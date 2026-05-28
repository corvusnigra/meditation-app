export type Scenario = 'morning' | 'commute' | 'sunset' | 'custom';

export type PhaseId = 'breathing' | 'grounding' | 'gratitude';

export type BreathingPhase = 'inhale' | 'holdIn' | 'exhale' | 'holdOut';

export type ProgressionLevel = 1 | 2 | 3 | 4;

export type AmbientPreset = 'ocean' | 'forest' | 'night' | 'silence';

export type ThemeMode = 'dark' | 'light' | 'auto';

export type SessionStatus =
  | 'idle'
  | 'breathing'
  | 'grounding'
  | 'gratitude'
  | 'complete';

export type SessionState = {
  status: SessionStatus;
  scenario: Scenario;
  isPaused: boolean;
  currentPhaseElapsed: number;
  breathingCycle: BreathingPhase;
  groundingSense: number;
  groundingItems: string[][];
  gratitudeText: string;
  startedAt: string | null;
};

export type CompletedSession = {
  id: string;
  date: string;
  scenario: Scenario;
  gratitudeText: string;
  durationMs: number;
  completedPhases: PhaseId[];
  level: ProgressionLevel;
};

export type UserSettings = {
  soundEnabled: boolean;
  ambientEnabled: boolean;
  ambientPreset: AmbientPreset;
  ambientVolume: number;
  hapticsEnabled: boolean;
  theme: ThemeMode;
  breathingPattern: [number, number, number, number];
  reducedMotion: boolean;
};

export type CustomDurations = {
  breathing: number;
  grounding: number;
  gratitude: number;
};

export type ProgressionState = {
  currentLevel: ProgressionLevel;
  offeredUpgrade: boolean;
  declinedAt: string | null;
  lastStreakBeforeBreak: number;
  customDurations: CustomDurations | null;
};

export type LevelDurations = {
  breathing: number;
  grounding: number;
  gratitude: number;
  total: number;
};

export type SessionDraft = {
  status: SessionStatus;
  scenario: Scenario;
  startedAt: string;
};
