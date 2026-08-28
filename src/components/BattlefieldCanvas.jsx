import React, { useEffect, useRef } from 'react';
import { BattlefieldScene } from '../battlefield/BattlefieldScene';
import { marketEngine } from '../services/marketData';

export function BattlefieldCanvas({ cameraMode = 'ISOMETRIC' }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Instantiate Three.js scene
    const scene = new BattlefieldScene(containerRef.current);
    sceneRef.current = scene;

    // Subscribe to real-time market engine events
    const unsubPrice = marketEngine.subscribePrice((priceData) => {
      if (sceneRef.current) sceneRef.current.handlePriceUpdate(priceData);
    });

    const unsubTrades = marketEngine.subscribeTrades((trade) => {
      if (sceneRef.current) sceneRef.current.handleTradeEvent(trade);
    });

    const unsubLiqs = marketEngine.subscribeLiquidations((liq) => {
      if (sceneRef.current) sceneRef.current.handleLiquidationEvent(liq);
    });

    return () => {
      unsubPrice();
      unsubTrades();
      unsubLiqs();
      if (sceneRef.current) {
        sceneRef.current.destroy();
        sceneRef.current = null;
      }
    };
  }, []);

  // Sync camera mode changes
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
