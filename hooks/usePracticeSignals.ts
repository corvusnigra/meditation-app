'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useSettings } from '@/context/SettingsContext';
import {
  ensureAudio,
  onBreathPhase,
  playPhaseCue,
  playSignal,
  stopCues,
} from '@/lib/breathing-audio';
import type { BreathingPhase, UserSettings } from '@/lib/types';
import {
  stopVibration,
  vibratePattern,
  vibratePhase,
  type HapticPattern,
} from './useHaptics';

export type StageSignal = 'count' | 'step' | 'soft';

export type PracticeSignals = {
  // Вызывать из обработчика касания: браузер включает звук только по жесту.
  unlock: () => Promise<void>;
  // resumed — повтор сигнала после паузы: фон уже на уровне фазы, его не трогаем.
  phase: (phase: BreathingPhase, durationSec: number, resumed?: boolean) => void;
  stage: (kind: StageSignal) => void;
  done: () => void;
  silence: () => void;
};

const STAGE_HAPTIC: Record<StageSignal, HapticPattern> = {
  count: 'count',
  step: 'transition',
  soft: 'soft',
};

const hasTone = (s: UserSettings): boolean => s.ambientEnabled || s.phaseSoundEnabled;
const hasHaptics = (s: UserSettings): boolean =>
  s.hapticGuideEnabled || s.hapticsEnabled;

// Сигналы практики для глаз, закрытых или отведённых от экрана: вибрация и тон.
// Объект стабилен между рендерами и всегда читает свежие настройки.
export function usePracticeSignals(): PracticeSignals {
  const { settings } = useSettings();
  const settingsRef = useRef(settings);

  useEffect(() => {
    settingsRef.current = settings;
  });

  return useMemo<PracticeSignals>(
    () => ({
      unlock: async () => {
        const s = settingsRef.current;
        if (!hasTone(s) && !s.entrainmentEnabled) return;
        try {
          await ensureAudio(s.ambientPreset, s.ambientVolume);
        } catch {
          // звук недоступен — практика идёт без него
        }
      },
      phase: (phase, durationSec, resumed = false) => {
        const s = settingsRef.current;
        if (s.hapticGuideEnabled) vibratePhase(phase);
        else if (s.hapticsEnabled) vibratePattern('tap');
        if (s.ambientEnabled && !resumed) onBreathPhase(phase, durationSec);
        else if (hasTone(s)) playPhaseCue(phase, durationSec);
      },
      stage: (kind) => {
        const s = settingsRef.current;
        if (hasHaptics(s)) vibratePattern(STAGE_HAPTIC[kind]);
        if (hasTone(s)) playSignal(kind);
      },
      done: () => {
        const s = settingsRef.current;
        if (hasHaptics(s)) vibratePattern('success');
        if (hasTone(s)) playSignal('done');
      },
      silence: () => {
        stopVibration();
        stopCues();
      },
    }),
    [],
  );
}
