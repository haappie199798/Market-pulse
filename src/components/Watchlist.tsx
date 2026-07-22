import React, { useState } from 'react';
import { WatchlistItem } from '../types';
import {
  Star,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Search
} from 'lucide-react';

export const Watchlist: React.FC = () => {
  const [items, setItems] = useState<WatchlistItem[]>([
    { symbol: 'NIFTY50', name: 'NIFTY 50 Benchmark', ltp: 24812.35, changePct: 0.48, type: 'INDEX' },
    { symbol: 'BANKNIFTY', name: 'NIFTY Bank Index', ltp: 52410.80, changePct: 0.85, type: 'INDEX' },
    { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', ltp: 1684.50, changePct: 1.42, type: 'STOCK' },
    { symbol: 'RELIANCE', name: 'Reliance Industries', ltp: 2942.10, changePct: -0.71, type: 'STOCK' },
    { symbol: 'INFY', name: 'Infosys Limited', ltp: 1820.40, changePct: 1.28, type: 'STOCK' },
  ]);

  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newSymbol, setNewSymbol] = useState('');
  const [newName, setNewName] = useState('');

  const handleAdd = () => {
    if (!newSymbol) return;
    setItems([
      ...items,
      {
        symbol: newSymbol.toUpperCase(),
        name: newName || newSymbol.toUpperCase(),
        ltp: 1500,
        changePct: 0.5,
        type: 'STOCK',
      },
    ]);
    setNewSymbol('');
    setNewName('');
    setShowAdd(false);
  };

  const handleDelete = (sym: string) => {
    setItems(items.filter((i) => i.symbol !== sym));
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div>
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            Custom Watchlist
          </h2>
          <p className="text-xs text-slate-400">Track favorite indices and constituents</p>
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Ticker</span>
        </button>
      </div>

      {/* WATCHLIST TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Symbol / Name</th>
                <th className="py-3 px-4 text-center">Type</th>
                <th className="py-3 px-4 text-right">LTP</th>
                <th className="py-3 px-4 text-right">Day Change</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {items.map((item) => {
                const isUp = item.changePct >= 0;
                return (
                  <tr key={item.symbol} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-100">{item.symbol}</div>
                      <div className="text-[10px] text-slate-400">{item.name}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                        {item.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-100">
                      ₹{item.ltp.toLocaleString('en-IN')}
                    </td>
                    <td className={`py-3 px-4 text-right font-mono font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isUp ? '▲ +' : '▼ '}{item.changePct}%
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(item.symbol)}
                        className="text-slate-500 hover:text-rose-400 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD DIALOG */}
      {showAdd && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-extrabold text-white">
              Add Stock to Watchlist
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Ticker Symbol</label>
                <input
                  type="text"
                  placeholder="e.g. TCS, TATAMOTORS"
                  value={newSymbol}
                  onChange={(e) => setNewSymbol(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Company Name</label>
                <input
                  type="text"
                  placeholder="e.g. Tata Consultancy Services"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowAdd(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
