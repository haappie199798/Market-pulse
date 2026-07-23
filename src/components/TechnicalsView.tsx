import React, { useState } from 'react';
import { TechnicalsPayload } from '../types';
import {
  ShieldAlert,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface TechnicalsViewProps {
  technicals: TechnicalsPayload;
  selectedInterval: '5m' | '15m' | '1h' | '1d';
  onIntervalChange: (int: '5m' | '15m' | '1h' | '1d') => void;
}

export const TechnicalsView: React.FC<TechnicalsViewProps> = ({
  technicals,
  selectedInterval,
  onIntervalChange,
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [infoModalContent, setInfoModalContent] = useState<{ title: string; desc: string } | null>(null);

  const { summary, rsi14, macd, ema, sma, supertrend, bollinger, pivots, cpr } = technicals;

  const fmt = (v: number | null, dp = 2): string =>
    v == null ? '—' : v.toFixed(dp);

  const biasColor =
    summary.bias.includes('BULLISH') ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' :
    summary.bias.includes('BEARISH') ? 'text-rose-400 bg-rose-500/10 border-rose-500/30' :
    'text-amber-400 bg-amber-500/10 border-amber-500/30';

  const totalVotes = summary.bullish + summary.bearish + summary.neutral || 1;
  const bullPct = Math.round((summary.bullish / totalVotes) * 100);

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  const dq = technicals.dataQuality;

  return (
    <div className="space-y-6">
      {dq?.source === 'SIMULATED' ? (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4">
          <ShieldAlert className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
          <div className="text-[12px] leading-relaxed">
            <p className="font-bold text-amber-300">Placeholder values — not computed</p>
            <p className="text-amber-200/80">
              The upstream candle fetch failed, so these are static placeholder
              numbers rather than indicators derived from market data. Do not
              read anything into them.
            </p>
          </div>
        </div>
      ) : dq && !dq.warmupComplete ? (
        <div className="flex items-start gap-3 rounded-2xl border border-slate-700 bg-slate-900 p-4">
          <ShieldAlert className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
          <div className="text-[12px] leading-relaxed">
            <p className="font-bold text-slate-200">Limited history</p>
            <p className="text-slate-400">
              Computed from {dq.candlesUsed} candles. Longer-period indicators
              such as EMA-200 need at least 200 and are shown as “—” until
              enough history is available. Pivots derived from {dq.pivotsFrom}.
            </p>
          </div>
        </div>
      ) : null}
      
      {/* Timeframe Selector & Non-advisory Disclaimer */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div>
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            Indicator Summary & Signal Gauge
          </h3>
          <p className="text-xs text-slate-400">Aggregated reading across technical mathematical formulas</p>
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {(['5m', '15m', '1h', '1d'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => onIntervalChange(tf)}
              className={`px-3 py-1 rounded-lg text-xs font-bold ${
                selectedInterval === tf
                  ? 'bg-emerald-500 text-slate-950'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tf.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* INDICATOR SUMMARY GAUGE & COUNTS */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          
          {/* Bias Badge */}
          <div className="text-center md:text-left">
            <span className="text-xs font-semibold text-slate-400 block mb-1">AGGREGATED BIAS</span>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border text-lg font-black tracking-wide ${biasColor}`}>
              <span>{summary.bias.replace('_', ' ')}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Automated count based on {totalVotes} standard technical indicators
            </p>
          </div>

          {/* Voting Gauge Bar */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-emerald-400">{summary.bullish} Bullish ({bullPct}%)</span>
              <span className="text-amber-400">{summary.neutral} Neutral</span>
              <span className="text-rose-400">{summary.bearish} Bearish</span>
            </div>

            <div className="h-4 bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
              <div className="bg-emerald-500 h-full" style={{ width: `${(summary.bullish / totalVotes) * 100}%` }} />
              <div className="bg-amber-500 h-full" style={{ width: `${(summary.neutral / totalVotes) * 100}%` }} />
              <div className="bg-rose-500 h-full" style={{ width: `${(summary.bearish / totalVotes) * 100}%` }} />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Confidence Index: {(summary.confidence * 100).toFixed(0)}%</span>
              <span className="italic text-slate-500">Not investment advice</span>
            </div>
          </div>

        </div>
      </div>

      {/* INDICATOR GROUPS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Trend Indicators */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Trend Indicators
            </h4>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60">
              <span className="text-slate-400 font-medium">Supertrend (10, 3)</span>
              <div className="flex items-center gap-2 font-mono">
                <span className="font-bold text-slate-200">₹{supertrend.value}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${supertrend.direction === 'UP' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                  {supertrend.direction}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60">
              <span className="text-slate-400 font-medium">EMA 20 / EMA 50</span>
              <div className="font-mono text-slate-200 font-bold">
                ₹{ema.ema20} / ₹{ema.ema50}
              </div>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60">
              <span className="text-slate-400 font-medium">EMA 200 (Long Term)</span>
              <div className="font-mono text-slate-200 font-bold">
                ₹{ema.ema200}
              </div>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60">
              <span className="text-slate-400 font-medium">ADX (14) Trend Strength</span>
              <div className="font-mono text-slate-200 font-bold">
                {fmt(technicals.adx14)}{' '}
                ({technicals.adx14 == null
                  ? 'Not available'
                  : technicals.adx14 > 25
                    ? 'Strong Trend'
                    : 'Weak Trend'})
              </div>
            </div>
          </div>
        </div>

        {/* Momentum Indicators */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-400" /> Momentum Oscillators
            </h4>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60">
              <span className="text-slate-400 font-medium">RSI (14)</span>
              <div className="flex items-center gap-2 font-mono">
                <span className="font-bold text-slate-200">{fmt(rsi14, 1)}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    rsi14 == null
                      ? 'bg-slate-800 text-slate-400'
                      : rsi14 > 70
                        ? 'bg-rose-500/20 text-rose-400'
                        : rsi14 < 30
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {rsi14 == null
                    ? 'Not available'
                    : rsi14 > 70
                      ? 'Overbought'
                      : rsi14 < 30
                        ? 'Oversold'
                        : 'Neutral'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60">
              <span className="text-slate-400 font-medium">MACD (12,26,9)</span>
              <div className="flex items-center gap-2 font-mono">
                <span className="font-bold text-slate-200">{macd.macd}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                  {macd.cross}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60">
              <span className="text-slate-400 font-medium">Stochastic (14,3,3)</span>
              <div className="font-mono text-slate-200 font-bold">
                %K: {technicals.stochastic.k} | %D: {technicals.stochastic.d}
              </div>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60">
              <span className="text-slate-400 font-medium">CCI (20)</span>
              <div className="font-mono text-slate-200 font-bold">
                {technicals.cci20}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* CPR & PIVOTS TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" /> Central Pivot Range (CPR) & Classic Levels
            </h4>
            <p className="text-[11px] text-slate-400">Derived from previous session High, Low, and Close prices</p>
          </div>
          <span className={`px-2.5 py-1 rounded text-xs font-bold ${cpr.width === 'NARROW' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-300'}`}>
            {cpr.width} CPR
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-4">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
            <span className="text-slate-500 block text-[10px]">Top Central (TC)</span>
            <span className="text-sm font-bold font-mono text-slate-200">₹{cpr.tc}</span>
          </div>
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-center">
            <span className="text-purple-400 block text-[10px]">Pivot Point (PP)</span>
            <span className="text-sm font-bold font-mono text-purple-300">₹{cpr.pivot}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
            <span className="text-slate-500 block text-[10px]">Bottom Central (BC)</span>
            <span className="text-sm font-bold font-mono text-slate-200">₹{cpr.bc}</span>
          </div>
        </div>

        {/* Pivot Levels Row */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
          <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 font-mono">
            <div className="text-[10px] text-slate-400">R3</div>
            <div className="font-bold">₹{pivots.r3}</div>
          </div>
          <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 font-mono">
            <div className="text-[10px] text-slate-400">R2</div>
            <div className="font-bold">₹{pivots.r2}</div>
          </div>
          <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 font-mono">
            <div className="text-[10px] text-slate-400">R1</div>
            <div className="font-bold">₹{pivots.r1}</div>
          </div>
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono">
            <div className="text-[10px] text-slate-400">S1</div>
            <div className="font-bold">₹{pivots.s1}</div>
          </div>
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono">
            <div className="text-[10px] text-slate-400">S2</div>
            <div className="font-bold">₹{pivots.s2}</div>
          </div>
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono">
            <div className="text-[10px] text-slate-400">S3</div>
            <div className="font-bold">₹{pivots.s3}</div>
          </div>
        </div>
      </div>

    </div>
  );
};
