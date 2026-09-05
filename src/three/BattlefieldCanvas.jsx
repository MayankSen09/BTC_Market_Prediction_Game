import React, { useEffect, useRef } from 'react';
import { BattlefieldScene } from './BattlefieldScene';
import { marketService } from '../engine/market/marketService';

export function BattlefieldCanvas({ cameraMode = 'ISOMETRIC' }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new BattlefieldScene(containerRef.current);
    sceneRef.current = scene;

    const unsubMarket = marketService.subscribe((data) => {
      if (sceneRef.current) {
        sceneRef.current.setPriceData(data.price, data.pressureScore);
      }
    });

    return () => {
      unsubMarket();
      if (sceneRef.current) {
        sceneRef.current.destroy();
        sceneRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.setCameraMode(cameraMode);
    }
  }, [cameraMode]);

  return (
    <div className="battlefield-canvas-container">
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      <div className="scanline-overlay" />
    </div>
  );
}
