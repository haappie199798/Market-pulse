import { Quote, Candle, NewsArticle } from '../types';

const SYMBOL_MAP: Record<string, string> = {
  NIFTY50: '^NSEI',
  BANKNIFTY: '^NSEBANK',
  FINNIFTY: '^NSEI',
  MIDCPNIFTY: '^NSEMDCP50',
  SENSEX: '^BSESN',
  INDIAVIX: '^INDIAVIX',
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

export async function fetchLiveCandles(
  symbol: string,
  interval: string = '5m'
): Promise<Candle[] | null> {
  const yahooSymbol = SYMBOL_MAP[symbol.toUpperCase()] || `${symbol.toUpperCase()}.NS`;
  const range = interval === '1d' ? '1mo' : interval === '1h' ? '5d' : '1d';
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

export async function fetchLiveNewsRSS(): Promise<NewsArticle[] | null> {
  try {
    const url =
      'https://news.google.com/rss/search?q=Indian+Stock+Market+Nifty+Sensex+NSE&hl=en-IN&gl=IN&ceid=IN:en';
    const randomUA = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
    const res = await fetch(url, {
      headers: {
        'User-Agent': randomUA,
      },
    });

    if (!res.ok) return null;

    const xml = await res.text();
    const itemRegex = /<item>[\s\S]*?<\/item>/g;
    const items = xml.match(itemRegex) || [];

    const newsList: NewsArticle[] = [];

    items.slice(0, 10).forEach((itemXml, index) => {
      const titleMatch = itemXml.match(/<title>([\s\S]*?)<\/title>/);
      const pubDateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
      const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/);
      const sourceMatch = itemXml.match(/<source[\s\S]*?>([\s\S]*?)<\/source>/);

      if (titleMatch) {
        let title = titleMatch[1]
          .replace(/<!\[CDATA\[/g, '')
          .replace(/\]\]>/g, '')
          .trim();
        const source = sourceMatch ? sourceMatch[1].trim() : 'Market News';
        const link = linkMatch ? linkMatch[1].trim() : 'https://news.google.com';
        const pubDate = pubDateMatch ? pubDateMatch[1] : new Date().toISOString();

        const lower = title.toLowerCase();
        let sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' = 'NEUTRAL';
        let sentimentScore = 0;
        if (
          lower.includes('surge') ||
          lower.includes('rally') ||
          lower.includes('gain') ||
          lower.includes('jump') ||
          lower.includes('record high') ||
          lower.includes('bull') ||
          lower.includes('profit up')
        ) {
          sentiment = 'POSITIVE';
          sentimentScore = 0.75;
        } else if (
          lower.includes('drop') ||
          lower.includes('fall') ||
          lower.includes('slide') ||
          lower.includes('plunge') ||
          lower.includes('crash') ||
          lower.includes('bear') ||
          lower.includes('loss')
        ) {
          sentiment = 'NEGATIVE';
          sentimentScore = -0.75;
        }

        const category = lower.includes('policy')
          ? 'POLICY'
          : lower.includes('result') || lower.includes('q1') || lower.includes('q2') || lower.includes('q3') || lower.includes('q4')
          ? 'RESULTS'
          : lower.includes('rbi') || lower.includes('gdp') || lower.includes('inflation')
          ? 'ECONOMY'
          : 'MARKETS';

        newsList.push({
          id: `live-news-${index}-${Date.now()}`,
          title,
          snippet: `${title}. Reported by ${source}.`,
          source,
          url: link,
          publishedAt: new Date(pubDate).toISOString(),
          sentiment,
          sentimentScore,
          impactScore: sentiment === 'NEUTRAL' ? 0.5 : 0.85,
          tags: ['LIVE', 'NSE', 'NIFTY'],
          category,
        });
      }
    });

    return newsList.length > 0 ? newsList : null;
  } catch (err) {
    console.error('Error fetching live news RSS:', err);
    return null;
  }
}
