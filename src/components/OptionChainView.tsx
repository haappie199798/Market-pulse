import React, { useState } from 'react';
import { OptionChainSnapshot, StrikeRow, BuildupType } from '../types';
import {
  PieChart,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Flame,
  Zap
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';

interface OptionChainViewProps {
  derivatives: OptionChainSnapshot;
  symbol: string;
}

export const OptionChainView: React.FC<OptionChainViewProps> = ({
  derivatives,
  symbol,
}) => {
  const [selectedExpiry, setSelectedExpiry] = useState(derivatives.selectedExpiry);

  const {
    spotPrice,
    expiryDates,
    pcrOi,
    pcrVolume,
    maxPain,
    highestCeOiStrike,
    highestPeOiStrike,
    totalCeOi,
    totalPeOi,
    futures,
    indiaVix,
    strikes,
  } = derivatives;

  // Chart data for OI by strike
  const oiChartData = strikes.map((s) => ({
    strike: s.strike,
    CE_OI: Math.round(s.ceOi / 1000), // in Thousands
    PE_OI: Math.round(s.peOi / 1000),
    isAtm: s.isAtm,
  }));

  const getBuildupBadge = (b: BuildupType) => {
    switch (b) {
      case 'LONG_BUILDUP':
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400">Long Build</span>;
      case 'SHORT_BUILDUP':
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/20 text-rose-400">Short Build</span>;
      case 'SHORT_COVERING':
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-sky-500/20 text-sky-400">Short Cover</span>;
      case 'LONG_UNWINDING':
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400">Long Unwind</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Bar: Expiry Selector & VIX Card */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div>
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            Option Chain Analytics
          </h3>
          <p className="text-xs text-slate-400">Open Interest, PCR, Max Pain & OI Buildup matrix</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">Expiry:</span>
          <select
            value={selectedExpiry}
            onChange={(e) => setSelectedExpiry(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs font-bold rounded-xl px-3 py-1.5 text-emerald-400 focus:outline-none focus:border-emerald-500"
          >
            {expiryDates.map((exp) => (
              <option key={exp} value={exp}>
                {exp}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* METRIC CARDS (PCR, MAX PAIN, SUPPORT/RESISTANCE) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* PCR Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">
            Put-Call Ratio (PCR)
          </span>
          <div className="text-2xl font-black font-mono text-emerald-400">{pcrOi}</div>
          <p className="text-[10px] text-slate-400 mt-1">
            {pcrOi > 1.2 ? 'Bullish Sentiment (PE Heavy)' : pcrOi < 0.8 ? 'Bearish Sentiment (CE Heavy)' : 'Neutral Range (0.8 - 1.2)'}
          </p>
        </div>

        {/* Max Pain Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">
            Max Pain Strike
          </span>
          <div className="text-2xl font-black font-mono text-amber-400">₹{maxPain}</div>
          <p className="text-[10px] text-slate-400 mt-1">
            Expiry loss minimization zone
          </p>
        </div>

        {/* Resistance Strike (CE) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-[11px] font-semibold text-rose-400 uppercase block mb-1">
            Max Call OI Resistance
          </span>
          <div className="text-2xl font-black font-mono text-rose-400">₹{highestCeOiStrike}</div>
          <p className="text-[10px] text-slate-400 mt-1">
            Strongest call writer wall
          </p>
        </div>

        {/* Support Strike (PE) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-[11px] font-semibold text-emerald-400 uppercase block mb-1">
            Max Put OI Support
          </span>
          <div className="text-2xl font-black font-mono text-emerald-400">₹{highestPeOiStrike}</div>
          <p className="text-[10px] text-slate-400 mt-1">
            Strongest put writer floor
          </p>
        </div>

      </div>

      {/* OI BY STRIKE BAR CHART */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <PieChart className="w-4 h-4 text-sky-400" />
            Open Interest Distribution by Strike (Call vs Put)
          </h4>
          <span className="text-[11px] text-slate-400">In Thousands ('000 contracts)</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={oiChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <XAxis dataKey="strike" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis orientation="right" stroke="#64748b" tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  fontSize: '11px',
                  color: '#f8fafc',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="CE_OI" fill="#f43f5e" name="Call OI (Resistance)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="PE_OI" fill="#10b981" name="Put OI (Support)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* OPTION CHAIN TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Detailed Option Chain Matrix
          </h4>
          <span className="text-xs font-mono text-emerald-400 font-bold">
            SPOT: ₹{spotPrice}
          </span>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-2 text-center text-rose-400 bg-rose-950/20" colSpan={4}>
                  CALL OPTIONS (CE)
                </th>
                <th className="py-3 px-2 text-center text-amber-400 bg-slate-950">
                  STRIKE
                </th>
                <th className="py-3 px-2 text-center text-emerald-400 bg-emerald-950/20" colSpan={4}>
                  PUT OPTIONS (PE)
                </th>
              </tr>
              <tr className="border-b border-slate-800 text-[10px] text-slate-400">
                <th className="py-2 px-2 text-right">OI (Chg)</th>
                <th className="py-2 px-2 text-right">IV %</th>
                <th className="py-2 px-2 text-right">LTP</th>
                <th className="py-2 px-2 text-center">Buildup</th>
                <th className="py-2 px-2 text-center font-bold text-slate-200 bg-slate-900">Strike</th>
                <th className="py-2 px-2 text-center">Buildup</th>
                <th className="py-2 px-2 text-left">LTP</th>
                <th className="py-2 px-2 text-left">IV %</th>
                <th className="py-2 px-2 text-left">OI (Chg)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {strikes.map((row) => {
                const isAtm = row.isAtm;
                return (
                  <tr
                    key={row.strike}
                    className={`hover:bg-slate-800/50 transition ${
                      isAtm ? 'bg-amber-500/10 border-y-2 border-amber-500/40 font-bold' : ''
                    }`}
                  >
                    {/* CE Columns */}
                    <td className="py-2 px-2 text-right text-slate-300">
                      {row.ceOi.toLocaleString()}
                      <span className={`text-[10px] block ${row.ceOiChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        ({row.ceOiChange >= 0 ? '+' : ''}{row.ceOiChange})
                      </span>
                    </td>
                    <td className="py-2 px-2 text-right text-slate-400">{row.ceIv}%</td>
                    <td className="py-2 px-2 text-right text-slate-100 font-bold">₹{row.ceLtp}</td>
                    <td className="py-2 px-2 text-center">{getBuildupBadge(row.ceBuildup)}</td>

                    {/* Strike Center */}
                    <td className={`py-2 px-2 text-center font-extrabold text-sm ${isAtm ? 'text-amber-400 bg-amber-500/20' : 'text-slate-100 bg-slate-950'}`}>
                      {row.strike} {isAtm && <span className="text-[9px] block text-amber-300">ATM</span>}
                    </td>

                    {/* PE Columns */}
                    <td className="py-2 px-2 text-center">{getBuildupBadge(row.peBuildup)}</td>
                    <td className="py-2 px-2 text-left text-slate-100 font-bold">₹{row.peLtp}</td>
                    <td className="py-2 px-2 text-left text-slate-400">{row.peIv}%</td>
                    <td className="py-2 px-2 text-left text-slate-300">
                      {row.peOi.toLocaleString()}
                      <span className={`text-[10px] block ${row.peOiChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        ({row.peOiChange >= 0 ? '+' : ''}{row.peOiChange})
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
