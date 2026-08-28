import React, { useEffect, useRef, useState } from 'react';
import { marketEngine } from '../services/marketData';
import { BarChart3 } from 'lucide-react';

export function OrderBookDepthChart() {
  const canvasRef = useRef(null);
  const [depthData, setDepthData] = useState({ bids: [], asks: [] });

  useEffect(() => {
    const unsub = marketEngine.subscribeDepth((data) => {
      setDepthData(data);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Background grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let y = 0; y < height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const bids = depthData.bids || [];
    const asks = depthData.asks || [];
    const midX = width / 2;

    // Draw Bid Cumulative Depth Area (Green / Left side)
    if (bids.length > 0) {
      ctx.beginPath();
      ctx.moveTo(0, height);

      let cumQty = 0;
      const maxCum = 250;

      bids.forEach((bid, i) => {
        cumQty += bid[1];
        const x = midX - (i / (bids.length - 1)) * midX;
        const y = height - (cumQty / maxCum) * (height - 15);
        ctx.lineTo(x, y);
      });

      ctx.lineTo(midX, height);
      ctx.closePath();

      const gradBid = ctx.createLinearGradient(0, 0, 0, height);
      gradBid.addColorStop(0, 'rgba(0, 230, 118, 0.5)');
      gradBid.addColorStop(1, 'rgba(0, 230, 118, 0.02)');
      ctx.fillStyle = gradBid;
      ctx.fill();

      ctx.strokeStyle = '#00e676';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw Ask Cumulative Depth Area (Red / Right side)
    if (asks.length > 0) {
      ctx.beginPath();
      ctx.moveTo(midX, height);

      let cumQty = 0;
      const maxCum = 250;

      asks.forEach((ask, i) => {
        cumQty += ask[1];
        const x = midX + (i / (asks.length - 1)) * midX;
        const y = height - (cumQty / maxCum) * (height - 15);
        ctx.lineTo(x, y);
      });

      ctx.lineTo(width, height);
      ctx.closePath();

      const gradAsk = ctx.createLinearGradient(0, 0, 0, height);
      gradAsk.addColorStop(0, 'rgba(255, 42, 95, 0.5)');
      gradAsk.addColorStop(1, 'rgba(255, 42, 95, 0.02)');
      ctx.fillStyle = gradAsk;
      ctx.fill();

      ctx.strokeStyle = '#ff2a5f';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Center divider tick
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(midX, height);
    ctx.lineTo(midX, height - 25);
    ctx.stroke();
  }, [depthData]);

  return (
    <div className="glass-panel p-3.5 w-80 flex flex-col gap-2 pointer-events-auto">
      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-300">
          <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
          <span>AGGREGATED SPOT DEPTH</span>
        </div>
        <span className="text-[10px] text-slate-500">BINANCE WS</span>
      </div>

      <div className="relative w-full h-24 bg-slate-950/60 rounded-md overflow-hidden border border-white/5">
        <canvas ref={canvasRef} width={280} height={96} className="w-full h-full" />
        <div className="absolute bottom-1 left-2 text-[10px] font-mono text-bull font-bold">BID WALL</div>
        <div className="absolute bottom-1 right-2 text-[10px] font-mono text-bear font-bold">ASK WALL</div>
      </div>
    </div>
  );
}
