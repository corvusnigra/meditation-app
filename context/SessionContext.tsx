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
  Scenario,
  SessionState,
  SessionStatus,
} from '@/lib/types';

const INITIAL: SessionState = {
  status: 'idle',
  scenario: 'custom',
  isPaused: false,
  groundingSense: 0,
  gratitudeText: '',
  startedAt: null,
};

type Action =
  | { type: 'start'; scenario: Scenario }
  | { type: 'advance'; status: SessionStatus }
  | { type: 'pause' }
  | { type: 'resume' }
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
    case 'advance':
      return { ...state, status: action.status, isPaused: false };
    case 'pause':
      return { ...state, isPaused: true };
    case 'resume':
      return { ...state, isPaused: false };
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
  advance: (status: SessionStatus) => void;
  pause: () => void;
  resume: () => void;
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
    (status: SessionStatus) => dispatch({ type: 'advance', status }),
    [],
  );
  const pause = useCallback(() => dispatch({ type: 'pause' }), []);
  const resume = useCallback(() => dispatch({ type: 'resume' }), []);
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
      pause,
      resume,
      reset,
      setGratitude,
      setGroundingSense,
    }),
    [
      state,
      start,
      advance,
      pause,
      resume,
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
