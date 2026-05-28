'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type WimHofStage = 'breathing' | 'retention' | 'recovery' | 'completed';

type Options = {
  rounds: number;
  breathsPerRound: number;
  breathCycleSec: number;
  recoveryHoldSec: number;
  onStageChange?: (stage: WimHofStage, round: number) => void;
  onBreath?: (n: number) => void;
};

type Result = {
  stage: WimHofStage;
  round: number;
  breathCount: number;
  breathInhale: boolean;
  retentionElapsed: number;
  recoveryRemaining: number;
  endRetention: () => void;
  finishEarly: () => void;
  reset: () => void;
};

const TICK_MS = 100;

export function useWimHof({
  rounds,
  breathsPerRound,
  breathCycleSec,
  recoveryHoldSec,
  onStageChange,
  onBreath,
}: Options): Result {
  const [stage, setStage] = useState<WimHofStage>('breathing');
  const [round, setRound] = useState(0);
  const [breathCount, setBreathCount] = useState(0);
  const [breathInhale, setBreathInhale] = useState(true);
  const [retentionElapsed, setRetentionElapsed] = useState(0);
  const [recoveryRemaining, setRecoveryRemaining] = useState(recoveryHoldSec);

  const startRef = useRef<number>(performance.now());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stageRef = useRef<WimHofStage>('breathing');
  const roundRef = useRef(0);
  const onStageRef = useRef(onStageChange);
  const onBreathRef = useRef(onBreath);

  useEffect(() => {
    onStageRef.current = onStageChange;
    onBreathRef.current = onBreath;
  });

  const clearLoop = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const transitionTo = useCallback(
    (next: WimHofStage) => {
      stageRef.current = next;
      setStage(next);
      startRef.current = performance.now();
      onStageRef.current?.(next, roundRef.current);
    },
    [],
  );

  const breathingTick = useCallback(() => {
    const elapsed = (performance.now() - startRef.current) / 1000;
    const breathIdx = Math.floor(elapsed / breathCycleSec);
    const inCycle = (elapsed % breathCycleSec) / breathCycleSec;
    setBreathInhale(inCycle < 0.5);
    if (breathIdx !== breathCount) {
      setBreathCount(breathIdx);
      onBreathRef.current?.(breathIdx);
    }
    if (breathIdx >= breathsPerRound) {
      transitionTo('retention');
    }
  }, [breathCount, breathCycleSec, breathsPerRound, transitionTo]);

  const retentionTick = useCallback(() => {
    setRetentionElapsed((performance.now() - startRef.current) / 1000);
  }, []);

  const recoveryTick = useCallback(() => {
    const elapsed = (performance.now() - startRef.current) / 1000;
    const remaining = Math.max(recoveryHoldSec - elapsed, 0);
    setRecoveryRemaining(remaining);
    if (remaining <= 0) {
      // round complete
      const nextRound = roundRef.current + 1;
      if (nextRound >= rounds) {
        clearLoop();
        stageRef.current = 'completed';
        setStage('completed');
        onStageRef.current?.('completed', roundRef.current);
        return;
      }
      roundRef.current = nextRound;
      setRound(nextRound);
      setBreathCount(0);
      setRetentionElapsed(0);
      setRecoveryRemaining(recoveryHoldSec);
      transitionTo('breathing');
    }
  }, [clearLoop, recoveryHoldSec, rounds, transitionTo]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const current = stageRef.current;
      if (current === 'breathing') breathingTick();
      else if (current === 'retention') retentionTick();
      else if (current === 'recovery') recoveryTick();
    }, TICK_MS);

    return () => clearLoop();
  }, [breathingTick, retentionTick, recoveryTick, clearLoop]);

  const endRetention = useCallback(() => {
    if (stageRef.current !== 'retention') return;
    setRecoveryRemaining(recoveryHoldSec);
    transitionTo('recovery');
  }, [recoveryHoldSec, transitionTo]);

  const finishEarly = useCallback(() => {
    clearLoop();
    stageRef.current = 'completed';
    setStage('completed');
    onStageRef.current?.('completed', roundRef.current);
  }, [clearLoop]);

  const reset = useCallback(() => {
    clearLoop();
    stageRef.current = 'breathing';
    roundRef.current = 0;
    setStage('breathing');
    setRound(0);
    setBreathCount(0);
    setBreathInhale(true);
    setRetentionElapsed(0);
    setRecoveryRemaining(recoveryHoldSec);
    startRef.current = performance.now();
  }, [clearLoop, recoveryHoldSec]);

  return {
    stage,
    round,
    breathCount,
    breathInhale,
    retentionElapsed,
    recoveryRemaining,
    endRetention,
    finishEarly,
    reset,
  };
}
