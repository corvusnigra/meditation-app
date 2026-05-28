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

type HistoryContextValue = {
  sessions: CompletedSession[];
  streak: number;
  longest: number;
  totalMinutes: number;
  add: (session: CompletedSession) => void;
  clear: () => void;
  hydrated: boolean;
};

const HistoryContext = createContext<HistoryContextValue | null>(null);

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<CompletedSession[]>([]);
  const [hydrated, setHydrated] = useState(false);

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
    const streak = calculateStreak(sessions);
    const longest = longestStreak(sessions);
    const totalMinutes = Math.round(totalDurationMs(sessions) / 60000);
    return { sessions, streak, longest, totalMinutes, add, clear, hydrated };
  }, [sessions, add, clear, hydrated]);

  return <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>;
}

export function useHistory(): HistoryContextValue {
  const ctx = useContext(HistoryContext);
  if (!ctx) {
    throw new Error('useHistory must be used inside HistoryProvider');
  }
  return ctx;
}
