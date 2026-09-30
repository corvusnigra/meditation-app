'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useSettings } from '@/context/SettingsContext';
import {
  ensureAudio,
  onBreathPhase,
  playPhaseCue,
  playSignal,
  stopCues,
  type SignalKind,
} from '@/lib/breathing-audio';
import type { BreathingPhase, UserSettings } from '@/lib/types';
import {
  stopVibration,
  vibratePattern,
  vibratePhase,
  type HapticPattern,
} from './useHaptics';

export type StageSignal = 'count' | 'step' | 'soft' | 'tense' | 'release';

type PhaseOptions = {
  // Повтор сигнала после паузы: фон уже на уровне фазы, его не трогаем.
  resumed?: boolean;
  // Быстрое дыхание: короткий тап на вдохе вместо паттерна фазы.
  light?: boolean;
};

export type PracticeSignals = {
  // Вызывать из обработчика касания: браузер включает звук только по жесту.
  unlock: () => Promise<void>;
  phase: (phase: BreathingPhase, durationSec: number, options?: PhaseOptions) => void;
  stage: (kind: StageSignal) => void;
  done: () => void;
  silence: () => void;
};

const STAGE_HAPTIC: Record<StageSignal, HapticPattern> = {
  count: 'count',
  step: 'transition',
  soft: 'soft',
  tense: 'tense',
  release: 'release',
};

const STAGE_TONE: Record<StageSignal, SignalKind> = {
  count: 'count',
  step: 'step',
  soft: 'soft',
  tense: 'step',
  release: 'soft',
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
      phase: (phase, durationSec, { resumed = false, light = false } = {}) => {
        const s = settingsRef.current;
        if (light) {
          if (hasHaptics(s) && phase === 'inhale') vibratePattern('tap');
        } else if (s.hapticGuideEnabled) vibratePhase(phase);
        else if (s.hapticsEnabled) vibratePattern('tap');
        if (s.ambientEnabled && !resumed) onBreathPhase(phase, durationSec);
        else if (hasTone(s)) playPhaseCue(phase, durationSec);
      },
      stage: (kind) => {
        const s = settingsRef.current;
        if (hasHaptics(s)) vibratePattern(STAGE_HAPTIC[kind]);
        if (hasTone(s)) playSignal(STAGE_TONE[kind]);
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

export const UNLOCK_WAIT_MS = 300;

// Будит звук перед сигналом, но не дольше UNLOCK_WAIT_MS: практика не зависит от аудио.
export function unlockBounded(signals: PracticeSignals): Promise<void> {
  const waited = new Promise<void>((resolve) => setTimeout(resolve, UNLOCK_WAIT_MS));
  return Promise.race([signals.unlock().catch(() => undefined), waited]);
}
