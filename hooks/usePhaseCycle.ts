'use client';

import { useEffect, useRef, useState } from 'react';
import { locatePhase, type PhaseDef } from '@/lib/practice';
import {
  useClockTick,
  usePracticeClock,
  type ClockEvent,
  type PracticeClock,
} from './usePracticeClock';

export type PhaseInfo = {
  // Первая фаза практики.
  first: boolean;
  // Повтор сигнала текущей фазы после паузы.
  resumed: boolean;
  cycle: number;
  index: number;
};

type Options<Id extends string> = {
  phases: PhaseDef<Id>[];
  cycles: number;
  clock: PracticeClock;
  enabled: boolean;
  // Срабатывает на каждой фазе, включая первую, и повторно после паузы.
  // sec — сколько фазе осталось.
  onPhase?: (phase: Id, sec: number, info: PhaseInfo) => void;
  onComplete?: () => void;
};

type State = {
  index: number;
  cycleIndex: number;
  phaseStartSec: number;
  completed: boolean;
};

type Result<Id extends string> = State & {
  phase: Id;
  phaseSec: number;
};

const RESUME_CUE_MIN_SEC = 0.5;

function firstPhaseIndex(phases: readonly PhaseDef[]): number {
  const index = phases.findIndex((p) => p.sec > 0);
  return index === -1 ? 0 : index;
}

// Цикл фаз поверх часов практики. Состояние меняется только на смене фазы —
// секунды внутри фазы компоненты читают из часов сами.
export function usePhaseCycle<Id extends string>({
  phases,
  cycles,
  clock,
  enabled,
  onPhase,
  onComplete,
}: Options<Id>): Result<Id> {
  const [state, setState] = useState<State>(() => ({
    index: firstPhaseIndex(phases),
    cycleIndex: 0,
    phaseStartSec: 0,
    completed: false,
  }));

  const latest = useRef({ phases, cycles, onPhase, onComplete });
  useEffect(() => {
    latest.current = { phases, cycles, onPhase, onComplete };
  });

  const emittedRef = useRef<{ cycle: number; index: number } | null>(null);
  const completedRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const evaluate = (event: ClockEvent) => {
      if (event === 'pause') return;
      if (event === 'restart') {
        emittedRef.current = null;
        completedRef.current = false;
      }
      if (completedRef.current || clock.isPaused()) return;

      const current = latest.current;
      const tSec = clock.now() / 1000;
      const loc = locatePhase(current.phases, current.cycles, tSec);

      if (loc.done) {
        completedRef.current = true;
        setState((prev) => ({ ...prev, cycleIndex: loc.cycle, completed: true }));
        current.onComplete?.();
        return;
      }

      const prev = emittedRef.current;
      const changed = !prev || prev.cycle !== loc.cycle || prev.index !== loc.index;
      if (!changed && event !== 'resume') return;

      const phase = current.phases[loc.index];
      const remainingSec = loc.phaseStartSec + phase.sec - tSec;
      // Фаза почти кончилась: повтор слился бы с сигналом следующей.
      if (!changed && remainingSec < RESUME_CUE_MIN_SEC) return;
      if (changed) {
        emittedRef.current = { cycle: loc.cycle, index: loc.index };
        setState({
          index: loc.index,
          cycleIndex: loc.cycle,
          phaseStartSec: loc.phaseStartSec,
          completed: false,
        });
      }
      current.onPhase?.(phase.id, Math.max(remainingSec, 0.05), {
        first: prev === null,
        resumed: !changed,
        cycle: loc.cycle,
        index: loc.index,
      });
    };

    evaluate('tick');
    return clock.subscribe(evaluate);
  }, [enabled, clock]);

  const phase = phases[state.index] ?? phases[0];
  return { ...state, phase: phase.id, phaseSec: phase.sec };
}

// Секунды с начала фазы как состояние — для экранов, которые ещё рисуют
// счёт сами и перерисовываются на каждом тике.
export function useSecondsInPhase(clock: PracticeClock, phaseStartSec: number): number {
  const [snap, setSnap] = useState({ start: phaseStartSec, value: 0 });
  useClockTick(clock, () => {
    setSnap({
      start: phaseStartSec,
      value: Math.max(clock.now() / 1000 - phaseStartSec, 0),
    });
  });
  // На тике смены фазы слушатель ещё считает от начала прошлой фазы:
  // такое значение не показываем, берём время из часов.
  return snap.start === phaseStartSec
    ? snap.value
    : Math.max(clock.now() / 1000 - phaseStartSec, 0);
}

// Часы, которыми управляет флаг active, — для тех же экранов.
export function useActiveClock(active: boolean): PracticeClock {
  const { clock } = usePracticeClock({ autoStart: false, skipIdle: false });
  useEffect(() => {
    if (active) clock.resume();
    else clock.pause('user');
  }, [active, clock]);
  return clock;
}
