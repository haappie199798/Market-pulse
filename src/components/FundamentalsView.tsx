import React from 'react';
import { IndexFundamentals, CalendarEvent } from '../types';
import {
  BarChart3,
  Calendar,
  Layers,
  Percent,
  CheckCircle2
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  Line,
  Bar,
  CartesianGrid
} from 'recharts';

interface FundamentalsViewProps {
  fundamentals: IndexFundamentals;
  calendar: CalendarEvent[];
  symbol: string;
}

export const FundamentalsView: React.FC<FundamentalsViewProps> = ({
  fundamentals,
  calendar,
  symbol,
}) => {
  const { pe, pb, divYield, pe5yPercentile, historicalPeBands } = fundamentals;

  return (
    <div className="space-y-6">
      
      {/* Valuation Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* P/E Ratio */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">
            Price-to-Earnings (P/E)
          </span>
          <div className="text-2xl font-black font-mono text-emerald-400">{pe}</div>
          <p className="text-[10px] text-slate-400 mt-1">
            Historical 5-yr avg: 21.8
          </p>
        </div>

        {/* P/B Ratio */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">
            Price-to-Book (P/B)
          </span>
          <div className="text-2xl font-black font-mono text-indigo-400">{pb}</div>
          <p className="text-[10px] text-slate-400 mt-1">
            Asset backing multiple
          </p>
        </div>

        {/* Dividend Yield */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">
            Dividend Yield
          </span>
          <div className="text-2xl font-black font-mono text-amber-400">{divYield}%</div>
          <p className="text-[10px] text-slate-400 mt-1">
            Annual cash yield
          </p>
        </div>

        {/* 5-Yr Percentile */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">
            5-Yr Valuation Percentile
          </span>
          <div className="text-2xl font-black font-mono text-sky-400">{pe5yPercentile}%</div>
          <p className="text-[10px] text-slate-400 mt-1">
            58% of historical days were cheaper
          </p>
        </div>

      </div>

      {/* P/E HISTORICAL BAND CHART */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            Historical P/E Trend vs 20 - 25 Fair Value Band
          </h4>
          <span className="text-xs text-slate-400">5-Year Historical</span>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={historicalPeBands} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis domain={[15, 30]} orientation="right" stroke="#64748b" tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  fontSize: '11px',
                  color: '#f8fafc',
                }}
              />
              <Bar dataKey="pe" fill="#10b981" name="Index P/E" radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey="pe20" stroke="#f59e0b" strokeDasharray="3 3" name="Fair Value Floor (20 P/E)" />
              <Line type="monotone" dataKey="pe25" stroke="#ef4444" strokeDasharray="3 3" name="Overvalued Ceiling (25 P/E)" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* MACRO & EXPIRY CALENDAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            Upcoming Financial & Macro Events
          </h4>
        </div>

        <div className="space-y-2.5">
          {calendar.map((item) => (
            <div key={item.id} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono font-bold text-emerald-400">{item.date}</span>
                  <span className="text-slate-500">• {item.time}</span>
                  <span className={`px-2 py-0.2 text-[9px] font-bold rounded ${item.impact === 'HIGH' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {item.impact} IMPACT
                  </span>
                </div>
                <h5 className="font-bold text-slate-100">{item.title}</h5>
                <p className="text-[11px] text-slate-400">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
