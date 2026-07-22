export type MarketStatusType = 'OPEN' | 'PRE_OPEN' | 'CLOSED' | 'HOLIDAY';

export interface MarketStatus {
  status: MarketStatusType;
  serverTime: string;
  nextUpdateAt: string;
  cycleId: string;
  message?: string;
}

export interface Quote {
  symbol: string;
  displayName: string;
  exchange: 'NSE' | 'BSE' | 'NFO';
  ltp: number;
  prevClose: number;
  dayOpen: number;
  dayHigh: number;
  dayLow: number;
  changeAbs: number;
  changePct: number;
  volume: number;
  week52High: number;
  week52Low: number;
  updatedAt: string;
}

export interface Breadth {
  advances: number;
  declines: number;
  unchanged: number;
}

export interface Contributor {
  symbol: string;
  name: string;
  points: number;
  changePct: number;
  weightPct: number;
  ltp: number;
  sector: string;
}

export interface Candle {
  ts: string;
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  vwap?: number;
  ema20?: number;
  ema50?: number;
  ema200?: number;
  supertrend?: number;
  rsi?: number;
  macd?: number;
  macdSignal?: number;
  macdHist?: number;
  upperBB?: number;
  lowerBB?: number;
}

export type BiasType = 'STRONG_BEARISH' | 'BEARISH_LEAN' | 'NEUTRAL' | 'BULLISH_LEAN' | 'STRONG_BULLISH';

export interface TechnicalsSummary {
  bullish: number;
  bearish: number;
  neutral: number;
  bias: BiasType;
  confidence: number;
}

export interface TechnicalsPayload {
  interval: '5m' | '15m' | '1h' | '1d';
  rsi14: number;
  macd: {
    macd: number;
    signal: number;
    hist: number;
    cross: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  };
  ema: {
    ema9: number;
    ema20: number;
    ema50: number;
    ema100: number;
    ema200: number;
  };
  sma: {
    sma20: number;
    sma50: number;
    sma200: number;
  };
  supertrend: {
    value: number;
    direction: 'UP' | 'DOWN';
    flippedThisCandle: boolean;
  };
  bollinger: {
    upper: number;
    mid: number;
    lower: number;
    percentB: number;
    bandwidth: number;
  };
  adx14: number;
  atr14: number;
  vwap: number;
  stochastic: {
    k: number;
    d: number;
  };
  cci20: number;
  pivots: {
    type: 'classic' | 'fibonacci' | 'camarilla';
    pp: number;
    r1: number;
    r2: number;
    r3: number;
    s1: number;
    s2: number;
    s3: number;
  };
  cpr: {
    pivot: number;
    tc: number;
    bc: number;
    width: 'NARROW' | 'AVERAGE' | 'WIDE';
  };
  patterns: string[];
  summary: TechnicalsSummary;
}

export type BuildupType = 'LONG_BUILDUP' | 'SHORT_BUILDUP' | 'LONG_UNWINDING' | 'SHORT_COVERING';

export interface StrikeRow {
  strike: number;
  ceLtp: number;
  ceChangePct: number;
  ceOi: number;
  ceOiChange: number;
  ceIv: number;
  ceVolume: number;
  ceBuildup: BuildupType;
  peLtp: number;
  peChangePct: number;
  peOi: number;
  peOiChange: number;
  peIv: number;
  peVolume: number;
  peBuildup: BuildupType;
  isAtm?: boolean;
}

export interface OptionChainSnapshot {
  indexSymbol: string;
  spotPrice: number;
  expiryDates: string[];
  selectedExpiry: string;
  pcrOi: number;
  pcrVolume: number;
  maxPain: number;
  highestCeOiStrike: number;
  highestPeOiStrike: number;
  totalCeOi: number;
  totalPeOi: number;
  futures: {
    ltp: number;
    basis: number;
    oiChangePct: number;
  };
  indiaVix: {
    value: number;
    changePct: number;
  };
  strikes: StrikeRow[];
}

export interface IndexFundamentals {
  pe: number;
  pb: number;
  divYield: number;
  pe5yPercentile: number;
  asOf: string;
  historicalPeBands: { date: string; pe: number; pe20: number; pe25: number }[];
}

export interface NewsArticle {
  id: string;
  title: string;
  snippet: string;
  url: string;
  imageUrl?: string;
  source: string;
  publishedAt: string;
  category: 'MARKETS' | 'ECONOMY' | 'RESULTS' | 'POLICY' | 'GLOBAL' | 'CORPORATE';
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  sentimentScore: number; // -1.0 to +1.0
  impactScore: number; // 0 to 1
  tags: string[];
  impactHigh?: boolean;
}

export interface FiiDiiFlow {
  date: string;
  fiiCashNet: number;
  diiCashNet: number;
  fiiFuturesNet: number;
  fiiIndexOptionNet: number;
}

export interface CalendarEvent {
  id: string;
  date: string;
  time: string;
  title: string;
  category: 'RBI' | 'EARNINGS' | 'EXPIRY' | 'MACRO';
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
}

export interface AlertRule {
  id: string;
  symbol: string;
  alertType: 'PRICE_ABOVE' | 'PRICE_BELOW' | 'RSI_CROSS' | 'SUPERTREND_FLIP' | 'PCR_CROSS' | 'NEWS_TAG';
  params: {
    value: number;
    timeframe?: string;
    condition?: string;
  };
  isActive: boolean;
  createdAt: string;
  lastFiredAt?: string;
}

export interface WatchlistItem {
  symbol: string;
  name: string;
  ltp: number;
  changePct: number;
  type: 'INDEX' | 'STOCK';
  category?: string;
}

export interface LiveTick {
  id: string;
  symbol: string;
  ltp: number;
  changeAbs: number;
  changePct: number;
  quantity: number;
  bidPrice: number;
  askPrice: number;
  direction: 'UP' | 'DOWN' | 'SAME';
  timestamp: string;
}

export interface FullIndexSnapshot {
  quote: Quote;
  breadth: Breadth;
  contributors: Contributor[];
  technicals: TechnicalsPayload;
  derivatives: OptionChainSnapshot;
  fundamentals: IndexFundamentals;
  disclaimerKey: string;
}

export interface UserSessionLog {
  id: string;
  ipAddress: string;
  device: string;
  browser: string;
  loginTime: string;
  status: 'SUCCESS' | '2FA_VERIFIED' | 'REVOKED';
  location: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  clientId: string;
  avatarUrl?: string;
  kycStatus: 'VERIFIED' | 'PENDING' | 'REJECTED';
  accountType: 'PRO_TRADER' | 'RETAIL' | 'INSTITUTIONAL';
  joinedDate: string;
  broker: string;
  segmentPermissions: string[];
  funds: {
    availableCash: number;
    usedMargin: number;
    collateralValue: number;
    totalPortfolio: number;
    payinToday: number;
  };
  apiKey: string;
  apiSecret: string;
  riskLimits: {
    maxDailyLoss: number;
    maxOrderValue: number;
    defaultStopLossPct: number;
    requireOrderConfirmation: boolean;
  };
  loginHistory: UserSessionLog[];
}

