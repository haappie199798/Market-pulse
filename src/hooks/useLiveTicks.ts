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
  }>>({});

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
      };
    } catch {
      setIsConnected(false);
    }

    return () => {
      if (es) es.close();
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
