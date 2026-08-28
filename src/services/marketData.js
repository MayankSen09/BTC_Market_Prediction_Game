/**
 * Real-Time Market Data Engine for Bitcoin Price Battlefield
 * Connects to live Binance WebSocket feeds (btcusdt@trade, btcusdt@depth20)
 * Handles auto-reconnect and high-fidelity live simulation fallback.
 */

class MarketDataEngine {
  constructor() {
    this.currentPrice = 64547.02;
    this.prevPrice = 64547.02;
    this.price24hChange = 4.16;
    this.high24h = 65200.0;
    this.low24h = 63100.0;
    this.tickDelta = 0.0;

    // Orderbook depth metrics
    this.buyWallTotal = 47.5; // In Millions USD
    this.sellWallTotal = 64.0; // In Millions USD
    this.depthBids = [];
    this.depthAsks = [];

    // Market Pressure: 'Contested', 'Bulls Dominating', 'Bears Pushing'
    this.marketPressure = 'Contested';

    this.isLive = true;
    this.listeners = new Set();
    this.tradeListeners = new Set();
    this.liquidationListeners = new Set();
    this.depthListeners = new Set();

    this.tradeWs = null;
    this.depthWs = null;
    this.simInterval = null;

    this.recentTrades = [];
    this.recentLiquidations = [];
  }

  async init() {
    // 1. Fetch initial 24h ticker info from Binance public REST API
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
    } catch (err) {
      console.warn('Initial REST price fetch failed, using fallback defaults:', err);
    }

    // 2. Connect WebSocket feeds
    this.connectWebSockets();

    // 3. Start liquidation simulation cycle (since public liquidations feed varies)
    this.startLiquidationSimulator();
  }

  connectWebSockets() {
    if (!this.isLive) return;

    try {
      // Trade WS
      this.tradeWs = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@trade');

      this.tradeWs.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const price = parseFloat(data.p);
        const qty = parseFloat(data.q);
        const usdValue = price * qty;
        const isBuyerMaker = data.m; // true = Sell order executed, false = Buy order executed
        const side = isBuyerMaker ? 'SELL' : 'BUY';

        this.updatePrice(price);

        // Notify trade event
        const isWhale = usdValue >= 100000;
        const tradeEvent = {
          id: data.t || Date.now(),
          price,
          qty,
          usdValue,
          side,
          isWhale,
          time: new Date().toLocaleTimeString('en-US', { hour12: false }),
        };

        this.recentTrades.unshift(tradeEvent);
        if (this.recentTrades.length > 50) this.recentTrades.pop();

        this.tradeListeners.forEach((fn) => fn(tradeEvent));
      };

      this.tradeWs.onerror = () => {
        console.warn('Binance Trade WS error, activating simulation mode...');
        this.startSimulationMode();
      };

      // Depth WS
      this.depthWs = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@depth20@100ms');
      this.depthWs.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.bids && data.asks) {
          this.parseDepthData(data.bids, data.asks);
        }
      };
    } catch (e) {
      console.warn('WebSocket connection failed:', e);
      this.startSimulationMode();
    }
  }

  updatePrice(newPrice) {
    if (newPrice === this.currentPrice) return;
    this.prevPrice = this.currentPrice;
    this.currentPrice = newPrice;
    this.tickDelta = ((this.currentPrice - this.prevPrice) / this.prevPrice) * 100;

    // Calculate Market Pressure
    if (this.tickDelta > 0.015) {
      this.marketPressure = 'Bulls Dominating';
    } else if (this.tickDelta < -0.015) {
      this.marketPressure = 'Bears Pushing';
    } else {
      this.marketPressure = 'Contested';
    }

    this.notifyPriceChange();
  }

  parseDepthData(bids, asks) {
    // Calc total buy wall & sell wall
    let buySum = 0;
    let sellSum = 0;

    const formattedBids = bids.slice(0, 15).map(([p, q]) => {
      const price = parseFloat(p);
      const qty = parseFloat(q);
      buySum += price * qty;
      return [price, qty];
    });

    const formattedAsks = asks.slice(0, 15).map(([p, q]) => {
      const price = parseFloat(p);
      const qty = parseFloat(q);
      sellSum += price * qty;
      return [price, qty];
    });

    this.buyWallTotal = (buySum / 1000000).toFixed(1);
    this.sellWallTotal = (sellSum / 1000000).toFixed(1);
    this.depthBids = formattedBids;
    this.depthAsks = formattedAsks;

    this.depthListeners.forEach((fn) =>
      fn({
        buyWallTotal: this.buyWallTotal,
        sellWallTotal: this.sellWallTotal,
        bids: formattedBids,
        asks: formattedAsks,
      })
    );
  }

  startSimulationMode() {
    if (this.simInterval) return;
    this.isLive = false;

    this.simInterval = setInterval(() => {
      const deltaPercent = (Math.random() - 0.49) * 0.08; // slight upward / random drift
      const change = this.currentPrice * (deltaPercent / 100);
      const newPrice = parseFloat((this.currentPrice + change).toFixed(2));
      this.updatePrice(newPrice);

      // Simulate a trade
      const side = Math.random() > 0.48 ? 'BUY' : 'SELL';
      const isWhale = Math.random() < 0.12;
      const usdValue = isWhale ? Math.floor(Math.random() * 800000) + 100000 : Math.floor(Math.random() * 45000) + 1000;
      const qty = parseFloat((usdValue / newPrice).toFixed(4));

      const tradeEvent = {
        id: Date.now(),
        price: newPrice,
        qty,
        usdValue,
        side,
        isWhale,
        time: new Date().toLocaleTimeString('en-US', { hour12: false }),
      };

      this.recentTrades.unshift(tradeEvent);
      if (this.recentTrades.length > 50) this.recentTrades.pop();

      this.tradeListeners.forEach((fn) => fn(tradeEvent));
    }, 400);
  }

  startLiquidationSimulator() {
    // Generate periodic liquidation events to drive battlefield airstrikes!
    setInterval(() => {
      if (Math.random() < 0.4) {
        const isShort = Math.random() > 0.45; // Short liquidated = Bull win; Long liquidated = Bear win
        const type = isShort ? 'SHORT' : 'LONG';
        const usdValue = Math.floor(Math.random() * 450000) + 25000;
        const units = Math.floor(usdValue / 8000);
        const exchanges = ['Binance', 'Bybit', 'OKX', 'Deribit'];
        const exchange = exchanges[Math.floor(Math.random() * exchanges.length)];

        const liqEvent = {
          id: Date.now(),
          type,
          exchange,
          amountUSD: usdValue,
          price: this.currentPrice,
          units,
          time: new Date().toLocaleTimeString('en-US', { hour12: false }),
        };

        this.recentLiquidations.unshift(liqEvent);
        if (this.recentLiquidations.length > 20) this.recentLiquidations.pop();

        this.liquidationListeners.forEach((fn) => fn(liqEvent));
      }
    }, 4500);
  }

  toggleLiveMode(enableLive) {
    this.isLive = enableLive;
    if (!enableLive) {
      if (this.tradeWs) this.tradeWs.close();
      if (this.depthWs) this.depthWs.close();
      this.startSimulationMode();
    } else {
      if (this.simInterval) {
        clearInterval(this.simInterval);
        this.simInterval = null;
      }
      this.connectWebSockets();
    }
  }

  subscribePrice(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  subscribeTrades(fn) {
    this.tradeListeners.add(fn);
    return () => this.tradeListeners.delete(fn);
  }

  subscribeLiquidations(fn) {
    this.liquidationListeners.add(fn);
    return () => this.liquidationListeners.delete(fn);
  }

  subscribeDepth(fn) {
    this.depthListeners.add(fn);
    return () => this.depthListeners.delete(fn);
  }

  notifyPriceChange() {
    const payload = {
      price: this.currentPrice,
      prevPrice: this.prevPrice,
      tickDelta: this.tickDelta,
      price24hChange: this.price24hChange,
      high24h: this.high24h,
      low24h: this.low24h,
      marketPressure: this.marketPressure,
      buyWallTotal: this.buyWallTotal,
      sellWallTotal: this.sellWallTotal,
      isLive: this.isLive,
    };
    this.listeners.forEach((fn) => fn(payload));
  }
}

export const marketEngine = new MarketDataEngine();
