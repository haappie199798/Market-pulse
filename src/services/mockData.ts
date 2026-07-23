import {
  Quote,
  Breadth,
  Contributor,
  Candle,
  TechnicalsPayload,
  OptionChainSnapshot,
  StrikeRow,
  IndexFundamentals,
  NewsArticle,
  FiiDiiFlow,
  CalendarEvent,
  FullIndexSnapshot,
  MarketStatus,
  BuildupType
} from '../types';

export const BASE_INDICES: Record<string, { displayName: string; basePrice: number; exchange: 'NSE' | 'BSE' }> = {
  'NIFTY50': { displayName: 'NIFTY 50', basePrice: 24812.35, exchange: 'NSE' },
  'BANKNIFTY': { displayName: 'NIFTY BANK', basePrice: 52410.80, exchange: 'NSE' },
  'FINNIFTY': { displayName: 'NIFTY FIN SERVICE', basePrice: 23945.15, exchange: 'NSE' },
  'MIDCPNIFTY': { displayName: 'NIFTY MIDCAP SELECT', basePrice: 12850.40, exchange: 'NSE' },
  'SENSEX': { displayName: 'SENSEX', basePrice: 81480.20, exchange: 'BSE' },
  'INDIAVIX': { displayName: 'INDIA VIX', basePrice: 12.84, exchange: 'NSE' },
};

export const CONSTITUENTS_MASTER: Record<string, Contributor[]> = {
  'NIFTY50': [
    { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', points: 31.4, changePct: 1.42, weightPct: 12.61, ltp: 1684.50, sector: 'Financial Services' },
    { symbol: 'RELIANCE', name: 'Reliance Industries', points: -12.8, changePct: -0.71, weightPct: 8.94, ltp: 2942.10, sector: 'Energy & Oil' },
    { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd.', points: 22.1, changePct: 1.15, weightPct: 7.82, ltp: 1224.30, sector: 'Financial Services' },
    { symbol: 'INFY', name: 'Infosys Ltd.', points: 18.6, changePct: 1.28, weightPct: 5.92, ltp: 1820.40, sector: 'Information Technology' },
    { symbol: 'TCS', name: 'Tata Consultancy Services', points: 14.2, changePct: 0.88, weightPct: 4.15, ltp: 4280.00, sector: 'Information Technology' },
    { symbol: 'ITC', name: 'ITC Ltd.', points: 8.4, changePct: 0.95, weightPct: 3.84, ltp: 492.60, sector: 'FMCG' },
    { symbol: 'BHARTIARTL', name: 'Bharti Airtel', points: 12.0, changePct: 1.35, weightPct: 3.65, ltp: 1540.20, sector: 'Telecommunication' },
    { symbol: 'L&T', name: 'Larsen & Toubro', points: 9.1, changePct: 0.76, weightPct: 3.42, ltp: 3680.10, sector: 'Capital Goods' },
    { symbol: 'AXISBANK', name: 'Axis Bank Ltd.', points: -6.4, changePct: -0.52, weightPct: 3.12, ltp: 1180.20, sector: 'Financial Services' },
    { symbol: 'SBIN', name: 'State Bank of India', points: 11.5, changePct: 1.10, weightPct: 3.05, ltp: 845.80, sector: 'Financial Services' },
    { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', points: 5.2, changePct: 0.45, weightPct: 2.85, ltp: 1812.00, sector: 'Financial Services' },
    { symbol: 'HCLTECH', name: 'HCL Technologies', points: 7.8, changePct: 1.12, weightPct: 2.45, ltp: 1720.50, sector: 'Information Technology' },
    { symbol: 'M&M', name: 'Mahindra & Mahindra', points: 10.4, changePct: 1.84, weightPct: 2.30, ltp: 2950.40, sector: 'Automobile' },
    { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd.', points: -4.2, changePct: -0.85, weightPct: 2.15, ltp: 985.20, sector: 'Automobile' },
    { symbol: 'SUNPHARMA', name: 'Sun Pharma', points: 6.1, changePct: 0.92, weightPct: 1.95, ltp: 1740.00, sector: 'Healthcare & Pharma' },
  ],
  'BANKNIFTY': [
    { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', points: 145.2, changePct: 1.42, weightPct: 29.10, ltp: 1684.50, sector: 'Private Bank' },
    { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd.', points: 98.4, changePct: 1.15, weightPct: 23.40, ltp: 1224.30, sector: 'Private Bank' },
    { symbol: 'AXISBANK', name: 'Axis Bank Ltd.', points: -28.6, changePct: -0.52, weightPct: 11.20, ltp: 1180.20, sector: 'Private Bank' },
    { symbol: 'SBIN', name: 'State Bank of India', points: 42.1, changePct: 1.10, weightPct: 10.80, ltp: 845.80, sector: 'PSU Bank' },
    { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', points: 21.0, changePct: 0.45, weightPct: 9.80, ltp: 1812.00, sector: 'Private Bank' },
    { symbol: 'INDUSINDBK', name: 'IndusInd Bank', points: -12.4, changePct: -0.82, weightPct: 5.40, ltp: 1410.10, sector: 'Private Bank' },
    { symbol: 'BANKBARODA', name: 'Bank of Baroda', points: 14.8, changePct: 1.65, weightPct: 2.80, ltp: 265.40, sector: 'PSU Bank' },
    { symbol: 'PNB', name: 'Punjab National Bank', points: 8.2, changePct: 1.40, weightPct: 2.10, ltp: 118.50, sector: 'PSU Bank' },
  ],
  'FINNIFTY': [
    { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', points: 68.5, changePct: 1.42, weightPct: 21.50, ltp: 1684.50, sector: 'Banks' },
    { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd.', points: 46.2, changePct: 1.15, weightPct: 17.80, ltp: 1224.30, sector: 'Banks' },
    { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd.', points: 38.1, changePct: 1.68, weightPct: 8.40, ltp: 6920.00, sector: 'NBFC' },
    { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', points: 12.0, changePct: 0.45, weightPct: 7.90, ltp: 1812.00, sector: 'Banks' },
    { symbol: 'AXISBANK', name: 'Axis Bank Ltd.', points: -14.2, changePct: -0.52, weightPct: 7.20, ltp: 1180.20, sector: 'Banks' },
    { symbol: 'SBIN', name: 'State Bank of India', points: 18.4, changePct: 1.10, weightPct: 6.80, ltp: 845.80, sector: 'Banks' },
    { symbol: 'BAJAJFINSV', name: 'Bajaj Finserv Ltd.', points: 15.6, changePct: 1.25, weightPct: 4.80, ltp: 1620.40, sector: 'Financial Holding' },
    { symbol: 'HDFCLIFE', name: 'HDFC Life Insurance', points: 8.1, changePct: 0.92, weightPct: 3.50, ltp: 642.00, sector: 'Insurance' },
  ]
};

export function getMarketStatus(): MarketStatus {
  const now = new Date();
  const utcHours = now.getUTCHours();
  const utcMinutes = now.getUTCMinutes();
  
  // IST is UTC + 5:30
  const istMinutesTotal = (utcHours * 60 + utcMinutes + 330) % (24 * 60);
  const istHours = Math.floor(istMinutesTotal / 60);
  const istMins = istMinutesTotal % 60;

  // Market hours: 09:15 to 15:30 IST
  const isWeekday = now.getUTCDay() >= 1 && now.getUTCDay() <= 5;
  const inPreOpen = isWeekday && istHours === 9 && istMins >= 0 && istMins < 15;
  const inMarketOpen = isWeekday && ((istHours === 9 && istMins >= 15) || (istHours > 9 && istHours < 15) || (istHours === 15 && istMins <= 30));

  let status: 'OPEN' | 'PRE_OPEN' | 'CLOSED' | 'HOLIDAY' = 'OPEN';
  if (!isWeekday) {
    status = 'CLOSED';
  } else if (inPreOpen) {
    status = 'PRE_OPEN';
  } else if (inMarketOpen) {
    status = 'OPEN';
  } else {
    status = 'CLOSED';
  }

  // Next 5m cycle calculation
  const nextCycleTime = new Date(now.getTime() + 300000 - (now.getTime() % 300000));

  return {
    status,
    serverTime: now.toISOString(),
    nextUpdateAt: nextCycleTime.toISOString(),
    cycleId: `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, '0')}${String(now.getUTCDate()).padStart(2, '0')}T${String(now.getUTCHours()).padStart(2, '0')}${String(now.getUTCMinutes()).padStart(2, '0')}Z`,
    message: status === 'OPEN' ? 'Market Live - 5m Refresh Active' : 'Market Closed - Showing Last Session Snapshot'
  };
}

export function generateQuote(symbol: string): Quote {
  const meta = BASE_INDICES[symbol] || { displayName: symbol, basePrice: 10000, exchange: 'NSE' };
  const base = meta.basePrice;
  const randomFactor = (Math.sin(Date.now() / 60000) * 0.008) + ((Math.random() - 0.48) * 0.003);
  const ltp = Number((base * (1 + randomFactor)).toFixed(2));
  const prevClose = Number((base * 0.995).toFixed(2));
  const changeAbs = Number((ltp - prevClose).toFixed(2));
  const changePct = Number(((changeAbs / prevClose) * 100).toFixed(2));

  return {
    symbol,
    displayName: meta.displayName,
    exchange: meta.exchange,
    ltp,
    prevClose,
    dayOpen: Number((prevClose * 1.001).toFixed(2)),
    dayHigh: Number((Math.max(ltp, base * 1.006)).toFixed(2)),
    dayLow: Number((Math.min(ltp, base * 0.993)).toFixed(2)),
    changeAbs,
    changePct,
    volume: Math.floor(180000000 + Math.random() * 50000000),
    week52High: Number((base * 1.08).toFixed(2)),
    week52Low: Number((base * 0.85).toFixed(2)),
    updatedAt: new Date().toISOString()
  };
}

export function generateCandles(symbol: string, interval: '5m' | '15m' | '1h' | '1d' = '5m', count: number = 60): Candle[] {
  const basePrice = BASE_INDICES[symbol]?.basePrice || 24800;
  const candles: Candle[] = [];
  let currentPrice = basePrice * 0.985;
  const now = new Date();

  const stepMinutes = interval === '5m' ? 5 : interval === '15m' ? 15 : interval === '1h' ? 60 : 1440;

  for (let i = count; i >= 0; i--) {
    const time = new Date(now.getTime() - i * stepMinutes * 60 * 1000);
    const noise = (Math.sin(i * 0.3) * 0.002) + ((Math.random() - 0.48) * 0.004);
    const open = currentPrice;
    const close = Number((open * (1 + noise)).toFixed(2));
    const high = Number((Math.max(open, close) + Math.random() * (basePrice * 0.0015)).toFixed(2));
    const low = Number((Math.min(open, close) - Math.random() * (basePrice * 0.0015)).toFixed(2));
    const volume = Math.floor(1000000 + Math.random() * 2000000);
    currentPrice = close;

    const timeStr = stepMinutes >= 1440 
      ? time.toISOString().split('T')[0]
      : `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;

    candles.push({
      ts: time.toISOString(),
      time: timeStr,
      open,
      high,
      low,
      close,
      volume,
      vwap: Number((close * 0.998).toFixed(2)),
      ema20: Number((close * 0.996).toFixed(2)),
      ema50: Number((close * 0.992).toFixed(2)),
      ema200: Number((close * 0.985).toFixed(2)),
      supertrend: Number((close * 0.991).toFixed(2)),
      rsi: Number((50 + Math.sin(i * 0.2) * 18).toFixed(1)),
      macd: Number((12.4 + Math.cos(i * 0.2) * 8).toFixed(2)),
      macdSignal: Number((10.2).toFixed(2)),
      macdHist: Number((2.2).toFixed(2)),
      upperBB: Number((close * 1.008).toFixed(2)),
      lowerBB: Number((close * 0.992).toFixed(2)),
    });
  }

  return candles;
}

export function generateTechnicals(symbol: string, interval: '5m' | '15m' | '1h' | '1d' = '5m'): TechnicalsPayload {
  const quote = generateQuote(symbol);
  const ltp = quote.ltp;
  const high = quote.dayHigh;
  const low = quote.dayLow;
  const close = quote.prevClose;

  const pp = Number(((high + low + close) / 3).toFixed(2));
  const bc = Number(((high + low) / 2).toFixed(2));
  const tc = Number(((pp - bc) + pp).toFixed(2));
  const cprWidth = Math.abs(tc - bc) / pp * 100;

  return {
    interval,
    dataQuality: {
      source: 'SIMULATED',
      candlesUsed: 0,
      warmupComplete: false,
      pivotsFrom: 'PREVIOUS_SESSION',
      vwapAvailable: false,
      computedAt: new Date().toISOString(),
    },
    rsi14: 61.4,
    macd: {
      macd: 18.2,
      signal: 12.7,
      hist: 5.5,
      cross: 'BULLISH',
    },
    ema: {
      ema9: Number((ltp * 0.998).toFixed(2)),
      ema20: Number((ltp * 0.996).toFixed(2)),
      ema50: Number((ltp * 0.992).toFixed(2)),
      ema100: Number((ltp * 0.988).toFixed(2)),
      ema200: Number((ltp * 0.980).toFixed(2)),
    },
    sma: {
      sma20: Number((ltp * 0.995).toFixed(2)),
      sma50: Number((ltp * 0.991).toFixed(2)),
      sma200: Number((ltp * 0.978).toFixed(2)),
    },
    supertrend: {
      value: Number((ltp * 0.991).toFixed(2)),
      direction: 'UP',
      flippedThisCandle: false,
    },
    bollinger: {
      upper: Number((ltp * 1.008).toFixed(2)),
      mid: Number((ltp * 0.996).toFixed(2)),
      lower: Number((ltp * 0.984).toFixed(2)),
      percentB: 0.72,
      bandwidth: 2.4,
    },
    adx14: 24.8,
    atr14: Number((ltp * 0.008).toFixed(2)),
    vwap: Number((ltp * 0.997).toFixed(2)),
    stochastic: { k: 68.5, d: 62.1 },
    cci20: 112.4,
    pivots: {
      type: 'classic',
      pp,
      r1: Number((2 * pp - low).toFixed(2)),
      r2: Number((pp + (high - low)).toFixed(2)),
      r3: Number((high + 2 * (pp - low)).toFixed(2)),
      s1: Number((2 * pp - high).toFixed(2)),
      s2: Number((pp - (high - low)).toFixed(2)),
      s3: Number((low - 2 * (high - pp)).toFixed(2)),
    },
    cpr: {
      pivot: pp,
      tc: Math.max(tc, bc),
      bc: Math.min(tc, bc),
      width: cprWidth < 0.25 ? 'NARROW' : cprWidth < 0.5 ? 'AVERAGE' : 'WIDE',
    },
    patterns: ['BULLISH_ENGULFING', 'MORNING_STAR_LEAN'],
    summary: {
      bullish: 8,
      bearish: 3,
      neutral: 3,
      bias: 'BULLISH_LEAN',
      confidence: 0.64,
    },
  };
}

export function generateOptionChain(indexSymbol: string): OptionChainSnapshot {
  const quote = generateQuote(indexSymbol);
  const spotPrice = quote.ltp;
  const step = indexSymbol === 'BANKNIFTY' ? 100 : 50;
  const atmStrike = Math.round(spotPrice / step) * step;

  const expiryDates = ['2026-07-30', '2026-08-06', '2026-08-27'];
  const strikes: StrikeRow[] = [];

  let maxLossMinStrike = atmStrike;
  let minLoss = Infinity;

  const buildupOptions: BuildupType[] = ['LONG_BUILDUP', 'SHORT_BUILDUP', 'LONG_UNWINDING', 'SHORT_COVERING'];

  let totalCeOi = 0;
  let totalPeOi = 0;

  for (let i = -10; i <= 10; i++) {
    const strike = atmStrike + i * step;
    const isAtm = strike === atmStrike;

    // Intrinsic value calculation
    const ceIntrinsic = Math.max(0, spotPrice - strike);
    const peIntrinsic = Math.max(0, strike - spotPrice);
    const timeValue = Math.max(12, (12 - Math.abs(i)) * (step * 0.4));

    const ceLtp = Number((ceIntrinsic + timeValue).toFixed(2));
    const peLtp = Number((peIntrinsic + timeValue).toFixed(2));

    const ceOi = Math.floor(40000 + Math.max(0, 15 - Math.abs(i)) * 35000 + Math.random() * 10000);
    const peOi = Math.floor(40000 + Math.max(0, 15 - Math.abs(i)) * 38000 + Math.random() * 10000);

    totalCeOi += ceOi;
    totalPeOi += peOi;

    // Max pain evaluation
    let lossForStrike = 0;
    for (let k = -10; k <= 10; k++) {
      const s = atmStrike + k * step;
      lossForStrike += ceOi * Math.max(0, s - strike) + peOi * Math.max(0, strike - s);
    }
    if (lossForStrike < minLoss) {
      minLoss = lossForStrike;
      maxLossMinStrike = strike;
    }

    strikes.push({
      strike,
      ceLtp,
      ceChangePct: Number(((Math.random() - 0.4) * 8).toFixed(2)),
      ceOi,
      ceOiChange: Math.floor((Math.random() - 0.3) * 8000),
      ceIv: Number((11.5 + Math.abs(i) * 0.4).toFixed(1)),
      ceVolume: Math.floor(ceOi * 1.2),
      ceBuildup: buildupOptions[Math.floor(Math.random() * buildupOptions.length)],
      peLtp,
      peChangePct: Number(((Math.random() - 0.4) * 8).toFixed(2)),
      peOi,
      peOiChange: Math.floor((Math.random() - 0.3) * 8000),
      peIv: Number((12.2 + Math.abs(i) * 0.4).toFixed(1)),
      peVolume: Math.floor(peOi * 1.3),
      peBuildup: buildupOptions[Math.floor(Math.random() * buildupOptions.length)],
      isAtm,
    });
  }

  // Highest OI strikes
  const sortedCe = [...strikes].sort((a, b) => b.ceOi - a.ceOi);
  const sortedPe = [...strikes].sort((a, b) => b.peOi - a.peOi);

  const pcrOi = Number((totalPeOi / (totalCeOi || 1)).toFixed(2));

  return {
    indexSymbol,
    spotPrice,
    expiryDates,
    selectedExpiry: expiryDates[0],
    pcrOi,
    pcrVolume: Number((pcrOi * 1.05).toFixed(2)),
    maxPain: maxLossMinStrike,
    highestCeOiStrike: sortedCe[0]?.strike || atmStrike + step * 2,
    highestPeOiStrike: sortedPe[0]?.strike || atmStrike - step * 2,
    totalCeOi,
    totalPeOi,
    futures: {
      ltp: Number((spotPrice * 1.0018).toFixed(2)),
      basis: Number((spotPrice * 0.0018).toFixed(2)),
      oiChangePct: 2.34,
    },
    indiaVix: {
      value: 12.84,
      changePct: -3.12,
    },
    strikes,
  };
}

export function generateFundamentals(symbol: string): IndexFundamentals {
  return {
    pe: 22.41,
    pb: 3.72,
    divYield: 1.24,
    pe5yPercentile: 58.0,
    asOf: new Date().toISOString().split('T')[0],
    historicalPeBands: [
      { date: '2022', pe: 21.2, pe20: 20.0, pe25: 25.0 },
      { date: '2023', pe: 22.8, pe20: 20.0, pe25: 25.0 },
      { date: '2024', pe: 23.5, pe20: 20.0, pe25: 25.0 },
      { date: '2025', pe: 21.9, pe20: 20.0, pe25: 25.0 },
      { date: 'Current', pe: 22.4, pe20: 20.0, pe25: 25.0 },
    ],
  };
}

export const SAMPLE_NEWS: NewsArticle[] = [
  {
    id: 'news-101',
    title: 'RBI MPC Keeps Repo Rate Unchanged at 6.50%; Retains Neutral Stance',
    snippet: 'The Reserve Bank of India Monetary Policy Committee has decided to keep the benchmark policy repo rate unchanged with a unanimous vote, highlighting controlled inflation trends.',
    url: 'https://moneycontrol.com',
    source: 'Moneycontrol',
    publishedAt: new Date(Date.now() - 15 * 60000).toISOString(),
    category: 'POLICY',
    sentiment: 'POSITIVE',
    sentimentScore: 0.75,
    impactScore: 0.92,
    tags: ['NIFTY50', 'BANKNIFTY', 'RBI', 'POLICY'],
    impactHigh: true,
  },
  {
    id: 'news-102',
    title: 'FII Net Inflows Touch ₹2,480 Crore as Global Tech Rally Elevates Sentiment',
    snippet: 'Foreign Institutional Investors turned net buyers in Indian equities on Wednesday, spurred by robust banking quarterly figures and sustained liquidity inflows.',
    url: 'https://economictimes.indiatimes.com',
    source: 'Economic Times',
    publishedAt: new Date(Date.now() - 42 * 60000).toISOString(),
    category: 'MARKETS',
    sentiment: 'POSITIVE',
    sentimentScore: 0.82,
    impactScore: 0.85,
    tags: ['NIFTY50', 'FII', 'MARKETS'],
    impactHigh: true,
  },
  {
    id: 'news-103',
    title: 'HDFC Bank Q1 Net Profit Jumps 14.2% YoY; Asset Quality Improves Solidly',
    snippet: 'India’s largest private lender reported strong credit growth alongside stable net interest margins (NIM) of 3.47%, exceeding street consensus estimates.',
    url: 'https://livemint.com',
    source: 'Livemint',
    publishedAt: new Date(Date.now() - 85 * 60000).toISOString(),
    category: 'RESULTS',
    sentiment: 'POSITIVE',
    sentimentScore: 0.88,
    impactScore: 0.90,
    tags: ['HDFCBANK', 'BANKNIFTY', 'RESULTS'],
    impactHigh: true,
  },
  {
    id: 'news-104',
    title: 'US Fed Signal Gentle Rate Glide Path as CPI Print Moderates to 2.4%',
    snippet: 'Federal Reserve Chairman Jerome Powell hinted that inflation trends allow room for monetary policy easing, boosting risk appetite in Asian emerging markets.',
    url: 'https://reuters.com',
    source: 'Reuters',
    publishedAt: new Date(Date.now() - 130 * 60000).toISOString(),
    category: 'GLOBAL',
    sentiment: 'POSITIVE',
    sentimentScore: 0.65,
    impactScore: 0.78,
    tags: ['GLOBAL', 'FED', 'MARKETS'],
  },
  {
    id: 'news-105',
    title: 'Crude Oil Drops Below $74/bbl; Aviation and Paint Stocks Gain Momentum',
    snippet: 'Softening international Brent crude prices provide margin relief for Indian oil refining, logistics, paint, and airline equities ahead of the festive quarter.',
    url: 'https://business-standard.com',
    source: 'Business Standard',
    publishedAt: new Date(Date.now() - 180 * 60000).toISOString(),
    category: 'ECONOMY',
    sentiment: 'POSITIVE',
    sentimentScore: 0.58,
    impactScore: 0.64,
    tags: ['ECONOMY', 'COMMODITY', 'NIFTY50'],
  },
];

export const SAMPLE_FII_DII: FiiDiiFlow[] = [
  { date: 'Today', fiiCashNet: 2480.5, diiCashNet: 1120.2, fiiFuturesNet: 840.1, fiiIndexOptionNet: 3120.0 },
  { date: 'Yesterday', fiiCashNet: -620.4, diiCashNet: 1850.8, fiiFuturesNet: -310.0, fiiIndexOptionNet: 1450.0 },
  { date: '21 Jul', fiiCashNet: 1250.0, diiCashNet: 450.0, fiiFuturesNet: 520.0, fiiIndexOptionNet: -890.0 },
  { date: '20 Jul', fiiCashNet: -1420.2, diiCashNet: 2100.4, fiiFuturesNet: -940.0, fiiIndexOptionNet: 620.0 },
  { date: '19 Jul', fiiCashNet: 3100.8, diiCashNet: -280.0, fiiFuturesNet: 1120.0, fiiIndexOptionNet: 2400.0 },
];

export const SAMPLE_CALENDAR: CalendarEvent[] = [
  { id: 'cal-1', date: '2026-07-30', time: '15:30 IST', title: 'NIFTY & BANK NIFTY Monthly F&O Expiry', category: 'EXPIRY', impact: 'HIGH', description: 'Monthly derivative contract settlement for July series.' },
  { id: 'cal-2', date: '2026-08-08', time: '10:00 IST', title: 'RBI Monetary Policy Committee Announcement', category: 'RBI', impact: 'HIGH', description: 'Governor speech and benchmark interest rate decision.' },
  { id: 'cal-3', date: '2026-08-12', time: '17:30 IST', title: 'India CPI & IIP Data Release', category: 'MACRO', impact: 'MEDIUM', description: 'Retail inflation print and index of industrial production.' },
];

export function getFullSnapshot(symbol: string): FullIndexSnapshot {
  const quote = generateQuote(symbol);
  const breadth: Breadth = { advances: 34, declines: 15, unchanged: 1 };
  const contributors = CONSTITUENTS_MASTER[symbol] || CONSTITUENTS_MASTER['NIFTY50'];
  const technicals = generateTechnicals(symbol);
  const derivatives = generateOptionChain(symbol);
  const fundamentals = generateFundamentals(symbol);

  return {
    quote,
    breadth,
    contributors,
    technicals,
    derivatives,
    fundamentals,
    disclaimerKey: 'NOT_INVESTMENT_ADVICE',
  };
}
