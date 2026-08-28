# ⚔️ Bitcoin War | Live 3D Market Battlefield & Tactical Game

> A real-time 3D tactical WebGL market visualizer and live prediction game that transforms Bitcoin orderbook dynamics into an epic battlefield between **Bulls (Green Army)** and **Bears (Red Army)**.

![Bitcoin War Banner](https://img.shields.io/badge/Live_Data-Binance_WebSocket-00ff88?style=for-the-badge&logo=binance)
![Three.js](https://img.shields.io/badge/3D_Engine-Three.js-000000?style=for-the-badge&logo=three.js)
![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?style=for-the-badge&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css)

---

## 🌟 Overview

**Bitcoin War** visualizes cryptocurrency market liquidity, trade execution velocity, and order book walls as a 3D tactical war zone. 

As real-time trades occur on the exchange, green Bull tanks and red Bear tanks fire laser salvos across a dynamic glowing frontline. Massive whale orders trigger heavy artillery mortar strikes, while exchange short/long liquidations spawn tactical airstrike explosions!

---

## ⚡ Core Features

- **🔴 Live Real-World Exchange Feeds**:
  - Direct WebSocket streaming from Binance (`btcusdt@trade` and `btcusdt@depth20@100ms`).
  - Real-time aggregated spot price, 24h tick delta %, and market pressure gauge ("Bulls Dominating", "Contested", "Bears Pushing").
  - Instant high-fidelity simulation fallback for offline testing.

- **🎮 3D WebGL Battlefield Scene (Three.js)**:
  - **Procedural Split Terrain**: Lush green landscape for Bulls HQ and scorched earth for Bears HQ, with curved highways, trees, and floating 3D price rulers ($64.5K, $64.6K...).
  - **Dynamic Laser Frontline**: A glowing barrier dividing the armies that advances or retreats smoothly along the price axis in real-time as price changes.
  - **3D Units & Combat Effects**: Low-poly tanks, laser beam skirmishes for small trades, heavy mortar salvos for whale orders ($100k+), and tactical airstrike explosions for liquidations.

- **🛡️ Glassmorphism Command Center HUD**:
  - **Top Bar**: UTC clock, big live BTC price text, Buy Wall ($M) vs Sell Wall ($M) volume gauges, and live liquidation ticker.
  - **Order Book Depth Chart**: Live canvas rendering cumulative Bid Depth vs Ask Depth curves.
  - **Live Combat Log**: Scrollable stream of buys, sells, whale alerts, and unit casualties.
  - **Camera & SFX Controls**: Switch between 3D Isometric, Overhead Tactical, and Close-up Cinematic views. Synthesized Web Audio API sound effects with mute toggle.

- **🎖️ War Commander Prediction Mini-Game**:
  - Tactical prediction panel where players select their faction (**Bulls** or **Bears**), place 30-second bets on price direction, earn War Points, rank up (Private → Field Marshal), and trigger victory confetti!

---

## 🛠️ Technology Stack

- **Framework**: React 18 + Vite 6
- **3D WebGL Engine**: Three.js
- **Styling**: Tailwind CSS v4 + Custom Glassmorphism CSS
- **Icons**: Lucide React
- **Audio Engine**: Synthesized Web Audio API (No external mp3 dependencies)
- **Effects**: Canvas Confetti

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+) or [Bun](https://bun.sh/)

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/MayankSen09/BTC_Market_Prediction_Game.git
   cd BTC_Market_Prediction_Game
   ```

2. **Install Dependencies**:
   ```bash
   bun install
   # or
   npm install
   ```

3. **Start Development Server**:
   ```bash
   bun run dev
   # or
   npm run dev
   ```
   Open `http://127.0.0.1:5173` in your browser.

4. **Build for Production**:
   ```bash
   bun run build
   # or
   npm run build
   ```

---

## 🎮 How to Play

1. **Observe the Battlefield**: Watch the glowing laser frontline wall move across the price scale as real-time trades occur on Binance.
2. **Track Liquidity & Feed**: Monitor the Ask/Bid walls in the depth chart and track whale trades and liquidations in the combat feed.
3. **Switch Camera Views**: Toggle between **Isometric**, **Tactical**, and **Cinematic** views at the bottom center.
4. **Command Faction Bets**: Open **WAR COMMANDER GAME**, choose your side (Bulls or Bears), place your 30s prediction, and earn War Points to rank up!

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.
