'use client';

import { useMemo } from 'react';
import { calculateStreak, longestStreak, totalDurationMs } from '@/lib/progression';
import type { CompletedSession } from '@/lib/types';

export function useStreak(sessions: CompletedSession[]): {
  current: number;
  longest: number;
  totalSessions: number;
  totalMinutes: number;
} {
  return useMemo(
    () => ({
      current: calculateStreak(sessions),
      longest: longestStreak(sessions),
      totalSessions: sessions.length,
      totalMinutes: Math.round(totalDurationMs(sessions) / 60000),
    }),
    [sessions],
  );
}
