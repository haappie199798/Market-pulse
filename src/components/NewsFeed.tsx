import React, { useState } from 'react';
import { NewsArticle } from '../types';
import {
  Newspaper,
  Search,
  Sparkles,
  ExternalLink,
  Flame,
  CheckCircle2,
  X
} from 'lucide-react';

interface NewsFeedProps {
  news: NewsArticle[];
  onAskAiArticle?: (title: string, snippet: string) => void;
}

export const NewsFeed: React.FC<NewsFeedProps> = ({ news, onAskAiArticle }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSentiment, setSelectedSentiment] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  const categories = ['ALL', 'MARKETS', 'ECONOMY', 'RESULTS', 'POLICY', 'GLOBAL'];

  const filtered = news.filter((item) => {
    const matchCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchSent = selectedSentiment === 'ALL' || item.sentiment === selectedSentiment;
    const matchSearch =
      searchQuery === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.snippet.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSent && matchSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Search & Filter Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-extrabold text-white">
              Indian Financial & Market News
            </h2>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search news, tickers (e.g. RBI, HDFC)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 placeholder-slate-500"
            />
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-950/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ARTICLE FEED LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedArticle(item)}
            className="bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              {/* Source & Sentiment Badge */}
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-indigo-400">{item.source}</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    item.sentiment === 'POSITIVE'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : item.sentiment === 'NEGATIVE'
                      ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.sentiment}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-sm font-bold text-slate-100 line-clamp-2 mb-2 leading-snug">
                {item.title}
              </h3>

              {/* Snippet */}
              <p className="text-xs text-slate-400 line-clamp-3 mb-3">
                {item.snippet}
              </p>
            </div>

            {/* Tags & AI Breakdown Button */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <div className="flex flex-wrap gap-1">
                {item.tags.map((t) => (
                  <span key={t} className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                    #{t}
                  </span>
                ))}
              </div>

              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <span>AI Insight</span>
                <Sparkles className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ARTICLE AI MODAL DRAWER */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-400 font-bold text-xs">
                {selectedArticle.source}
              </span>
              <span className="text-xs text-slate-400">
                {new Date(selectedArticle.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <h3 className="text-base font-extrabold text-white">
              {selectedArticle.title}
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
              {selectedArticle.snippet}
            </p>

            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/30 via-slate-900 to-indigo-950/30 border border-emerald-500/30">
              <div className="flex items-center gap-2 mb-1 text-emerald-400 text-xs font-bold">
                <Sparkles className="w-4 h-4" /> Automated Sentiment Impact
              </div>
              <p className="text-xs text-slate-300">
                Sentiment tagged as <strong className="text-emerald-400">{selectedArticle.sentiment}</strong> with impact score of <strong className="text-slate-100">{(selectedArticle.impactScore * 100).toFixed(0)}%</strong>. This news item primarily affects <span className="font-mono text-emerald-300">{selectedArticle.tags.join(', ')}</span>.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <a
                href={selectedArticle.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs text-indigo-400 hover:underline font-semibold"
              >
                <span>Read Publisher Article</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => setSelectedArticle(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
