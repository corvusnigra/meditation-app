'use client';

import { useMemo } from 'react';
import { breathingPhases } from '@/lib/practice';
import type { BreathingPhase } from '@/lib/types';
import { useActiveClock, usePhaseCycle, useSecondsInPhase } from './usePhaseCycle';

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

// Обёртка над usePhaseCycle с прежней сигнатурой — для экранов техник, пока
// они не переведены на общий движок. Первая фаза и повтор после паузы наружу
// не сообщаются, как и раньше.
export function useBreathingCycle({
  pattern,
  active,
  onPhaseChange,
}: UseBreathingCycleOptions): UseBreathingCycleResult {
  const clock = useActiveClock(active);
  const phases = useMemo(() => breathingPhases(pattern), [pattern]);

  const cycle = usePhaseCycle({
    phases,
    cycles: Infinity,
    clock,
    enabled: true,
    onPhase: (phase, _sec, info) => {
      if (info.first || info.resumed) return;
      onPhaseChange?.(phase, phases[info.index].sec);
    },
  });

  const secondsInPhase = useSecondsInPhase(clock, cycle.phaseStartSec);
  const phaseProgress =
    cycle.phaseSec > 0 ? Math.min(secondsInPhase / cycle.phaseSec, 1) : 0;

  return {
    phase: cycle.phase,
    secondsInPhase,
    cycleCount: cycle.cycleIndex,
    phaseProgress,
  };
}
