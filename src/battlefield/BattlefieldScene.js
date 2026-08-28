import * as THREE from 'three';
import { audioEngine } from '../services/audioEngine';

export class BattlefieldScene {
  constructor(container) {
    this.container = container;

    // Core Three.js components
    this.scene = new THREE.Scene();
    this.camera = null;
    this.renderer = null;

    // Animation & State
    this.animFrameId = null;
    this.clock = new THREE.Clock();

    // Game objects
    this.frontlineX = 0; // Frontline position (-25 to +25)
    this.targetFrontlineX = 0;
    this.frontlineWall = null;

    this.priceBase = 64500;
    this.priceRange = 200; // $200 price spread across map

    this.bullTanks = [];
    this.bearTanks = [];
    this.projectiles = [];
    this.particles = [];
    this.floatingLabels = [];

    this.cameraMode = 'ISOMETRIC'; // ISOMETRIC, OVERHEAD, CINEMATIC
    this.cameraTargetPos = new THREE.Vector3(0, 35, 45);
    this.cameraLookAt = new THREE.Vector3(0, 0, 0);

    this.init();
  }

  init() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    // 1. Camera Setup
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.set(0, 42, 52);
    this.camera.lookAt(0, 0, 0);

    // 2. Renderer Setup
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    this.container.replaceChildren(this.renderer.domElement);

    // 3. Lighting
    this.setupLighting();

    // 4. Environment & Terrain
    this.createTerrain();
    this.createRoadsAndLakes();
    this.createPriceRuler();
    this.createBaseCamps();
    this.createFrontline();

    // 5. Initial Spawning
    this.spawnInitialArmies();

    // 6. Handle Window Resize
    this.onWindowResize = this.onWindowResize.bind(this);
    window.addEventListener('resize', this.onWindowResize);

    // 7. Start Render Loop
    this.animate = this.animate.bind(this);
    this.animate();
  }

  setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xddeeff, 0.6);
    this.scene.add(ambientLight);

    // Main Sun Directional Light (Shadow Caster)
    const sun = new THREE.DirectionalLight(0xffffff, 1.2);
    sun.position.set(-30, 50, 40);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 200;
    sun.shadow.camera.left = -60;
    sun.shadow.camera.right = 60;
    sun.shadow.camera.top = 60;
    sun.shadow.camera.bottom = -60;
    this.scene.add(sun);

    // Green Bull Accent Light
    const bullLight = new THREE.PointLight(0x00ff88, 2, 40);
    bullLight.position.set(-35, 10, 0);
    this.scene.add(bullLight);

    // Red Bear Accent Light
    const bearLight = new THREE.PointLight(0xff3366, 2, 40);
    bearLight.position.set(35, 10, 0);
    this.scene.add(bearLight);

    // Scene Fog
    this.scene.fog = new THREE.FogExp2(0x080c14, 0.008);
  }

  createTerrain() {
    // Large 3D Terrain Plane (Width 120, Depth 80)
    const geometry = new THREE.PlaneGeometry(120, 80, 60, 40);
    geometry.rotateX(-Math.PI / 2);

    // Deform vertices for rolling hills landscape
    const pos = geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);

      // Subtle height variations
      let y = Math.sin(x * 0.1) * Math.cos(z * 0.1) * 1.8;
      // Ridge elevation near outer borders
      if (Math.abs(z) > 25) y += (Math.abs(z) - 25) * 0.25;

      pos.setY(i, y);
    }
    geometry.computeVertexNormals();

    // Canvas texture generating dynamic split ground (Green for Bulls, Scorched Red/Brown for Bears)
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Left side: Lush Green Gradient
    const gradGreen = ctx.createLinearGradient(0, 0, 512, 0);
    gradGreen.addColorStop(0, '#1e3a1e');
    gradGreen.addColorStop(1, '#2e5a2e');
    ctx.fillStyle = gradGreen;
    ctx.fillRect(0, 0, 512, 512);

    // Right side: Scorched Red/Brown Gradient
    const gradRed = ctx.createLinearGradient(512, 0, 1024, 0);
    gradRed.addColorStop(0, '#4a2520');
    gradRed.addColorStop(1, '#2a1512');
    ctx.fillStyle = gradRed;
    ctx.fillRect(512, 0, 512, 512);

    // Grid lines on ground
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 2;
    for (let x = 0; x <= 1024; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
    }
    for (let y = 0; y <= 512; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1024, y);
      ctx.stroke();
    }

    const groundTexture = new THREE.CanvasTexture(canvas);
    groundTexture.wrapS = THREE.ClampToEdgeWrapping;
    groundTexture.wrapT = THREE.ClampToEdgeWrapping;

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
    // Curved Highway winding across map (matching reference images)
    const roadCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-55, 0.4, -20),
      new THREE.Vector3(-25, 0.4, -10),
      new THREE.Vector3(0, 0.4, 5),
      new THREE.Vector3(25, 0.4, -5),
      new THREE.Vector3(55, 0.4, -15),
    ]);

    const roadGeo = new THREE.TubeGeometry(roadCurve, 60, 2.5, 8, false);
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x22262c, roughness: 0.9, flatShading: true });
    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    roadMesh.receiveShadow = true;
    this.scene.add(roadMesh);

    // Lake on Bear side (Scorched Blue/Purple Pond)
    const lakeGeo = new THREE.CylinderGeometry(8, 10, 0.2, 16);
    const lakeMat = new THREE.MeshStandardMaterial({ color: 0x0088cc, roughness: 0.1, metalness: 0.8 });
    const bearLake = new THREE.Mesh(lakeGeo, lakeMat);
    bearLake.position.set(32, 0.15, 18);
    this.scene.add(bearLake);

    // Lake on Bull side
    const bullLake = new THREE.Mesh(lakeGeo, new THREE.MeshStandardMaterial({ color: 0x00ccaa, roughness: 0.1, metalness: 0.8 }));
    bullLake.position.set(-36, 0.15, -18);
    this.scene.add(bullLake);

    // Trees on Bull side (Low Poly Conifer Trees)
    for (let i = 0; i < 24; i++) {
      const tree = this.createLowPolyTree(0x00e676);
      tree.position.set(-15 - Math.random() * 35, 0, (Math.random() - 0.5) * 60);
      this.scene.add(tree);
    }

    // Rocks on Bear side
    for (let i = 0; i < 18; i++) {
      const rock = this.createRock();
      rock.position.set(15 + Math.random() * 35, 0, (Math.random() - 0.5) * 60);
      this.scene.add(rock);
    }
  }

  createLowPolyTree(foliageColor) {
    const group = new THREE.Group();

    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.2, 0.35, 1.8, 5);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3d2314, roughness: 0.9 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 0.9;
    trunk.castShadow = true;
    group.add(trunk);

    // Foliage Cone
    const foliageGeo = new THREE.ConeGeometry(1.5, 3.5, 5);
    const foliageMat = new THREE.MeshStandardMaterial({ color: foliageColor, roughness: 0.6, flatShading: true });
    const foliage = new THREE.Mesh(foliageGeo, foliageMat);
    foliage.position.y = 2.8;
    foliage.castShadow = true;
    group.add(foliage);

    const scale = 0.7 + Math.random() * 0.6;
    group.scale.set(scale, scale, scale);
    return group;
  }

  createRock() {
    const geo = new THREE.DodecahedronGeometry(1 + Math.random() * 0.8, 1);
    const mat = new THREE.MeshStandardMaterial({ color: 0x44444c, roughness: 0.9, flatShading: true });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = 0.6;
    mesh.rotation.set(Math.random(), Math.random(), Math.random());
    mesh.castShadow = true;
    return mesh;
  }

  createPriceRuler() {
    // 3D Price ruler markings floating on terrain grid (like in reference image!)
    const rulerGroup = new THREE.Group();
    const count = 11;
    const startX = -25;
    const endX = 25;

    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      const x = startX + t * (endX - startX);
      const priceTick = Math.round(this.priceBase + (t - 0.5) * this.priceRange);

      // Tick line
      const lineGeo = new THREE.BoxGeometry(0.15, 0.05, 4);
      const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.4, transparent: true });
      const line = new THREE.Mesh(lineGeo, lineMat);
      line.position.set(x, 0.3, 0);
      rulerGroup.add(line);

      // Create 3D text label sprite for price tick
      const sprite = this.createPriceLabelSprite(`$${priceTick.toLocaleString()}`);
      sprite.position.set(x, 1.2, 0.5);
      rulerGroup.add(sprite);
    }

    this.scene.add(rulerGroup);
  }

  createPriceLabelSprite(text) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.roundRect(10, 10, 236, 44, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = 'bold 22px "JetBrains Mono", monospace';
    ctx.fillStyle = '#f8fafc';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 128, 32);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(4, 1, 1);
    return sprite;
  }

  createBaseCamps() {
    // 1. Bulls HQ Base Camp (Left / Green Side)
    const bullBaseGroup = new THREE.Group();
    bullBaseGroup.position.set(-42, 0, 0);

    const baseGeo = new THREE.BoxGeometry(10, 2, 12);
    const bullBaseMat = new THREE.MeshStandardMaterial({ color: 0x1a3322, roughness: 0.5 });
    const bullBase = new THREE.Mesh(baseGeo, bullBaseMat);
    bullBase.position.y = 1;
    bullBase.castShadow = true;
    bullBaseGroup.add(bullBase);

    // Bull Headquarters Banner Sign
    const bullSignSprite = this.createHQBannerSprite('BULLS HQ', '#00ff88');
    bullSignSprite.position.set(0, 5, 0);
    bullBaseGroup.add(bullSignSprite);

    this.scene.add(bullBaseGroup);

    // 2. Bears HQ Base Camp (Right / Red Side)
    const bearBaseGroup = new THREE.Group();
    bearBaseGroup.position.set(42, 0, 0);

    const bearBaseMat = new THREE.MeshStandardMaterial({ color: 0x3d1a20, roughness: 0.5 });
    const bearBase = new THREE.Mesh(baseGeo, bearBaseMat);
    bearBase.position.y = 1;
    bearBase.castShadow = true;
    bearBaseGroup.add(bearBase);

    // Bear Headquarters Banner Sign
    const bearSignSprite = this.createHQBannerSprite('BEARS HQ', '#ff2a5f');
    bearSignSprite.position.set(0, 5, 0);
    bearBaseGroup.add(bearSignSprite);

    this.scene.add(bearBaseGroup);
  }

  createHQBannerSprite(title, colorHex) {
    const canvas = document.createElement('canvas');
    canvas.width = 384;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(8, 12, 20, 0.9)';
    ctx.roundRect(10, 10, 364, 108, 12);
    ctx.fill();
    ctx.strokeStyle = colorHex;
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.font = '900 36px "Outfit", sans-serif';
    ctx.fillStyle = colorHex;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, 192, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(9, 3, 1);
    return sprite;
  }

  createFrontline() {
    // Dynamic glowing laser frontline dividing wall
    const wallGeo = new THREE.BoxGeometry(0.3, 8, 70);

    // Glowing shader-like canvas texture
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 64, 0);
    grad.addColorStop(0, '#00ff88');
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
    this.frontlineWall.position.set(0, 4, 0);
    this.scene.add(this.frontlineWall);
  }

  spawnInitialArmies() {
    // Spawn initial green Bull tanks & red Bear tanks facing each other along frontline
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

    // Body/Chassis
    const bodyGeo = new THREE.BoxGeometry(2.4, 1.0, 3.2);
    const bodyMat = new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.6 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.6;
    body.castShadow = true;
    group.add(body);

    // Tracks (Left & Right)
    const trackGeo = new THREE.BoxGeometry(0.5, 0.7, 3.4);
    const trackMat = new THREE.MeshStandardMaterial({ color: 0x111115, roughness: 0.9 });
    const leftTrack = new THREE.Mesh(trackGeo, trackMat);
    leftTrack.position.set(-1.3, 0.4, 0);
    const rightTrack = leftTrack.clone();
    rightTrack.position.set(1.3, 0.4, 0);
    group.add(leftTrack);
    group.add(rightTrack);

    // Turret Dome
    const turretGeo = new THREE.BoxGeometry(1.6, 0.8, 1.8);
    const turret = new THREE.Mesh(turretGeo, bodyMat);
    turret.position.set(0, 1.4, 0);
    group.add(turret);

    // Cannon Barrel
    const barrelGeo = new THREE.CylinderGeometry(0.12, 0.15, 2.2, 8);
    barrelGeo.rotateX(Math.PI / 2);
    const barrelMat = new THREE.MeshStandardMaterial({ color: 0x22222a, roughness: 0.3, metalness: 0.8 });
    const barrel = new THREE.Mesh(barrelGeo, barrelMat);
    barrel.position.set(0, 1.4, isBull ? 1.8 : -1.8);
    group.add(barrel);

    // Orient facing opponent
    if (isBull) {
      group.rotation.y = Math.PI / 2;
    } else {
      group.rotation.y = -Math.PI / 2;
    }

    group.userData = { isBull, cooldown: Math.random() * 2 };
    return group;
  }

  // --- Real-Time Combat Event Triggers ---

  handlePriceUpdate(priceData) {
    // Map current price into 3D X position (-25 to +25)
    this.priceBase = priceData.price;
    const delta = priceData.tickDelta || 0;
    // Pushing frontline forward when price increases
    this.targetFrontlineX = Math.max(-25, Math.min(25, delta * 300));
  }

  handleTradeEvent(trade) {
    const isBull = trade.side === 'BUY';
    const isWhale = trade.isWhale;

    // Pick random tank on that side to fire!
    const tanks = isBull ? this.bullTanks : this.bearTanks;
    if (tanks.length === 0) return;
    const shooter = tanks[Math.floor(Math.random() * tanks.length)];

    const startPos = shooter.position.clone().add(new THREE.Vector3(0, 1.5, 0));
    const targetX = this.frontlineX + (isBull ? 3 + Math.random() * 5 : -3 - Math.random() * 5);
    const targetPos = new THREE.Vector3(targetX, 0.5, startPos.z + (Math.random() - 0.5) * 6);

    if (isWhale) {
      // Heavy Artillery Mortar Arc + Sound
      this.fireArtilleryShell(startPos, targetPos, isBull);
      audioEngine.playCannon();
      this.spawnFloatingText(startPos, `${isBull ? 'WHALE BUY' : 'WHALE SELL'} $${(trade.usdValue / 1000).toFixed(0)}K`, isBull ? '#00ff88' : '#ff2a5f');
    } else {
      // Rapid Laser Beam
      this.fireLaserBeam(startPos, targetPos, isBull);
      audioEngine.playLaser(isBull);
    }
  }

  handleLiquidationEvent(liq) {
    const isShortLiq = liq.type === 'SHORT'; // Shorts liquidated = Bull Win -> Red side gets bombed!
    const targetX = isShortLiq ? 15 + Math.random() * 15 : -15 - Math.random() * 15;
    const targetPos = new THREE.Vector3(targetX, 0, (Math.random() - 0.5) * 40);

    // Tactical Airstrike Missile Drop
    this.triggerAirstrike(targetPos, isShortLiq);
    audioEngine.playExplosion();

    this.spawnFloatingText(
      targetPos,
      `💥 LIQUIDATED ${liq.type}: $${(liq.amountUSD / 1000).toFixed(0)}K`,
      isShortLiq ? '#00ff88' : '#ff2a5f'
    );
  }

  fireLaserBeam(startPos, targetPos, isBull) {
    const color = isBull ? 0x00ff88 : 0xff2a5f;
    const points = [startPos, targetPos];
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({ color, linewidth: 3 });
    const line = new THREE.Line(geo, mat);

    this.scene.add(line);

    // Flash & destroy
    setTimeout(() => {
      this.scene.remove(line);
      geo.dispose();
      mat.dispose();
      this.createExplosion(targetPos, color, 0.5);
    }, 120);
  }

  fireArtilleryShell(startPos, targetPos, isBull) {
    const color = isBull ? 0x00ff88 : 0xff2a5f;
    const geo = new THREE.SphereGeometry(0.4, 8, 8);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const shell = new THREE.Mesh(geo, mat);
    shell.position.copy(startPos);
    this.scene.add(shell);

    const duration = 0.8;
    const startTime = this.clock.getElapsedTime();

    this.projectiles.push({
      mesh: shell,
      startPos,
      targetPos,
      startTime,
      duration,
      color,
    });
  }

  triggerAirstrike(targetPos, isShortLiq) {
    const startPos = targetPos.clone().add(new THREE.Vector3(0, 30, -10));
    this.fireArtilleryShell(startPos, targetPos, !isShortLiq);
  }

  createExplosion(position, colorHex, scale = 1.0) {
    const particleCount = Math.floor(16 * scale);
    for (let i = 0; i < particleCount; i++) {
      const geo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
      const mat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true });
      const p = new THREE.Mesh(geo, mat);
      p.position.copy(position);

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 12 * scale,
        (Math.random() * 10 + 2) * scale,
        (Math.random() - 0.5) * 12 * scale
      );

      this.scene.add(p);
      this.particles.push({ mesh: p, vel, life: 1.0 });
    }
  }

  spawnFloatingText(pos, text, colorHex) {
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 80;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(8, 12, 20, 0.85)';
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
    sprite.position.copy(pos).add(new THREE.Vector3(0, 3, 0));
    sprite.scale.set(7, 1.8, 1);

    this.scene.add(sprite);
    this.floatingLabels.push({ sprite, life: 2.2 });
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
      // ISOMETRIC
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

    // Smoothly lerp frontline wall to target X
    this.frontlineX += (this.targetFrontlineX - this.frontlineX) * 0.05;
    if (this.frontlineWall) {
      this.frontlineWall.position.x = this.frontlineX;
    }

    // Smoothly transition camera position
    if (this.cameraMode === 'CINEMATIC') {
      this.cameraTargetPos.x = this.frontlineX;
      this.cameraLookAt.x = this.frontlineX;
    }
    this.camera.position.lerp(this.cameraTargetPos, 0.04);
    this.camera.lookAt(this.cameraLookAt);

    // Animate Tanks (Subtle sway & track motion)
    [...this.bullTanks, ...this.bearTanks].forEach((tank) => {
      tank.position.y = 0.6 + Math.sin(time * 3 + tank.position.x) * 0.05;
    });

    // Update Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      const elapsed = time - p.startTime;
      const progress = elapsed / p.duration;

      if (progress >= 1.0) {
        // Impact!
        this.createExplosion(p.targetPos, p.color, 1.8);
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        p.mesh.material.dispose();
        this.projectiles.splice(i, 1);
      } else {
        // Parabolic arc path
        p.mesh.position.lerpVectors(p.startPos, p.targetPos, progress);
        p.mesh.position.y = p.startPos.y + Math.sin(progress * Math.PI) * 12;
      }
    }

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= delta * 1.8;
      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        p.mesh.material.dispose();
        this.particles.splice(i, 1);
      } else {
        p.mesh.position.addScaledVector(p.vel, delta);
        p.vel.y -= 9.8 * delta; // Gravity
        p.mesh.material.opacity = p.life;
      }
    }

    // Update Floating Text Labels
    for (let i = this.floatingLabels.length - 1; i >= 0; i--) {
      const lbl = this.floatingLabels[i];
      lbl.life -= delta;
      if (lbl.life <= 0) {
        this.scene.remove(lbl.sprite);
        lbl.sprite.material.map.dispose();
        lbl.sprite.material.dispose();
        this.floatingLabels.splice(i, 1);
      } else {
        lbl.sprite.position.y += delta * 1.2; // Float up
        lbl.sprite.material.opacity = Math.min(1.0, lbl.life);
      }
    }

    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    window.removeEventListener('resize', this.onWindowResize);
    if (this.renderer && this.renderer.domElement) {
      this.renderer.domElement.remove();
    }
  }
}
