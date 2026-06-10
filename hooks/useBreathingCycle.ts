'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { BreathingPhase } from '@/lib/types';

type UseBreathingCycleOptions = {
  pattern: [number, number, number, number];
  active: boolean;
  onPhaseChange?: (phase: BreathingPhase, durationSec: number) => void;
};

type UseBreathingCycleResult = {
  phase: BreathingPhase;
  secondsInPhase: number;
  cycleCount: number;
  phaseProgress: number;
};

const PHASES: BreathingPhase[] = ['inhale', 'holdIn', 'exhale', 'holdOut'];
const TICK_MS = 100;

export function useBreathingCycle({
  pattern,
  active,
  onPhaseChange,
}: UseBreathingCycleOptions): UseBreathingCycleResult {
  const [phase, setPhase] = useState<BreathingPhase>('inhale');
  const [secondsInPhase, setSecondsInPhase] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);

  const phaseIndexRef = useRef(0);
  const phaseStartRef = useRef<number | null>(null);
  const elapsedBeforePauseRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onPhaseChangeRef = useRef(onPhaseChange);
  const patternRef = useRef(pattern);

  useEffect(() => {
    onPhaseChangeRef.current = onPhaseChange;
    patternRef.current = pattern;
  });

  const cycleLength = useMemo(() => pattern.reduce((a, b) => a + b, 0), [pattern]);

  useEffect(() => {
    if (!active) {
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
      const phaseDuration = patternRef.current[phaseIndexRef.current] ?? 4;

      if (inPhase >= phaseDuration) {
        const overflow = inPhase - phaseDuration;
        // Фазы нулевой длины (например, [4,0,8,0]) пропускаем целиком,
        // иначе они дают двойной haptic/cue и флэш подсказки.
        let nextIdx = phaseIndexRef.current;
        let wrapped = false;
        for (let step = 0; step < PHASES.length; step += 1) {
          nextIdx = (nextIdx + 1) % PHASES.length;
          if (nextIdx === 0) wrapped = true;
          if ((patternRef.current[nextIdx] ?? 0) > 0) break;
        }
        phaseIndexRef.current = nextIdx;
        const nextPhase = PHASES[nextIdx] as BreathingPhase;
        const nextDuration = patternRef.current[nextIdx] ?? 4;
        if (wrapped) {
          setCycleCount((c) => c + 1);
        }
        setPhase(nextPhase);
        onPhaseChangeRef.current?.(nextPhase, nextDuration);
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
  }, [active, cycleLength]);

  const phaseDuration = patternRef.current[phaseIndexRef.current] ?? 4;
  const phaseProgress =
    phaseDuration > 0 ? Math.min(secondsInPhase / phaseDuration, 1) : 0;

  return { phase, secondsInPhase, cycleCount, phaseProgress };
}
