import {
  DECLINE_GRACE_DAYS,
  LEVEL_DURATIONS,
  LEVEL_STREAK_THRESHOLD,
  STREAK_BREAK_GRACE_DAYS,
} from './constants';
import type {
  CompletedSession,
  CustomDurations,
  LevelDurations,
  ProgressionLevel,
  ProgressionState,
} from './types';
import { daysBetween, isoDayKey } from './utils';

export function levelFromStreak(streak: number): ProgressionLevel {
  if (streak >= LEVEL_STREAK_THRESHOLD[4]) return 4;
  if (streak >= LEVEL_STREAK_THRESHOLD[3]) return 3;
  if (streak >= LEVEL_STREAK_THRESHOLD[2]) return 2;
  return 1;
}

export function nextLevel(level: ProgressionLevel): ProgressionLevel | null {
  if (level >= 4) return null;
  return (level + 1) as ProgressionLevel;
}

export function previousLevel(level: ProgressionLevel): ProgressionLevel {
  if (level <= 1) return 1;
  return (level - 1) as ProgressionLevel;
}

export function getDurations(
  level: ProgressionLevel,
  custom: CustomDurations | null,
): LevelDurations {
  if (level === 4 && custom) {
    return {
      breathing: custom.breathing,
      grounding: custom.grounding,
      gratitude: custom.gratitude,
      total: custom.breathing + custom.grounding + custom.gratitude,
    };
  }
  return LEVEL_DURATIONS[level];
}

export function shouldOfferUpgrade(
  streak: number,
  state: ProgressionState,
): { offer: boolean; nextLvl: ProgressionLevel } | null {
  const target = levelFromStreak(streak);
  if (target <= state.currentLevel) return null;
  if (state.offeredUpgrade) return null;
  if (state.declinedAt) {
    const since = daysBetween(state.declinedAt, new Date());
    if (since < DECLINE_GRACE_DAYS) return null;
  }
  return { offer: true, nextLvl: target };
}

export function applyUpgradeAcceptance(
  state: ProgressionState,
  toLevel: ProgressionLevel,
): ProgressionState {
  return {
    ...state,
    currentLevel: toLevel,
    offeredUpgrade: true,
    declinedAt: null,
  };
}

export function applyUpgradeDecline(state: ProgressionState): ProgressionState {
  return {
    ...state,
    offeredUpgrade: true,
    declinedAt: new Date().toISOString(),
  };
}

export function resetUpgradeOffer(state: ProgressionState): ProgressionState {
  return { ...state, offeredUpgrade: false, declinedAt: null };
}

export function maybeRollback(
  state: ProgressionState,
  lastSession: CompletedSession | null,
): ProgressionState {
  if (state.currentLevel <= 1) return state;
  if (!lastSession) return state;
  const days = daysBetween(lastSession.date, new Date());
  if (days <= STREAK_BREAK_GRACE_DAYS) return state;
  const newLevel = previousLevel(state.currentLevel);
  return {
    ...state,
    currentLevel: newLevel,
    offeredUpgrade: false,
    declinedAt: null,
  };
}

export function calculateStreak(sessions: CompletedSession[]): number {
  if (sessions.length === 0) return 0;
  const days = new Set<string>(sessions.map((s) => isoDayKey(s.date)));
  const today = new Date();
  const todayKey = isoDayKey(today);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayKey = isoDayKey(yesterday);

  let cursor = days.has(todayKey)
    ? today
    : days.has(yesterdayKey)
      ? yesterday
      : null;

  if (!cursor) return 0;

  let streak = 0;
  while (days.has(isoDayKey(cursor))) {
    streak += 1;
    cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() - 1);
  }
  return streak;
}

export function longestStreak(sessions: CompletedSession[]): number {
  if (sessions.length === 0) return 0;
  const days = Array.from(new Set(sessions.map((s) => isoDayKey(s.date)))).sort();
  let best = 1;
  let current = 1;
  for (let i = 1; i < days.length; i += 1) {
    const prev = new Date(days[i - 1] as string);
    const curr = new Date(days[i] as string);
    const diff = daysBetween(prev, curr);
    if (diff === 1) {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 1;
    }
  }
  return best;
}

export function totalDurationMs(sessions: CompletedSession[]): number {
  return sessions.reduce((acc, s) => acc + s.durationMs, 0);
}
