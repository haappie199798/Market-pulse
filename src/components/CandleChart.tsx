import React, { useState } from 'react';
import { Candle } from '../types';
import {
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  Line,
  Bar,
  Area,
  CartesianGrid
} from 'recharts';
import { Sliders, Eye } from 'lucide-react';

interface CandleChartProps {
  candles: Candle[];
  interval: '5m' | '15m' | '1h' | '1d';
  onIntervalChange: (int: '5m' | '15m' | '1h' | '1d') => void;
  symbol: string;
}

export const CandleChart: React.FC<CandleChartProps> = ({
  candles,
  interval,
  onIntervalChange,
  symbol,
}) => {
  const [showEma, setShowEma] = useState(true);
  const [showVwap, setShowVwap] = useState(true);
  const [showSupertrend, setShowSupertrend] = useState(true);
  const [showBollinger, setShowBollinger] = useState(false);
  const [bottomOscillator, setBottomOscillator] = useState<'rsi' | 'macd' | 'none'>('rsi');

  // Chart domain padding
  const prices = candles.map((c) => c.close);
  const minPrice = Math.min(...prices) * 0.998;
  const maxPrice = Math.max(...prices) * 1.002;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
      
      {/* Chart Top Bar & Indicator Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        
        {/* Timeframe Chips */}
        <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800/60">
          {(['5m', '15m', '1h', '1d'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => onIntervalChange(tf)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                interval === tf
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {tf.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Overlay Switches */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
          <button
            onClick={() => setShowEma(!showEma)}
            className={`px-2.5 py-1 rounded-lg border transition ${
              showEma
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : 'bg-slate-800/40 text-slate-500 border-slate-800'
            }`}
          >
            EMA (20/50/200)
          </button>

          <button
            onClick={() => setShowVwap(!showVwap)}
            className={`px-2.5 py-1 rounded-lg border transition ${
              showVwap
                ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                : 'bg-slate-800/40 text-slate-500 border-slate-800'
            }`}
          >
            VWAP
          </button>

          <button
            onClick={() => setShowSupertrend(!showSupertrend)}
            className={`px-2.5 py-1 rounded-lg border transition ${
              showSupertrend
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-slate-800/40 text-slate-500 border-slate-800'
            }`}
          >
            Supertrend
          </button>

          <button
            onClick={() => setShowBollinger(!showBollinger)}
            className={`px-2.5 py-1 rounded-lg border transition ${
              showBollinger
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                : 'bg-slate-800/40 text-slate-500 border-slate-800'
            }`}
          >
            Bollinger
          </button>

          <div className="h-4 w-[1px] bg-slate-800 mx-1 hidden sm:block" />

          <select
            value={bottomOscillator}
            onChange={(e) => setBottomOscillator(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 text-xs rounded-lg px-2 py-1 text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="rsi">Oscillator: RSI (14)</option>
            <option value="macd">Oscillator: MACD (12,26,9)</option>
            <option value="none">Oscillator: None</option>
          </select>
        </div>
      </div>

      {/* Main Price & Overlay Chart */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={candles} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} tickLine={false} />
            <YAxis
              domain={[minPrice, maxPrice]}
              orientation="right"
              stroke="#64748b"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              tickFormatter={(v) => `₹${Math.round(v)}`}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '0.75rem',
                fontSize: '11px',
                color: '#f8fafc',
              }}
              formatter={(val: any, name: any) => [
                typeof val === 'number' ? `₹${val.toFixed(2)}` : val,
                String(name).toUpperCase(),
              ]}
            />

            {/* Area gradient for Price line */}
            <defs>
              <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <Area type="monotone" dataKey="close" stroke="#10b981" strokeWidth={2} fill="url(#priceGrad)" name="Close Price" />

            {showEma && <Line type="monotone" dataKey="ema20" stroke="#f59e0b" strokeWidth={1.5} dot={false} name="EMA 20" />}
            {showEma && <Line type="monotone" dataKey="ema50" stroke="#3b82f6" strokeWidth={1.5} dot={false} name="EMA 50" />}
            {showEma && <Line type="monotone" dataKey="ema200" stroke="#ef4444" strokeWidth={1.5} dot={false} name="EMA 200" />}

            {showVwap && <Line type="monotone" dataKey="vwap" stroke="#a855f7" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="VWAP" />}
            {showSupertrend && <Line type="monotone" dataKey="supertrend" stroke="#10b981" strokeWidth={2} dot={false} name="Supertrend" />}

            {showBollinger && <Line type="monotone" dataKey="upperBB" stroke="#60a5fa" strokeWidth={1} dot={false} name="Upper BB" />}
            {showBollinger && <Line type="monotone" dataKey="lowerBB" stroke="#60a5fa" strokeWidth={1} dot={false} name="Lower BB" />}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Sub-chart for RSI / MACD */}
      {bottomOscillator !== 'none' && (
        <div className="h-28 w-full border-t border-slate-800/80 pt-2">
          <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">
            {bottomOscillator === 'rsi' ? 'RSI (14) Relative Strength Index' : 'MACD (12, 26, 9) Histogram'}
          </div>
          <ResponsiveContainer width="100%" height="100%">
            {bottomOscillator === 'rsi' ? (
              <ComposedChart data={candles} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <YAxis domain={[0, 100]} orientation="right" stroke="#64748b" tick={{ fontSize: 9 }} tickLine={false} />
                <XAxis dataKey="time" hide />
                <Line type="monotone" dataKey="rsi" stroke="#38bdf8" strokeWidth={1.5} dot={false} name="RSI" />
              </ComposedChart>
            ) : (
              <ComposedChart data={candles} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <YAxis orientation="right" stroke="#64748b" tick={{ fontSize: 9 }} tickLine={false} />
                <XAxis dataKey="time" hide />
                <Bar dataKey="macdHist" fill="#10b981" name="MACD Hist" />
                <Line type="monotone" dataKey="macd" stroke="#38bdf8" strokeWidth={1.5} dot={false} name="MACD" />
                <Line type="monotone" dataKey="macdSignal" stroke="#f43f5e" strokeWidth={1.5} dot={false} name="Signal" />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        </div>
      )}

    </div>
  );
};
