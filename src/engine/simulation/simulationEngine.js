/**
 * BITCOIN WAR — Multi-Preset Simulation Engine
 * Generates realistic market data events for offline testing and demo scenarios.
 */

import { eventBus } from '../events/eventBus';

export class SimulationEngine {
  constructor() {
    this.preset = 'NORMAL'; // CALM, NORMAL, VOLATILE, BLACK_SWAN, DEMO_SCRIPT
    this.isRunning = false;
    this.intervalId = null;
    this.demoStep = 0;
    this.currentPrice = 64720.0;
  }

  setPreset(preset) {
    this.preset = preset;
    this.demoStep = 0;
  }

  start(onTick) {
    if (this.isRunning) return;
    this.isRunning = true;

    this.intervalId = setInterval(() => {
      if (this.preset === 'DEMO_SCRIPT') {
        this.runDemoStep(onTick);
      } else {
        this.runStandardStep(onTick);
      }
    }, 400);
  }

  stop() {
    if (this.intervalId) clearInterval(this.intervalId);
    this.isRunning = false;
  }

  runStandardStep(onTick) {
    let multiplier = 0.05;
    if (this.preset === 'CALM') multiplier = 0.02;
    if (this.preset === 'VOLATILE') multiplier = 0.15;
    if (this.preset === 'BLACK_SWAN') multiplier = 0.45;

    const deltaPercent = (Math.random() - 0.48) * multiplier;
    const priceChange = this.currentPrice * (deltaPercent / 100);
    this.currentPrice = parseFloat((this.currentPrice + priceChange).toFixed(2));

    const isBuy = Math.random() > 0.48;
    const isWhale = Math.random() < (this.preset === 'VOLATILE' ? 0.25 : 0.1);
    const usdValue = isWhale
      ? Math.floor(Math.random() * 1500000) + 150000
      : Math.floor(Math.random() * 45000) + 1000;

    const tradeEvent = {
      id: Date.now(),
      type: isWhale ? 'WHALE_TRADE' : 'TRADE',
      price: this.currentPrice,
      usdValue,
      side: isBuy ? 'BUY' : 'SELL',
      isWhale,
      timestamp: Date.now(),
      time: new Date().toLocaleTimeString('en-US', { hour12: false }),
    };

    eventBus.emit(tradeEvent.type, tradeEvent);

    if (onTick) onTick(this.currentPrice, tradeEvent);
  }

  runDemoStep(onTick) {
    // PRD Section 84 Demo Script
    this.demoStep++;
    const step = this.demoStep % 40;

    if (step < 10) {
      // Start: $64,720 Contested
      this.currentPrice += (Math.random() - 0.5) * 5;
    } else if (step === 10) {
      // Large Buy $1.3M -> Bulls Advance to $64,780
      this.currentPrice = 64780.0;
      const whaleBuy = {
        id: Date.now(),
        type: 'WHALE_TRADE',
        price: this.currentPrice,
        usdValue: 1300000,
        side: 'BUY',
        isWhale: true,
        timestamp: Date.now(),
        time: new Date().toLocaleTimeString('en-US', { hour12: false }),
      };
      eventBus.emit('WHALE_TRADE', whaleBuy);
    } else if (step === 20) {
      // Sell Wall Appears -> Bears Fortify back to $64,735
      this.currentPrice = 64735.0;
      eventBus.emit('BOOK_SHIFT', { type: 'SELL_WALL', volume: 4200000 });
    } else if (step === 30) {
      // Volatility Spike & Reversal -> Last Stand
      this.currentPrice = 64810.0;
      eventBus.emit('VOLATILITY_SPIKE', { intensity: 'HIGH' });
    }

    const tradeEvent = {
      id: Date.now(),
      type: 'TRADE',
      price: this.currentPrice,
      usdValue: Math.floor(Math.random() * 25000) + 2000,
      side: Math.random() > 0.5 ? 'BUY' : 'SELL',
      timestamp: Date.now(),
      time: new Date().toLocaleTimeString('en-US', { hour12: false }),
    };

    eventBus.emit('TRADE', tradeEvent);
    if (onTick) onTick(this.currentPrice, tradeEvent);
  }
}

export const simulationEngine = new SimulationEngine();
