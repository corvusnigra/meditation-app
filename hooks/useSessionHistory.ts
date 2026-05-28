'use client';

import { useCallback, useEffect, useState } from 'react';
import { sessionsStorage } from '@/lib/storage';
import type { CompletedSession } from '@/lib/types';

export function useSessionHistory(): {
  sessions: CompletedSession[];
  add: (session: CompletedSession) => void;
  clear: () => void;
  hydrated: boolean;
} {
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

  return { sessions, add, clear, hydrated };
}
