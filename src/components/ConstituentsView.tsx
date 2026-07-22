import React, { useState } from 'react';
import { Contributor } from '../types';
import {
  PieChart,
  ArrowUpDown,
  Zap,
  CheckCircle2
} from 'lucide-react';

interface ConstituentsViewProps {
  contributors: Contributor[];
  symbol: string;
}

export const ConstituentsView: React.FC<ConstituentsViewProps> = ({
  contributors,
  symbol,
}) => {
  const [sortField, setSortField] = useState<'points' | 'changePct' | 'weightPct'>('points');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedSector, setSelectedSector] = useState<string>('ALL');

  const sectors = ['ALL', ...Array.from(new Set(contributors.map((c) => c.sector)))];

  const filtered = contributors.filter(
    (c) => selectedSector === 'ALL' || c.sector === selectedSector
  );

  const sorted = [...filtered].sort((a, b) => {
    const mult = sortOrder === 'desc' ? -1 : 1;
    return (a[sortField] - b[sortField]) * mult;
  });

  const toggleSort = (field: 'points' | 'changePct' | 'weightPct') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Sector Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div>
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            Index Constituents & Point Contribution
          </h3>
          <p className="text-xs text-slate-400">Real-time weight-adjusted contribution to {symbol} movement</p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-xs text-slate-400 font-semibold">Sector:</span>
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs font-bold rounded-xl px-3 py-1.5 text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            {sectors.map((sec) => (
              <option key={sec} value={sec}>
                {sec}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* CONSTITUENT TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Company / Symbol</th>
                <th className="py-3 px-4">Sector</th>
                <th className="py-3 px-4 text-right">LTP</th>
                <th className="py-3 px-4 text-right cursor-pointer hover:text-white" onClick={() => toggleSort('changePct')}>
                  <div className="flex items-center justify-end gap-1">
                    Change % <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right cursor-pointer hover:text-white" onClick={() => toggleSort('weightPct')}>
                  <div className="flex items-center justify-end gap-1">
                    Weight % <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right cursor-pointer hover:text-white" onClick={() => toggleSort('points')}>
                  <div className="flex items-center justify-end gap-1">
                    Point Impact <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sorted.map((item) => {
                const isUp = item.points >= 0;
                return (
                  <tr key={item.symbol} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-100">{item.symbol}</div>
                      <div className="text-[10px] text-slate-400">{item.name}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-medium">{item.sector}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-200">
                      ₹{item.ltp.toLocaleString('en-IN')}
                    </td>
                    <td className={`py-3 px-4 text-right font-mono font-bold ${item.changePct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {item.changePct >= 0 ? '+' : ''}{item.changePct}%
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-300 font-semibold">
                      {item.weightPct}%
                    </td>
                    <td className={`py-3 px-4 text-right font-mono font-extrabold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isUp ? '+' : ''}{item.points} pts
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
