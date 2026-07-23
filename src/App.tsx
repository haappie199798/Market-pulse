import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { MarketHome } from './components/MarketHome';
import { IndexDetail } from './components/IndexDetail';
import { NewsFeed } from './components/NewsFeed';
import { AlertsManager } from './components/AlertsManager';
import { Watchlist } from './components/Watchlist';
import { AiAssistant } from './components/AiAssistant';
import { LiveFeedStream } from './components/LiveFeedStream';
import { DisclaimerModal } from './components/DisclaimerModal';
import { UserProfileComponent } from './components/UserProfile';

import {
  MarketStatus,
  Quote,
  Candle,
  FullIndexSnapshot,
  NewsArticle,
  FiiDiiFlow,
  CalendarEvent,
  UserProfile
} from './types';

import {
  fetchMarketStatus,
  fetchIndexSnapshot,
  fetchCandles,
  fetchNews,
  fetchFiiDiiFlows,
  fetchCalendarEvents
} from './services/api';

import { LEGAL_DISCLAIMER_TEXT } from './constants/legal';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('NIFTY50');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const [marketStatus, setMarketStatus] = useState<MarketStatus | null>(null);
  const [snapshot, setSnapshot] = useState<FullIndexSnapshot | null>(null);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [flows, setFlows] = useState<FiiDiiFlow[]>([]);
  const [calendar, setCalendar] = useState<CalendarEvent[]>([]);

  const [heroQuotes, setHeroQuotes] = useState<Record<string, Quote>>({});
  const [secondaryQuotes, setSecondaryQuotes] = useState<Record<string, Quote>>({});

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: 'usr_849201',
    name: 'Guest User',
    email: 'guest@example.com',
    clientId: 'IN-NSE-984210',
    kycStatus: 'VERIFIED',
    accountType: 'PRO_TRADER',
    joinedDate: '12 Jan 2024',
    broker: 'PulseMarket Broking (NSE/BSE Direct)',
    segmentPermissions: ['NSE Equity', 'NSE Futures & Options', 'BSE Sensex F&O', 'Currency Derivatives'],
    funds: {
      availableCash: 450000,
      usedMargin: 125000,
      collateralValue: 280000,
      totalPortfolio: 1875400,
      payinToday: 50000,
    },
    apiKey: '',
    apiSecret: '',
    riskLimits: {
      maxDailyLoss: 50000,
      maxOrderValue: 250000,
      defaultStopLossPct: 1.5,
      requireOrderConfirmation: true,
    },
    loginHistory: [],
  });

  // Load Market Data
  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [statusRes, snapRes, candleRes, newsRes, flowRes, calRes] = await Promise.all([
        fetchMarketStatus(),
        fetchIndexSnapshot(selectedSymbol),
        fetchCandles(selectedSymbol, '5m'),
        fetchNews(),
        fetchFiiDiiFlows(),
        fetchCalendarEvents()
      ]);

      setMarketStatus(statusRes);
      setSnapshot(snapRes);
      setCandles(candleRes);
      setNews(newsRes);
      setFlows(flowRes);
      setCalendar(calRes);

      // Hero quotes
      const heroSymbols = ['NIFTY50', 'BANKNIFTY', 'FINNIFTY'];
      const heroSnaps = await Promise.all(heroSymbols.map(s => fetchIndexSnapshot(s)));
      const heroMap: Record<string, Quote> = {};
      heroSnaps.forEach(s => { heroMap[s.quote.symbol] = s.quote; });
      setHeroQuotes(heroMap);

      // Secondary quotes
      const secSymbols = ['SENSEX', 'MIDCPNIFTY', 'INDIAVIX'];
      const secSnaps = await Promise.all(secSymbols.map(s => fetchIndexSnapshot(s)));
      const secMap: Record<string, Quote> = {};
      secSnaps.forEach(s => { secMap[s.quote.symbol] = s.quote; });
      setSecondaryQuotes(secMap);

    } catch (err) {
      console.error('Failed to load market data:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [selectedSymbol]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} font-sans antialiased selection:bg-emerald-500 selection:text-slate-950 transition-colors duration-200`}>
      
      {/* App Header Bar */}
      <Header
        status={marketStatus}
        onRefresh={loadData}
        isRefreshing={isRefreshing}
        theme={theme}
        setTheme={setTheme}
        onOpenDisclaimer={() => setShowDisclaimer(true)}
        userName={userProfile.name}
        userEmail={userProfile.email}
        onNavigateProfile={() => setActiveTab('profile')}
        provenance={snapshot?.provenance ?? null}
      />

      {/* Tab Navigation */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedSymbol={snapshot?.quote.displayName || selectedSymbol}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 pt-6">
        {activeTab === 'home' && snapshot && (
          <MarketHome
            heroQuotes={heroQuotes}
            secondaryQuotes={secondaryQuotes}
            breadth={snapshot.breadth}
            contributors={snapshot.contributors}
            news={news}
            flows={flows}
            onSelectSymbol={(sym) => {
              setSelectedSymbol(sym);
              setActiveTab('index');
            }}
            onNavigateTab={(tab) => setActiveTab(tab as any)}
          />
        )}

        {activeTab === 'live' && (
          <LiveFeedStream />
        )}

        {activeTab === 'index' && snapshot && (
          <IndexDetail
            snapshot={snapshot}
            candles={candles}
            calendar={calendar}
            symbol={selectedSymbol}
            onSelectSymbol={setSelectedSymbol}
          />
        )}

        {activeTab === 'news' && (
          <NewsFeed news={news} />
        )}

        {activeTab === 'alerts' && (
          <AlertsManager />
        )}

        {activeTab === 'watchlist' && (
          <Watchlist />
        )}

        {activeTab === 'assistant' && (
          <AiAssistant symbol={selectedSymbol} />
        )}

        {activeTab === 'profile' && (
          <UserProfileComponent
            user={userProfile}
            onUpdateUser={setUserProfile}
            onLogout={() => {
              setActiveTab('home');
            }}
          />
        )}
      </main>

      {/* Persistent Legal Footnote */}
      <footer className="border-t border-slate-800/80 bg-slate-950 text-slate-500 text-[11px] py-6 px-4 text-center space-y-2 mt-12">
        <p className="max-w-4xl mx-auto leading-relaxed">
          {LEGAL_DISCLAIMER_TEXT}
        </p>
        <div className="flex items-center justify-center gap-4 text-[10px] text-slate-600 font-mono pt-2">
          <span>PulseMarket v1.0</span>
          <span>•</span>
          <span>5-Minute Market Refresh Cycle</span>
          <span>•</span>
          <button onClick={() => setShowDisclaimer(true)} className="underline hover:text-slate-400">
            Regulatory Compliance Notice
          </button>
        </div>
      </footer>

      {/* SEBI Compliance Disclaimer Modal */}
      <DisclaimerModal
        isOpen={showDisclaimer}
        onClose={() => setShowDisclaimer(false)}
      />

    </div>
  );
}
