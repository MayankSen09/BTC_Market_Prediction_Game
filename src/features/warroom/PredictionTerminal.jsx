import React, { useState, useEffect } from 'react';
import { predictionEngine } from '../../engine/prediction/predictionEngine';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { TrendingUp, TrendingDown, Clock, ShieldCheck, Award, Zap } from 'lucide-react';

export function PredictionTerminal() {
  const [predictionState, setPredictionState] = useState({
    markets: [],
    positions: [],
    warPoints: 500,
    rank: 'Captain',
  });

  const [selectedMarket, setSelectedMarket] = useState(null);
  const [selectedSide, setSelectedSide] = useState('YES');
  const [stake, setStake] = useState(50);

  useEffect(() => {
    const unsub = predictionEngine.subscribe((data) => {
      setPredictionState(data);
    });
    return unsub;
  }, []);

  const handleExecute = () => {
    if (!selectedMarket) return;
    predictionEngine.placeOrder(selectedMarket.id, selectedSide, stake);
    setSelectedMarket(null);
  };

  return (
    <div className="flex flex-col gap-4 w-full text-slate-100 font-mono">
      {/* Active Prediction Market Contracts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {predictionState.markets.map((market) => {
          const yesPct = Math.round(market.yesPrice * 100);
          const noPct = Math.round(market.noPrice * 100);

          return (
            <Card
              key={market.id}
              className="bg-slate-900/80 border border-white/10 hover:border-emerald-500/40 p-4 transition-all"
            >
              <div className="flex items-center justify-between">
                <Badge variant="blue">{market.type}</Badge>
                <div className="flex items-center gap-1 text-xs text-amber-400 font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{market.timeLeft || market.duration}s</span>
                </div>
              </div>

              <h4 className="text-sm font-extrabold font-display text-white mt-2 leading-tight">
                {market.title}
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{market.description}</p>

              {/* Price & Probability Row */}
              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/5">
                <button
                  onClick={() => {
                    setSelectedMarket(market);
                    setSelectedSide('YES');
                  }}
                  className="p-2.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/40 flex flex-col items-center gap-1 transition-all"
                >
                  <span className="text-[10px] text-slate-400 font-bold">BUY YES</span>
                  <span className="text-base font-extrabold text-bull">{yesPct}¢</span>
                  <span className="text-[9px] text-slate-400 font-normal">≈ {yesPct}% prob</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedMarket(market);
                    setSelectedSide('NO');
                  }}
                  className="p-2.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/50 border border-rose-500/40 flex flex-col items-center gap-1 transition-all"
                >
                  <span className="text-[10px] text-slate-400 font-bold">BUY NO</span>
                  <span className="text-base font-extrabold text-bear">{noPct}¢</span>
                  <span className="text-[9px] text-slate-400 font-normal">≈ {noPct}% prob</span>
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Active User Positions */}
      {predictionState.positions.length > 0 && (
        <Card className="bg-slate-900/90 border border-white/10 p-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            ACTIVE PREDICTION POSITIONS
          </h4>
          <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
            {predictionState.positions.map((pos) => (
              <div
                key={pos.id}
                className="flex items-center justify-between p-2.5 rounded bg-slate-950/60 border border-white/5 text-xs"
              >
                <div className="flex items-center gap-3">
                  <Badge variant={pos.side === 'YES' ? 'bull' : 'bear'}>
                    {pos.side} ({pos.shares} SHARES)
                  </Badge>
                  <span className="font-bold text-white">{pos.marketTitle}</span>
                </div>

                <div className="flex items-center gap-4 text-xs font-bold">
                  <span className="text-slate-400">STAKE: {pos.stakePoints} PTS</span>
                  <span className={pos.status === 'WON' ? 'text-bull' : pos.status === 'LOST' ? 'text-bear' : 'text-amber-400'}>
                    {pos.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Contract Execution Modal */}
      {selectedMarket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <Card className="w-full max-w-md bg-slate-900 border-2 border-emerald-500/50 p-6 flex flex-col gap-4">
            <h3 className="text-base font-extrabold font-display text-white">CONFIRM PREDICTION</h3>
            <p className="text-xs text-slate-400">{selectedMarket.title}</p>

            <div className="flex items-center justify-between p-3 rounded bg-slate-950 border border-white/10 text-xs">
              <span>POSITION SIDE:</span>
              <Badge variant={selectedSide === 'YES' ? 'bull' : 'bear'}>{selectedSide}</Badge>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs text-slate-400">STAKE WAR POINTS:</label>
              <div className="grid grid-cols-4 gap-2">
                {[25, 50, 100, 200].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setStake(amt)}
                    disabled={predictionState.warPoints < amt}
                    className={`py-2 rounded text-xs font-bold border ${
                      stake === amt ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-800 border-white/10 text-slate-300'
                    }`}
                  >
                    {amt} PTS
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-4">
              <Button variant="outline" size="sm" onClick={() => setSelectedMarket(null)}>
                CANCEL
              </Button>
              <Button variant={selectedSide === 'YES' ? 'bull' : 'bear'} size="sm" onClick={handleExecute}>
                CONFIRM PREDICTION
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
