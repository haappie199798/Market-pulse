import React, { useState } from 'react';
import { useLiveTicks } from '../hooks/useLiveTicks';
import {
  Radio,
  Pause,
  Play,
  Trash2,
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

export const LiveFeedStream: React.FC = () => {
  const {
    ticks,
    latestPrices,
    isConnected,
    isPaused,
    setIsPaused,
    clearTicks
  } = useLiveTicks();

  const [selectedSymbolFilter, setSelectedSymbolFilter] = useState<string>('ALL');
  const [selectedDepthSymbol, setSelectedDepthSymbol] = useState<string>('NIFTY50');

  const symbols = ['NIFTY50', 'BANKNIFTY', 'FINNIFTY', 'SENSEX', 'RELIANCE', 'HDFCBANK'];

  const filteredTicks = ticks.filter(
    (t) => selectedSymbolFilter === 'ALL' || t.symbol === selectedSymbolFilter
  );

  // There is no order-book feed behind this app.
  const depthLtp = latestPrices[selectedDepthSymbol]?.ltp ?? null;

  return (
    <div className="space-y-6 pb-12">
      
      {/* TOP HEADER & STREAM STATUS BAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white">
                  Real-time SSE Tick Feed & Order Stream
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                  isPaused
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isPaused ? 'bg-amber-400' : 'bg-emerald-400 animate-ping'}`} />
                  {isPaused ? 'PAUSED' : isConnected ? 'LIVE SSE CONNECTED' : 'STREAM ACTIVE'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Low-latency ~1000ms tick engine broadcasting price changes & order sizes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                isPaused
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
              <span>{isPaused ? 'Resume Stream' : 'Pause Stream'}</span>
            </button>

            <button
              onClick={clearTicks}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              title="Clear Tick Log"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* LIVE TICKER CARDS GRID WITH FLASHING ANIMATIONS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {symbols.map((sym) => {
            const data = latestPrices[sym];
            if (!data) return null;

            const isUp = data.changeAbs >= 0;
            const flashClass =
              data.flash === 'UP'
                ? 'bg-emerald-500/30 border-emerald-500/80 scale-[1.02]'
                : data.flash === 'DOWN'
                ? 'bg-rose-500/30 border-rose-500/80 scale-[1.02]'
                : 'bg-slate-950/80 border-slate-800';

            return (
              <div
                key={sym}
                onClick={() => setSelectedDepthSymbol(sym)}
                className={`p-3 rounded-2xl border transition-all duration-300 cursor-pointer ${flashClass}`}
              >
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-extrabold text-slate-200">{sym}</span>
                  <span className={`text-[9px] font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isUp ? '▲' : '▼'}
                  </span>
                </div>
                <div className="text-sm font-black font-mono text-white tracking-tight">
                  ₹{data.ltp.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <div className={`text-[10px] font-mono font-bold mt-0.5 ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isUp ? '+' : ''}{data.changePct}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* TWO-COLUMN LAYOUT: LIVE ORDER DEPTH & TRADE TICK STREAM LOG */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMN 1: ORDER DEPTH STATUS */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-500" />
                Level-2 Order Depth
              </h3>
              <p className="text-[11px] text-slate-400">Bid/Ask order book status</p>
            </div>
            
            <select
              value={selectedDepthSymbol}
              onChange={(e) => setSelectedDepthSymbol(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs font-bold rounded-xl px-2.5 py-1 text-emerald-400 focus:outline-none"
            >
              {symbols.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="text-center py-2 bg-slate-950/80 rounded-2xl border border-slate-800">
            <span className="text-[10px] text-slate-500 block uppercase">LAST TRADED PRICE</span>
            <span className="text-xl font-black font-mono text-emerald-400">
              {depthLtp == null
                ? '—'
                : `₹${depthLtp.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
            </span>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-center text-slate-400 text-xs space-y-1">
            <p className="font-bold text-slate-300">Order Depth Not Available</p>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Level-2 bid/ask depth requires a paid tick websocket feed from a registered broker or exchange vendor. It is not available from public quote endpoints.
            </p>
          </div>
        </div>

        {/* COLUMN 2 & 3: REAL-TIME TICK STREAM LOG */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
          
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-400" />
                Live Trade Stream Matrix ({filteredTicks.length} Ticks)
              </h3>
              <p className="text-[11px] text-slate-400">Incoming updates pushed live via Server-Sent Events</p>
            </div>

            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {['ALL', ...symbols].map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSymbolFilter(s)}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition ${
                    selectedSymbolFilter === s
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* TICK LOG TABLE */}
          <div className="overflow-x-auto h-96 no-scrollbar rounded-2xl border border-slate-800/80 bg-slate-950/60">
            <table className="w-full text-xs text-left font-mono">
              <thead className="bg-slate-950 text-slate-400 sticky top-0 border-b border-slate-800 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Symbol</th>
                  <th className="py-2.5 px-3 text-right">LTP</th>
                  <th className="py-2.5 px-3 text-right">Change</th>
                  <th className="py-2.5 px-3 text-right">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {filteredTicks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-slate-500 text-xs">
                      Waiting for live tick broadcast...
                    </td>
                  </tr>
                ) : (
                  filteredTicks.map((t, idx) => {
                    const isUp = t.direction === 'UP';
                    const timeStr = new Date(t.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    });

                    return (
                      <tr
                        key={t.id ? `${t.id}-${idx}` : `tick-${t.timestamp}-${idx}`}
                        className={`hover:bg-slate-800/50 transition-colors ${
                          isUp ? 'bg-emerald-950/10' : 'bg-rose-950/10'
                        }`}
                      >
                        <td className="py-2 px-3 text-slate-400 text-[11px]">{timeStr}</td>
                        <td className="py-2 px-3 font-extrabold text-slate-200">{t.symbol}</td>
                        <td className={`py-2 px-3 text-right font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                          ₹{t.ltp.toFixed(2)}
                        </td>
                        <td className={`py-2 px-3 text-right font-bold text-[11px] ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isUp ? '▲ +' : '▼ '}{t.changePct}%
                        </td>
                        <td className="py-2 px-3 text-right text-slate-400 text-[10px] uppercase font-sans">
                          {t.source === 'POLL' ? (
                            <span className="text-emerald-400 font-semibold">quote poll</span>
                          ) : (
                            <span className="text-amber-400 font-semibold">simulated</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>

      </div>

    </div>
  );
};
