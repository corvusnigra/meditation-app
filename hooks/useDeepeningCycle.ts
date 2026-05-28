'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { BreathingPhase, DeepeningStage } from '@/lib/types';

type Options = {
  stages: DeepeningStage[];
  active: boolean;
  onPhaseChange?: (phase: BreathingPhase, durationSec: number) => void;
  onStageChange?: (stageIndex: number, stage: DeepeningStage) => void;
  onComplete?: () => void;
};

type Result = {
  phase: BreathingPhase;
  stageIndex: number;
  stage: DeepeningStage;
  cycleInStage: number;
  secondsInPhase: number;
  phaseDuration: number;
  totalCycles: number;
  cyclesDone: number;
};

const PHASES: BreathingPhase[] = ['inhale', 'holdIn', 'exhale', 'holdOut'];
const TICK_MS = 100;

export function useDeepeningCycle({
  stages,
  active,
  onPhaseChange,
  onStageChange,
  onComplete,
}: Options): Result {
  const safeStages = stages.length > 0 ? stages : [];
  const [stageIndex, setStageIndex] = useState(0);
  const [cycleInStage, setCycleInStage] = useState(0);
  const [phase, setPhase] = useState<BreathingPhase>('inhale');
  const [secondsInPhase, setSecondsInPhase] = useState(0);

  const stageIdxRef = useRef(0);
  const cycleInStageRef = useRef(0);
  const phaseIdxRef = useRef(0);
  const phaseStartRef = useRef<number | null>(null);
  const elapsedBeforePauseRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completedRef = useRef(false);

  const onPhaseRef = useRef(onPhaseChange);
  const onStageRef = useRef(onStageChange);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onPhaseRef.current = onPhaseChange;
    onStageRef.current = onStageChange;
    onCompleteRef.current = onComplete;
  });

  const totalCycles = useMemo(
    () => safeStages.reduce((acc, s) => acc + s.cycles, 0),
    [safeStages],
  );

  useEffect(() => {
    if (!active || completedRef.current || safeStages.length === 0) {
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
      const stage = safeStages[stageIdxRef.current];
      if (!stage) return;
      const pattern = stage.pattern;
      const now = performance.now();
      const inPhase =
        elapsedBeforePauseRef.current + (now - phaseStartRef.current) / 1000;
      const phaseDuration = pattern[phaseIdxRef.current] ?? 4;

      if (inPhase >= phaseDuration) {
        const overflow = inPhase - phaseDuration;
        phaseIdxRef.current = (phaseIdxRef.current + 1) % PHASES.length;

        // Закончили полный цикл — увеличиваем счётчик в стадии.
        if (phaseIdxRef.current === 0) {
          cycleInStageRef.current += 1;

          // Стадия пройдена — двигаемся дальше или завершаем.
          if (cycleInStageRef.current >= stage.cycles) {
            const nextStageIdx = stageIdxRef.current + 1;
            if (nextStageIdx >= safeStages.length) {
              completedRef.current = true;
              if (intervalRef.current !== null) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
              }
              onCompleteRef.current?.();
              return;
            }
            stageIdxRef.current = nextStageIdx;
            cycleInStageRef.current = 0;
            setStageIndex(nextStageIdx);
            const nextStage = safeStages[nextStageIdx];
            if (nextStage) onStageRef.current?.(nextStageIdx, nextStage);
          }
          setCycleInStage(cycleInStageRef.current);
        }

        const nextPhase = PHASES[phaseIdxRef.current] as BreathingPhase;
        const nextPattern = safeStages[stageIdxRef.current]?.pattern ?? pattern;
        const nextDuration = nextPattern[phaseIdxRef.current] ?? 4;
        setPhase(nextPhase);
        onPhaseRef.current?.(nextPhase, nextDuration);
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
  }, [active, safeStages]);

  const stage = safeStages[stageIndex] ?? safeStages[0];
  const phaseDuration =
    stage?.pattern[
      phase === 'inhale' ? 0 : phase === 'holdIn' ? 1 : phase === 'exhale' ? 2 : 3
    ] ?? 4;

  const cyclesDone = useMemo(() => {
    let done = 0;
    for (let i = 0; i < stageIndex; i += 1) {
      done += safeStages[i]?.cycles ?? 0;
    }
    return done + cycleInStage;
  }, [stageIndex, cycleInStage, safeStages]);

  return {
    phase,
    stageIndex,
    stage: stage as DeepeningStage,
    cycleInStage,
    secondsInPhase,
    phaseDuration,
    totalCycles,
    cyclesDone,
  };
}
