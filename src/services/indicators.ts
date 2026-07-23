import { Candle } from '../types';

/**
 * Technical Indicators Calculation Engine
 * Implements standard technical analysis formulas using Wilder's smoothing where applicable.
 */

// 1. Simple Moving Average (SMA)
export function calculateSMA(data: number[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  let sum = 0;

  for (let i = 0; i < data.length; i++) {
    sum += data[i];
    if (i >= period) {
      sum -= data[i - period];
    }
    if (i >= period - 1) {
      result.push(Number((sum / period).toFixed(2)));
    } else {
      result.push(null);
    }
  }
  return result;
}

// 2. Exponential Moving Average (EMA)
export function calculateEMA(data: number[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  const multiplier = 2 / (period + 1);
  let prevEMA: number | null = null;

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
      continue;
    }

    if (i === period - 1) {
      // Seed with SMA
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[j];
      }
      prevEMA = sum / period;
      result.push(Number(prevEMA.toFixed(2)));
      continue;
    }

    if (prevEMA !== null) {
      const currentEMA = (data[i] - prevEMA) * multiplier + prevEMA;
      prevEMA = currentEMA;
      result.push(Number(currentEMA.toFixed(2)));
    }
  }
  return result;
}

// 3. Relative Strength Index (RSI) using Wilder's Smoothing Method
export function calculateRSI(closes: number[], period: number = 14): (number | null)[] {
  const result: (number | null)[] = [];
  if (closes.length <= period) {
    return closes.map(() => null);
  }

  const gains: number[] = [];
  const losses: number[] = [];

  for (let i = 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    gains.push(diff > 0 ? diff : 0);
    losses.push(diff < 0 ? Math.abs(diff) : 0);
  }

  // First values are null for index 0 to period-1
  for (let i = 0; i < period; i++) {
    result.push(null);
  }

  // Initial average gain and loss for first period
  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  let rsi = avgLoss === 0 ? 100 : 100 - 100 / (1 + rs);
  result.push(Number(rsi.toFixed(2)));

  // Subsequent Wilder's smoothed values
  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;

    if (avgLoss === 0) {
      result.push(100);
    } else {
      rs = avgGain / avgLoss;
      rsi = 100 - 100 / (1 + rs);
      result.push(Number(rsi.toFixed(2)));
    }
  }

  return result;
}

// 4. Moving Average Convergence Divergence (MACD)
export interface MACDResult {
  macd: (number | null)[];
  signal: (number | null)[];
  histogram: (number | null)[];
}

export function calculateMACD(
  closes: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): MACDResult {
  const fastEMA = calculateEMA(closes, fastPeriod);
  const slowEMA = calculateEMA(closes, slowPeriod);

  const macdLine: (number | null)[] = [];
  const validMACDValues: number[] = [];
  const validMACDIndices: number[] = [];

  for (let i = 0; i < closes.length; i++) {
    if (fastEMA[i] !== null && slowEMA[i] !== null) {
      const val = Number((fastEMA[i]! - slowEMA[i]!).toFixed(2));
      macdLine.push(val);
      validMACDValues.push(val);
      validMACDIndices.push(i);
    } else {
      macdLine.push(null);
    }
  }

  const signalEMA = calculateEMA(validMACDValues, signalPeriod);
  const signalLine: (number | null)[] = new Array(closes.length).fill(null);
  const histogram: (number | null)[] = new Array(closes.length).fill(null);

  for (let i = 0; i < validMACDValues.length; i++) {
    const originalIdx = validMACDIndices[i];
    if (signalEMA[i] !== null) {
      signalLine[originalIdx] = signalEMA[i];
      histogram[originalIdx] = Number((macdLine[originalIdx]! - signalEMA[i]!).toFixed(2));
    }
  }

  return { macd: macdLine, signal: signalLine, histogram };
}

// 5. Stochastic Oscillator (%K, %D)
export function calculateStochastic(
  highs: number[],
  lows: number[],
  closes: number[],
  kPeriod: number = 14,
  dPeriod: number = 3
): { k: (number | null)[]; d: (number | null)[] } {
  const kLine: (number | null)[] = [];

  for (let i = 0; i < closes.length; i++) {
    if (i < kPeriod - 1) {
      kLine.push(null);
      continue;
    }

    const windowHighs = highs.slice(i - kPeriod + 1, i + 1);
    const windowLows = lows.slice(i - kPeriod + 1, i + 1);
    const highestHigh = Math.max(...windowHighs);
    const lowestLow = Math.min(...windowLows);

    if (highestHigh === lowestLow) {
      kLine.push(50);
    } else {
      const kVal = ((closes[i] - lowestLow) / (highestHigh - lowestLow)) * 100;
      kLine.push(Number(kVal.toFixed(2)));
    }
  }

  const validK = kLine.filter((v): v is number => v !== null);
  const validD = calculateSMA(validK, dPeriod);

  const dLine: (number | null)[] = [];
  let validDIdx = 0;
  for (let i = 0; i < kLine.length; i++) {
    if (kLine[i] !== null) {
      dLine.push(validD[validDIdx] ?? null);
      validDIdx++;
    } else {
      dLine.push(null);
    }
  }

  return { k: kLine, d: dLine };
}

// 6. Commodity Channel Index (CCI)
export function calculateCCI(
  highs: number[],
  lows: number[],
  closes: number[],
  period: number = 20
): (number | null)[] {
  const result: (number | null)[] = [];
  const tpList: number[] = [];

  for (let i = 0; i < closes.length; i++) {
    tpList.push((highs[i] + lows[i] + closes[i]) / 3);
  }

  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) {
      result.push(null);
      continue;
    }

    const tpSlice = tpList.slice(i - period + 1, i + 1);
    const meanTP = tpSlice.reduce((a, b) => a + b, 0) / period;
    const meanDev = tpSlice.reduce((acc, val) => acc + Math.abs(val - meanTP), 0) / period;

    if (meanDev === 0) {
      result.push(0);
    } else {
      const cci = (tpList[i] - meanTP) / (0.015 * meanDev);
      result.push(Number(cci.toFixed(2)));
    }
  }

  return result;
}

// 7. Average True Range (ATR)
export function calculateATR(
  highs: number[],
  lows: number[],
  closes: number[],
  period: number = 14
): (number | null)[] {
  const result: (number | null)[] = [];
  const trList: number[] = [highs[0] - lows[0]];

  for (let i = 1; i < closes.length; i++) {
    const tr = Math.max(
      highs[i] - lows[i],
      Math.abs(highs[i] - closes[i - 1]),
      Math.abs(lows[i] - closes[i - 1])
    );
    trList.push(tr);
  }

  let prevATR: number | null = null;

  for (let i = 0; i < trList.length; i++) {
    if (i < period - 1) {
      result.push(null);
      continue;
    }

    if (i === period - 1) {
      prevATR = trList.slice(0, period).reduce((a, b) => a + b, 0) / period;
      result.push(Number(prevATR.toFixed(2)));
      continue;
    }

    if (prevATR !== null) {
      prevATR = (prevATR * (period - 1) + trList[i]) / period;
      result.push(Number(prevATR.toFixed(2)));
    }
  }

  return result;
}

// 8. Bollinger Bands (20 period, 2 std dev)
export function calculateBollingerBands(
  closes: number[],
  period: number = 20,
  stdDevMult: number = 2
): { middle: (number | null)[]; upper: (number | null)[]; lower: (number | null)[] } {
  const middle = calculateSMA(closes, period);
  const upper: (number | null)[] = [];
  const lower: (number | null)[] = [];

  for (let i = 0; i < closes.length; i++) {
    if (middle[i] === null) {
      upper.push(null);
      lower.push(null);
      continue;
    }

    const window = closes.slice(i - period + 1, i + 1);
    const mean = middle[i]!;
    const variance = window.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / period;
    const stdDev = Math.sqrt(variance);

    upper.push(Number((mean + stdDevMult * stdDev).toFixed(2)));
    lower.push(Number((mean - stdDevMult * stdDev).toFixed(2)));
  }

  return { middle, upper, lower };
}

// 9. Volume Weighted Average Price (VWAP)
export function calculateVWAP(candles: Candle[]): (number | null)[] {
  const vwapList: (number | null)[] = [];
  let cumulativeTPV = 0; // Typical Price * Volume
  let cumulativeVol = 0;

  for (let i = 0; i < candles.length; i++) {
    const c = candles[i];
    const typicalPrice = (c.high + c.low + c.close) / 3;
    const volume = c.volume || 1;

    cumulativeTPV += typicalPrice * volume;
    cumulativeVol += volume;

    const vwap = cumulativeVol > 0 ? cumulativeTPV / cumulativeVol : c.close;
    vwapList.push(Number(vwap.toFixed(2)));
  }

  return vwapList;
}

// 10. Classic Pivots & CPR (Central Pivot Range)
export interface PivotPointsCPR {
  pivot: number;
  bc: number; // Bottom Central
  tc: number; // Top Central
  cprWidthPct: number;
  r1: number;
  r2: number;
  r3: number;
  s1: number;
  s2: number;
  s3: number;
}

export function calculatePivotCPR(high: number, low: number, close: number): PivotPointsCPR {
  const pivot = (high + low + close) / 3;
  const bc = (high + low) / 2;
  const tc = pivot - bc + pivot;
  const cprWidthPct = Math.abs((tc - bc) / pivot) * 100;

  const r1 = 2 * pivot - low;
  const s1 = 2 * pivot - high;

  const r2 = pivot + (high - low);
  const s2 = pivot - (high - low);

  const r3 = high + 2 * (pivot - low);
  const s3 = low - 2 * (high - pivot);

  return {
    pivot: Number(pivot.toFixed(2)),
    bc: Number(Math.min(bc, tc).toFixed(2)),
    tc: Number(Math.max(bc, tc).toFixed(2)),
    cprWidthPct: Number(cprWidthPct.toFixed(2)),
    r1: Number(r1.toFixed(2)),
    r2: Number(r2.toFixed(2)),
    r3: Number(r3.toFixed(2)),
    s1: Number(s1.toFixed(2)),
    s2: Number(s2.toFixed(2)),
    s3: Number(s3.toFixed(2)),
  };
}

// 11. Candlestick Pattern Detector
export function detectCandlePattern(candles: Candle[]): { pattern: string; signal: 'BULLISH' | 'BEARISH' | 'NEUTRAL' } | null {
  if (candles.length < 2) return null;

  const cur = candles[candles.length - 1];
  const prev = candles[candles.length - 2];

  const curBody = Math.abs(cur.close - cur.open);
  const curRange = cur.high - cur.low;
  const curIsBull = cur.close >= cur.open;

  const prevIsBull = prev.close >= prev.open;

  // Doji
  if (curRange > 0 && curBody / curRange < 0.1) {
    return { pattern: 'Doji', signal: 'NEUTRAL' };
  }

  // Bullish Engulfing
  if (!prevIsBull && curIsBull && cur.close > prev.open && cur.open < prev.close) {
    return { pattern: 'Bullish Engulfing', signal: 'BULLISH' };
  }

  // Bearish Engulfing
  if (prevIsBull && !curIsBull && cur.close < prev.open && cur.open > prev.close) {
    return { pattern: 'Bearish Engulfing', signal: 'BEARISH' };
  }

  // Hammer
  const lowerShadow = Math.min(cur.open, cur.close) - cur.low;
  const upperShadow = cur.high - Math.max(cur.open, cur.close);

  if (curRange > 0 && lowerShadow > curBody * 2 && upperShadow < curBody * 0.5) {
    return { pattern: 'Hammer Pinbar', signal: 'BULLISH' };
  }

  // Shooting Star
  if (curRange > 0 && upperShadow > curBody * 2 && lowerShadow < curBody * 0.5) {
    return { pattern: 'Shooting Star', signal: 'BEARISH' };
  }

  return null;
}
