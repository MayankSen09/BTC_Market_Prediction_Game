/**
 * BITCOIN WAR — Prediction Market & Settlement Engine
 * Handles prediction markets, order placements, position execution,
 * implied probabilities, 30s/60s settlement timers, and War Points.
 */

import { marketService } from '../market/marketService';
import { audioEngine } from '../../audio/audioEngine';
import confetti from 'canvas-confetti';

export class PredictionEngine {
  constructor() {
    this.activeMarkets = [];
    this.userPositions = [];
    this.resolvedHistory = [];

    this.warPoints = 500;
    this.rank = 'Captain';
    this.winStreak = 0;
    this.totalPredictions = 0;
    this.successfulPredictions = 0;

    this.listeners = new Set();
    this.initDefaultMarkets();
  }

  initDefaultMarkets() {
    const now = Date.now();
    const currentPrice = marketService.currentPrice || 64720;

    this.activeMarkets = [
      {
        id: 'm1-' + now,
        type: 'BINARY_DIRECTION',
        title: 'BTC HIGHER IN 30 SECONDS',
        description: 'Will BTC price be higher than entry price at market expiry?',
        duration: 30,
        expiresAt: now + 30000,
        openPrice: currentPrice,
        targetPrice: currentPrice,
        yesPrice: 0.65,
        noPrice: 0.35,
        volumeUSD: 42800,
        status: 'OPEN',
      },
      {
        id: 'm2-' + now,
        type: 'THRESHOLD',
        title: `BTC BREAK $${(Math.ceil(currentPrice / 100) * 100).toLocaleString()}`,
        description: 'Will BTC price cross the resistance fortress level before expiry?',
        duration: 60,
        expiresAt: now + 60000,
        openPrice: currentPrice,
        targetPrice: Math.ceil(currentPrice / 100) * 100,
        yesPrice: 0.58,
        noPrice: 0.42,
        volumeUSD: 89400,
        status: 'OPEN',
      },
      {
        id: 'm3-' + now,
        type: 'VOLATILITY',
        title: 'BTC MOVE > 0.15% IN 60s',
        description: 'Will BTC price experience high volatility spike?',
        duration: 60,
        expiresAt: now + 60000,
        openPrice: currentPrice,
        targetPrice: currentPrice * 1.0015,
        yesPrice: 0.45,
        noPrice: 0.55,
        volumeUSD: 31200,
        status: 'OPEN',
      },
    ];

    this.startResolutionTimer();
  }

  startResolutionTimer() {
    setInterval(() => {
      const now = Date.now();
      let hasUpdates = false;

      this.activeMarkets.forEach((market) => {
        const timeLeft = Math.max(0, Math.ceil((market.expiresAt - now) / 1000));
        market.timeLeft = timeLeft;

        if (timeLeft <= 0 && market.status === 'OPEN') {
          this.resolveMarket(market);
          hasUpdates = true;
        }
      });

      if (hasUpdates) this.notifyState();
    }, 1000);
  }

  placeOrder(marketId, side, stakePoints) {
    if (this.warPoints < stakePoints) return { success: false, reason: 'INSUFFICIENT_WAR_POINTS' };

    const market = this.activeMarkets.find((m) => m.id === marketId);
    if (!market || market.status !== 'OPEN') return { success: false, reason: 'MARKET_CLOSED' };

    this.warPoints -= stakePoints;
    this.totalPredictions++;

    const contractPrice = side === 'YES' ? market.yesPrice : market.noPrice;
    const shares = Math.floor(stakePoints / contractPrice);

    const position = {
      id: 'pos-' + Date.now(),
      marketId,
      marketTitle: market.title,
      side, // 'YES' or 'NO'
      stakePoints,
      shares,
      entryPrice: market.openPrice,
      targetPrice: market.targetPrice,
      contractPrice,
      openedAt: Date.now(),
      expiresAt: market.expiresAt,
      status: 'ACTIVE',
    };

    this.userPositions.unshift(position);
    audioEngine.playLaser(side === 'YES');
    this.notifyState();

    return { success: true, position };
  }

  resolveMarket(market) {
    market.status = 'RESOLVED';
    const finalPrice = marketService.currentPrice;
    market.finalPrice = finalPrice;

    // Determine winning outcome
    let yesWon = false;
    if (market.type === 'BINARY_DIRECTION') {
      yesWon = finalPrice >= market.openPrice;
    } else if (market.type === 'THRESHOLD') {
      yesWon = finalPrice >= market.targetPrice;
    } else if (market.type === 'VOLATILITY') {
      yesWon = Math.abs(finalPrice - market.openPrice) / market.openPrice >= 0.0015;
    }

    market.winningOutcome = yesWon ? 'YES' : 'NO';

    // Settle open user positions
    this.userPositions.forEach((pos) => {
      if (pos.marketId === market.id && pos.status === 'ACTIVE') {
        const won = pos.side === market.winningOutcome;
        pos.status = won ? 'WON' : 'LOST';

        if (won) {
          this.successfulPredictions++;
          this.winStreak++;
          const payout = Math.round(pos.shares * 1.0);
          pos.payout = payout;
          this.warPoints += payout;

          audioEngine.playChime(pos.side === 'YES');
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.6 },
            colors: pos.side === 'YES' ? ['#00E676', '#00ff88'] : ['#FF2A5F', '#ff3366'],
          });
        } else {
          this.winStreak = 0;
          pos.payout = 0;
        }

        this.resolvedHistory.unshift(pos);
      }
    });

    this.updateRank();
    this.notifyState();

    // Respawn new market contract after resolution
    setTimeout(() => this.initDefaultMarkets(), 4000);
  }

  updateRank() {
    if (this.warPoints >= 3000) this.rank = 'Field Marshal';
    else if (this.warPoints >= 2000) this.rank = 'General';
    else if (this.warPoints >= 1400) this.rank = 'Colonel';
    else if (this.warPoints >= 900) this.rank = 'Major';
    else if (this.warPoints >= 500) this.rank = 'Captain';
    else if (this.warPoints >= 250) this.rank = 'Lieutenant';
    else if (this.warPoints >= 100) this.rank = 'Sergeant';
    else this.rank = 'Private';
  }

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  notifyState() {
    const accuracy =
      this.totalPredictions > 0
        ? ((this.successfulPredictions / this.totalPredictions) * 100).toFixed(1)
        : '0.0';

    const payload = {
      markets: this.activeMarkets,
      positions: this.userPositions,
      history: this.resolvedHistory,
      warPoints: this.warPoints,
      rank: this.rank,
      winStreak: this.winStreak,
      accuracy,
      totalPredictions: this.totalPredictions,
    };

    this.listeners.forEach((fn) => fn(payload));
  }
}

export const predictionEngine = new PredictionEngine();
