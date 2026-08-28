import React, { useState, useEffect } from 'react';
import { BattlefieldCanvas } from './components/BattlefieldCanvas';
import { HeaderHUD } from './components/HeaderHUD';
import { OrderBookDepthChart } from './components/OrderBookDepthChart';
import { LiveBattleFeed } from './components/LiveBattleFeed';
import { BattleControls } from './components/BattleControls';
import { WarCommanderPanel } from './components/WarCommanderPanel';
import { marketEngine } from './services/marketData';

export function App() {
  const [cameraMode, setCameraMode] = useState('ISOMETRIC');
  const [isCommanderOpen, setIsCommanderOpen] = useState(false);

  useEffect(() => {
    // Initialize live market data stream
    marketEngine.init();
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none">
      {/* 3D WebGL Battlefield Canvas */}
      <BattlefieldCanvas cameraMode={cameraMode} />

      {/* Top Header HUD Overlay */}
      <HeaderHUD />

      {/* Bottom Floating Control Bar */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 pointer-events-none w-full max-w-2xl px-4 flex justify-center">
        <BattleControls
          cameraMode={cameraMode}
          setCameraMode={setCameraMode}
          onOpenCommander={() => setIsCommanderOpen(true)}
        />
      </div>

      {/* Bottom Left: Order Book Spot Depth Curve Overlay */}
      <div className="absolute bottom-5 left-5 z-20 pointer-events-none hidden md:block">
        <OrderBookDepthChart />
      </div>

      {/* Bottom Right: Live Market & Combat Feed Overlay */}
      <div className="absolute bottom-5 right-5 z-20 pointer-events-none hidden md:block">
        <LiveBattleFeed />
      </div>

      {/* War Commander Prediction Game Modal */}
      <WarCommanderPanel
        isOpen={isCommanderOpen}
        onClose={() => setIsCommanderOpen(false)}
      />
    </div>
  );
}

export default App;
