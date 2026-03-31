import { useCallback, useEffect, useRef } from 'react';

export function useSafePolling(callback: () => Promise<void>, delay: number) {
  const running = useRef(false);
  const enabled = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ✅ 최신 callback 유지
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const run = useCallback(async () => {
    if (running.current) return;

    try {
      running.current = true;
      await callbackRef.current(); // ✅ 항상 최신 값 사용
    } finally {
      running.current = false;
    }
  }, []);

  const start = useCallback(() => {
    if (enabled.current) return;

    enabled.current = true;

    intervalRef.current = setInterval(() => {
      if (!enabled.current) return;
      void run();
    }, delay);
  }, [delay, run]);

  const stop = useCallback(() => {
    enabled.current = false;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stop();
  }, [stop]);

  return { start, stop };
}
