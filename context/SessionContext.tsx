'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';
import type {
  PhaseId,
  Scenario,
  SessionState,
  SessionStatus,
} from '@/lib/types';

const INITIAL: SessionState = {
  status: 'idle',
  scenario: 'custom',
  groundingSense: 0,
  gratitudeText: '',
  startedAt: null,
  completedPhases: [],
  activeMs: 0,
};

// Итог пройденной фазы: засчитана ли она и сколько длилась без пауз.
export type PhaseReport = { phase: PhaseId; counted: boolean; activeMs: number };

type Action =
  | { type: 'start'; scenario: Scenario }
  | { type: 'advance'; status: SessionStatus; report?: PhaseReport }
  | { type: 'set-gratitude'; text: string }
  | { type: 'set-grounding-sense'; index: number }
  | { type: 'reset' };

function reducer(state: SessionState, action: Action): SessionState {
  switch (action.type) {
    case 'start':
      return {
        ...INITIAL,
        status: 'breathing',
        scenario: action.scenario,
        startedAt: new Date().toISOString(),
      };
    case 'advance': {
      const { report } = action;
      if (!report) return { ...state, status: action.status };
      const counted =
        report.counted && !state.completedPhases.includes(report.phase);
      return {
        ...state,
        status: action.status,
        completedPhases: counted
          ? [...state.completedPhases, report.phase]
          : state.completedPhases,
        activeMs: state.activeMs + Math.max(report.activeMs, 0),
      };
    }
    case 'set-gratitude':
      return { ...state, gratitudeText: action.text };
    case 'set-grounding-sense':
      return { ...state, groundingSense: action.index };
    case 'reset':
      return INITIAL;
    default:
      return state;
  }
}

type SessionContextValue = {
  state: SessionState;
  start: (scenario: Scenario) => void;
  advance: (status: SessionStatus, report?: PhaseReport) => void;
  reset: () => void;
  setGratitude: (text: string) => void;
  setGroundingSense: (index: number) => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL);

  const start = useCallback(
    (scenario: Scenario) => dispatch({ type: 'start', scenario }),
    [],
  );
  const advance = useCallback(
    (status: SessionStatus, report?: PhaseReport) =>
      dispatch({ type: 'advance', status, report }),
    [],
  );
  const reset = useCallback(() => dispatch({ type: 'reset' }), []);
  const setGratitude = useCallback(
    (text: string) => dispatch({ type: 'set-gratitude', text }),
    [],
  );
  const setGroundingSense = useCallback(
    (index: number) => dispatch({ type: 'set-grounding-sense', index }),
    [],
  );

  const value = useMemo(
    () => ({
      state,
      start,
      advance,
      reset,
      setGratitude,
      setGroundingSense,
    }),
    [
      state,
      start,
      advance,
      reset,
      setGratitude,
      setGroundingSense,
    ],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession must be used inside SessionProvider');
  }
  return ctx;
}
