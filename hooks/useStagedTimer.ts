'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type Options = {
  durations: number[];
  active: boolean;
  onStageChange?: (index: number) => void;
  onComplete?: () => void;
};

type Result = {
  index: number;
  secondsInStage: number;
  stageDuration: number;
  totalProgress: number;
  goNext: () => void;
};

const TICK_MS = 200;

// Линейная последовательность этапов с авто-переходом.
// Используется PMR (напряжение/расслабление × группы) и Body Scan (области тела).
export function useStagedTimer({
  durations,
  active,
  onStageChange,
  onComplete,
}: Options): Result {
  const [index, setIndex] = useState(0);
  const [secondsInStage, setSecondsInStage] = useState(0);

  const indexRef = useRef(0);
  const stageStartRef = useRef<number | null>(null);
  const elapsedBeforePauseRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completedRef = useRef(false);
  const durationsRef = useRef(durations);
  const onStageRef = useRef(onStageChange);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    durationsRef.current = durations;
    onStageRef.current = onStageChange;
    onCompleteRef.current = onComplete;
  });

  const totalSec = useMemo(
    () => durations.reduce((a, b) => a + b, 0),
    [durations],
  );

  const advance = () => {
    const next = indexRef.current + 1;
    if (next >= durationsRef.current.length) {
      completedRef.current = true;
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      onCompleteRef.current?.();
      return;
    }
    indexRef.current = next;
    setIndex(next);
    onStageRef.current?.(next);
    elapsedBeforePauseRef.current = 0;
    stageStartRef.current = performance.now();
    setSecondsInStage(0);
  };

  useEffect(() => {
    if (!active || completedRef.current) {
      if (stageStartRef.current !== null) {
        const now = performance.now();
        elapsedBeforePauseRef.current += (now - stageStartRef.current) / 1000;
        stageStartRef.current = null;
      }
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    stageStartRef.current = performance.now();

    const tick = () => {
      if (stageStartRef.current === null) return;
      const now = performance.now();
      const inStage =
        elapsedBeforePauseRef.current + (now - stageStartRef.current) / 1000;
      const dur = durationsRef.current[indexRef.current] ?? 0;
      if (dur > 0 && inStage >= dur) {
        advance();
      } else {
        setSecondsInStage(inStage);
      }
    };

    tick();
    intervalRef.current = setInterval(tick, TICK_MS);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const stageDuration = durations[index] ?? 0;
  const elapsedTotal =
    durations.slice(0, index).reduce((a, b) => a + b, 0) + secondsInStage;
  const totalProgress = totalSec > 0 ? Math.min(elapsedTotal / totalSec, 1) : 0;

  return {
    index,
    secondsInStage,
    stageDuration,
    totalProgress,
    goNext: advance,
  };
}
