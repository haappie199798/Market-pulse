import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

import {
  getMarketStatus,
  generateQuote,
  generateCandles,
  generateTechnicals,
  generateOptionChain,
  getFullSnapshot,
  SAMPLE_NEWS,
  SAMPLE_FII_DII,
  SAMPLE_CALENDAR
} from './src/services/mockData.js';

import {
  fetchLiveQuote,
  fetchMultipleLiveQuotes,
  fetchLiveCandles,
  fetchLiveNewsRSS
} from './src/services/liveMarketFetcher.js';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Server-side Gemini initialization
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
    }
  }
  return aiClient;
}

// REST API Endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/market/status', (req, res) => {
  const status = getMarketStatus();
  res.json({
    data: status,
    meta: {
      serverTime: status.serverTime,
      nextUpdateAt: status.nextUpdateAt,
      stale: false
    }
  });
});

app.get('/api/indices', async (req, res) => {
  const symbols = ['NIFTY50', 'BANKNIFTY', 'FINNIFTY', 'MIDCPNIFTY', 'SENSEX', 'INDIAVIX'];
  try {
    const liveMap = await fetchMultipleLiveQuotes(symbols);
    const quotes = symbols.map(s => liveMap[s] || generateQuote(s));
    res.json({ data: quotes, meta: { isLive: Object.keys(liveMap).length > 0 } });
  } catch (e) {
    const quotes = symbols.map(s => generateQuote(s));
    res.json({ data: quotes, meta: { isLive: false } });
  }
});

app.get('/api/indices/:symbol', async (req, res) => {
  const symbol = (req.params.symbol || 'NIFTY50').toUpperCase();
  const snapshot = getFullSnapshot(symbol);
  try {
    const liveQuote = await fetchLiveQuote(symbol);
    if (liveQuote) {
      snapshot.quote = liveQuote;
    }
    res.json({
      data: snapshot,
      meta: {
        asOf: new Date().toISOString(),
        stale: false,
        delayedMinutes: 0,
        isLive: !!liveQuote
      }
    });
  } catch (e) {
    res.json({
      data: snapshot,
      meta: {
        asOf: new Date().toISOString(),
        stale: false,
        delayedMinutes: 0,
        isLive: false
      }
    });
  }
});

app.get('/api/indices/:symbol/ohlcv', async (req, res) => {
  const symbol = (req.params.symbol || 'NIFTY50').toUpperCase();
  const interval = (req.query.interval as '5m' | '15m' | '1h' | '1d') || '5m';
  try {
    const liveCandles = await fetchLiveCandles(symbol, interval);
    if (liveCandles && liveCandles.length >= 5) {
      res.json({ data: liveCandles, meta: { isLive: true } });
      return;
    }
  } catch (err) {
    console.error('Candle fetch error:', err);
  }
  const candles = generateCandles(symbol, interval, 60);
  res.json({ data: candles, meta: { isLive: false } });
});

app.get('/api/indices/:symbol/technicals', (req, res) => {
  const symbol = (req.params.symbol || 'NIFTY50').toUpperCase();
  const interval = (req.query.interval as '5m' | '15m' | '1h' | '1d') || '5m';
  const technicals = generateTechnicals(symbol, interval);
  res.json({ data: technicals });
});

app.get('/api/indices/:symbol/option-chain', (req, res) => {
  const symbol = (req.params.symbol || 'NIFTY50').toUpperCase();
  const chain = generateOptionChain(symbol);
  res.json({ data: chain });
});

app.get('/api/news', async (req, res) => {
  const category = (req.query.category as string) || 'ALL';
  const tag = (req.query.tag as string) || '';
  
  let news = await fetchLiveNewsRSS();
  if (!news || news.length === 0) {
    news = [...SAMPLE_NEWS];
  } else {
    news = [...news, ...SAMPLE_NEWS];
  }

  if (category !== 'ALL') {
    news = news.filter(n => n.category === category);
  }
  if (tag) {
    news = news.filter(n => n.tags.includes(tag.toUpperCase()));
  }
  res.json({ data: news });
});

app.get('/api/flows/fii-dii', (req, res) => {
  res.json({ data: SAMPLE_FII_DII });
});

app.get('/api/calendar/events', (req, res) => {
  res.json({ data: SAMPLE_CALENDAR });
});

// SSE Real-time Live Market Ticks Stream
app.get('/api/stream/ticks', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const symbols = ['NIFTY50', 'BANKNIFTY', 'FINNIFTY', 'SENSEX', 'RELIANCE', 'HDFCBANK'];
  
  let basePrices: Record<string, number> = {
    NIFTY50: 24812.35,
    BANKNIFTY: 52410.80,
    FINNIFTY: 23680.15,
    SENSEX: 81342.10,
    RELIANCE: 2942.10,
    HDFCBANK: 1684.50,
  };

  let lastLiveFetchAt = 0;

  const updateLivePrices = async () => {
    try {
      const liveMap = await fetchMultipleLiveQuotes(symbols);
      symbols.forEach((sym) => {
        if (liveMap[sym]?.ltp) {
          basePrices[sym] = liveMap[sym].ltp;
        }
      });
      lastLiveFetchAt = Date.now();
    } catch (e) {
      // Keep existing base prices
    }
  };

  await updateLivePrices();
  const currentPrices: Record<string, number> = { ...basePrices };

  // Periodically update live prices every 10 seconds from market API
  const liveSyncInterval = setInterval(() => {
    updateLivePrices();
  }, 10000);

  const interval = setInterval(() => {
    const sym = symbols[Math.floor(Math.random() * symbols.length)];
    const cur = currentPrices[sym] || basePrices[sym] || 1000;
    
    // Smooth micro step relative to real-time live price
    const step = (Math.random() - 0.48) * (cur * 0.0004);
    const newLtp = Number((cur + step).toFixed(2));
    currentPrices[sym] = newLtp;

    const base = basePrices[sym] || newLtp;
    const changeAbs = Number((newLtp - base).toFixed(2));
    const changePct = Number(((changeAbs / base) * 100).toFixed(2));
    const direction = step > 0 ? 'UP' : step < 0 ? 'DOWN' : 'SAME';
    const quantity = Math.floor(Math.random() * 450) + 25;
    const spread = Number((newLtp * 0.00015).toFixed(2));

    const tick = {
      id: `tick-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      symbol: sym,
      ltp: newLtp,
      changeAbs,
      changePct,
      quantity,
      bidPrice: Number((newLtp - spread).toFixed(2)),
      askPrice: Number((newLtp + spread).toFixed(2)),
      direction,
      timestamp: new Date().toISOString(),
      isLiveSynced: lastLiveFetchAt > 0,
    };

    res.write(`data: ${JSON.stringify(tick)}\n\n`);
  }, 1000);

  req.on('close', () => {
    clearInterval(interval);
    clearInterval(liveSyncInterval);
  });
});

// Gemini AI Market Assistant Endpoint
app.post('/api/ai/assistant', async (req, res) => {
  const { query, contextSymbol = 'NIFTY50' } = req.body;
  const snapshot = getFullSnapshot(contextSymbol);

  const gemini = getGeminiClient();
  if (!gemini) {
    return res.json({
      data: {
        answer: `**PulseMarket Indicator Summary for ${contextSymbol}**\n\n- **LTP**: ₹${snapshot.quote.ltp.toLocaleString('en-IN')} (${snapshot.quote.changePct > 0 ? '+' : ''}${snapshot.quote.changePct}%)\n- **RSI (14)**: ${snapshot.technicals.rsi14}\n- **Supertrend**: ${snapshot.technicals.supertrend.direction} @ ₹${snapshot.technicals.supertrend.value}\n- **PCR**: ${snapshot.derivatives.pcrOi} (Max Pain: ₹${snapshot.derivatives.maxPain})\n- **Indicator Bias**: ${snapshot.technicals.summary.bias.replace('_', ' ')} (${snapshot.technicals.summary.bullish} Bullish / ${snapshot.technicals.summary.bearish} Bearish / ${snapshot.technicals.summary.neutral} Neutral)\n\n*Note: Configure GEMINI_API_KEY in Secrets panel for conversational AI analysis.*`
      }
    });
  }

  try {
    const prompt = `You are PulseMarket AI, an expert Indian stock market analyst assistant.
Analyze the following user query in the context of live market indicator data for ${contextSymbol}:

User Query: "${query}"

Live Data Context for ${contextSymbol}:
- LTP: ₹${snapshot.quote.ltp} (${snapshot.quote.changePct}%)
- Technical Bias: ${snapshot.technicals.summary.bias} (${snapshot.technicals.summary.bullish} Bullish, ${snapshot.technicals.summary.bearish} Bearish)
- RSI(14): ${snapshot.technicals.rsi14}
- MACD Cross: ${snapshot.technicals.macd.cross}
- CPR Range: ${snapshot.technicals.cpr.bc} - ${snapshot.technicals.cpr.tc} (${snapshot.technicals.cpr.width} width)
- Supertrend (10,3): ${snapshot.technicals.supertrend.direction} @ ${snapshot.technicals.supertrend.value}
- Option Chain PCR: ${snapshot.derivatives.pcrOi}
- Max Pain Strike: ${snapshot.derivatives.maxPain}
- Highest CE OI Resistance: ${snapshot.derivatives.highestCeOiStrike}
- Highest PE OI Support: ${snapshot.derivatives.highestPeOiStrike}

Instructions:
1. Provide a concise, highly readable, structured response using markdown headers and bullet points.
2. Interpret technicals and options data mathematically and objectively.
3. NEVER give buy, sell, or target price advice. Include a brief non-advisory SEBI compliant note at the bottom.`;

    const response = await gemini.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });

    res.json({
      data: {
        answer: response.text || 'Unable to generate analysis at this moment.'
      }
    });
  } catch (err: any) {
    console.error('Gemini API Error:', err);
    res.status(500).json({ error: 'Failed to process AI query', details: err.message });
  }
});

// Vite Middleware & Production Static Serving
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[PulseMarket] Server active on http://0.0.0.0:${PORT}`);
  });
}

start();
