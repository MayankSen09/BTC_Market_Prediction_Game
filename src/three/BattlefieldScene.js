import * as THREE from 'three';
import { eventBus } from '../engine/events/eventBus';
import { audioEngine } from '../audio/audioEngine';

export class BattlefieldScene {
  constructor(container) {
    this.container = container;

    this.scene = new THREE.Scene();
    this.camera = null;
    this.renderer = null;

    this.animFrameId = null;
    this.clock = new THREE.Clock();

    this.frontlineX = 0;
    this.targetFrontlineX = 0;
    this.frontlineWall = null;

    this.priceBase = 64720;
    this.priceRange = 200;

    this.bullTanks = [];
    this.bearTanks = [];
    this.projectiles = [];
    this.particles = [];
    this.floatingLabels = [];

    this.cameraMode = 'ISOMETRIC';
    this.cameraTargetPos = new THREE.Vector3(0, 42, 52);
    this.cameraLookAt = new THREE.Vector3(0, 0, 0);

    this.siegeMode = false;
    this.lastStandMode = false;

    this.init();
  }

  init() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(0, 42, 52);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    this.container.replaceChildren(this.renderer.domElement);

    this.setupLighting();
    this.createTerrain();
    this.createRoadsAndLakes();
    this.createPriceFortresses();
    this.createBaseCamps();
    this.createFrontline();
    this.spawnInitialArmies();

    this.setupEventListeners();

    this.onWindowResize = this.onWindowResize.bind(this);
    window.addEventListener('resize', this.onWindowResize);

    this.animate = this.animate.bind(this);
    this.animate();
  }

  setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xddeeff, 0.6);
    this.scene.add(ambientLight);

    const sun = new THREE.DirectionalLight(0xffffff, 1.2);
    sun.position.set(-30, 50, 40);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    this.scene.add(sun);

    const bullLight = new THREE.PointLight(0x00e676, 2, 40);
    bullLight.position.set(-35, 10, 0);
    this.scene.add(bullLight);

    const bearLight = new THREE.PointLight(0xff2a5f, 2, 40);
    bearLight.position.set(35, 10, 0);
    this.scene.add(bearLight);

    this.scene.fog = new THREE.FogExp2(0x080c14, 0.008);
  }

  createTerrain() {
    const geometry = new THREE.PlaneGeometry(120, 80, 60, 40);
    geometry.rotateX(-Math.PI / 2);

    const pos = geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      let y = Math.sin(x * 0.1) * Math.cos(z * 0.1) * 1.8;
      if (Math.abs(z) > 25) y += (Math.abs(z) - 25) * 0.25;
      pos.setY(i, y);
    }
    geometry.computeVertexNormals();

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    const gradGreen = ctx.createLinearGradient(0, 0, 512, 0);
    gradGreen.addColorStop(0, '#132817');
    gradGreen.addColorStop(1, '#1e3e23');
    ctx.fillStyle = gradGreen;
    ctx.fillRect(0, 0, 512, 512);

    const gradRed = ctx.createLinearGradient(512, 0, 1024, 0);
    gradRed.addColorStop(0, '#3e1a20');
    gradRed.addColorStop(1, '#251014');
    ctx.fillStyle = gradRed;
    ctx.fillRect(512, 0, 512, 512);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 2;
    for (let x = 0; x <= 1024; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
    }

    const groundTexture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshStandardMaterial({
      map: groundTexture,
      roughness: 0.85,
      metalness: 0.15,
      flatShading: true,
    });

    const terrainMesh = new THREE.Mesh(geometry, material);
    terrainMesh.receiveShadow = true;
    this.scene.add(terrainMesh);
  }

  createRoadsAndLakes() {
    const roadCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-55, 0.4, -20),
      new THREE.Vector3(-25, 0.4, -10),
      new THREE.Vector3(0, 0.4, 5),
      new THREE.Vector3(25, 0.4, -5),
      new THREE.Vector3(55, 0.4, -15),
    ]);

    const roadGeo = new THREE.TubeGeometry(roadCurve, 60, 2.5, 8, false);
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x1c2026, roughness: 0.9, flatShading: true });
    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    roadMesh.receiveShadow = true;
    this.scene.add(roadMesh);
  }

  createPriceFortresses() {
    // 3D Price Fortresses on landscape
    const fortresses = [
      { name: '$65,000 RESISTANCE FORTRESS', x: 20, z: -15, color: '#ff2a5f' },
      { name: '$64,500 SUPPORT BASTION', x: -20, z: 15, color: '#00e676' },
    ];

    fortresses.forEach((f) => {
      const geo = new THREE.CylinderGeometry(3, 4, 3, 6);
      const mat = new THREE.MeshStandardMaterial({ color: 0x151c29, roughness: 0.5 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(f.x, 1.5, f.z);
      mesh.castShadow = true;
      this.scene.add(mesh);

      const sprite = this.createLabelSprite(f.name, f.color);
      sprite.position.set(f.x, 6, f.z);
      this.scene.add(sprite);
    });
  }

  createBaseCamps() {
    // Bulls HQ Base
    const bullGroup = new THREE.Group();
    bullGroup.position.set(-42, 0, 0);

    const baseGeo = new THREE.BoxGeometry(10, 2.5, 12);
    const bullMat = new THREE.MeshStandardMaterial({ color: 0x132817, roughness: 0.5 });
    const bullBase = new THREE.Mesh(baseGeo, bullMat);
    bullBase.position.y = 1.25;
    bullGroup.add(bullBase);

    const bullSprite = this.createLabelSprite('BULLS HQ', '#00e676');
    bullSprite.position.set(0, 5, 0);
    bullGroup.add(bullSprite);

    this.scene.add(bullGroup);

    // Bears HQ Base
    const bearGroup = new THREE.Group();
    bearGroup.position.set(42, 0, 0);

    const bearMat = new THREE.MeshStandardMaterial({ color: 0x3e1a20, roughness: 0.5 });
    const bearBase = new THREE.Mesh(baseGeo, bearMat);
    bearBase.position.y = 1.25;
    bearGroup.add(bearBase);

    const bearSprite = this.createLabelSprite('BEARS HQ', '#ff2a5f');
    bearSprite.position.set(0, 5, 0);
    bearGroup.add(bearSprite);

    this.scene.add(bearGroup);
  }

  createLabelSprite(text, colorHex) {
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 80;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(8, 12, 20, 0.9)';
    ctx.roundRect(5, 5, 310, 70, 10);
    ctx.fill();
    ctx.strokeStyle = colorHex;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.font = 'bold 22px "Outfit", sans-serif';
    ctx.fillStyle = colorHex;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 160, 40);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(8, 2, 1);
    return sprite;
  }

  createFrontline() {
    const wallGeo = new THREE.BoxGeometry(0.3, 9, 70);

    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 64, 0);
    grad.addColorStop(0, '#00e676');
    grad.addColorStop(0.5, '#ffffff');
    grad.addColorStop(1, '#ff2a5f');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 256);

    const wallTex = new THREE.CanvasTexture(canvas);
    const wallMat = new THREE.MeshBasicMaterial({
      map: wallTex,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });

    this.frontlineWall = new THREE.Mesh(wallGeo, wallMat);
    this.frontlineWall.position.set(0, 4.5, 0);
    this.scene.add(this.frontlineWall);
  }

  spawnInitialArmies() {
    for (let i = 0; i < 6; i++) {
      const zPos = -22 + i * 8.5;
      const bullTank = this.createTank(true);
      bullTank.position.set(-18 - Math.random() * 5, 0.6, zPos);
      this.scene.add(bullTank);
      this.bullTanks.push(bullTank);

      const bearTank = this.createTank(false);
      bearTank.position.set(18 + Math.random() * 5, 0.6, zPos);
      this.scene.add(bearTank);
      this.bearTanks.push(bearTank);
    }
  }

  createTank(isBull = true) {
    const group = new THREE.Group();
    const color = isBull ? 0x00e676 : 0xff2a5f;

    const bodyGeo = new THREE.BoxGeometry(2.4, 1.0, 3.2);
    const bodyMat = new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.6 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.6;
    body.castShadow = true;
    group.add(body);

    const turretGeo = new THREE.BoxGeometry(1.6, 0.8, 1.8);
    const turret = new THREE.Mesh(turretGeo, bodyMat);
    turret.position.set(0, 1.4, 0);
    group.add(turret);

    const barrelGeo = new THREE.CylinderGeometry(0.12, 0.15, 2.2, 8);
    barrelGeo.rotateX(Math.PI / 2);
    const barrelMat = new THREE.MeshStandardMaterial({ color: 0x1c2026, roughness: 0.3 });
    const barrel = new THREE.Mesh(barrelGeo, barrelMat);
    barrel.position.set(0, 1.4, isBull ? 1.8 : -1.8);
    group.add(barrel);

    group.rotation.y = isBull ? Math.PI / 2 : -Math.PI / 2;
    return group;
  }

  setupEventListeners() {
    this.unsubTrade = eventBus.on('TRADE', (e) => this.handleTrade(e));
    this.unsubWhale = eventBus.on('WHALE_TRADE', (e) => this.handleWhale(e));
    this.unsubLiq = eventBus.on('LIQUIDATION', (e) => this.handleLiquidation(e));
  }

  handleTrade(trade) {
    const isBull = trade.side === 'BUY';
    const tanks = isBull ? this.bullTanks : this.bearTanks;
    if (tanks.length === 0) return;
    const shooter = tanks[Math.floor(Math.random() * tanks.length)];

    const startPos = shooter.position.clone().add(new THREE.Vector3(0, 1.5, 0));
    const targetPos = new THREE.Vector3(
      this.frontlineX + (isBull ? 4 : -4),
      0.5,
      startPos.z + (Math.random() - 0.5) * 6
    );

    this.fireLaser(startPos, targetPos, isBull);
    audioEngine.playLaser(isBull);
  }

  handleWhale(trade) {
    const isBull = trade.side === 'BUY';
    const tanks = isBull ? this.bullTanks : this.bearTanks;
    if (tanks.length === 0) return;
    const shooter = tanks[Math.floor(Math.random() * tanks.length)];

    const startPos = shooter.position.clone().add(new THREE.Vector3(0, 1.5, 0));
    const targetPos = new THREE.Vector3(
      this.frontlineX + (isBull ? 6 : -6),
      0.5,
      startPos.z + (Math.random() - 0.5) * 10
    );

    this.fireMortar(startPos, targetPos, isBull);
    audioEngine.playCannon();
    this.spawnFloatingText(startPos, `WHALE ${isBull ? 'BUY' : 'SELL'} $${(trade.usdValue / 1000).toFixed(0)}K`, isBull ? '#00e676' : '#ff2a5f');
  }

  handleLiquidation(liq) {
    const isShortLiq = liq.subType === 'SHORT';
    const targetX = isShortLiq ? 15 + Math.random() * 15 : -15 - Math.random() * 15;
    const targetPos = new THREE.Vector3(targetX, 0, (Math.random() - 0.5) * 35);

    const startPos = targetPos.clone().add(new THREE.Vector3(0, 28, -10));
    this.fireMortar(startPos, targetPos, isShortLiq);
    audioEngine.playExplosion();

    this.spawnFloatingText(
      targetPos,
      `💥 LIQUIDATED ${liq.subType}: $${(liq.amountUSD / 1000).toFixed(0)}K`,
      isShortLiq ? '#00e676' : '#ff2a5f'
    );
  }

  fireLaser(startPos, targetPos, isBull) {
    const color = isBull ? 0x00e676 : 0xff2a5f;
    const points = [startPos, targetPos];
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({ color, linewidth: 3 });
    const line = new THREE.Line(geo, mat);

    this.scene.add(line);
    setTimeout(() => {
      this.scene.remove(line);
      geo.dispose();
      mat.dispose();
    }, 120);
  }

  fireMortar(startPos, targetPos, isBull) {
    const color = isBull ? 0x00e676 : 0xff2a5f;
    const geo = new THREE.SphereGeometry(0.4, 8, 8);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const shell = new THREE.Mesh(geo, mat);
    shell.position.copy(startPos);
    this.scene.add(shell);

    this.projectiles.push({
      mesh: shell,
      startPos,
      targetPos,
      startTime: this.clock.getElapsedTime(),
      duration: 0.8,
      color,
    });
  }

  spawnFloatingText(pos, text, colorHex) {
    const sprite = this.createLabelSprite(text, colorHex);
    sprite.position.copy(pos).add(new THREE.Vector3(0, 3, 0));
    this.scene.add(sprite);
    this.floatingLabels.push({ sprite, life: 2.2 });
  }

  setPriceData(price, score) {
    this.targetFrontlineX = Math.max(-25, Math.min(25, score * 0.25));
  }

  setCameraMode(mode) {
    this.cameraMode = mode;
    if (mode === 'OVERHEAD') {
      this.cameraTargetPos.set(0, 60, 1);
      this.cameraLookAt.set(0, 0, 0);
    } else if (mode === 'CINEMATIC') {
      this.cameraTargetPos.set(this.frontlineX, 8, 22);
      this.cameraLookAt.set(this.frontlineX, 3, 0);
    } else {
      this.cameraTargetPos.set(0, 42, 52);
      this.cameraLookAt.set(0, 0, 0);
    }
  }

  onWindowResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    this.animFrameId = requestAnimationFrame(this.animate);
    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime();

    this.frontlineX += (this.targetFrontlineX - this.frontlineX) * 0.05;
    if (this.frontlineWall) this.frontlineWall.position.x = this.frontlineX;

    if (this.cameraMode === 'CINEMATIC') {
      this.cameraTargetPos.x = this.frontlineX;
      this.cameraLookAt.x = this.frontlineX;
    }
    this.camera.position.lerp(this.cameraTargetPos, 0.04);
    this.camera.lookAt(this.cameraLookAt);

    // Update Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      const progress = (time - p.startTime) / p.duration;

      if (progress >= 1.0) {
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        p.mesh.material.dispose();
        this.projectiles.splice(i, 1);
      } else {
        p.mesh.position.lerpVectors(p.startPos, p.targetPos, progress);
        p.mesh.position.y = p.startPos.y + Math.sin(progress * Math.PI) * 12;
      }
    }

    // Update Floating Labels
    for (let i = this.floatingLabels.length - 1; i >= 0; i--) {
      const lbl = this.floatingLabels[i];
      lbl.life -= delta;
      if (lbl.life <= 0) {
        this.scene.remove(lbl.sprite);
        lbl.sprite.material.map.dispose();
        lbl.sprite.material.dispose();
        this.floatingLabels.splice(i, 1);
      } else {
        lbl.sprite.position.y += delta * 1.2;
      }
    }

    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    window.removeEventListener('resize', this.onWindowResize);
    if (this.unsubTrade) this.unsubTrade();
    if (this.unsubWhale) this.unsubWhale();
    if (this.unsubLiq) this.unsubLiq();
    if (this.renderer && this.renderer.domElement) this.renderer.domElement.remove();
  }
}
