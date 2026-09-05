import React, { useState } from 'react';
import { LandingPage } from './features/landing/LandingPage';
import { WarRoom } from './features/warroom/WarRoom';
import { CommanderProfile } from './features/commander/CommanderProfile';
import { Leaderboards } from './features/leaderboard/Leaderboards';
import { Missions } from './features/missions/Missions';
import { ReplaySystem } from './features/replay/ReplaySystem';
import { Swords, Award, Trophy, Target, Film, ArrowLeft } from 'lucide-react';
import { Button } from './components/ui/Button';

export function App() {
  const [currentView, setCurrentView] = useState('LANDING'); // LANDING, WAR_ROOM, PROFILE, LEADERBOARDS, MISSIONS, REPLAY

  return (
    <div className="min-h-screen w-screen bg-[#080C14] text-slate-100 font-sans selection:bg-emerald-500 selection:text-black">
      
      {/* Persistent View Switcher Bar for sub-pages */}
      {currentView !== 'LANDING' && currentView !== 'WAR_ROOM' && (
        <header className="w-full bg-[#0D1320] border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setCurrentView('WAR_ROOM')}>
              <ArrowLeft className="w-4 h-4 mr-1" /> BACK TO WAR ROOM
            </Button>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <button
              onClick={() => setCurrentView('WAR_ROOM')}
              className={`px-3 py-1.5 rounded font-bold transition-all ${
                currentView === 'WAR_ROOM' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              WAR ROOM
            </button>
            <button
              onClick={() => setCurrentView('PROFILE')}
              className={`px-3 py-1.5 rounded font-bold transition-all ${
                currentView === 'PROFILE' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              PROFILE
            </button>
            <button
              onClick={() => setCurrentView('LEADERBOARDS')}
              className={`px-3 py-1.5 rounded font-bold transition-all ${
                currentView === 'LEADERBOARDS' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              LEADERBOARDS
            </button>
            <button
              onClick={() => setCurrentView('MISSIONS')}
              className={`px-3 py-1.5 rounded font-bold transition-all ${
                currentView === 'MISSIONS' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              MISSIONS
            </button>
            <button
              onClick={() => setCurrentView('REPLAY')}
              className={`px-3 py-1.5 rounded font-bold transition-all ${
                currentView === 'REPLAY' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              REPLAY
            </button>
          </div>
        </header>
      )}

      {/* Render Active View */}
      {currentView === 'LANDING' && <LandingPage onEnterWarRoom={() => setCurrentView('WAR_ROOM')} />}
      {currentView === 'WAR_ROOM' && <WarRoom onBackToLanding={() => setCurrentView('LANDING')} />}
      {currentView === 'PROFILE' && <CommanderProfile />}
      {currentView === 'LEADERBOARDS' && <Leaderboards />}
      {currentView === 'MISSIONS' && <Missions />}
      {currentView === 'REPLAY' && <ReplaySystem />}
    </div>
  );
}

export default App;
