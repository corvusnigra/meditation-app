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
import { progressionStorage } from '@/lib/storage';
import {
  applyUpgradeAcceptance,
  applyUpgradeDecline,
  getDurations,
  maybeRollback,
  resetUpgradeOffer,
  shouldOfferUpgrade,
} from '@/lib/progression';
import type {
  CustomDurations,
  LevelDurations,
  ProgressionLevel,
  ProgressionState,
} from '@/lib/types';
import { useHistory } from './HistoryContext';

const INITIAL: ProgressionState = {
  currentLevel: 1,
  offeredUpgrade: false,
  declinedAt: null,
  lastStreakBeforeBreak: 0,
  customDurations: null,
};

type ProgressionContextValue = {
  state: ProgressionState;
  durations: LevelDurations;
  upgradeOffer: { offer: boolean; nextLvl: ProgressionLevel } | null;
  acceptUpgrade: (lvl: ProgressionLevel) => void;
  declineUpgrade: () => void;
  resetOffer: () => void;
  resetLevel: () => void;
  setCustomDurations: (d: CustomDurations) => void;
  hydrated: boolean;
};

const ProgressionContext = createContext<ProgressionContextValue | null>(null);

export function ProgressionProvider({ children }: { children: ReactNode }) {
  const { sessions, streak } = useHistory();
  const [state, setState] = useState<ProgressionState>(INITIAL);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(progressionStorage.load());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const lastSession =
      sessions.length > 0 ? sessions[sessions.length - 1] ?? null : null;
    const rolled = maybeRollback(state, lastSession);
    if (rolled.currentLevel !== state.currentLevel) {
      setState(rolled);
      progressionStorage.save(rolled);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, sessions.length]);

  const persist = useCallback((next: ProgressionState) => {
    setState(next);
    progressionStorage.save(next);
  }, []);

  const acceptUpgrade = useCallback(
    (lvl: ProgressionLevel) => persist(applyUpgradeAcceptance(state, lvl)),
    [persist, state],
  );
  const declineUpgrade = useCallback(
    () => persist(applyUpgradeDecline(state)),
    [persist, state],
  );
  const resetOffer = useCallback(
    () => persist(resetUpgradeOffer(state)),
    [persist, state],
  );
  const resetLevel = useCallback(() => persist(INITIAL), [persist]);
  const setCustomDurations = useCallback(
    (d: CustomDurations) => persist({ ...state, customDurations: d }),
    [persist, state],
  );

  const value = useMemo(() => {
    const durations = getDurations(state.currentLevel, state.customDurations);
    const upgradeOffer = hydrated ? shouldOfferUpgrade(streak, state) : null;
    return {
      state,
      durations,
      upgradeOffer,
      acceptUpgrade,
      declineUpgrade,
      resetOffer,
      resetLevel,
      setCustomDurations,
      hydrated,
    };
  }, [
    state,
    streak,
    hydrated,
    acceptUpgrade,
    declineUpgrade,
    resetOffer,
    resetLevel,
    setCustomDurations,
  ]);

  return (
    <ProgressionContext.Provider value={value}>{children}</ProgressionContext.Provider>
  );
}

export function useProgressionContext(): ProgressionContextValue {
  const ctx = useContext(ProgressionContext);
  if (!ctx) {
    throw new Error('useProgressionContext must be used inside ProgressionProvider');
  }
  return ctx;
}
