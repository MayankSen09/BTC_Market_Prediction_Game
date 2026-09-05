import React, { useState, useEffect } from 'react';
import { marketService } from '../../engine/market/marketService';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge, Progress } from '../../components/ui/Badge';
import { Cpu, Activity, Zap, Compass, AlertTriangle, ShieldCheck } from 'lucide-react';

export function CommandIntelligence() {
  const [intelState, setIntelState] = useState({
    momentum: 78,
    orderFlow: 84,
    liquidity: 61,
    volatility: 72,
    whaleFlow: 66,
    signalText: 'Taker buy aggression increased over the last 15s while resistance thinned. Bulls currently possess stronger short-term setup.',
    confidencePct: 74,
    crowdSentimentBull: 82,
    marketOrderFlowBull: 61,
  });

  useEffect(() => {
    const unsub = marketService.subscribe((data) => {
      const score = data.pressureScore || 0;
      const momentumVal = Math.min(99, Math.max(10, Math.round(50 + score * 0.45)));
      setIntelState((prev) => ({
        ...prev,
        momentum: momentumVal,
        orderFlow: Math.min(99, Math.max(10, Math.round(50 + score * 0.4))),
        confidencePct: Math.min(95, Math.max(45, Math.round(50 + Math.abs(score) * 0.45))),
      }));
    });
    return unsub;
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full text-slate-100 font-mono">
      
      {/* GENERAL ATLAS AI Analysis */}
      <Card className="bg-slate-900/90 border border-indigo-500/40 p-4">
        <CardHeader>
          <div className="flex items-center gap-2 text-indigo-400 font-bold">
            <Cpu className="w-4 h-4" />
            <span>GENERAL ATLAS — COMMAND AI</span>
          </div>
          <Badge variant="gold">{intelState.confidencePct}% CONFIDENCE</Badge>
        </CardHeader>

        <CardContent className="mt-3">
          <p className="text-xs text-slate-300 font-sans leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-white/5">
            "{intelState.signalText}"
          </p>

          <div className="flex items-center justify-between mt-4 text-xs">
            <span className="text-slate-400">MODEL SIGNAL:</span>
            <span className="font-extrabold text-bull">BULL ADVANTAGE (74%)</span>
          </div>
        </CardContent>
      </Card>

      {/* Sentiment Divergence Indicator */}
      <Card className="bg-slate-900/90 border border-amber-500/40 p-4">
        <CardHeader>
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <AlertTriangle className="w-4 h-4" />
            <span>SENTIMENT DIVERGENCE</span>
          </div>
          <Badge variant="bear">DIVERGENCE DETECTED</Badge>
        </CardHeader>

        <CardContent className="mt-3 flex flex-col gap-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">CROWD SENTIMENT:</span>
              <span className="font-bold text-bull">{intelState.crowdSentimentBull}% BULLISH</span>
            </div>
            <Progress value={intelState.crowdSentimentBull} />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">MARKET ORDER FLOW:</span>
              <span className="font-bold text-bear">{intelState.marketOrderFlowBull}% BULLISH</span>
            </div>
            <Progress value={intelState.marketOrderFlowBull} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
