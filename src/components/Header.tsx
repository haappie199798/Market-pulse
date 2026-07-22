import React, { useState, useEffect } from 'react';
import { MarketStatus } from '../types';
import {
  TrendingUp,
  Clock,
  RefreshCw,
  Sun,
  Moon,
  ShieldAlert,
  Radio,
  Search,
  User
} from 'lucide-react';

interface HeaderProps {
  status: MarketStatus | null;
  onRefresh: () => void;
  isRefreshing: boolean;
  theme: 'dark' | 'light';
  setTheme: (t: 'dark' | 'light') => void;
  onOpenDisclaimer: () => void;
  onSearchSymbol?: (sym: string) => void;
  userName?: string;
  userEmail?: string;
  onNavigateProfile?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  onRefresh,
  isRefreshing,
  theme,
  setTheme,
  onOpenDisclaimer,
  userName = 'Santhosh Mitukula',
  userEmail = 'mitukulasanthosh97@gmail.com',
  onNavigateProfile,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(300);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (secondsLeft === 0) {
      setSecondsLeft(300);
      onRefresh();
    }
  }, [secondsLeft, onRefresh]);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const isMarketOpen = status?.status === 'OPEN';

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-800 text-slate-100 px-4 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        
        {/* Brand & Market Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-extrabold text-xl">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-tight text-lg text-white">
                  Pulse<span className="text-emerald-400">Market</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  IN
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                NIFTY 50 • BANK NIFTY • FIN NIFTY Analytics
              </p>
            </div>
          </div>

          <div className="h-6 w-[1px] bg-slate-800 mx-1 hidden md:block" />

          {/* Market Status Pill */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isMarketOpen ? 'bg-emerald-400' : 'bg-amber-400'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isMarketOpen ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            <span className="font-semibold tracking-wide text-slate-200">
              {status?.status === 'OPEN' ? 'MARKET OPEN' : status?.status === 'PRE_OPEN' ? 'PRE-OPEN' : 'MARKET CLOSED'}
            </span>
          </div>

          {/* Live Data Feed Source Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold text-emerald-400">
            <Radio className="w-3 h-3 animate-pulse text-emerald-400" />
            <span>LIVE API FEED</span>
          </div>
        </div>

        {/* 5-Min Cycle Countdown Ring & Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          
          {/* Cycle Countdown */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-800/60 border border-slate-700/50 text-xs text-slate-300">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] text-slate-400">Cycle:</span>
            <span className="font-mono font-bold text-emerald-400">
              {formatCountdown(secondsLeft)}
            </span>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => {
              setSecondsLeft(300);
              onRefresh();
            }}
            disabled={isRefreshing}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition active:scale-95 disabled:opacity-50"
            title="Refresh Market Cycle Data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          {/* Theme Switcher */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition active:scale-95"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

          {/* SEBI Compliance / Disclaimer */}
          <button
            onClick={onOpenDisclaimer}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 text-xs font-medium transition"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="hidden md:inline">SEBI Notice</span>
          </button>

          {/* User Logged In Profile Pill */}
          <button
            onClick={onNavigateProfile}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs text-slate-200 transition active:scale-95"
            title="View Account & Login Details"
          >
            <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-[10px]">
              {userName.charAt(0)}
            </div>
            <div className="hidden lg:flex flex-col text-left leading-tight">
              <span className="font-bold text-[11px] text-white">{userName}</span>
              <span className="text-[9px] text-emerald-400 font-mono">Logged In</span>
            </div>
            <User className="w-3.5 h-3.5 text-emerald-400 lg:hidden" />
          </button>
        </div>
      </div>
    </header>
  );
};
