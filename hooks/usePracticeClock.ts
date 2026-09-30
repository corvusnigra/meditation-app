'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

export type PauseReason = 'user' | 'hidden' | 'back';
export type ClockEvent = 'tick' | 'pause' | 'resume' | 'restart';
type Listener = (event: ClockEvent) => void;

// Ручка часов стабильна между рендерами: её можно отдавать в эффекты и дочерние
// компоненты, которые сами читают время.
export type PracticeClock = {
  // Активное время в миллисекундах: паузы и простой вкладки в него не входят.
  now: () => number;
  isPaused: () => boolean;
  pause: (reason: PauseReason) => void;
  resume: () => void;
  restart: () => void;
  exclude: (ms: number) => void;
  subscribe: (listener: Listener) => () => void;
};

type Result = {
  clock: PracticeClock;
  paused: boolean;
  reason: PauseReason | null;
};

const TICK_MS = 100;
// Тики реже раза в секунду значат, что таймеры вкладки стояли: это время
// не считается практикой.
const GAP_MS = 1000;

export function usePracticeClock(): Result {
  const [pause, setPause] = useState<{ paused: boolean; reason: PauseReason | null }>({
    paused: false,
    reason: null,
  });

  const accumulatedRef = useRef(0);
  const startedAtRef = useRef<number | null>(null);
  const pausedRef = useRef(false);
  const lastTickRef = useRef(0);
  const listenersRef = useRef(new Set<Listener>());

  const clock = useMemo<PracticeClock>(() => {
    const emit = (event: ClockEvent) => {
      listenersRef.current.forEach((listener) => listener(event));
    };
    const now = () => {
      const running =
        startedAtRef.current === null ? 0 : performance.now() - startedAtRef.current;
      return Math.max(accumulatedRef.current + running, 0);
    };
    return {
      now,
      isPaused: () => pausedRef.current,
      // Метка паузы пишется в ref сразу, в самом обработчике: рендер свёрнутой
      // вкладки может не успеть.
      pause: (reason) => {
        if (pausedRef.current) return;
        if (startedAtRef.current !== null) {
          accumulatedRef.current += performance.now() - startedAtRef.current;
          startedAtRef.current = null;
        }
        pausedRef.current = true;
        setPause({ paused: true, reason });
        emit('pause');
      },
      resume: () => {
        if (!pausedRef.current) return;
        pausedRef.current = false;
        startedAtRef.current = performance.now();
        lastTickRef.current = startedAtRef.current;
        setPause({ paused: false, reason: null });
        emit('resume');
      },
      restart: () => {
        accumulatedRef.current = 0;
        startedAtRef.current = pausedRef.current ? null : performance.now();
        lastTickRef.current = performance.now();
        emit('restart');
      },
      exclude: (ms) => {
        accumulatedRef.current -= ms;
      },
      subscribe: (listener) => {
        listenersRef.current.add(listener);
        return () => {
          listenersRef.current.delete(listener);
        };
      },
    };
  }, []);

  useEffect(() => {
    if (!pausedRef.current && startedAtRef.current === null) {
      startedAtRef.current = performance.now();
    }
    lastTickRef.current = performance.now();
    const listeners = listenersRef.current;

    const interval = setInterval(() => {
      if (pausedRef.current) return;
      const wall = performance.now();
      const gap = wall - lastTickRef.current;
      lastTickRef.current = wall;
      if (gap > GAP_MS) clock.exclude(gap);
      listeners.forEach((listener) => listener('tick'));
    }, TICK_MS);

    return () => {
      clearInterval(interval);
      if (startedAtRef.current !== null) {
        accumulatedRef.current += performance.now() - startedAtRef.current;
        startedAtRef.current = null;
      }
    };
  }, [clock]);

  return { clock, paused: pause.paused, reason: pause.reason };
}

// Подписка на часы: listener вызывается сразу и на каждом событии часов.
// Сам компонент при этом не перерисовывается.
export function useClockTick(clock: PracticeClock, listener: Listener): void {
  const listenerRef = useRef(listener);

  useEffect(() => {
    listenerRef.current = listener;
  });

  useEffect(() => {
    listenerRef.current('tick');
    return clock.subscribe((event) => listenerRef.current(event));
  }, [clock]);
}
