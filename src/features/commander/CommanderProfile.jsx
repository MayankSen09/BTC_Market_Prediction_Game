import React, { useState, useEffect } from 'react';
import { predictionEngine } from '../../engine/prediction/predictionEngine';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge, Progress } from '../../components/ui/Badge';
import { Award, Trophy, Target, Zap, Shield, Sparkles, Activity } from 'lucide-react';

export function CommanderProfile() {
  const [profile, setProfile] = useState({
    rank: 'Captain',
    warPoints: 500,
    accuracy: '68.4',
    totalPredictions: 12,
    winStreak: 3,
  });

  useEffect(() => {
    const unsub = predictionEngine.subscribe((data) => {
      setProfile({
        rank: data.rank,
        warPoints: data.warPoints,
        accuracy: data.accuracy,
        totalPredictions: data.totalPredictions,
        winStreak: data.winStreak,
      });
    });
    return unsub;
  }, []);

  const dnaStats = [
    { label: 'MOMENTUM', value: 78 },
    { label: 'CONTRARIAN', value: 82 },
    { label: 'VOLATILITY', value: 64 },
    { label: 'MEAN REVERSION', value: 55 },
    { label: 'AGGRESSION', value: 70 },
    { label: 'PATIENCE', value: 85 },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto w-full flex flex-col gap-6 text-slate-100 font-mono">
      <div className="flex items-center gap-4 border-b border-white/10 pb-4">
        <div className="p-4 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400">
          <Award className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-black font-display text-white">COMMANDER SERVICE RECORD</h2>
          <p className="text-xs text-slate-400">Tactical Profile & Behavioral Prediction DNA</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-900/80 p-4 border border-white/10 flex flex-col items-center text-center">
          <span className="text-xs text-slate-400">CURRENT RANK</span>
          <span className="text-2xl font-black font-display text-emerald-400 mt-1">{profile.rank}</span>
          <Badge variant="gold" className="mt-2">LEVEL 5</Badge>
        </Card>

        <Card className="bg-slate-900/80 p-4 border border-white/10 flex flex-col items-center text-center">
          <span className="text-xs text-slate-400">WAR POINTS</span>
          <span className="text-2xl font-black font-mono text-amber-300 mt-1">{profile.warPoints} PTS</span>
          <span className="text-[10px] text-slate-500 mt-1">FOR RANK & UNLOCKS</span>
        </Card>

        <Card className="bg-slate-900/80 p-4 border border-white/10 flex flex-col items-center text-center">
          <span className="text-xs text-slate-400">ACCURACY RATE</span>
          <span className="text-2xl font-black font-mono text-indigo-400 mt-1">{profile.accuracy}%</span>
          <span className="text-[10px] text-slate-500 mt-1">{profile.winStreak} STREAK WINS</span>
        </Card>
      </div>

      {/* Prediction DNA Stats */}
      <Card className="bg-slate-900/80 p-6 border border-white/10">
        <CardHeader>
          <CardTitle>PREDICTION DNA ANALYSIS</CardTitle>
          <Badge variant="blue">BEHAVIORAL SPECTRUM</Badge>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {dnaStats.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">{stat.label}</span>
                <span className="text-emerald-400">{stat.value}%</span>
              </div>
              <Progress value={stat.value} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
