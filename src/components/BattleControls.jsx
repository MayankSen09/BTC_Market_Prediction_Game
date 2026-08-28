import React, { useState } from 'react';
import { audioEngine } from '../services/audioEngine';
import { marketEngine } from '../services/marketData';
import { Camera, Volume2, VolumeX, Eye, SlidersHorizontal, Radio, Play, Pause } from 'lucide-react';

export function BattleControls({ cameraMode, setCameraMode, onOpenCommander }) {
  const [isMuted, setIsMuted] = useState(true);
  const [isLiveFeed, setIsLiveFeed] = useState(true);

  const handleToggleAudio = () => {
    const nextMuted = audioEngine.toggleMute();
    setIsMuted(nextMuted);
  };

  const handleToggleFeed = () => {
    const nextFeed = !isLiveFeed;
    setIsLiveFeed(nextFeed);
    marketEngine.toggleLiveMode(nextFeed);
  };

  return (
    <div className="glass-panel p-2 flex items-center gap-2 pointer-events-auto shadow-2xl">
      {/* Camera Modes */}
      <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-white/5">
        <button
          onClick={() => setCameraMode('ISOMETRIC')}
          className={`px-3 py-1.5 rounded text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
            cameraMode === 'ISOMETRIC' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-white'
          }`}
          title="3D Isometric Camera View"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>ISOMETRIC</span>
        </button>

        <button
          onClick={() => setCameraMode('OVERHEAD')}
          className={`px-3 py-1.5 rounded text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
            cameraMode === 'OVERHEAD' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-white'
          }`}
          title="Top-Down Tactical Grid View"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>TACTICAL</span>
        </button>

        <button
          onClick={() => setCameraMode('CINEMATIC')}
          className={`px-3 py-1.5 rounded text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
            cameraMode === 'CINEMATIC' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:text-white'
          }`}
          title="Frontline Close-up Cinematic View"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>CINEMATIC</span>
        </button>
      </div>

      <div className="w-px h-6 bg-white/10" />

      {/* Audio Mute Toggle */}
      <button
        onClick={handleToggleAudio}
        className={`p-2 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all border ${
          !isMuted ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-900/80 text-slate-400 border-white/5 hover:text-white'
        }`}
        title={isMuted ? 'Unmute Combat Audio' : 'Mute Combat Audio'}
      >
        {!isMuted ? <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
        <span className="hidden sm:inline">{!isMuted ? 'SFX ON' : 'SFX MUTED'}</span>
      </button>

      {/* Live / Sim Data Toggle */}
      <button
        onClick={handleToggleFeed}
        className={`px-3 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all border ${
          isLiveFeed ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
        }`}
        title="Toggle between Live Binance WS data and Demo Simulation mode"
      >
        <Radio className={`w-3.5 h-3.5 ${isLiveFeed ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
        <span>{isLiveFeed ? 'BINANCE LIVE' : 'SIMULATION'}</span>
      </button>

      <div className="w-px h-6 bg-white/10" />

      {/* Open War Commander Bet Mini-Game */}
      <button
        onClick={onOpenCommander}
        className="px-4 py-2 rounded-lg text-xs font-mono font-extrabold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 flex items-center gap-1.5 shadow-lg shadow-emerald-500/25 transition-all"
      >
        <span>WAR COMMANDER GAME</span>
      </button>
    </div>
  );
}
