/**
 * BITCOIN WAR — Market Pressure Engine
 * Calculates normalized market pressure (-100 to +100) using PRD weighted metrics.
 */

export class MarketPressureEngine {
  constructor() {
    this.tradeMomentum = 0; // -100 to +100
    this.bookImbalance = 0; // -100 to +100
    this.aggressiveFlowImbalance = 0; // -100 to +100
    this.volatility = 0; // 0 to 100
    this.acceleration = 0; // -100 to +100
  }

  calculate(priceData) {
    const tickDelta = priceData.tickDelta || 0;
    const buyWall = parseFloat(priceData.buyWallTotal) || 45.0;
    const sellWall = parseFloat(priceData.sellWallTotal) || 60.0;

    // 1. Trade Momentum (30%)
    this.tradeMomentum = Math.max(-100, Math.min(100, tickDelta * 2000));

    // 2. Order Book Imbalance (25%)
    const wallTotal = buyWall + sellWall || 1;
    this.bookImbalance = ((buyWall - sellWall) / wallTotal) * 100;

    // 3. Aggressive Flow Imbalance (20%)
    this.aggressiveFlowImbalance = Math.max(-100, Math.min(100, tickDelta * 1500));

    // 4. Price Acceleration (10%)
    this.acceleration = Math.max(-100, Math.min(100, (priceData.price - priceData.prevPrice) * 10));

    // Weighted Formula
    const score = Math.round(
      0.3 * this.tradeMomentum +
        0.25 * this.bookImbalance +
        0.2 * this.aggressiveFlowImbalance +
        0.1 * this.acceleration
    );

    const normalizedScore = Math.max(-100, Math.min(100, score));

    let state = 'CONTESTED';
    if (normalizedScore >= 70) state = 'BULLS DOMINATING';
    else if (normalizedScore >= 30) state = 'BULL ADVANTAGE';
    else if (normalizedScore <= -70) state = 'BEARS DOMINATING';
    else if (normalizedScore <= -30) state = 'BEAR ADVANTAGE';

    return {
      score: normalizedScore,
      state,
      bullProbability: Math.min(95, Math.max(5, Math.round(50 + normalizedScore * 0.45))),
      bearProbability: Math.min(95, Math.max(5, Math.round(50 - normalizedScore * 0.45))),
    };
  }
}

export const marketPressure = new MarketPressureEngine();
