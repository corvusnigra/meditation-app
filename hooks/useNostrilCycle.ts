'use client';

import { useEffect, useRef, useState } from 'react';
import type { NostrilPhase } from '@/lib/types';

type Options = {
  inhaleSec: number;
  exhaleSec: number;
  cycles: number;
  active: boolean;
  onPhaseChange?: (phase: NostrilPhase) => void;
  onComplete?: () => void;
};

type Result = {
  phase: NostrilPhase;
  cycleIndex: number;
  secondsInPhase: number;
  phaseDuration: number;
};

// Один цикл: вдох левой → выдох правой → вдох правой → выдох левой.
const ORDER: NostrilPhase[] = [
  'inhale-left',
  'exhale-right',
  'inhale-right',
  'exhale-left',
];

const TICK_MS = 100;

export function useNostrilCycle({
  inhaleSec,
  exhaleSec,
  cycles,
  active,
  onPhaseChange,
  onComplete,
}: Options): Result {
  const [phase, setPhase] = useState<NostrilPhase>('inhale-left');
  const [cycleIndex, setCycleIndex] = useState(0);
  const [secondsInPhase, setSecondsInPhase] = useState(0);

  const phaseIdxRef = useRef(0);
  const cycleRef = useRef(0);
  const phaseStartRef = useRef<number | null>(null);
  const elapsedBeforePauseRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completedRef = useRef(false);
  const onPhaseRef = useRef(onPhaseChange);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onPhaseRef.current = onPhaseChange;
    onCompleteRef.current = onComplete;
  });

  const durationOf = (p: NostrilPhase): number =>
    p === 'inhale-left' || p === 'inhale-right' ? inhaleSec : exhaleSec;

  useEffect(() => {
    if (!active || completedRef.current) {
      if (phaseStartRef.current !== null) {
        const now = performance.now();
        elapsedBeforePauseRef.current += (now - phaseStartRef.current) / 1000;
        phaseStartRef.current = null;
      }
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    phaseStartRef.current = performance.now();

    const tick = () => {
      if (phaseStartRef.current === null) return;
      const now = performance.now();
      const inPhase =
        elapsedBeforePauseRef.current + (now - phaseStartRef.current) / 1000;
      const current = ORDER[phaseIdxRef.current] as NostrilPhase;
      const duration = durationOf(current);

      if (inPhase >= duration) {
        const overflow = inPhase - duration;
        phaseIdxRef.current = (phaseIdxRef.current + 1) % ORDER.length;
        if (phaseIdxRef.current === 0) {
          cycleRef.current += 1;
          setCycleIndex(cycleRef.current);
          if (cycleRef.current >= cycles) {
            completedRef.current = true;
            if (intervalRef.current !== null) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            onCompleteRef.current?.();
            return;
          }
        }
        const next = ORDER[phaseIdxRef.current] as NostrilPhase;
        setPhase(next);
        onPhaseRef.current?.(next);
        elapsedBeforePauseRef.current = overflow;
        phaseStartRef.current = performance.now();
        setSecondsInPhase(overflow);
      } else {
        setSecondsInPhase(inPhase);
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
  }, [active, inhaleSec, exhaleSec, cycles]);

  return {
    phase,
    cycleIndex,
    secondsInPhase,
    phaseDuration: durationOf(phase),
  };
}
