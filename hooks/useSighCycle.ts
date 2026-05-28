'use client';

import { useEffect, useRef, useState } from 'react';

export type SighPhase = 'inhale1' | 'inhale2' | 'exhale';

const PHASE_DURATIONS: Record<SighPhase, number> = {
  inhale1: 1.5,
  inhale2: 0.5,
  exhale: 5,
};

const PHASE_ORDER: SighPhase[] = ['inhale1', 'inhale2', 'exhale'];

type Options = {
  cycles: number;
  active: boolean;
  onPhaseChange?: (phase: SighPhase) => void;
  onComplete?: () => void;
};

type Result = {
  phase: SighPhase;
  cycleIndex: number;
  secondsInPhase: number;
  phaseDuration: number;
};

const TICK_MS = 100;

export function useSighCycle({
  cycles,
  active,
  onPhaseChange,
  onComplete,
}: Options): Result {
  const [phase, setPhase] = useState<SighPhase>('inhale1');
  const [cycleIndex, setCycleIndex] = useState(0);
  const [secondsInPhase, setSecondsInPhase] = useState(0);

  const phaseIdxRef = useRef(0);
  const cycleRef = useRef(0);
  const phaseStartRef = useRef<number | null>(null);
  const elapsedBeforePauseRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completedRef = useRef(false);
  const onPhaseChangeRef = useRef(onPhaseChange);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onPhaseChangeRef.current = onPhaseChange;
    onCompleteRef.current = onComplete;
  });

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
      const currentPhase = PHASE_ORDER[phaseIdxRef.current] as SighPhase;
      const duration = PHASE_DURATIONS[currentPhase];

      if (inPhase >= duration) {
        const overflow = inPhase - duration;
        phaseIdxRef.current = (phaseIdxRef.current + 1) % PHASE_ORDER.length;
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
        const next = PHASE_ORDER[phaseIdxRef.current] as SighPhase;
        setPhase(next);
        onPhaseChangeRef.current?.(next);
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
  }, [active, cycles]);

  return {
    phase,
    cycleIndex,
    secondsInPhase,
    phaseDuration: PHASE_DURATIONS[phase],
  };
}
