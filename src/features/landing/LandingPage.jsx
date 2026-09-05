import React from 'react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Swords, ShieldAlert, Activity, Award, TrendingUp, Zap, ChevronRight, Play, Compass, RefreshCw } from 'lucide-react';

export function LandingPage({ onEnterWarRoom }) {
  return (
    <div className="min-h-screen w-full bg-[#080C14] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      
      {/* Sticky Top Navbar */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-[#080C14]/80 border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Swords className="w-5 h-5" />
          </div>
          <span className="font-display font-black text-lg tracking-wider text-white">BITCOIN WAR</span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-mono font-bold text-slate-400">
          <a href="#markets" className="hover:text-white transition-colors">MARKETS</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">HOW IT WORKS</a>
          <a href="#ranks" className="hover:text-white transition-colors">COMMANDER RANKS</a>
          <a href="#intelligence" className="hover:text-white transition-colors">INTELLIGENCE</a>
        </nav>

        <Button variant="bull" size="md" onClick={onEnterWarRoom}>
          ENTER THE WAR ROOM <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </header>

      {/* Hero Section */}
      <section className="relative w-full pt-20 pb-32 px-6 max-w-7xl mx-auto flex flex-col items-center text-center gap-8">
        
        <Badge variant="gold" className="px-3 py-1 text-xs uppercase tracking-widest animate-pulse">
          ⚡ REAL-TIME CRYPTO PREDICTION ARENA
        </Badge>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black font-display tracking-tight text-white max-w-5xl leading-[1.05]">
          THE MARKET IS THE BATTLEFIELD. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-rose-500">
            YOUR PREDICTION IS THE WEAPON.
          </span>
        </h1>

        <p className="text-lg md:text-xl font-sans text-slate-400 max-w-2xl font-light leading-relaxed">
          Bitcoin War transforms real-time cryptocurrency order flows, price velocity, and liquidations into an interactive 3D tactical command center.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
          <Button variant="bull" size="lg" onClick={onEnterWarRoom} className="w-full sm:w-auto">
            ENTER THE WAR ROOM <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
          <Button variant="outline" size="lg" onClick={onEnterWarRoom} className="w-full sm:w-auto">
            <Play className="w-4 h-4 mr-2" /> WATCH LIVE BATTLE
          </Button>
        </div>

        {/* Hero Interactive Terminal Card Preview */}
        <div className="w-full max-w-4xl mt-12 command-panel p-6 border border-white/10 shadow-2xl rounded-2xl flex flex-col gap-6 text-left">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xl font-extrabold text-white">$64,720.00</span>
              <span className="text-xs font-mono text-bull font-bold">+0.04% tick</span>
            </div>
            <Badge variant="bull">BULLS DOMINATING (74%)</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-slate-900/60 border border-emerald-500/30">
              <span className="text-xs font-mono text-slate-400 uppercase">BTC ABOVE $65,000 IN 30s</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-mono font-black text-bull">YES 68¢</span>
                <span className="text-xs font-mono text-slate-400">≈ 68% IMPLIED PROBABILITY</span>
              </div>
            </Card>

            <Card className="bg-slate-900/60 border border-rose-500/30">
              <span className="text-xs font-mono text-slate-400 uppercase">BTC BELOW $65,000 IN 30s</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-mono font-black text-bear">NO 32¢</span>
                <span className="text-xs font-mono text-slate-400">≈ 32% IMPLIED PROBABILITY</span>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="w-full py-24 bg-[#0D1320] border-y border-white/5 px-6">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center gap-16">
          <div className="flex flex-col gap-3">
            <span className="text-xs font-mono text-indigo-400 uppercase font-bold tracking-widest">TACTICAL PROTOCOL</span>
            <h2 className="text-3xl md:text-5xl font-black font-display text-white">HOW IT WORKS</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
            <Card className="p-8 text-left bg-slate-900/80 border border-white/10 hover:border-emerald-500/40 transition-all">
              <span className="text-4xl font-mono font-black text-emerald-400">01</span>
              <h3 className="text-xl font-bold font-display text-white mt-4">READ THE MARKET</h3>
              <p className="text-sm text-slate-400 font-sans mt-2 leading-relaxed">
                Watch real-time Binance order flows, buy/sell liquidity walls, and price acceleration metrics.
              </p>
            </Card>

            <Card className="p-8 text-left bg-slate-900/80 border border-white/10 hover:border-emerald-500/40 transition-all">
              <span className="text-4xl font-mono font-black text-indigo-400">02</span>
              <h3 className="text-xl font-bold font-display text-white mt-4">MAKE YOUR CALL</h3>
              <p className="text-sm text-slate-400 font-sans mt-2 leading-relaxed">
                Take a position on short-duration 30s binary, threshold, or volatility prediction contracts.
              </p>
            </Card>

            <Card className="p-8 text-left bg-slate-900/80 border border-white/10 hover:border-emerald-500/40 transition-all">
              <span className="text-4xl font-mono font-black text-amber-400">03</span>
              <h3 className="text-xl font-bold font-display text-white mt-4">COMMAND THE BATTLE</h3>
              <p className="text-sm text-slate-400 font-sans mt-2 leading-relaxed">
                Your prediction influences 3D tank artillery, laser skirmishes, and territory capture as markets resolve deterministically.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Ranks Section */}
      <section id="ranks" className="w-full py-24 px-6 max-w-6xl mx-auto flex flex-col items-center text-center gap-12">
        <div className="flex flex-col gap-3">
          <span className="text-xs font-mono text-amber-400 uppercase font-bold tracking-widest">PROGRESSION SYSTEM</span>
          <h2 className="text-3xl md:text-5xl font-black font-display text-white">COMMANDER RANKS</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 w-full font-mono text-xs">
          {['Private', 'Corporal', 'Sergeant', 'Lieutenant', 'Captain', 'Major', 'Colonel', 'General', 'Field Marshal'].map((rank, idx) => (
            <Card key={rank} className="p-4 items-center justify-center text-center bg-slate-900/60 border border-white/5 hover:border-amber-500/40">
              <Award className="w-6 h-6 text-amber-400 mb-2" />
              <span className="font-extrabold text-white text-sm">{rank}</span>
              <span className="text-[10px] text-slate-500 mt-1">LEVEL {idx + 1}</span>
            </Card>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="w-full py-24 bg-gradient-to-b from-[#0D1320] to-[#080C14] border-t border-white/5 px-6 flex flex-col items-center text-center gap-8">
        <h2 className="text-4xl md:text-6xl font-black font-display text-white max-w-3xl">
          CHOOSE YOUR SIDE.
        </h2>
        <div className="flex flex-col sm:flex-row gap-6 w-full max-w-md">
          <Button variant="bull" size="lg" onClick={onEnterWarRoom} className="w-full">
            JOIN THE BULLS
          </Button>
          <Button variant="bear" size="lg" onClick={onEnterWarRoom} className="w-full">
            JOIN THE BEARS
          </Button>
        </div>
      </section>
    </div>
  );
}
