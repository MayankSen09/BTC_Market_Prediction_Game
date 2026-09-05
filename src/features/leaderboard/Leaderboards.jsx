import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Trophy, Swords, Shield, Flame } from 'lucide-react';

export function Leaderboards() {
  const commanders = [
    { rank: 1, name: 'Commander_Vortex', title: 'Field Marshal', winRate: '78.4%', pts: 4820, faction: 'BULLS' },
    { rank: 2, name: 'Satoshi_Blade', title: 'General', winRate: '74.2%', pts: 3950, faction: 'BEARS' },
    { rank: 3, name: 'Cipher_Whale', title: 'General', winRate: '71.9%', pts: 3410, faction: 'BULLS' },
    { rank: 4, name: 'Apex_Trader', title: 'Colonel', winRate: '69.5%', pts: 2890, faction: 'BEARS' },
    { rank: 5, name: 'Quantum_Bull', title: 'Major', winRate: '67.8%', pts: 2150, faction: 'BULLS' },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto w-full flex flex-col gap-6 text-slate-100 font-mono">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <Trophy className="w-7 h-7 text-amber-400" />
          <h2 className="text-2xl font-black font-display text-white">SEASON 01 — GENESIS WAR LEADERBOARDS</h2>
        </div>
        <Badge variant="gold">SEASON ACTIVE</Badge>
      </div>

      {/* Legion Clan Battle Banner */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-emerald-950/40 border border-emerald-500/40 p-4 flex flex-col items-center text-center">
          <span className="text-xs text-slate-400 font-bold">BULL LEGION SCORE</span>
          <span className="text-3xl font-black font-display text-bull mt-1">142,850 PTS</span>
          <span className="text-[10px] text-slate-400 mt-1">54.2% DOMINANCE</span>
        </Card>

        <Card className="bg-rose-950/40 border border-rose-500/40 p-4 flex flex-col items-center text-center">
          <span className="text-xs text-slate-400 font-bold">BEAR LEGION SCORE</span>
          <span className="text-3xl font-black font-display text-bear mt-1">120,410 PTS</span>
          <span className="text-[10px] text-slate-400 mt-1">45.8% DOMINANCE</span>
        </Card>
      </div>

      {/* Top Commanders Table */}
      <Card className="bg-slate-900/80 border border-white/10 p-4">
        <CardHeader>
          <CardTitle>TOP COMMANDER RANKINGS</CardTitle>
        </CardHeader>
        <div className="flex flex-col gap-2 mt-3">
          {commanders.map((c) => (
            <div
              key={c.rank}
              className="flex items-center justify-between p-3 rounded bg-slate-950/60 border border-white/5 text-xs font-mono"
            >
              <div className="flex items-center gap-4">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${
                  c.rank === 1 ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-300'
                }`}>
                  {c.rank}
                </span>
                <div>
                  <span className="font-bold text-white text-sm">{c.name}</span>
                  <span className="text-[10px] text-slate-400 ml-2">[{c.title}]</span>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <Badge variant={c.faction === 'BULLS' ? 'bull' : 'bear'}>{c.faction}</Badge>
                <span className="text-slate-300">WIN RATE: {c.winRate}</span>
                <span className="font-extrabold text-amber-300">{c.pts} PTS</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
