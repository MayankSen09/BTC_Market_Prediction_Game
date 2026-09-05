import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ShieldCheck, Target, Zap, Award } from 'lucide-react';

export function Missions() {
  const missions = [
    { id: 1, title: 'MISSION 01: READ DIRECTION', desc: 'Predict price direction accurately on a 30s binary market.', reward: '+50 WP', status: 'COMPLETED' },
    { id: 2, title: 'MISSION 02: LIQUIDITY WALL IDENTIFIER', desc: 'Identify the dominant liquidity wall on the order book depth chart.', reward: '+75 WP', status: 'COMPLETED' },
    { id: 3, title: 'MISSION 03: WHALE DETECTIVE', desc: 'Place a prediction immediately following a $100K+ whale order.', reward: '+100 WP', status: 'AVAILABLE' },
    { id: 4, title: 'MISSION 04: CONTRARIAN STRIKE', desc: 'Win a prediction against > 75% crowd consensus.', reward: '+200 WP', status: 'AVAILABLE' },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto w-full flex flex-col gap-6 text-slate-100 font-mono">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <Target className="w-7 h-7 text-emerald-400" />
          <h2 className="text-2xl font-black font-display text-white">TACTICAL ONBOARDING MISSIONS</h2>
        </div>
        <Badge variant="bull">2 OF 4 COMPLETED</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {missions.map((m) => (
          <Card key={m.id} className="bg-slate-900/80 border border-white/10 p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-sm text-white">{m.title}</span>
              <Badge variant={m.status === 'COMPLETED' ? 'bull' : 'gold'}>{m.status}</Badge>
            </div>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">{m.desc}</p>
            <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs">
              <span className="text-amber-400 font-bold">REWARD: {m.reward}</span>
              {m.status === 'AVAILABLE' && <Button variant="bull" size="sm">START MISSION</Button>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
