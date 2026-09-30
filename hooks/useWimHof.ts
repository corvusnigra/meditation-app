'use client';

import { useMemo, useRef, useState } from 'react';
import type { PhaseDef } from '@/lib/practice';
import type { WimHofTechniqueConfig } from '@/lib/types';
import { usePhaseCycle } from './usePhaseCycle';
import type { PracticeClock } from './usePracticeClock';
import type { PracticeSignals } from './usePracticeSignals';
import { unlockBounded } from './usePracticeSignals';

export type WimHofStage = 'breathing' | 'retention' | 'recovery';

type Options = {
  config: WimHofTechniqueConfig;
  clock: PracticeClock;
  signals: PracticeSignals;
  running: boolean;
  onComplete: () => void;
};

type Step = {
  stage: WimHofStage;
  round: number;
  // Начало этапа на часах практики.
  startSec: number;
  // Раунд засчитан, когда задержку на выдохе закончили вдохом.
  roundsDone: number;
};

type Result = Step & {
  // Номер текущего вдоха в раунде, с нуля.
  breath: number;
  inhaling: boolean;
  endRetention: () => void;
};

// Раунды Вим Хофа на общих часах практики: быстрое дыхание, задержка на выдохе
// (её заканчивает сам человек) и задержка на вдохе. Пауза и сворачивание
// останавливают все три этапа вместе с часами.
export function useWimHof({ config, clock, signals, running, onComplete }: Options): Result {
  const wakingRef = useRef(false);
  const [step, setStep] = useState<Step>({
    stage: 'breathing',
    round: 0,
    startSec: 0,
    roundsDone: 0,
  });

  const halfSec = config.breathCycleSec / 2;
  const breathPhases = useMemo<PhaseDef<'inhale' | 'exhale'>[]>(
    () => [
      { id: 'inhale', sec: halfSec },
      { id: 'exhale', sec: halfSec },
    ],
    [halfSec],
  );
  const holdPhases = useMemo<PhaseDef<'holdIn'>[]>(
    () => [{ id: 'holdIn', sec: config.recoveryHoldSec }],
    [config.recoveryHoldSec],
  );

  const go = (stage: WimHofStage, round: number, roundsDone: number) => {
    setStep({ stage, round, roundsDone, startSec: clock.now() / 1000 });
  };

  const breathing = usePhaseCycle({
    phases: breathPhases,
    cycles: config.breathsPerRound,
    clock,
    enabled: running && step.stage === 'breathing',
    startSec: step.startSec,
    onPhase: (phase, sec, info) => {
      signals.phase(phase, sec, { resumed: info.resumed, light: true });
    },
    onComplete: () => {
      signals.silence();
      signals.stage('step');
      go('retention', step.round, step.roundsDone);
    },
  });

  usePhaseCycle({
    phases: holdPhases,
    cycles: 1,
    clock,
    enabled: running && step.stage === 'recovery',
    startSec: step.startSec,
    onPhase: (phase, sec, info) => {
      signals.phase(phase, sec, { resumed: info.resumed });
    },
    onComplete: () => {
      const next = step.round + 1;
      if (next >= config.rounds) {
        onComplete();
        return;
      }
      signals.silence();
      signals.stage('step');
      go('breathing', next, step.roundsDone);
    },
  });

  const endRetention = () => {
    if (step.stage !== 'retention' || wakingRef.current) return;
    // Касание будит звук, если он уснул за долгую задержку.
    wakingRef.current = true;
    void unlockBounded(signals).then(() => {
      wakingRef.current = false;
      go('recovery', step.round, step.round + 1);
    });
  };

  return {
    ...step,
    breath: breathing.cycleIndex,
    inhaling: breathing.phase === 'inhale',
    endRetention,
  };
}
