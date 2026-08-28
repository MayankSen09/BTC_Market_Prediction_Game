import React, { useState, useEffect, useRef } from 'react';
import { marketEngine } from '../services/marketData';
import { Crosshair, Skull, ShieldAlert, TrendingUp, TrendingDown } from 'lucide-react';

export function LiveBattleFeed() {
  const [feedItems, setFeedItems] = useState([]);
  const listRef = useRef(null);

  useEffect(() => {
    // Subscribe to trades
    const unsubTrades = marketEngine.subscribeTrades((trade) => {
      const isBuy = trade.side === 'BUY';
      const unitsLost = Math.max(1, Math.floor(trade.usdValue / 8000));
      const newItem = {
        id: 't-' + trade.id + '-' + Math.random(),
        type: trade.isWhale ? 'WHALE' : 'TRADE',
        side: trade.side,
        title: trade.isWhale ? `Whale ${isBuy ? 'Buy' : 'Sell'} Trade` : `${isBuy ? 'Buy' : 'Sell'} Order`,
        amount: `$${(trade.usdValue / 1000).toFixed(1)}K`,
        casualties: `${isBuy ? 'Bears' : 'Bulls'} -${unitsLost} units`,
        time: trade.time,
        isBuy,
      };

      setFeedItems((prev) => [newItem, ...prev.slice(0, 35)]);
    });

    // Subscribe to liquidations
    const unsubLiqs = marketEngine.subscribeLiquidations((liq) => {
      const isShortLiq = liq.type === 'SHORT';
      const newItem = {
        id: 'l-' + liq.id + '-' + Math.random(),
        type: 'LIQUIDATION',
        side: isShortLiq ? 'BUY' : 'SELL',
        title: `Liquidated ${liq.type.toLowerCase()} • ${liq.exchange}`,
        amount: `$${(liq.amountUSD / 1000).toFixed(0)}K`,
        casualties: `${isShortLiq ? 'Bears' : 'Bulls'} -${liq.units} units`,
        time: liq.time,
        isBuy: isShortLiq,
      };

      setFeedItems((prev) => [newItem, ...prev.slice(0, 35)]);
    });

    return () => {
      unsubTrades();
      unsubLiqs();
    };
  }, []);

  return (
    <div className="glass-panel p-3.5 w-84 max-h-64 flex flex-col gap-2 pointer-events-auto">
      {/* Header */}
      <div className="flex items-center justify-between text-[11px] font-mono border-b border-white/10 pb-2">
        <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-300">
          <Crosshair className="w-3.5 h-3.5 text-red-400" />
          <span>MARKET FEED / COMBAT LOG</span>
        </div>
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">LIVE</span>
      </div>

      {/* Feed List */}
      <div ref={listRef} className="flex flex-col gap-1.5 overflow-y-auto pr-1">
        {feedItems.length === 0 ? (
          <div className="text-xs font-mono text-slate-500 py-4 text-center">Awaiting market combat activity...</div>
        ) : (
          feedItems.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between p-2 rounded text-xs font-mono border transition-all ${
                item.type === 'LIQUIDATION'
                  ? 'bg-amber-950/30 border-amber-500/40 text-amber-200 animate-pulse'
                  : item.type === 'WHALE'
                  ? item.isBuy
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                  : 'bg-slate-900/60 border-white/5 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {item.type === 'LIQUIDATION' ? (
                  <Skull className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                ) : item.isBuy ? (
                  <TrendingUp className="w-3.5 h-3.5 text-bull shrink-0" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-bear shrink-0" />
                )}

                <div className="flex flex-col">
                  <span className="font-bold text-[11px] leading-tight">{item.title}</span>
                  <span className="text-[10px] opacity-75">{item.casualties}</span>
                </div>
              </div>

              <div className="flex flex-col items-end shrink-0">
                <span className={`font-extrabold text-[11px] ${item.isBuy ? 'text-bull' : 'text-bear'}`}>{item.amount}</span>
                <span className="text-[9px] text-slate-500">{item.time}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
