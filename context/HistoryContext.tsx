'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { sessionsStorage } from '@/lib/storage';
import type { CompletedSession } from '@/lib/types';
import {
  calculateStreak,
  longestStreak,
  totalDurationMs,
} from '@/lib/progression';
import { isoDayKey } from '@/lib/utils';
import { useDayKey } from '@/hooks/useDayKey';

type HistoryContextValue = {
  sessions: CompletedSession[];
  streak: number;
  longest: number;
  totalMinutes: number;
  todayKey: string;
  doneToday: boolean;
  lastRitual: CompletedSession | null;
  add: (session: CompletedSession) => void;
  clear: () => void;
  hydrated: boolean;
};

const HistoryContext = createContext<HistoryContextValue | null>(null);

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<CompletedSession[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const todayKey = useDayKey();

  useEffect(() => {
    setSessions(sessionsStorage.load());
    setHydrated(true);
  }, []);

  const add = useCallback((session: CompletedSession) => {
    setSessions((prev) => {
      const next = [...prev, session];
      sessionsStorage.save(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setSessions([]);
    sessionsStorage.clear();
  }, []);

  const value = useMemo(() => {
    // Стрик и рекорды — только по полным ритуалам: короткая техника
    // не должна продлевать серию и двигать прогрессию уровней.
    const rituals = sessions.filter((s) => s.kind !== 'technique');
    const streak = calculateStreak(rituals);
    const longest = longestStreak(rituals);
    const totalMinutes = Math.round(totalDurationMs(sessions) / 60000);
    const lastRitual = rituals[rituals.length - 1] ?? null;
    // todayKey в зависимостях ещё и затем, чтобы серия пересчиталась при смене дня.
    const doneToday = rituals.some((s) => isoDayKey(s.date) === todayKey);
    return {
      sessions,
      streak,
      longest,
      totalMinutes,
      todayKey,
      doneToday,
      lastRitual,
      add,
      clear,
      hydrated,
    };
  }, [sessions, todayKey, add, clear, hydrated]);

  return <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>;
}

export function useHistory(): HistoryContextValue {
  const ctx = useContext(HistoryContext);
  if (!ctx) {
    throw new Error('useHistory must be used inside HistoryProvider');
  }
  return ctx;
}
