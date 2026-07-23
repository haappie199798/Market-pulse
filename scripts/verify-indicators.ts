import {
  calculateSMA,
  calculateEMA,
  calculateRSI,
  calculateMACD,
  calculateBollingerBands,
  calculatePivotCPR,
} from '../src/services/indicators';

/**
 * Verification Script for Technical Indicators Engine
 * Run via `npx tsx scripts/verify-indicators.ts`
 */

function runVerification() {
  console.log('=== PulseMarket Indicator Engine Verification ===\n');
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, description: string) {
    total++;
    if (condition) {
      console.log(`✅ PASS: ${description}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${description}`);
    }
  }

  // 1. SMA Verification
  const pricesSMA = [10, 20, 30, 40, 50, 60];
  const sma3 = calculateSMA(pricesSMA, 3);
  assert(sma3[0] === null && sma3[1] === null, 'SMA period 3 initially returns null for indices < 2');
  assert(sma3[2] === 20, 'SMA(10,20,30) period 3 equals 20.0');
  assert(sma3[5] === 50, 'SMA(40,50,60) period 3 equals 50.0');

  // 2. EMA Verification
  const pricesEMA = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
  const ema5 = calculateEMA(pricesEMA, 5);
  assert(ema5[0] === null && ema5[3] === null, 'EMA period 5 initially returns null for indices < 4');
  assert(ema5[4] === 12, 'EMA seed period 5 equals SMA seed 12.0');

  // 3. Wilder's RSI Verification
  // Series with 15 values (14 period)
  const rsiPrices = [
    44.34, 44.09, 44.15, 43.61, 44.33, 44.83, 45.10, 45.42, 45.84, 46.08,
    45.89, 46.03, 45.61, 46.28, 46.28
  ];
  const rsi14 = calculateRSI(rsiPrices, 14);
  assert(rsi14.length === rsiPrices.length, 'RSI output length matches input length');
  assert(rsi14[0] === null && rsi14[13] === null, 'RSI returns null for first 14 elements');
  assert(typeof rsi14[14] === 'number' && rsi14[14]! > 0 && rsi14[14]! < 100, 'RSI calculates valid 0-100 bounded number');

  // 4. MACD Verification
  const macdPrices = Array.from({ length: 40 }, (_, i) => 100 + i * 0.5 + Math.sin(i) * 2);
  const macdResult = calculateMACD(macdPrices, 12, 26, 9);
  assert(macdResult.macd.length === 40, 'MACD line length matches prices');
  assert(macdResult.signal.length === 40, 'MACD signal line length matches prices');
  assert(macdResult.histogram.length === 40, 'MACD histogram length matches prices');

  // 5. Bollinger Bands Verification
  const bbPrices = Array.from({ length: 25 }, (_, i) => 100 + (i % 5));
  const bb = calculateBollingerBands(bbPrices, 20, 2);
  assert(bb.middle[19] !== null, 'Bollinger Bands middle period 20 calculated');
  assert(bb.upper[19]! > bb.middle[19]!, 'Bollinger Bands upper > middle');
  assert(bb.lower[19]! < bb.middle[19]!, 'Bollinger Bands lower < middle');

  // 6. Pivot Points & CPR Verification
  const cpr = calculatePivotCPR(25000, 24500, 24800);
  assert(cpr.pivot === 24766.67, 'Pivot calculation matches (H+L+C)/3');
  assert(cpr.r1 > cpr.pivot, 'R1 resistance higher than Pivot');
  assert(cpr.s1 < cpr.pivot, 'S1 support lower than Pivot');
  assert(cpr.tc >= cpr.pivot || cpr.bc <= cpr.pivot, 'CPR TC/BC brackets Pivot');

  console.log(`\nResults: ${passed}/${total} checks passed.`);
  if (passed !== total) {
    process.exit(1);
  }
}

runVerification();
