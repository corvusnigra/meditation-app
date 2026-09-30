import {
  DECLINE_GRACE_DAYS,
  LEVEL_DURATIONS,
  LEVEL_STREAK_THRESHOLD,
  STREAK_BREAK_GRACE_DAYS,
  UPGRADE_COOLDOWN_DAYS,
} from './constants';
import type {
  CompletedSession,
  CustomDurations,
  LevelDurations,
  LevelProgress,
  ProgressionLevel,
  ProgressionState,
} from './types';
import { daysBetween, isoDayKey } from './utils';

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

// Сколько осталось до следующего уровня. Предлагается только соседний уровень:
// нужна серия, пауза после отказа и пауза после прошлого повышения.
export function levelProgress(
  streak: number,
  state: ProgressionState,
  now: Date = new Date(),
): LevelProgress {
  if (state.currentLevel >= 4) return { kind: 'max' };
  const next = (state.currentLevel + 1) as ProgressionLevel;
  const daysLeft = Math.max(
    LEVEL_STREAK_THRESHOLD[next] - streak,
    state.declinedAt
      ? DECLINE_GRACE_DAYS - daysBetween(state.declinedAt, now)
      : 0,
    state.lastUpgradeAt
      ? UPGRADE_COOLDOWN_DAYS - daysBetween(state.lastUpgradeAt, now)
      : 0,
  );
  if (daysLeft <= 0) return { kind: 'ready', next };
  return { kind: 'wait', next, daysLeft };
}

export function shouldOfferUpgrade(
  streak: number,
  state: ProgressionState,
  now: Date = new Date(),
): { nextLvl: ProgressionLevel } | null {
  const progress = levelProgress(streak, state, now);
  return progress.kind === 'ready' ? { nextLvl: progress.next } : null;
}

export function applyUpgradeAcceptance(
  state: ProgressionState,
  now: Date = new Date(),
): ProgressionState {
  if (state.currentLevel >= 4) return state;
  const next = (state.currentLevel + 1) as ProgressionLevel;
  const level3 = LEVEL_DURATIONS[3];
  return {
    ...state,
    currentLevel: next,
    declinedAt: null,
    lastUpgradeAt: now.toISOString(),
    // Уровень 4 стартует с длительностей уровня 3, дальше их меняют в настройках.
    customDurations:
      next === 4 && !state.customDurations
        ? {
            breathing: level3.breathing,
            grounding: level3.grounding,
            gratitude: level3.gratitude,
          }
        : state.customDurations,
  };
}

export function applyUpgradeDecline(
  state: ProgressionState,
  now: Date = new Date(),
): ProgressionState {
  return { ...state, declinedAt: now.toISOString() };
}

// Один откат на перерыв: rollbackAnchor помнит ритуал, после которого он уже был,
// и следующий откат возможен только после нового ритуала.
export function maybeRollback(
  state: ProgressionState,
  lastRitual: CompletedSession | null,
  now: Date = new Date(),
): ProgressionState {
  if (state.currentLevel <= 1) return state;
  if (!lastRitual) return state;
  if (state.rollbackAnchor === lastRitual.date) return state;
  const days = daysBetween(lastRitual.date, now);
  if (days <= STREAK_BREAK_GRACE_DAYS) return state;
  const newLevel = previousLevel(state.currentLevel);
  return {
    ...state,
    currentLevel: newLevel,
    declinedAt: null,
    rollbackAnchor: lastRitual.date,
    rollbackNotice: { from: state.currentLevel, to: newLevel },
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
