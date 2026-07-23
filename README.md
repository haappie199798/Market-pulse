# PulseMarket — Live Indian Stock Market & Derivatives Terminal

PulseMarket is a full-stack, real-time market analytical terminal for Indian equity indices, option chains, and technical indicators.

---

## 1. Features & Architecture

- **Real-Time Index Tracking**: Quotes for NIFTY 50, BANK NIFTY, FIN NIFTY (`NIFTY_FIN_SERVICE.NS`), MIDCAP SELECT (`NIFTY_MID_SELECT.NS`), SENSEX, and INDIA VIX.
- **Dynamic Technical Indicators Engine**: Pure TypeScript calculation engine (`src/services/indicators.ts`) computing Wilder's RSI (14), EMA (9, 20, 50, 100, 200), SMA, MACD (12, 26, 9), Bollinger Bands (20, 2), Stochastic Oscillator, CCI, ATR, VWAP, Central Pivot Range (CPR), and Classic Pivot Points.
- **Shared Fan-Out SSE Stream**: Single background polling broadcaster (`src/services/tickBroadcaster.ts`) fanning out live tick updates to all connected browser clients.
- **Option Chain & CPR Analyzer**: Real-time PCR, Max Pain estimation, and strike open-interest buildup visualization.
- **AI Market Assistant**: Powered by server-side Google Gemini 2.5 Flash API with regulatory non-advisory safety guardrails.
- **User Account & Risk Limits**: Complete profile management with risk daily loss caps, 2FA logs, and API key management.

---

## 2. Data Provenance & Realism

To maintain strict data transparency, all payloads distinguish between live data, computed metrics, and simulated structures:

| Component | Status | Source |
|---|---|---|
| Index LTP & Quotes | **LIVE** | Live Yahoo Finance market endpoint |
| Intraday Candles (OHLCV) | **LIVE** | 1m/5m/15m/1h Yahoo chart meta stream |
| Technical Indicators | **COMPUTED** | Calculated on-the-fly from actual candle history |
| Micro Ticks Stream | **HYBRID** | Base price synced to live quote + micro steps |
| Option Chain & Greeks | **SIMULATED** | Derived around live ATM strike price |
| Market News & RSS | **LIVE** | Live Google News IN RSS feed |

---

## 3. Verification & Commands

```bash
# 1. Type Check (Lint)
npm run lint

# 2. Run Technical Indicators Verification Test
npm run verify

# 3. Full Check (Typecheck + Indicator Math Test)
npm run check

# 4. Production Build
npm run build
```

---

## 4. Production Integration (Upgrading to Broker APIs)

For live production execution, replace `src/services/liveMarketFetcher.ts` with official broker SDKs:

- **Angel One SmartAPI** (`smartapi-python` / REST)
- **DhanHQ API** (`dhanhq` REST & WebSocket)
- **Zerodha Kite Connect** (`kiteconnect` REST & WebSocket)

All calculation logic in `src/services/indicators.ts` and UI components remain 100% reusable when swapping data providers.
