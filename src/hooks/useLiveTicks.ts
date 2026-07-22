import { useState, useEffect, useRef } from 'react';
import { LiveTick } from '../types';

export function useLiveTicks() {
  const [ticks, setTicks] = useState<LiveTick[]>([]);
  const [latestPrices, setLatestPrices] = useState<Record<string, {
    ltp: number;
    changeAbs: number;
    changePct: number;
    direction: 'UP' | 'DOWN' | 'SAME';
    flash: 'UP' | 'DOWN' | null;
    timestamp: string;
  }>>({
    NIFTY50: { ltp: 24812.35, changeAbs: 118.5, changePct: 0.48, direction: 'UP', flash: null, timestamp: new Date().toISOString() },
    BANKNIFTY: { ltp: 52410.80, changeAbs: 442.2, changePct: 0.85, direction: 'UP', flash: null, timestamp: new Date().toISOString() },
    FINNIFTY: { ltp: 23680.15, changeAbs: 95.4, changePct: 0.40, direction: 'UP', flash: null, timestamp: new Date().toISOString() },
    SENSEX: { ltp: 81342.10, changeAbs: -120.3, changePct: -0.15, direction: 'DOWN', flash: null, timestamp: new Date().toISOString() },
    RELIANCE: { ltp: 2942.10, changeAbs: -21.0, changePct: -0.71, direction: 'DOWN', flash: null, timestamp: new Date().toISOString() },
    HDFCBANK: { ltp: 1684.50, changeAbs: 23.6, changePct: 1.42, direction: 'UP', flash: null, timestamp: new Date().toISOString() },
  });

  const [isConnected, setIsConnected] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const flashTimers = useRef<Record<string, NodeJS.Timeout>>({});

  const latestPricesRef = useRef(latestPrices);
  useEffect(() => {
    latestPricesRef.current = latestPrices;
  }, [latestPrices]);

  const processTick = (tick: LiveTick) => {
    setTicks((prev) => [tick, ...prev.slice(0, 49)]);

    if (flashTimers.current[tick.symbol]) {
      clearTimeout(flashTimers.current[tick.symbol]);
    }

    const dir = tick.direction;
    setLatestPrices((prev) => ({
      ...prev,
      [tick.symbol]: {
        ltp: tick.ltp,
        changeAbs: tick.changeAbs,
        changePct: tick.changePct,
        direction: dir,
        flash: dir === 'UP' ? 'UP' : 'DOWN',
        timestamp: tick.timestamp,
      },
    }));

    flashTimers.current[tick.symbol] = setTimeout(() => {
      setLatestPrices((curr) => {
        if (!curr[tick.symbol]) return curr;
        return {
          ...curr,
          [tick.symbol]: {
            ...curr[tick.symbol],
            flash: null,
          },
        };
      });
    }, 600);
  };

  useEffect(() => {
    if (isPaused) {
      setIsConnected(false);
      return;
    }

    let es: EventSource | null = null;
    let fallbackInterval: NodeJS.Timeout | null = null;

    try {
      es = new EventSource('/api/stream/ticks');

      es.onopen = () => {
        setIsConnected(true);
      };

      es.onmessage = (event) => {
        try {
          const tick: LiveTick = JSON.parse(event.data);
          processTick(tick);
        } catch (err) {
          console.error('Error parsing tick event', err);
        }
      };

      es.onerror = () => {
        setIsConnected(false);
        if (es) es.close();

        // Fallback simulated local ticker if SSE connection drops
        if (!fallbackInterval) {
          fallbackInterval = setInterval(() => {
            const symbols = ['NIFTY50', 'BANKNIFTY', 'FINNIFTY', 'SENSEX', 'RELIANCE', 'HDFCBANK'];
            const sym = symbols[Math.floor(Math.random() * symbols.length)];
            const curLtp = latestPricesRef.current[sym]?.ltp || 1000;
            const delta = (Math.random() - 0.48) * (curLtp * 0.0005);
            const newLtp = Number((curLtp + delta).toFixed(2));
            const direction = delta > 0 ? 'UP' : 'DOWN';

            const simulatedTick: LiveTick = {
              id: `sim-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              symbol: sym,
              ltp: newLtp,
              changeAbs: Number((delta).toFixed(2)),
              changePct: Number(((delta / curLtp) * 100).toFixed(2)),
              quantity: Math.floor(Math.random() * 300) + 10,
              bidPrice: Number((newLtp - 0.2).toFixed(2)),
              askPrice: Number((newLtp + 0.2).toFixed(2)),
              direction,
              timestamp: new Date().toISOString()
            };
            processTick(simulatedTick);
          }, 1200);
        }
      };
    } catch {
      setIsConnected(false);
    }

    return () => {
      if (es) es.close();
      if (fallbackInterval) clearInterval(fallbackInterval);
    };
  }, [isPaused]);

  return {
    ticks,
    latestPrices,
    isConnected,
    isPaused,
    setIsPaused,
    clearTicks: () => setTicks([]),
  };
}
