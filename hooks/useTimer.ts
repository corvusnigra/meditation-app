'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type UseTimerOptions = {
  durationSec: number;
  autoStart?: boolean;
  onComplete?: () => void;
  onTick?: (elapsedSec: number) => void;
};

type UseTimerResult = {
  elapsed: number;
  remaining: number;
  progress: number;
  isRunning: boolean;
  isPaused: boolean;
  isComplete: boolean;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  finish: () => void;
};

const TICK_MS = 250;

export function useTimer({
  durationSec,
  autoStart = false,
  onComplete,
  onTick,
}: UseTimerOptions): UseTimerResult {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const startTimestampRef = useRef<number | null>(null);
  const elapsedBeforePauseRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCompleteRef = useRef(onComplete);
  const onTickRef = useRef(onTick);
  const durationRef = useRef(durationSec);
  const completedRef = useRef(false);

  useEffect(() => {
    onCompleteRef.current = onComplete;
    onTickRef.current = onTick;
    durationRef.current = durationSec;
  });

  const stopLoop = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const tickOnce = useCallback(() => {
    if (startTimestampRef.current === null) return;
    const now = performance.now();
    const fresh =
      elapsedBeforePauseRef.current + (now - startTimestampRef.current) / 1000;
    setElapsed(fresh);
    onTickRef.current?.(fresh);
    const dur = durationRef.current;
    if (dur > 0 && fresh >= dur && !completedRef.current) {
      completedRef.current = true;
      stopLoop();
      setIsRunning(false);
      setIsComplete(true);
      setElapsed(dur);
      onCompleteRef.current?.();
    }
  }, [stopLoop]);

  const startLoop = useCallback(() => {
    stopLoop();
    tickOnce();
    intervalRef.current = setInterval(tickOnce, TICK_MS);
  }, [stopLoop, tickOnce]);

  const start = useCallback(() => {
    completedRef.current = false;
    setIsComplete(false);
    setIsPaused(false);
    setElapsed(0);
    elapsedBeforePauseRef.current = 0;
    startTimestampRef.current = performance.now();
    setIsRunning(true);
    startLoop();
  }, [startLoop]);

  const pause = useCallback(() => {
    if (startTimestampRef.current === null) return;
    const now = performance.now();
    elapsedBeforePauseRef.current += (now - startTimestampRef.current) / 1000;
    startTimestampRef.current = null;
    stopLoop();
    setIsPaused(true);
    setIsRunning(false);
  }, [stopLoop]);

  const resume = useCallback(() => {
    if (isComplete || startTimestampRef.current !== null) return;
    startTimestampRef.current = performance.now();
    setIsPaused(false);
    setIsRunning(true);
    startLoop();
  }, [isComplete, startLoop]);

  const reset = useCallback(() => {
    stopLoop();
    completedRef.current = false;
    startTimestampRef.current = null;
    elapsedBeforePauseRef.current = 0;
    setElapsed(0);
    setIsRunning(false);
    setIsPaused(false);
    setIsComplete(false);
  }, [stopLoop]);

  const finish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    stopLoop();
    const dur = durationRef.current;
    startTimestampRef.current = null;
    elapsedBeforePauseRef.current = dur;
    setElapsed(dur);
    setIsRunning(false);
    setIsPaused(false);
    setIsComplete(true);
    onCompleteRef.current?.();
  }, [stopLoop]);

  useEffect(() => {
    if (autoStart) {
      start();
    }
    return () => {
      stopLoop();
      startTimestampRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const remaining = Math.max(durationSec - elapsed, 0);
  const progress = durationSec > 0 ? Math.min(elapsed / durationSec, 1) : 0;

  return {
    elapsed,
    remaining,
    progress,
    isRunning,
    isPaused,
    isComplete,
    start,
    pause,
    resume,
    reset,
    finish,
  };
}
