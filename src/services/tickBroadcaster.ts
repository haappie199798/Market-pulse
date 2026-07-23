import { Quote } from '../types';
import { fetchMultipleLiveQuotes } from './liveMarketFetcher';

export interface BroadcastTick {
  id: string;
  symbol: string;
  ltp: number;
  changeAbs: number;
  changePct: number;
  direction: 'UP' | 'DOWN' | 'SAME';
  timestamp: string;
  source: 'POLL';
}

export const TRACKED_SYMBOLS = [
  'NIFTY50',
  'BANKNIFTY',
  'FINNIFTY',
  'SENSEX',
  'RELIANCE',
  'HDFCBANK',
];

const POLL_INTERVAL_MS = 5_000;

type Subscriber = (tick: BroadcastTick) => void;

class TickBroadcaster {
  private subscribers = new Set<Subscriber>();
  private timer: NodeJS.Timeout | null = null;
  private lastSeen: Record<string, number> = {};
  private lastQuotes: Record<string, Quote> = {};
  private lastPollAt: number | null = null;
  private consecutiveFailures = 0;

  subscribe(fn: Subscriber): () => void {
    this.subscribers.add(fn);
    this.ensureRunning();
    return () => {
      this.subscribers.delete(fn);
      if (this.subscribers.size === 0) this.stop();
    };
  }

  getStatus() {
    return {
      subscribers: this.subscribers.size,
      lastPollAt: this.lastPollAt ? new Date(this.lastPollAt).toISOString() : null,
      stale:
        this.lastPollAt === null || Date.now() - this.lastPollAt > POLL_INTERVAL_MS * 4,
      consecutiveFailures: this.consecutiveFailures,
      trackedSymbols: TRACKED_SYMBOLS,
    };
  }

  getSnapshot(): Record<string, Quote> {
    return { ...this.lastQuotes };
  }

  private ensureRunning() {
    if (this.timer) return;
    void this.poll();
    this.timer = setInterval(() => void this.poll(), POLL_INTERVAL_MS);
  }

  private stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private async poll() {
    try {
      const quotes = await fetchMultipleLiveQuotes(TRACKED_SYMBOLS);

      if (Object.keys(quotes).length === 0) {
        this.consecutiveFailures += 1;
        return;
      }

      this.consecutiveFailures = 0;
      this.lastPollAt = Date.now();

      for (const [symbol, quote] of Object.entries(quotes)) {
        this.lastQuotes[symbol] = quote;

        const previous = this.lastSeen[symbol];
        if (previous !== undefined && previous === quote.ltp) continue;

        const direction: BroadcastTick['direction'] =
          previous === undefined
            ? 'SAME'
            : quote.ltp > previous
              ? 'UP'
              : quote.ltp < previous
                ? 'DOWN'
                : 'SAME';

        this.lastSeen[symbol] = quote.ltp;

        const tick: BroadcastTick = {
          id: `tick-${symbol}-${Date.now()}`,
          symbol,
          ltp: quote.ltp,
          changeAbs: quote.changeAbs,
          changePct: quote.changePct,
          direction,
          timestamp: quote.updatedAt || new Date().toISOString(),
          source: 'POLL',
        };

        for (const fn of this.subscribers) {
          try {
            fn(tick);
          } catch {
            /* ignore client error */
          }
        }
      }
    } catch {
      this.consecutiveFailures += 1;
    }
  }
}

export const tickBroadcaster = new TickBroadcaster();
