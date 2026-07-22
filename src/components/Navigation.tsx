import React from 'react';
import {
  TrendingUp,
  BarChart3,
  Newspaper,
  BellRing,
  Star,
  Sparkles,
  Radio,
  User
} from 'lucide-react';

export type TabType = 'home' | 'live' | 'index' | 'news' | 'alerts' | 'watchlist' | 'assistant' | 'profile';

interface NavigationProps {
  activeTab: TabType;
  setActiveTab: (t: TabType) => void;
  selectedSymbol: string;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  selectedSymbol
}) => {
  const tabs = [
    { id: 'home', label: 'Markets', icon: TrendingUp },
    { id: 'live', label: 'Live Feed 🔴', icon: Radio, badge: 'SSE' },
    { id: 'index', label: selectedSymbol || 'NIFTY 50', icon: BarChart3 },
    { id: 'news', label: 'News', icon: Newspaper },
    { id: 'alerts', label: 'Alerts', icon: BellRing },
    { id: 'watchlist', label: 'Watchlist', icon: Star },
    { id: 'assistant', label: 'AI Assistant', icon: Sparkles, badge: 'AI' },
    { id: 'profile', label: 'Account & Login', icon: User },
  ];


  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-slate-300 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto no-scrollbar">
        <div className="flex space-x-1 sm:space-x-2 py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 relative ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="px-1.5 py-0.2 text-[9px] font-bold tracking-wider rounded bg-gradient-to-r from-teal-500 to-emerald-400 text-slate-950">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
