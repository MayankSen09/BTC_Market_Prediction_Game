import React, { useState, useEffect } from 'react';
import { marketEngine } from '../services/marketData';
import { Shield, Flame, Activity, Zap, Radio } from 'lucide-react';

export function HeaderHUD() {
  const [marketState, setMarketState] = useState({
    price: 64547.02,
    tickDelta: 0.0,
    price24hChange: 4.16,
    marketPressure: 'Contested',
    buyWallTotal: '47.5',
    sellWallTotal: '64.0',
    isLive: true,
  });

  const [utcTime, setUtcTime] = useState('');
  const [latestLiq, setLatestLiq] = useState(null);

  useEffect(() => {
    // Update UTC clock every second
    const interval = setInterval(() => {
      const now = new Date();
      setUtcTime(now.toISOString().substring(11, 19) + ' UTC');
    }, 1000);

    // Subscribe to price changes
    const unsubPrice = marketEngine.subscribePrice((data) => {
      setMarketState(data);
    });

    // Subscribe to liquidations for marquee alert
    const unsubLiq = marketEngine.subscribeLiquidations((liq) => {
      setLatestLiq(liq);
    });

    return () => {
      clearInterval(interval);
      unsubPrice();
      unsubLiq();
    };
  }, []);

  const isGreenTick = marketState.tickDelta >= 0;

  return (
    <header className="absolute top-0 left-0 w-full z-20 p-4 pointer-events-none flex flex-col gap-3">
      {/* Top Bar Overlay */}
      <div className="flex items-start justify-between w-full">
        
        {/* Left Side: UTC Clock & Symbol */}
        <div className="pointer-events-auto flex items-center gap-3">
          <div className="glass-panel px-3 py-1.5 flex items-center gap-2 text-xs font-mono text-slate-300">
            <Radio className={`w-3.5 h-3.5 ${marketState.isLive ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
            <span>{utcTime || '00:00:00 UTC'}</span>
            <span className="text-slate-500">|</span>
            <span className="font-bold text-slate-200">BTC/USD - AGGREGATED SPOT</span>
          </div>
        </div>

        {/* Center: Big BTC Price Display */}
        <div className="pointer-events-auto glass-panel px-8 py-3 flex flex-col items-center justify-center border-t-2 border-t-emerald-500/50">
          <div className="flex items-baseline gap-3">
            <span className="price-display text-slate-100">
              ${marketState.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <div className={`flex items-center gap-1 font-mono text-sm font-bold ${isGreenTick ? 'text-bull' : 'text-bear'}`}>
              <span>{isGreenTick ? '+' : ''}{marketState.tickDelta.toFixed(3)}% tick</span>
              <span className="text-xs opacity-75">({marketState.price24hChange >= 0 ? '+' : ''}{marketState.price24hChange}% 24h)</span>
            </div>
          </div>

          {/* Wall Gauges (Sell Wall vs Buy Wall) */}
          <div className="w-full flex items-center justify-between mt-2 pt-2 border-t border-white/10 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-bear">
              <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400">SELL WALL</span>
              <span className="font-extrabold text-sm">${marketState.sellWallTotal}M</span>
            </div>
            <div className="w-36 h-1.5 bg-slate-800 rounded-full overflow-hidden flex">
              <div
                className="bg-bear transition-all duration-300"
                style={{ width: `${(parseFloat(marketState.sellWallTotal) / (parseFloat(marketState.sellWallTotal) + parseFloat(marketState.buyWallTotal))) * 100}%` }}
              />
              <div
                className="bg-bull transition-all duration-300"
                style={{ width: `${(parseFloat(marketState.buyWallTotal) / (parseFloat(marketState.sellWallTotal) + parseFloat(marketState.buyWallTotal))) * 100}%` }}
              />
            </div>
            <div className="flex items-center gap-1.5 text-bull">
              <span className="font-extrabold text-sm">${marketState.buyWallTotal}M</span>
              <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400">BUY WALL</span>
            </div>
          </div>
        </div>

        {/* Right Side: Market Pressure Indicator */}
        <div className="pointer-events-auto glass-panel px-4 py-2.5 flex flex-col gap-1 min-w-[220px]">
          <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            <span>MARKET PRESSURE</span>
          </div>
          <div className="flex items-center justify-between">
            <span className={`text-base font-extrabold font-display ${
              marketState.marketPressure === 'Bulls Dominating' ? 'text-bull' :
              marketState.marketPressure === 'Bears Pushing' ? 'text-bear' : 'text-amber-300'
            }`}>
              {marketState.marketPressure}
            </span>
            <Flame className={`w-4 h-4 ${
              marketState.marketPressure === 'Bulls Dominating' ? 'text-bull animate-bounce' :
              marketState.marketPressure === 'Bears Pushing' ? 'text-bear animate-bounce' : 'text-amber-400'
            }`} />
          </div>
        </div>
      </div>

      {/* Marquee Banner for Latest Liquidation Alert */}
      {latestLiq && (
        <div className="pointer-events-auto self-center glass-panel px-4 py-1.5 flex items-center gap-3 text-xs font-mono border-amber-500/30 bg-amber-950/20">
          <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
          <span className="text-amber-200 font-bold">{latestLiq.exchange}</span>
          <span className="text-slate-400">•</span>
          <span className={latestLiq.type === 'SHORT' ? 'text-bull font-bold' : 'text-bear font-bold'}>
            Liquidated {latestLiq.type.toLowerCase()} - ${(latestLiq.amountUSD / 1000).toFixed(0)}K @ ${latestLiq.price.toLocaleString()}
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-300">{latestLiq.units} units destroyed</span>
        </div>
      )}
    </header>
  );
}
