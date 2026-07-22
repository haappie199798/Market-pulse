import React, { useState } from 'react';
import { askAiAssistant } from '../services/api';
import {
  Sparkles,
  Send,
  Bot,
  User,
  ShieldCheck,
  RefreshCw,
  HelpCircle
} from 'lucide-react';

interface AiAssistantProps {
  symbol: string;
}

export const AiAssistant: React.FC<AiAssistantProps> = ({ symbol }) => {
  const [messages, setMessages] = useState<
    { sender: 'user' | 'bot'; text: string; time: string }[]
  >([
    {
      sender: 'bot',
      text: `Namaste! I am **PulseMarket AI**, your smart assistant for Indian stock market analytics.\n\nI can help interpret technical indicators, option chain PCR/Max Pain, and market news for **${symbol}**.\n\n*What would you like to analyze today?*`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const samplePrompts = [
    `Give me a technical breakdown for ${symbol}`,
    `Explain the Option Chain PCR and Max Pain for ${symbol}`,
    `What are the key resistance and support levels today?`,
    `How do I read Central Pivot Range (CPR) width?`,
  ];

  const handleSend = async (queryText?: string) => {
    const q = queryText || input;
    if (!q.trim() || isLoading) return;

    const userMsg = {
      sender: 'user' as const,
      text: q,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await askAiAssistant(q, symbol);
      const botMsg = {
        sender: 'bot' as const,
        text: res.answer,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot' as const,
          text: 'Sorry, I am unable to connect to the analysis engine right now. Please try again.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 space-y-4 shadow-xl">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              PulseMarket AI Assistant
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400">
                Gemini 3.6 Flash
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Contextual analysis for {symbol}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span className="hidden sm:inline">SEBI Compliant</span>
        </div>
      </div>

      {/* CHAT MESSAGES CONTAINER */}
      <div className="h-80 overflow-y-auto no-scrollbar space-y-3 p-2 bg-slate-950/60 rounded-2xl border border-slate-800/60">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'bot' && (
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl text-xs whitespace-pre-line leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-emerald-500 text-slate-950 font-medium rounded-tr-none'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
              }`}
            >
              {m.text}
              <div
                className={`text-[9px] mt-1 text-right font-mono ${
                  m.sender === 'user' ? 'text-slate-900/70' : 'text-slate-500'
                }`}
              >
                {m.time}
              </div>
            </div>

            {m.sender === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-emerald-400 italic p-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Analyzing 5m technical candles & option chain...</span>
          </div>
        )}
      </div>

      {/* SAMPLE PROMPT CHIPS */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {samplePrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => handleSend(p)}
            className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-[11px] font-medium whitespace-nowrap transition border border-slate-700/50"
          >
            {p}
          </button>
        ))}
      </div>

      {/* INPUT FORM */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          placeholder={`Ask AI about ${symbol} indicators, option chain, or market terms...`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 placeholder-slate-500"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-1 transition"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>

    </div>
  );
};
