'use client';

import { useEffect, useRef, useState } from 'react';
import { useClockTick, type PracticeClock } from '@/hooks/usePracticeClock';

type Props = {
  clock: PracticeClock;
  seconds?: number;
  // Срабатывает в начале каждой секунды отсчёта.
  onCount?: () => void;
  onDone: () => void;
};

// Отсчёт перед практикой: время устроиться и закрыть глаза. Касание начинает
// сразу. Если страницу открыли без касания (ярлык, ссылка), браузер не даст
// ни звука, ни вибрации — тогда отсчёт ждёт касания.
// Кнопка накрывает ближайшего предка с position: relative: касание в любом
// месте области практики пропускает отсчёт.
export function StartCountdown({ clock, seconds = 3, onCount, onDone }: Props) {
  const [value, setValue] = useState(seconds);
  const [needsGesture, setNeedsGesture] = useState(false);
  const needsGestureRef = useRef(false);
  const countedRef = useRef<number | null>(null);
  const doneRef = useRef(false);

  useEffect(() => {
    const activation = navigator.userActivation;
    const needs = activation ? !activation.hasBeenActive : false;
    needsGestureRef.current = needs;
    setNeedsGesture(needs);
  }, []);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone();
  };

  useClockTick(clock, () => {
    if (doneRef.current || needsGestureRef.current || clock.isPaused()) return;
    const remaining = seconds - clock.now() / 1000;
    if (remaining <= 0) {
      finish();
      return;
    }
    const next = Math.ceil(remaining);
    if (countedRef.current !== next) {
      countedRef.current = next;
      setValue(next);
      onCount?.();
    }
  });

  return (
    <>
      <div className="text-center">
        {needsGesture ? (
          <p className="text-xl font-medium text-text-primary">Коснитесь, чтобы начать</p>
        ) : (
          <>
            <p className="text-xl font-medium text-text-primary sm:text-2xl">
              Приготовьтесь
            </p>
            <p className="mt-1 text-4xl font-light tabular-nums text-accent-breathing">
              {value}
            </p>
          </>
        )}
      </div>
      <button
        type="button"
        aria-label="Начать сразу"
        onClick={finish}
        className="absolute inset-0 rounded-3xl"
      />
    </>
  );
}
