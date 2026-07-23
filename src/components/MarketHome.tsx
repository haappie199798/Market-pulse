import React from 'react';
import { Quote, Breadth, Contributor, NewsArticle, FiiDiiFlow, TechnicalsPayload } from '../types';
import {
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Sparkles,
  BarChart2,
  Activity,
  Layers,
  Zap,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface MarketHomeProps {
  heroQuotes: Record<string, Quote>;
  secondaryQuotes: Record<string, Quote>;
  breadth: Breadth;
  contributors: Contributor[];
  news: NewsArticle[];
  flows: FiiDiiFlow[];
  onSelectSymbol: (symbol: string) => void;
  onNavigateTab: (tab: 'index' | 'news' | 'assistant') => void;
}

export const MarketHome: React.FC<MarketHomeProps> = ({
  heroQuotes,
  secondaryQuotes,
  breadth,
  contributors,
  news,
  flows,
  onSelectSymbol,
  onNavigateTab,
}) => {
  const topGainers = [...contributors].sort((a, b) => b.points - a.points).slice(0, 5);
  const topLosers = [...contributors].sort((a, b) => a.points - b.points).slice(0, 5);

  const heroSymbols = ['NIFTY50', 'BANKNIFTY', 'FINNIFTY'];
  const totalAdvancesDeclines = breadth.advances + breadth.declines + breadth.unchanged || 50;
  const advancesPct = Math.round((breadth.advances / totalAdvancesDeclines) * 100);

  return (
    <div className="space-y-6 pb-12">
      
      {/* LIVE FEED PROMO BANNER */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-indigo-950/80 border border-emerald-500/30 rounded-3xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-2">
              <span>Polled Quote Stream</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ~5s poll
              </span>
            </h3>
            <p className="text-[11px] text-slate-300">
              Price updates polled from the upstream quote source every ~5 seconds. Not an exchange tick feed, and no order-book depth is available.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab('live' as any)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition shadow-lg shadow-emerald-500/20 shrink-0"
        >
          <Zap className="w-4 h-4 fill-current" />
          <span>Open quote stream</span>
        </button>
      </div>

      {/* 3 HERO INDEX CARDS */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Benchmark Indices
            </h2>
          </div>
          <span className="text-xs text-slate-400">Refreshed every 5 min</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {heroSymbols.map((sym) => {
            const quote = heroQuotes[sym];
            if (!quote) return null;
            const isUp = quote.changeAbs >= 0;

            return (
              <div
                key={sym}
                onClick={() => {
                  onSelectSymbol(sym);
                  onNavigateTab('index');
                }}
                className="group relative bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl hover:shadow-emerald-500/5"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      {quote.exchange}
                    </span>
                    <h3 className="text-base font-extrabold text-white group-hover:text-emerald-400 transition-colors">
                      {quote.displayName}
                    </h3>
                  </div>

                  {/* Change Pill */}
                  <div
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                      isUp
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    <span>{isUp ? '▲' : '▼'} {quote.changePct > 0 ? '+' : ''}{quote.changePct}%</span>
                  </div>
                </div>

                {/* LTP Number in Tabular Font */}
                <div className="my-2">
                  <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-slate-100">
                    ₹{quote.ltp.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className={`text-xs font-mono font-medium ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {quote.changeAbs > 0 ? '+' : ''}{quote.changeAbs.toFixed(2)} pts
                  </div>
                </div>

                {/* High / Low Range Bar */}
                <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                  <div>
                    <span className="text-slate-500">Low: </span>
                    <span className="font-mono text-slate-300">₹{quote.dayLow.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="w-20 bg-slate-800 h-1.5 rounded-full overflow-hidden mx-2">
                    <div
                      className="bg-emerald-400 h-full rounded-full"
                      style={{
                        width: `${Math.min(100, Math.max(10, ((quote.ltp - quote.dayLow) / (quote.dayHigh - quote.dayLow || 1)) * 100))}%`
                      }}
                    />
                  </div>
                  <div>
                    <span className="text-slate-500">High: </span>
                    <span className="font-mono text-slate-300">₹{quote.dayHigh.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs font-semibold text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                  <span>View Technicals & Options</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECONDARY STRIP (SENSEX, MIDCAP, INDIA VIX) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {['SENSEX', 'MIDCPNIFTY', 'INDIAVIX'].map((sym) => {
          const q = secondaryQuotes[sym];
          if (!q) return null;
          const isUp = q.changeAbs >= 0;

          return (
            <div
              key={sym}
              onClick={() => {
                onSelectSymbol(sym);
                onNavigateTab('index');
              }}
              className="bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 rounded-xl p-3 cursor-pointer transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">{q.displayName}</span>
                <span className={`text-[11px] font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {q.changePct > 0 ? '+' : ''}{q.changePct}%
                </span>
              </div>
              <div className="text-lg font-bold font-mono text-slate-100 mt-1">
                {sym === 'INDIAVIX' ? q.ltp.toFixed(2) : `₹${q.ltp.toLocaleString('en-IN')}`}
              </div>
            </div>
          );
        })}
      </div>

      {/* MARKET BREADTH & POINT CONTRIBUTORS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Market Breadth & FII/DII Net Flows */}
        <div className="space-y-6 lg:col-span-1">
          
          {/* Breadth Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-emerald-400" />
                Market Breadth
              </h3>
              <span className="text-xs font-mono text-slate-400">NIFTY 50</span>
            </div>

            {/* Progress Bar */}
            <div className="h-3 bg-slate-800 rounded-full overflow-hidden flex mb-3">
              <div className="bg-emerald-500 h-full" style={{ width: `${advancesPct}%` }} />
              <div className="bg-rose-500 h-full" style={{ width: `${100 - advancesPct}%` }} />
            </div>

            <div className="grid grid-cols-3 text-center text-xs">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">
                <div className="text-lg font-bold font-mono">{breadth.advances}</div>
                <div>Advances</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/50 text-slate-400 font-semibold mx-1">
                <div className="text-lg font-bold font-mono">{breadth.unchanged}</div>
                <div>Unchanged</div>
              </div>
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-semibold">
                <div className="text-lg font-bold font-mono">{breadth.declines}</div>
                <div>Declines</div>
              </div>
            </div>
          </div>

          {/* FII / DII Institutional Flows */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                Institutional Flows (FII/DII)
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-semibold">
                Cash Market
              </span>
            </div>

            <div className="space-y-2.5">
              {flows.slice(0, 3).map((flow, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-slate-800/50 text-xs flex items-center justify-between">
                  <span className="font-semibold text-slate-300">{flow.date}</span>
                  <div className="flex items-center gap-3 font-mono">
                    <div>
                      <span className="text-[10px] text-slate-500 block">FII Net</span>
                      <span className={`font-bold ${flow.fiiCashNet >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {flow.fiiCashNet >= 0 ? '+' : ''}₹{flow.fiiCashNet} Cr
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">DII Net</span>
                      <span className={`font-bold ${flow.diiCashNet >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {flow.diiCashNet >= 0 ? '+' : ''}₹{flow.diiCashNet} Cr
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right 2 Cols: Point Contributors Widget */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Index Point Impact (NIFTY 50)
              </h3>
              <p className="text-xs text-slate-400">Which stocks are pulling NIFTY up or down today</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Top Positive Contributors */}
            <div>
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <ArrowUpRight className="w-4 h-4" /> Top Positive Contributors
              </div>
              <div className="space-y-1.5">
                {topGainers.map((item) => (
                  <div key={item.symbol} className="flex items-center justify-between p-2 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-xs">
                    <div>
                      <div className="font-bold text-slate-200">{item.symbol}</div>
                      <div className="text-[10px] text-slate-400">{item.sector}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold font-mono text-emerald-400">
                        +{item.points} pts
                      </div>
                      <div className="text-[10px] text-slate-400">
                        ₹{item.ltp} ({item.changePct > 0 ? '+' : ''}{item.changePct}%)
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Negative Contributors */}
            <div>
              <div className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <ArrowDownRight className="w-4 h-4" /> Top Dragging Stock
              </div>
              <div className="space-y-1.5">
                {topLosers.map((item) => (
                  <div key={item.symbol} className="flex items-center justify-between p-2 rounded-xl bg-rose-500/5 border border-rose-500/10 text-xs">
                    <div>
                      <div className="font-bold text-slate-200">{item.symbol}</div>
                      <div className="text-[10px] text-slate-400">{item.sector}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold font-mono text-rose-400">
                        {item.points} pts
                      </div>
                      <div className="text-[10px] text-slate-400">
                        ₹{item.ltp} ({item.changePct}%)
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* BREAKING NEWS & AI DIGEST BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800/80 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-400" />
            <h3 className="text-base font-extrabold text-white">
              Market Pulse & Headlines
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab('news')}
            className="text-xs font-semibold text-teal-400 hover:underline flex items-center gap-1"
          >
            <span>View All News</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {news.slice(0, 2).map((item) => (
            <div
              key={item.id}
              onClick={() => onNavigateTab('news')}
              className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 cursor-pointer transition"
            >
              <div className="flex items-center justify-between text-[11px] mb-1.5">
                <span className="font-bold text-indigo-400">{item.source}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400">
                  {item.sentiment}
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-100 line-clamp-2 mb-1">
                {item.title}
              </h4>
              <p className="text-[11px] text-slate-400 line-clamp-2">
                {item.snippet}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
