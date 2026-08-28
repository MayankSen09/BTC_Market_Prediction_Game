import React, { useState, useEffect } from 'react';
import { marketEngine } from '../services/marketData';
import { audioEngine } from '../services/audioEngine';
import confetti from 'canvas-confetti';
import { X, Award, Shield, Swords, TrendingUp, TrendingDown, Timer, Trophy, Sparkles } from 'lucide-react';

export function WarCommanderPanel({ isOpen, onClose }) {
  const [warPoints, setWarPoints] = useState(500);
  const [rank, setRank] = useState('Captain');
  const [winStreak, setWinStreak] = useState(0);

  const [selectedSide, setSelectedSide] = useState('BULL'); // 'BULL' or 'BEAR'
  const [betAmount, setBetAmount] = useState(50);
  const [activeBet, setActiveBet] = useState(null); // { side, entryPrice, startTime, duration: 30, timeLeft }

  const [currentPrice, setCurrentPrice] = useState(64547.02);

  useEffect(() => {
    const unsub = marketEngine.subscribePrice((data) => {
      setCurrentPrice(data.price);
    });
    return unsub;
  }, []);

  // Countdown timer cycle for active bets
  useEffect(() => {
    if (!activeBet) return;

    const interval = setInterval(() => {
      setActiveBet((prev) => {
        if (!prev) return null;
        const newTime = prev.timeLeft - 1;

        if (newTime <= 0) {
          // Resolve Bet Outcome!
          const endPrice = marketEngine.currentPrice;
          const priceDiff = endPrice - prev.entryPrice;
          const won = prev.side === 'BULL' ? priceDiff > 0 : priceDiff < 0;

          if (won) {
            const reward = prev.amount * 2;
            setWarPoints((pts) => pts + reward);
            setWinStreak((stk) => stk + 1);
            audioEngine.playChime(prev.side === 'BULL');

            // Launch victory confetti
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
              colors: prev.side === 'BULL' ? ['#00ff88', '#00e676', '#ffffff'] : ['#ff2a5f', '#ff1744', '#ffffff'],
            });
          } else {
            setWinStreak(0);
          }

          return null;
        }

        return { ...prev, timeLeft: newTime };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeBet]);

  // Update Rank based on War Points
  useEffect(() => {
    if (warPoints >= 2000) setRank('Field Marshal');
    else if (warPoints >= 1200) setRank('General');
    else if (warPoints >= 800) setRank('Major');
    else if (warPoints >= 400) setRank('Captain');
    else setRank('Private');
  }, [warPoints]);

  if (!isOpen) return null;

  const handlePlaceBet = (side) => {
    if (warPoints < betAmount || activeBet) return;

    setWarPoints((pts) => pts - betAmount);
    setSelectedSide(side);
    setActiveBet({
      side,
      entryPrice: currentPrice,
      amount: betAmount,
      duration: 30,
      timeLeft: 30,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-lg p-6 relative flex flex-col gap-5 border-t-4 border-t-emerald-500 shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Swords className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black font-display text-white tracking-wide flex items-center gap-2">
              <span>WAR COMMANDER TACTICAL BETS</span>
            </h2>
            <p className="text-xs text-slate-400 font-mono">Predict 30s Market Frontline Push to Earn War Points</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-900/80 p-3 rounded-xl border border-white/5 flex flex-col items-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase">COMMANDER RANK</span>
            <span className="text-sm font-extrabold font-display text-emerald-400 flex items-center gap-1 mt-0.5">
              <Award className="w-4 h-4" />
              {rank}
            </span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-white/5 flex flex-col items-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase">WAR POINTS</span>
            <span className="text-sm font-extrabold font-mono text-amber-300 flex items-center gap-1 mt-0.5">
              <Trophy className="w-4 h-4 text-amber-400" />
              {warPoints.toLocaleString()} PTS
            </span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-white/5 flex flex-col items-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase">WIN STREAK</span>
            <span className="text-sm font-extrabold font-mono text-indigo-400 flex items-center gap-1 mt-0.5">
              <Sparkles className="w-4 h-4" />
              {winStreak} WINS
            </span>
          </div>
        </div>

        {/* Active Bet Status */}
        {activeBet ? (
          <div className="bg-slate-900/90 p-4 rounded-xl border border-amber-500/40 flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 text-amber-400 font-mono text-sm font-bold">
              <Timer className="w-4 h-4 animate-spin" />
              <span>TACTICAL ENGAGEMENT IN PROGRESS...</span>
            </div>

            <div className="text-3xl font-black font-mono text-white tracking-widest">{activeBet.timeLeft}s</div>

            <div className="w-full flex items-center justify-between text-xs font-mono pt-2 border-t border-white/10">
              <span className="text-slate-400">FACTION: <strong className={activeBet.side === 'BULL' ? 'text-bull' : 'text-bear'}>{activeBet.side}S</strong></span>
              <span className="text-slate-400">ENTRY: <strong>${activeBet.entryPrice.toLocaleString()}</strong></span>
              <span className="text-slate-400">STAKE: <strong>{activeBet.amount} PTS</strong></span>
            </div>
          </div>
        ) : (
          /* Bet Placement Form */
          <div className="flex flex-col gap-4">
            
            {/* Stake Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-mono text-slate-400 flex justify-between">
                <span>SELECT WAR STAKE</span>
                <span>AVAIL: {warPoints} PTS</span>
              </label>
              <div className="grid grid-cols-4 gap-2 font-mono">
                {[25, 50, 100, 250].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setBetAmount(amt)}
                    disabled={warPoints < amt}
                    className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                      betAmount === amt
                        ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30'
                        : 'bg-slate-900/60 text-slate-300 border-white/10 hover:bg-slate-800'
                    }`}
                  >
                    {amt} PTS
                  </button>
                ))}
              </div>
            </div>

            {/* Faction Bet Buttons */}
            <div className="grid grid-cols-2 gap-4 mt-2">
              {/* Bull Bet */}
              <button
                onClick={() => handlePlaceBet('BULL')}
                disabled={warPoints < betAmount}
                className="group p-4 rounded-xl bg-gradient-to-br from-emerald-950/80 to-slate-900 border-2 border-emerald-500/50 hover:border-emerald-400 hover:shadow-xl hover:shadow-emerald-500/20 transition-all flex flex-col items-center gap-2"
              >
                <div className="p-3 rounded-full bg-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-7 h-7" />
                </div>
                <span className="text-base font-black font-display text-emerald-400 tracking-wider">BULLS PUSH</span>
                <span className="text-[11px] font-mono text-slate-400 text-center">Predict price will RISE in 30s</span>
              </button>

              {/* Bear Bet */}
              <button
                onClick={() => handlePlaceBet('BEAR')}
                disabled={warPoints < betAmount}
                className="group p-4 rounded-xl bg-gradient-to-br from-rose-950/80 to-slate-900 border-2 border-rose-500/50 hover:border-rose-400 hover:shadow-xl hover:shadow-rose-500/20 transition-all flex flex-col items-center gap-2"
              >
                <div className="p-3 rounded-full bg-rose-500/20 text-rose-400 group-hover:scale-110 transition-transform">
                  <TrendingDown className="w-7 h-7" />
                </div>
                <span className="text-base font-black font-display text-rose-400 tracking-wider">BEARS PUSH</span>
                <span className="text-[11px] font-mono text-slate-400 text-center">Predict price will FALL in 30s</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
