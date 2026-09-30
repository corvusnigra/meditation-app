'use client';

import { useCallback, useEffect } from 'react';
import { stopCues, suspendAudio } from '@/lib/breathing-audio';
import { useBackGuard } from './useBackGuard';
import {
  usePracticeClock,
  type PauseReason,
  type PracticeClock,
} from './usePracticeClock';
import { usePracticeSignals, type PracticeSignals, unlockBounded } from './usePracticeSignals';
import { useWakeLock } from './useWakeLock';


export type PracticeController = {
  clock: PracticeClock;
  signals: PracticeSignals;
  paused: boolean;
  reason: PauseReason | null;
  pause: (reason?: PauseReason) => void;
  resume: () => void;
  leave: (go: () => void) => void;
};

// Общее управление практикой: часы активного времени, пауза при сворачивании,
// системный «назад» и удержание экрана.
export function usePracticeController(): PracticeController {
  const { clock, paused, reason } = usePracticeClock();
  const signals = usePracticeSignals();

  const pause = useCallback(
    (why: PauseReason = 'user') => {
      clock.pause(why);
      signals.silence();
    },
    [clock, signals],
  );

  // Звук включается до часов, чтобы сигнал текущей фазы уже прозвучал. Ждать
  // его дольше UNLOCK_WAIT_MS нельзя: практика не должна зависеть от аудио.
  const resume = useCallback(() => {
    void unlockBounded(signals).then(() => {
      // Пока ждали, приложение могли свернуть: пауза остаётся.
      if (document.visibilityState !== 'hidden') clock.resume();
    });
  }, [clock, signals]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState !== 'hidden') return;
      clock.pause('hidden');
      suspendAudio();
      signals.silence();
    };
    onVisibilityChange();
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [clock, signals]);

  // Сигнал фазы идёт мимо фона и сам при уходе со страницы не стихнет.
  useEffect(() => stopCues, []);

  const { leave } = useBackGuard({
    enabled: true,
    onBack: () => {
      if (clock.isPaused()) resume();
      else pause('back');
    },
  });

  // После возврата из фона экран не удерживается, пока практика не продолжена.
  useWakeLock(!paused);

  return { clock, signals, paused, reason, pause, resume, leave };
}
