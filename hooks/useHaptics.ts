'use client';

import { useCallback } from 'react';
import type { BreathingPhase } from '@/lib/types';

export type HapticPattern =
  | 'tap'
  | 'pulse'
  | 'success'
  | 'transition'
  | 'tense'
  | 'release';

const PATTERNS: Record<HapticPattern, number | number[]> = {
  tap: 10,
  pulse: [40],
  success: [20, 60, 20],
  transition: [10, 30, 10],
  tense: [300],
  release: [60, 50, 60],
};

// Вибро-гид: различимые на ощупь сигнатуры фаз дыхания —
// практика с телефоном в кармане, без взгляда на экран.
// Мнемоника: длинная = движение воздуха (1 — вдох, 2 — выдох),
// короткая = пауза (2 — после вдоха, 1 — после выдоха).
const PHASE_PATTERNS: Record<BreathingPhase, number[]> = {
  inhale: [350],
  holdIn: [90, 80, 90],
  exhale: [250, 110, 250],
  holdOut: [90],
};

function vibrateRaw(pattern: number | number[]): void {
  if (typeof navigator === 'undefined') return;
  if (typeof navigator.vibrate !== 'function') return;
  try {
    navigator.vibrate(pattern);
  } catch {
    // ignore
  }
}

export function useHaptics(enabled: boolean): (pattern: HapticPattern) => void {
  return useCallback(
    (pattern: HapticPattern) => {
      if (!enabled) return;
      vibrateRaw(PATTERNS[pattern]);
    },
    [enabled],
  );
}

export function usePhaseHaptics(
  guideEnabled: boolean,
  fallbackEnabled: boolean,
): (phase: BreathingPhase) => void {
  return useCallback(
    (phase: BreathingPhase) => {
      if (guideEnabled) {
        vibrateRaw(PHASE_PATTERNS[phase]);
      } else if (fallbackEnabled) {
        vibrateRaw(PATTERNS.tap);
      }
    },
    [guideEnabled, fallbackEnabled],
  );
}
