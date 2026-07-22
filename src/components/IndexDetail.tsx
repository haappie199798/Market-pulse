import React, { useState } from 'react';
import {
  FullIndexSnapshot,
  Candle,
  CalendarEvent,
  NewsArticle
} from '../types';
import { CandleChart } from './CandleChart';
import { TechnicalsView } from './TechnicalsView';
import { OptionChainView } from './OptionChainView';
import { ConstituentsView } from './ConstituentsView';
import { FundamentalsView } from './FundamentalsView';
import { AiAssistant } from './AiAssistant';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
  Sparkles,
  PieChart,
  Calendar
} from 'lucide-react';

interface IndexDetailProps {
  snapshot: FullIndexSnapshot;
  candles: Candle[];
  calendar: CalendarEvent[];
  symbol: string;
  onSelectSymbol: (sym: string) => void;
}

export const IndexDetail: React.FC<IndexDetailProps> = ({
  snapshot,
  candles,
  calendar,
  symbol,
  onSelectSymbol,
}) => {
  const [subTab, setSubTab] = useState<'overview' | 'technicals' | 'options' | 'constituents' | 'fundamentals' | 'ai'>('overview');
  const [interval, setInterval] = useState<'5m' | '15m' | '1h' | '1d'>('5m');

  const { quote, technicals, derivatives, constituents, fundamentals, breadth, contributors } = snapshot;
  const isUp = quote.changeAbs >= 0;

  const indices = ['NIFTY50', 'BANKNIFTY', 'FINNIFTY', 'MIDCPNIFTY', 'SENSEX'];

  return (
    <div className="space-y-6 pb-12">
      
      {/* INDEX SELECTOR STRIP & QUOTE BANNER */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
        
        {/* Index Selector Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-slate-800 pb-3">
          {indices.map((ind) => (
            <button
              key={ind}
              onClick={() => onSelectSymbol(ind)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                symbol === ind
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-slate-950/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {ind}
            </button>
          ))}
        </div>

        {/* Index Live Quote Row */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{quote.exchange}</span>
              <span className="text-[10px] px-2 py-0.2 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                5m Cycle Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {quote.displayName}
            </h1>
          </div>

          <div className="text-right">
            <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-slate-100">
              ₹{quote.ltp.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className={`text-sm font-mono font-bold flex items-center justify-end gap-1 ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{isUp ? '+' : ''}{quote.changeAbs.toFixed(2)} ({isUp ? '+' : ''}{quote.changePct}%)</span>
            </div>
          </div>
        </div>

        {/* OHLC Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-2 border-t border-slate-800/80 font-mono">
          <div className="p-2 rounded-xl bg-slate-950/60 text-slate-300">
            <span className="text-slate-500 text-[10px] block">OPEN</span>
            <span className="font-bold">₹{quote.dayOpen.toLocaleString('en-IN')}</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-950/60 text-slate-300">
            <span className="text-slate-500 text-[10px] block">HIGH</span>
            <span className="font-bold text-emerald-400">₹{quote.dayHigh.toLocaleString('en-IN')}</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-950/60 text-slate-300">
            <span className="text-slate-500 text-[10px] block">LOW</span>
            <span className="font-bold text-rose-400">₹{quote.dayLow.toLocaleString('en-IN')}</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-950/60 text-slate-300">
            <span className="text-slate-500 text-[10px] block">PREV CLOSE</span>
            <span className="font-bold">₹{quote.prevClose.toLocaleString('en-IN')}</span>
          </div>
        </div>

      </div>

      {/* SUB-TABS NAVIGATION */}
      <div className="flex items-center space-x-1 sm:space-x-2 border-b border-slate-800 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: 'overview', label: 'Overview & Chart', icon: BarChart3 },
          { id: 'technicals', label: 'Technicals', icon: Activity },
          { id: 'options', label: 'Option Chain', icon: Layers },
          { id: 'constituents', label: 'Constituents', icon: PieChart },
          { id: 'fundamentals', label: 'Fundamentals', icon: Calendar },
          { id: 'ai', label: 'AI Assistant', icon: Sparkles, badge: 'AI' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="px-1.5 py-0.2 rounded text-[9px] bg-slate-950 text-emerald-400 font-extrabold">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* SUB-TAB CONTENTS */}
      {subTab === 'overview' && (
        <div className="space-y-6">
          <CandleChart
            candles={candles}
            interval={interval}
            onIntervalChange={setInterval}
            symbol={symbol}
          />
          <TechnicalsView
            technicals={technicals}
            selectedInterval={interval}
            onIntervalChange={setInterval}
          />
        </div>
      )}

      {subTab === 'technicals' && (
        <TechnicalsView
          technicals={technicals}
          selectedInterval={interval}
          onIntervalChange={setInterval}
        />
      )}

      {subTab === 'options' && (
        <OptionChainView derivatives={derivatives} symbol={symbol} />
      )}

      {subTab === 'constituents' && (
        <ConstituentsView contributors={contributors} symbol={symbol} />
      )}

      {subTab === 'fundamentals' && (
        <FundamentalsView
          fundamentals={fundamentals}
          calendar={calendar}
          symbol={symbol}
        />
      )}

      {subTab === 'ai' && (
        <AiAssistant symbol={symbol} />
      )}

    </div>
  );
};
