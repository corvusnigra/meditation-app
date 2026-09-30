'use client';

import type { PhaseDef } from '@/lib/practice';
import { useActiveClock, usePhaseCycle, useSecondsInPhase } from './usePhaseCycle';

export type SighPhase = 'inhale1' | 'inhale2' | 'exhale';

const PHASES: PhaseDef<SighPhase>[] = [
  { id: 'inhale1', sec: 1.5 },
  { id: 'inhale2', sec: 0.5 },
  { id: 'exhale', sec: 5 },
];

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

// Обёртка над usePhaseCycle с прежней сигнатурой — до перевода экрана вздоха
// на общий движок.
export function useSighCycle({
  cycles,
  active,
  onPhaseChange,
  onComplete,
}: Options): Result {
  const clock = useActiveClock(active);

  const cycle = usePhaseCycle({
    phases: PHASES,
    cycles,
    clock,
    enabled: true,
    onPhase: (phase, _sec, info) => {
      if (info.first || info.resumed) return;
      onPhaseChange?.(phase);
    },
    onComplete,
  });

  return {
    phase: cycle.phase,
    cycleIndex: cycle.cycleIndex,
    secondsInPhase: useSecondsInPhase(clock, cycle.phaseStartSec),
    phaseDuration: cycle.phaseSec,
  };
}
