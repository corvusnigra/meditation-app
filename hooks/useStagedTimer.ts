'use client';

import { useMemo } from 'react';
import type { PhaseDef } from '@/lib/practice';
import { useActiveClock, usePhaseCycle, useSecondsInPhase } from './usePhaseCycle';

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
};

// Линейная последовательность этапов с авто-переходом (PMR: напряжение и
// расслабление по группам). Обёртка над usePhaseCycle с прежней сигнатурой.
export function useStagedTimer({
  durations,
  active,
  onStageChange,
  onComplete,
}: Options): Result {
  const clock = useActiveClock(active);
  const phases = useMemo<PhaseDef[]>(
    () => durations.map((sec, i) => ({ id: String(i), sec })),
    [durations],
  );
  const totalSec = useMemo(() => durations.reduce((a, b) => a + b, 0), [durations]);

  const cycle = usePhaseCycle({
    phases,
    cycles: 1,
    clock,
    enabled: true,
    onPhase: (_phase, _sec, info) => {
      if (info.first || info.resumed) return;
      onStageChange?.(info.index);
    },
    onComplete,
  });

  const secondsInStage = useSecondsInPhase(clock, cycle.phaseStartSec);
  const elapsed = cycle.completed ? totalSec : cycle.phaseStartSec + secondsInStage;

  return {
    index: cycle.index,
    secondsInStage,
    stageDuration: cycle.phaseSec,
    totalProgress: totalSec > 0 ? Math.min(elapsed / totalSec, 1) : 0,
  };
}
