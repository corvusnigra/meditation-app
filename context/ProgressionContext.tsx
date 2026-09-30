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
  levelProgress,
  maybeRollback,
  shouldOfferUpgrade,
} from '@/lib/progression';
import { DEFAULT_PROGRESSION } from '@/lib/constants';
import type {
  CustomDurations,
  LevelDurations,
  LevelProgress,
  ProgressionLevel,
  ProgressionState,
} from '@/lib/types';
import { dayKeyToDate } from '@/lib/utils';
import { useHistory } from './HistoryContext';

type ProgressionContextValue = {
  state: ProgressionState;
  durations: LevelDurations;
  progress: LevelProgress;
  upgradeOffer: { nextLvl: ProgressionLevel } | null;
  acceptUpgrade: () => void;
  declineUpgrade: () => void;
  dismissRollbackNotice: () => void;
  resetLevel: () => void;
  setCustomDurations: (d: CustomDurations) => void;
  hydrated: boolean;
};

const ProgressionContext = createContext<ProgressionContextValue | null>(null);

export function ProgressionProvider({ children }: { children: ReactNode }) {
  const { streak, lastRitual, todayKey, hydrated: historyHydrated } = useHistory();
  const [state, setState] = useState<ProgressionState>(DEFAULT_PROGRESSION);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(progressionStorage.load());
    setHydrated(true);
  }, []);

  // Откат проверяется при запуске, после нового ритуала и при смене дня.
  // Повторно на том же перерыве он не сработает: maybeRollback запоминает
  // ритуал в rollbackAnchor, и якорь переживает перезагрузку.
  useEffect(() => {
    if (!hydrated || !historyHydrated) return;
    const rolled = maybeRollback(state, lastRitual);
    if (rolled !== state) {
      setState(rolled);
      progressionStorage.save(rolled);
    }
  }, [hydrated, historyHydrated, state, lastRitual, todayKey]);

  const persist = useCallback((next: ProgressionState) => {
    setState(next);
    progressionStorage.save(next);
  }, []);

  // «Сейчас» для расчёта уровня — день из todayKey: прогресс пересчитывается
  // при смене дня, даже если приложение всё это время было в памяти.
  const today = useMemo(() => dayKeyToDate(todayKey), [todayKey]);
  const upgradeOffer = useMemo(
    () =>
      hydrated && historyHydrated
        ? shouldOfferUpgrade(streak, state, today)
        : null,
    [hydrated, historyHydrated, streak, state, today],
  );

  // Без действующего предложения ответ игнорируется — от повторных нажатий.
  const acceptUpgrade = useCallback(() => {
    if (upgradeOffer) persist(applyUpgradeAcceptance(state));
  }, [persist, state, upgradeOffer]);
  const declineUpgrade = useCallback(() => {
    if (upgradeOffer) persist(applyUpgradeDecline(state));
  }, [persist, state, upgradeOffer]);
  const dismissRollbackNotice = useCallback(
    () => persist({ ...state, rollbackNotice: null }),
    [persist, state],
  );
  const resetLevel = useCallback(() => persist(DEFAULT_PROGRESSION), [persist]);
  const setCustomDurations = useCallback(
    (d: CustomDurations) => persist({ ...state, customDurations: d }),
    [persist, state],
  );

  const value = useMemo(() => {
    const durations = getDurations(state.currentLevel, state.customDurations);
    const progress = levelProgress(streak, state, today);
    return {
      state,
      durations,
      progress,
      upgradeOffer,
      acceptUpgrade,
      declineUpgrade,
      dismissRollbackNotice,
      resetLevel,
      setCustomDurations,
      hydrated,
    };
  }, [
    state,
    streak,
    today,
    hydrated,
    upgradeOffer,
    acceptUpgrade,
    declineUpgrade,
    dismissRollbackNotice,
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
