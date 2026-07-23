import { Quote, Candle, NewsArticle } from '../types';

interface SymbolSpec {
  upstream: string;
  expectNameContains: string;
}

const SYMBOL_SPECS: Record<string, SymbolSpec> = {
  NIFTY50: { upstream: '^NSEI', expectNameContains: 'nifty 50' },
  BANKNIFTY: { upstream: '^NSEBANK', expectNameContains: 'bank' },
  FINNIFTY: { upstream: 'NIFTY_FIN_SERVICE.NS', expectNameContains: 'fin' },
  MIDCPNIFTY: { upstream: 'NIFTY_MID_SELECT.NS', expectNameContains: 'mid' },
  SENSEX: { upstream: '^BSESN', expectNameContains: 'sensex' },
  INDIAVIX: { upstream: '^INDIAVIX', expectNameContains: 'vix' },
};

const SYMBOL_MAP: Record<string, string> = {
  ...Object.fromEntries(
    Object.entries(SYMBOL_SPECS).map(([key, spec]) => [key, spec.upstream])
  ),
  RELIANCE: 'RELIANCE.NS',
  HDFCBANK: 'HDFCBANK.NS',
  INFY: 'INFY.NS',
  TCS: 'TCS.NS',
  ICICIBANK: 'ICICIBANK.NS',
  BHARTIARTL: 'BHARTIARTL.NS',
  SBIN: 'SBIN.NS',
  ITC: 'ITC.NS',
  LTIM: 'LTIM.NS',
};

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15',
];

let cachedQuotes: Record<string, { quote: Quote; fetchedAt: number }> = {};
const CACHE_TTL_MS = 3000; // 3 seconds cache

async function fetchYahooChartMeta(symbolKey: string): Promise<Quote | null> {
  const yahooSymbol = SYMBOL_MAP[symbolKey.toUpperCase()] || `${symbolKey.toUpperCase()}.NS`;
  const randomUA = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

  const hosts = [
    'https://query1.finance.yahoo.com',
    'https://query2.finance.yahoo.com'
  ];

  for (const host of hosts) {
    try {
      const url = `${host}/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?interval=1m&range=1d`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': randomUA,
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });

      if (!res.ok) continue;

      const data = await res.json();
      const result = data?.chart?.result?.[0];
      if (!result) continue;

      const meta = result.meta || {};
      const indicators = result.indicators?.quote?.[0] || {};
      const closes = indicators.close || [];
      const opens = indicators.open || [];
      const highs = indicators.high || [];
      const lows = indicators.low || [];
      const volumes = indicators.volume || [];

      // Find last valid non-null price in closes
      let lastValidClose = meta.regularMarketPrice;
      if (!lastValidClose || isNaN(lastValidClose)) {
        for (let i = closes.length - 1; i >= 0; i--) {
          if (closes[i] != null && !isNaN(closes[i])) {
            lastValidClose = closes[i];
            break;
          }
        }
      }

      if (!lastValidClose) continue;

      const prevClose = meta.chartPreviousClose || meta.previousClose || lastValidClose;
      const changeAbs = Number((lastValidClose - prevClose).toFixed(2));
      const changePct = Number(((changeAbs / (prevClose || 1)) * 100).toFixed(2));

      // Calculate high and low from candles if not in meta
      let dayHigh = meta.regularMarketDayHigh;
      let dayLow = meta.regularMarketDayLow;

      if (!dayHigh && highs.length > 0) {
        const validHighs = highs.filter((h: any) => h != null);
        if (validHighs.length > 0) dayHigh = Math.max(...validHighs);
      }
      if (!dayLow && lows.length > 0) {
        const validLows = lows.filter((l: any) => l != null);
        if (validLows.length > 0) dayLow = Math.min(...validLows);
      }

      let dayOpen = opens.find((o: any) => o != null) || meta.regularMarketPrice;

      const quote: Quote = {
        symbol: symbolKey.toUpperCase(),
        displayName: meta.shortName || meta.symbol || symbolKey.toUpperCase(),
        exchange: symbolKey.includes('SENSEX') ? 'BSE' : 'NSE',
        ltp: Number(lastValidClose.toFixed(2)),
        prevClose: Number(prevClose.toFixed(2)),
        dayOpen: Number(dayOpen.toFixed(2)),
        dayHigh: Number((dayHigh || lastValidClose).toFixed(2)),
        dayLow: Number((dayLow || lastValidClose).toFixed(2)),
        changeAbs,
        changePct,
        volume: meta.regularMarketVolume || volumes.reduce((a: number, b: number) => a + (b || 0), 0) || 1500000,
        week52High: Number((meta.fiftyTwoWeekHigh || lastValidClose * 1.15).toFixed(2)),
        week52Low: Number((meta.fiftyTwoWeekLow || lastValidClose * 0.85).toFixed(2)),
        updatedAt: new Date(
          (meta.regularMarketTime || Math.floor(Date.now() / 1000)) * 1000
        ).toISOString(),
      };

      const spec = SYMBOL_SPECS[symbolKey.toUpperCase()];
      if (spec) {
        const upstreamName = String(
          meta.shortName || meta.longName || meta.symbol || ''
        ).toLowerCase();
        if (upstreamName && !upstreamName.includes(spec.expectNameContains)) {
          console.error(
            `[symbol-guard] ${symbolKey} resolved to "${upstreamName}" ` +
              `which does not look like "${spec.expectNameContains}". Refusing the quote.`
          );
          return null;
        }
      }

      return quote;
    } catch (err) {
      console.error(`Host ${host} failed for ${symbolKey}:`, err);
    }
  }

  return null;
}

export async function fetchLiveQuote(symbol: string): Promise<Quote | null> {
  const now = Date.now();
  if (cachedQuotes[symbol] && now - cachedQuotes[symbol].fetchedAt < CACHE_TTL_MS) {
    return cachedQuotes[symbol].quote;
  }

  const liveQuote = await fetchYahooChartMeta(symbol);
  if (liveQuote) {
    cachedQuotes[symbol] = { quote: liveQuote, fetchedAt: now };
  }
  return liveQuote;
}

export async function fetchMultipleLiveQuotes(
  symbols: string[]
): Promise<Record<string, Quote>> {
  const results = await Promise.allSettled(
    symbols.map(async (s) => {
      const quote = await fetchLiveQuote(s);
      return { symbol: s, quote };
    })
  );

  const map: Record<string, Quote> = {};
  results.forEach((res) => {
    if (res.status === 'fulfilled' && res.value.quote) {
      map[res.value.symbol] = res.value.quote;
    }
  });

  return map;
}

const CHART_RANGE: Record<string, string> = {
  '5m': '1d',
  '15m': '5d',
  '1h': '1mo',
  '1d': '1y',
};

const WARMUP_RANGE: Record<string, string> = {
  '5m': '1mo',
  '15m': '3mo',
  '1h': '1y',
  '1d': '5y',
};

export async function fetchLiveCandles(
  symbol: string,
  interval: string = '5m',
  purpose: 'chart' | 'indicators' = 'chart'
): Promise<Candle[] | null> {
  const yahooSymbol = SYMBOL_MAP[symbol.toUpperCase()] || `${symbol.toUpperCase()}.NS`;
  const rangeTable = purpose === 'indicators' ? WARMUP_RANGE : CHART_RANGE;
  const range = rangeTable[interval] || '1d';
  const yahooInterval = interval === '5m' ? '5m' : interval === '15m' ? '15m' : interval === '1h' ? '60m' : '1d';

  const hosts = [
    'https://query1.finance.yahoo.com',
    'https://query2.finance.yahoo.com'
  ];

  for (const host of hosts) {
    try {
      const url = `${host}/v8/finance/chart/${encodeURIComponent(
        yahooSymbol
      )}?interval=${yahooInterval}&range=${range}`;

      const randomUA = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
      const res = await fetch(url, {
        headers: {
          'User-Agent': randomUA,
          'Accept': 'application/json',
        },
      });

      if (!res.ok) continue;

      const data = await res.json();
      const result = data?.chart?.result?.[0];
      if (!result) continue;

      const timestamps: number[] = result.timestamp || [];
      const quote = result.indicators?.quote?.[0];
      if (!quote || !timestamps.length) continue;

      const opens = quote.open || [];
      const highs = quote.high || [];
      const lows = quote.low || [];
      const closes = quote.close || [];
      const volumes = quote.volume || [];

      const candles: Candle[] = [];

      for (let i = 0; i < timestamps.length; i++) {
        if (
          opens[i] == null ||
          highs[i] == null ||
          lows[i] == null ||
          closes[i] == null
        ) {
          continue;
        }

        const dateObj = new Date(timestamps[i] * 1000);
        const timeStr = dateObj.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });

        candles.push({
          ts: dateObj.toISOString(),
          time: timeStr,
          open: Number(opens[i].toFixed(2)),
          high: Number(highs[i].toFixed(2)),
          low: Number(lows[i].toFixed(2)),
          close: Number(closes[i].toFixed(2)),
          volume: Math.round(volumes[i] || 10000),
        });
      }

      if (candles.length > 0) return candles;
    } catch (err) {
      console.error(`Candle host ${host} error for ${symbol}:`, err);
    }
  }

  return null;
}

/* ------------------------------------------------------------------ */
/* News                                                                */
/* ------------------------------------------------------------------ */

const ENTITY_TAGS: { tag: string; patterns: RegExp }[] = [
  { tag: 'NIFTY50', patterns: /\bnifty\s?50\b|\bnifty\b(?!\s?(bank|next|midcap|it))/i },
  { tag: 'BANKNIFTY', patterns: /\bbank\s?nifty\b|\bnifty\s?bank\b/i },
  { tag: 'FINNIFTY', patterns: /\bfin\s?nifty\b|financial services index/i },
  { tag: 'SENSEX', patterns: /\bsensex\b|\bbse\b/i },
  { tag: 'BANKING', patterns: /\bbank(s|ing)?\b|hdfc bank|icici|axis bank|sbi\b|kotak/i },
  { tag: 'IT', patterns: /\binfosys\b|\btcs\b|\bwipro\b|hcl tech|\bit stocks?\b/i },
  { tag: 'AUTO', patterns: /maruti|tata motors|mahindra|bajaj auto|\bauto stocks?\b/i },
  { tag: 'ENERGY', patterns: /reliance|ongc|\bcrude\b|\boil\b|adani/i },
  { tag: 'PHARMA', patterns: /pharma|cipla|sun pharma|dr\.? reddy/i },
  { tag: 'RBI', patterns: /\brbi\b|reserve bank|\bmpc\b|repo rate/i },
  { tag: 'MACRO', patterns: /\bgdp\b|inflation|\bcpi\b|\bwpi\b|\biip\b|budget|fiscal/i },
  { tag: 'FII', patterns: /\bfii\b|\bdii\b|foreign investors?|institutional/i },
  { tag: 'GLOBAL', patterns: /\bfed\b|wall street|nasdaq|dow jones|us markets/i },
  { tag: 'DERIVATIVES', patterns: /option|expiry|futures|open interest|\boi\b|\bpcr\b/i },
];

const POSITIVE_TERMS = [
  'surge', 'surges', 'rally', 'rallies', 'gain', 'gains', 'jump', 'jumps',
  'record high', 'all-time high', 'rebound', 'recover', 'recovers', 'upgrade',
  'beats estimate', 'outperform', 'inflow', 'inflows', 'bullish', 'soar', 'soars',
];

const NEGATIVE_TERMS = [
  'plunge', 'plunges', 'crash', 'crashes', 'slump', 'slumps', 'tumble', 'tumbles',
  'slide', 'slides', 'downgrade', 'misses estimate', 'outflow', 'outflows',
  'bearish', 'sell-off', 'selloff', 'profit booking', 'sinks', 'drags', 'weighs on',
];

const NEGATORS = /\b(cuts?|pares?|trims?|erases?|recovers? from|off)\s+(losses|lows)\b/i;

function scoreSentiment(text: string): {
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  score: number;
} {
  const lower = text.toLowerCase();

  if (NEGATORS.test(lower)) return { sentiment: 'POSITIVE', score: 0.4 };

  let score = 0;
  for (const term of POSITIVE_TERMS) if (lower.includes(term)) score += 1;
  for (const term of NEGATIVE_TERMS) if (lower.includes(term)) score -= 1;

  if (score === 0) return { sentiment: 'NEUTRAL', score: 0 };

  const normalised = Math.max(-1, Math.min(1, score / 3));
  return {
    sentiment: normalised > 0 ? 'POSITIVE' : 'NEGATIVE',
    score: Number(normalised.toFixed(2)),
  };
}

function tagHeadline(text: string): string[] {
  const tags = ENTITY_TAGS.filter((e) => e.patterns.test(text)).map((e) => e.tag);
  return tags.length ? tags : ['MARKETS'];
}

function categorise(
  text: string
): 'MARKETS' | 'ECONOMY' | 'RESULTS' | 'POLICY' | 'GLOBAL' | 'CORPORATE' {
  const lower = text.toLowerCase();
  if (/\brbi\b|repo rate|monetary policy|\bmpc\b/.test(lower)) return 'POLICY';
  if (/\bq[1-4]\b|results|earnings|profit rose|revenue/.test(lower)) return 'RESULTS';
  if (/\bgdp\b|inflation|\bcpi\b|\bwpi\b|\biip\b|budget/.test(lower)) return 'ECONOMY';
  if (/\bfed\b|wall street|nasdaq|dow jones|global markets/.test(lower)) return 'GLOBAL';
  return 'MARKETS';
}

function dedupeKey(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .slice(0, 8)
    .join(' ');
}

function decodeXmlText(raw: string): string {
  return raw
    .replace(/<!\[CDATA\[/g, '')
    .replace(/\]\]>/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

export async function fetchLiveNewsRSS(): Promise<NewsArticle[] | null> {
  try {
    const url =
      'https://news.google.com/rss/search?q=Indian+Stock+Market+Nifty+Sensex+NSE&hl=en-IN&gl=IN&ceid=IN:en';
    const randomUA = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
    const res = await fetch(url, { headers: { 'User-Agent': randomUA } });

    if (!res.ok) return null;

    const xml = await res.text();
    const items = xml.match(/<item>[\s\S]*?<\/item>/g) || [];

    const newsList: NewsArticle[] = [];
    const seen = new Set<string>();

    items.slice(0, 25).forEach((itemXml, index) => {
      const titleMatch = itemXml.match(/<title>([\s\S]*?)<\/title>/);
      if (!titleMatch) return;

      const title = decodeXmlText(titleMatch[1]);
      if (!title) return;

      const key = dedupeKey(title);
      if (seen.has(key)) return;
      seen.add(key);

      const pubDateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
      const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/);
      const sourceMatch = itemXml.match(/<source[\s\S]*?>([\s\S]*?)<\/source>/);
      const descMatch = itemXml.match(/<description>([\s\S]*?)<\/description>/);

      const source = sourceMatch ? decodeXmlText(sourceMatch[1]) : 'Market News';
      const link = linkMatch ? linkMatch[1].trim() : 'https://news.google.com';

      const parsedDate = pubDateMatch ? new Date(pubDateMatch[1]) : new Date();
      const publishedAt = Number.isNaN(parsedDate.getTime())
        ? new Date().toISOString()
        : parsedDate.toISOString();

      const rawDesc = descMatch ? decodeXmlText(descMatch[1]) : '';
      const snippet =
        rawDesc && rawDesc.toLowerCase() !== title.toLowerCase()
          ? rawDesc.slice(0, 200)
          : `Published by ${source}.`;

      const { sentiment, score } = scoreSentiment(title);
      const tags = tagHeadline(title);

      const ageHours = (Date.now() - new Date(publishedAt).getTime()) / 3_600_000;
      const recency = Math.max(0, 1 - ageHours / 24);
      const impactScore = Number(
        Math.min(1, 0.3 * recency + 0.2 * Math.min(tags.length / 3, 1) + Math.abs(score) * 0.3).toFixed(2)
      );

      newsList.push({
        id: `live-news-${key.replace(/ /g, '-')}-${index}`,
        title,
        snippet,
        source,
        url: link,
        publishedAt,
        sentiment,
        sentimentScore: score,
        impactScore,
        tags,
        category: categorise(title),
      });
    });

    return newsList.length > 0 ? newsList : null;
  } catch (err) {
    console.error('Error fetching live news RSS:', err);
    return null;
  }
}
