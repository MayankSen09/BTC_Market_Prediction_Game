import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Play, Pause, RotateCcw, FastForward, Film } from 'lucide-react';

export function ReplaySystem() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState('1x');
  const [progress, setProgress] = useState(35);

  return (
    <div className="p-6 max-w-5xl mx-auto w-full flex flex-col gap-6 text-slate-100 font-mono">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <Film className="w-7 h-7 text-indigo-400" />
          <h2 className="text-2xl font-black font-display text-white">HISTORICAL BATTLE REPLAY</h2>
        </div>
        <Badge variant="blue">SYSTEM ACTIVE</Badge>
      </div>

      <Card className="bg-slate-900/80 border border-white/10 p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">BATTLE #8420 — $65K SIEGE MOMENT</h3>
            <span className="text-xs text-slate-400">TIMESTAMP: 2026-08-28 21:40:00 UTC</span>
          </div>
          <Badge variant="gold">RESULT: BULLS WIN</Badge>
        </div>

        {/* Scrubber Bar */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-xs text-slate-400">
            <span>00:00</span>
            <span>00:30 (EXPIRY)</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={(e) => setProgress(e.target.value)}
            className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsPlaying(!isPlaying)}>
              {isPlaying ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
              {isPlaying ? 'PAUSE' : 'PLAY'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setProgress(0)}>
              <RotateCcw className="w-4 h-4 mr-1" /> REWIND
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">SPEED:</span>
            {['0.5x', '1x', '2x', '5x'].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2 py-1 rounded text-xs font-bold ${
                  speed === s ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
