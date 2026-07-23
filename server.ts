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

import { tickBroadcaster } from './src/services/tickBroadcaster';
import { computeRealTechnicals } from './src/services/technicals';
import { SnapshotProvenance } from './src/types';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

const STALE_AFTER_MS = 5 * 60 * 1000 + 30 * 1000;

function buildMeta(asOf: Date, extra: Record<string, unknown> = {}) {
  const age = Date.now() - asOf.getTime();
  return {
    asOf: asOf.toISOString(),
    ageSeconds: Math.round(age / 1000),
    stale: age > STALE_AFTER_MS,
    ...extra,
  };
}

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
  const asOf = new Date();

  const [liveQuote] = await Promise.all([
    fetchLiveQuote(symbol).catch(() => null),
  ]);

  if (liveQuote) snapshot.quote = liveQuote;

  const provenance: SnapshotProvenance = {
    quote: liveQuote ? 'LIVE' : 'SIMULATED',
    technicals: snapshot.technicals.dataQuality?.source || 'SIMULATED',
    derivatives: 'SIMULATED',
    fundamentals: 'SIMULATED',
    constituents: 'SIMULATED',
    asOf: asOf.toISOString(),
    anySimulated: true,
  };
  provenance.anySimulated =
    provenance.quote === 'SIMULATED' ||
    provenance.technicals === 'SIMULATED' ||
    provenance.derivatives === 'SIMULATED' ||
    provenance.fundamentals === 'SIMULATED' ||
    provenance.constituents === 'SIMULATED';

  snapshot.provenance = provenance;

  res.json({
    data: snapshot,
    meta: buildMeta(asOf, { isLive: !!liveQuote, provenance }),
  });
});

app.get('/api/indices/:symbol/ohlcv', async (req, res) => {
  const symbol = (req.params.symbol || 'NIFTY50').toUpperCase();
  const interval = (req.query.interval as '5m' | '15m' | '1h' | '1d') || '5m';
  try {
    const liveCandles = await fetchLiveCandles(symbol, interval, 'chart');
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

app.get('/api/indices/:symbol/technicals', async (req, res) => {
  const symbol = (req.params.symbol || 'NIFTY50').toUpperCase();
  const interval = (req.query.interval as '5m' | '15m' | '1h' | '1d') || '5m';

  try {
    let quote = await fetchLiveQuote(symbol);
    if (!quote) {
      quote = generateQuote(symbol);
    }

    let candles = await fetchLiveCandles(symbol, interval, 'indicators');
    if (!candles || candles.length < 5) {
      candles = generateCandles(symbol, interval, 60);
    }

    const realTechnicals = computeRealTechnicals(candles, quote, interval);
    res.json({
      data: realTechnicals,
      meta: buildMeta(new Date(), {
        computed: realTechnicals.dataQuality?.source === 'COMPUTED',
        warmupComplete: realTechnicals.dataQuality?.warmupComplete ?? false,
      }),
    });
  } catch (err) {
    console.error('Error calculating technicals:', err);
    const fallback = generateTechnicals(symbol, interval);
    res.json({ data: fallback });
  }
});

app.get('/api/indices/:symbol/option-chain', (req, res) => {
  const symbol = (req.params.symbol || 'NIFTY50').toUpperCase();
  const chain = generateOptionChain(symbol);
  res.json({
    data: chain,
    meta: buildMeta(new Date(), { simulated: true, reason: 'NO_OPTION_CHAIN_PROVIDER' }),
  });
});

app.get('/api/news', async (req, res) => {
  const category = (req.query.category as string) || 'ALL';
  const tag = (req.query.tag as string) || '';
  
  let news = await fetchLiveNewsRSS();
  if (!news || news.length === 0) {
    news = [...SAMPLE_NEWS];
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
  res.json({
    data: SAMPLE_FII_DII,
    meta: buildMeta(new Date(), { simulated: true, reason: 'NO_FLOWS_PROVIDER' }),
  });
});

app.get('/api/calendar/events', (req, res) => {
  res.json({ data: SAMPLE_CALENDAR });
});

// SSE Real-time Live Market Ticks Stream using shared fan-out broadcaster
app.get('/api/stream/ticks', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  res.write(
    `event: meta\ndata: ${JSON.stringify({
      source: 'UPSTREAM_QUOTE_POLL',
      isExchangeTickFeed: false,
      pollIntervalMs: 5000,
      note: 'Values are polled quote observations, not trade prints. No order book data is available.',
    })}\n\n`
  );

  for (const [symbol, quote] of Object.entries(tickBroadcaster.getSnapshot())) {
    res.write(
      `data: ${JSON.stringify({
        id: `seed-${symbol}`,
        symbol,
        ltp: quote.ltp,
        changeAbs: quote.changeAbs,
        changePct: quote.changePct,
        direction: 'SAME',
        timestamp: quote.updatedAt,
        source: 'POLL',
      })}\n\n`
    );
  }

  const unsubscribe = tickBroadcaster.subscribe((tick) => {
    res.write(`data: ${JSON.stringify(tick)}\n\n`);
  });

  const heartbeat = setInterval(() => res.write(': keep-alive\n\n'), 25000);

  req.on('close', () => {
    unsubscribe();
    clearInterval(heartbeat);
  });
});

app.get('/api/stream/status', (req, res) => {
  res.json({ data: tickBroadcaster.getStatus() });
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
3. NEVER give buy, sell, or target price advice. Include a brief non-advisory SEBI compliant note at the bottom.
4. Option chain figures (PCR, max pain, OI strikes) in this context are PLACEHOLDER values, not live exchange data. If the user's question depends on them, say so plainly rather than interpreting them as real.`;

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
