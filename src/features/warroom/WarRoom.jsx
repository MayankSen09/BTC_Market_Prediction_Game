import React, { useState, useEffect } from 'react';
import { BattlefieldCanvas } from '../../three/BattlefieldCanvas';
import { PredictionTerminal } from './PredictionTerminal';
import { CommandIntelligence } from './CommandIntelligence';
import { OrderBookDepthChart } from '../../components/OrderBookDepthChart';
import { LiveBattleFeed } from '../../components/LiveBattleFeed';
import { BattleControls } from '../../components/BattleControls';
import { marketService } from '../../engine/market/marketService';
import { Button } from '../../components/ui/Button';
import { Badge, Progress } from '../../components/ui/Badge';
import { Activity, Flame, Radio, Volume2, VolumeX, Shield, ArrowLeft } from 'lucide-react';

export function WarRoom({ onBackToLanding }) {
  const [marketState, setMarketState] = useState({
    price: 64720.0,
    tickDelta: 0.0,
    price24hChange: 4.16,
    marketPressure: 'Contested',
    buyWallTotal: '48.5',
    sellWallTotal: '62.0',
    bullProbability: 58,
    bearProbability: 42,
    connectionStatus: 'LIVE',
  });

  const [activeTab, setActiveTab] = useState('PREDICTIONS');
  const [cameraMode, setCameraMode] = useState('ISOMETRIC');
  const [utcTime, setUtcTime] = useState('');

  useEffect(() => {
    marketService.init();

    const interval = setInterval(() => {
      setUtcTime(new Date().toISOString().substring(11, 19) + ' UTC');
    }, 1000);

    const unsub = marketService.subscribe((data) => setMarketState(data));

    return () => {
      clearInterval(interval);
      unsub();
    };
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#080C14] text-slate-100 select-none">
      
      {/* 3D WebGL Battlefield Scene */}
      <BattlefieldCanvas cameraMode={cameraMode} />

      {/* Top Command Bar */}
      <header className="absolute top-0 left-0 w-full z-20 p-4 pointer-events-none flex flex-col gap-3">
        <div className="flex items-start justify-between w-full">
          
          {/* Left: Navigation & UTC */}
          <div className="pointer-events-auto flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={onBackToLanding}>
              <ArrowLeft className="w-4 h-4 mr-1" /> LANDING
            </Button>

            <div className="command-panel px-3 py-1.5 flex items-center gap-2 text-xs font-mono text-slate-300">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>{utcTime || '00:00:00 UTC'}</span>
              <span className="text-slate-600">|</span>
              <span className="font-bold text-slate-200">BTC/USD AGGREGATED</span>
            </div>
          </div>

          {/* Center: Big Price Display & Walls */}
          <div className="pointer-events-auto command-panel px-8 py-3 flex flex-col items-center border-t-2 border-t-emerald-500/60">
            <div className="flex items-baseline gap-3">
              <span className="price-display text-white">
                ${marketState.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className={`font-mono text-sm font-bold ${marketState.tickDelta >= 0 ? 'text-bull' : 'text-bear'}`}>
                {marketState.tickDelta >= 0 ? '+' : ''}{marketState.tickDelta.toFixed(3)}% tick
              </span>
            </div>

            {/* Probability Progress Bar */}
            <div className="w-full flex items-center justify-between mt-2 pt-2 border-t border-white/10 text-xs font-mono gap-4">
              <span className="text-bull font-bold">BULLS {marketState.bullProbability}%</span>
              <Progress bullValue={marketState.bullProbability} bearValue={marketState.bearProbability} className="w-48" />
              <span className="text-bear font-bold">BEARS {marketState.bearProbability}%</span>
            </div>
          </div>

          {/* Right: Connection & Pressure */}
          <div className="pointer-events-auto command-panel px-4 py-2.5 flex flex-col gap-1 min-w-[200px]">
            <div className="flex items-center justify-between text-[10px] font-bold font-mono text-slate-400 uppercase">
              <span>MARKET PRESSURE</span>
              <Badge variant="gold">{marketState.connectionStatus}</Badge>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm font-extrabold font-display text-emerald-400">
                {marketState.marketPressure}
              </span>
              <Flame className="w-4 h-4 text-emerald-400 animate-bounce" />
            </div>
          </div>
        </div>
      </header>

      {/* Floating Camera Controls (Bottom Center) */}
      <div className="absolute bottom-64 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
        <BattleControls
          cameraMode={cameraMode}
          setCameraMode={setCameraMode}
          onOpenCommander={() => setActiveTab('PREDICTIONS')}
        />
      </div>

      {/* Bottom Market Terminal */}
      <div className="absolute bottom-0 left-0 w-full z-20 p-4 pointer-events-auto">
        <div className="command-panel p-4 flex flex-col gap-3 max-h-56 overflow-y-auto">
          
          {/* Terminal Tabs Header */}
          <div className="flex items-center gap-2 border-b border-white/10 pb-2 text-xs font-mono">
            {['PREDICTIONS', 'INTELLIGENCE', 'DEPTH', 'LOGS'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded font-bold transition-all ${
                  activeTab === tab ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'PREDICTIONS' && <PredictionTerminal />}
          {activeTab === 'INTELLIGENCE' && <CommandIntelligence />}
          {activeTab === 'DEPTH' && <OrderBookDepthChart />}
          {activeTab === 'LOGS' && <LiveBattleFeed />}
        </div>
      </div>
    </div>
  );
}
