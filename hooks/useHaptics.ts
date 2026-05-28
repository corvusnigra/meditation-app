'use client';

import { useCallback } from 'react';

export type HapticPattern = 'tap' | 'pulse' | 'success' | 'transition';

const PATTERNS: Record<HapticPattern, number | number[]> = {
  tap: 10,
  pulse: [40],
  success: [20, 60, 20],
  transition: [10, 30, 10],
};

export function useHaptics(enabled: boolean): (pattern: HapticPattern) => void {
  return useCallback(
    (pattern: HapticPattern) => {
      if (!enabled) return;
      if (typeof navigator === 'undefined') return;
      if (typeof navigator.vibrate !== 'function') return;
      try {
        navigator.vibrate(PATTERNS[pattern]);
      } catch {
        // ignore
      }
    },
    [enabled],
  );
}
