/**
 * BITCOIN WAR — Resilient Market Service
 * Connects to live Binance WebSocket feeds, calculates market pressure,
 * dispatches normalized events, and falls back gracefully to simulation mode.
 */

import { eventBus } from '../events/eventBus';
import { marketPressure } from './marketPressure';
import { simulationEngine } from '../simulation/simulationEngine';

class MarketService {
  constructor() {
    this.currentPrice = 64720.0;
    this.prevPrice = 64720.0;
    this.price24hChange = 4.16;
    this.high24h = 65500.0;
    this.low24h = 63200.0;

    this.buyWallTotal = '48.5';
    this.sellWallTotal = '62.0';

    this.connectionStatus = 'LIVE'; // LIVE, SIMULATION, CONNECTING, DISCONNECTED
    this.isLive = true;

    this.tradeWs = null;
    this.depthWs = null;
    this.reconnectAttempts = 0;
    this.listeners = new Set();
  }

  async init() {
    try {
      const res = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT');
      if (res.ok) {
        const data = await res.json();
        this.currentPrice = parseFloat(data.lastPrice);
        this.prevPrice = parseFloat(data.openPrice);
        this.price24hChange = parseFloat(data.priceChangePercent);
        this.high24h = parseFloat(data.highPrice);
        this.low24h = parseFloat(data.lowPrice);
      }
    } catch (e) {
      console.warn('Initial REST fetch failed, using fallback market price');
    }

    this.connectWebSockets();
    this.startLiquidationSimulator();
  }

  connectWebSockets() {
    if (!this.isLive) {
      this.startSimulation();
      return;
    }

    this.connectionStatus = 'CONNECTING';
    this.notifyState();

    try {
      this.tradeWs = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@trade');
      this.tradeWs.onopen = () => {
        this.connectionStatus = 'LIVE';
        this.reconnectAttempts = 0;
        this.notifyState();
      };

      this.tradeWs.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const price = parseFloat(data.p);
        const qty = parseFloat(data.q);
        const usdValue = price * qty;
        const isBuyerMaker = data.m;
        const side = isBuyerMaker ? 'SELL' : 'BUY';
        const isWhale = usdValue >= 100000;

        this.updatePrice(price);

        const tradeEvent = {
          id: data.t || Date.now(),
          type: isWhale ? 'WHALE_TRADE' : 'TRADE',
          price,
          qty,
          usdValue,
          side,
          isWhale,
          timestamp: Date.now(),
          time: new Date().toLocaleTimeString('en-US', { hour12: false }),
        };

        eventBus.emit(tradeEvent.type, tradeEvent);
      };

      this.tradeWs.onerror = () => {
        this.handleDisconnect();
      };

      // Depth WS
      this.depthWs = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@depth20@100ms');
      this.depthWs.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.bids && data.asks) {
          let buySum = 0;
          let sellSum = 0;
          data.bids.slice(0, 10).forEach(([p, q]) => (buySum += parseFloat(p) * parseFloat(q)));
          data.asks.slice(0, 10).forEach(([p, q]) => (sellSum += parseFloat(p) * parseFloat(q)));

          this.buyWallTotal = (buySum / 1000000).toFixed(1);
          this.sellWallTotal = (sellSum / 1000000).toFixed(1);

          eventBus.emit('BOOK_SHIFT', {
            buyWallTotal: this.buyWallTotal,
            sellWallTotal: this.sellWallTotal,
            bids: data.bids,
            asks: data.asks,
          });
        }
      };
    } catch (e) {
      this.handleDisconnect();
    }
  }

  handleDisconnect() {
    this.connectionStatus = 'DISCONNECTED';
    this.notifyState();
    this.reconnectAttempts++;

    if (this.reconnectAttempts > 3) {
      console.warn('Max WebSocket reconnects exceeded, switching to SIMULATION mode');
      this.setLiveMode(false);
    } else {
      setTimeout(() => this.connectWebSockets(), Math.pow(2, this.reconnectAttempts) * 1000);
    }
  }

  startSimulation() {
    this.connectionStatus = 'SIMULATION';
    this.notifyState();

    simulationEngine.start((newPrice, tradeEvent) => {
      this.updatePrice(newPrice);
    });
  }

  setLiveMode(enableLive) {
    this.isLive = enableLive;
    if (!enableLive) {
      if (this.tradeWs) this.tradeWs.close();
      if (this.depthWs) this.depthWs.close();
      this.startSimulation();
    } else {
      simulationEngine.stop();
      this.connectWebSockets();
    }
  }

  updatePrice(newPrice) {
    if (newPrice === this.currentPrice) return;
    this.prevPrice = this.currentPrice;
    this.currentPrice = newPrice;
    this.notifyState();
  }

  startLiquidationSimulator() {
    setInterval(() => {
      if (Math.random() < 0.35) {
        const isShort = Math.random() > 0.45;
        const usdValue = Math.floor(Math.random() * 480000) + 20000;
        const units = Math.floor(usdValue / 7500);

        const liqEvent = {
          id: Date.now(),
          type: 'LIQUIDATION',
          subType: isShort ? 'SHORT' : 'LONG',
          amountUSD: usdValue,
          price: this.currentPrice,
          units,
          time: new Date().toLocaleTimeString('en-US', { hour12: false }),
        };

        eventBus.emit('LIQUIDATION', liqEvent);
      }
    }, 4500);
  }

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  notifyState() {
    const tickDelta = ((this.currentPrice - this.prevPrice) / (this.prevPrice || 1)) * 100;
    const pressureData = marketPressure.calculate({
      price: this.currentPrice,
      prevPrice: this.prevPrice,
      tickDelta,
      buyWallTotal: this.buyWallTotal,
      sellWallTotal: this.sellWallTotal,
    });

    const payload = {
      price: this.currentPrice,
      prevPrice: this.prevPrice,
      tickDelta,
      price24hChange: this.price24hChange,
      high24h: this.high24h,
      low24h: this.low24h,
      buyWallTotal: this.buyWallTotal,
      sellWallTotal: this.sellWallTotal,
      pressureScore: pressureData.score,
      marketPressure: pressureData.state,
      bullProbability: pressureData.bullProbability,
      bearProbability: pressureData.bearProbability,
      connectionStatus: this.connectionStatus,
      isLive: this.isLive,
    };

    this.listeners.forEach((fn) => fn(payload));
  }
}

export const marketService = new MarketService();
