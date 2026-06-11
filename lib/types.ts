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
  groundingSense: number;
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
  kind?: 'ritual' | 'technique';
  techniqueId?: BreathingTechniqueId;
  techniqueName?: string;
};

export type TechniqueCategory = 'anxiety' | 'sleep' | 'focus' | 'energy';

export type TechniqueKind =
  | 'box'
  | 'sigh'
  | 'wim-hof'
  | 'deepening'
  | 'pmr'
  | 'bodyscan';

export type BreathingTechniqueId =
  | 'physiological-sigh'
  | 'relax-4-7-8'
  | 'sleep-4-7-8'
  | 'coherent-4-8'
  | 'box-4-4-4-4'
  | 'coherent-6-6'
  | 'wim-hof'
  | 'diaphragmatic'
  | 'pmr'
  | 'body-scan';

export type PmrTechniqueConfig = {
  kind: 'pmr';
  groups: Array<{ label: string; instruction: string }>;
  tenseSec: number;
  releaseSec: number;
};

export type BodyScanTechniqueConfig = {
  kind: 'bodyscan';
  areas: Array<{ label: string; prompt: string }>;
  secondsPerArea: number;
};

export type DeepeningStage = {
  pattern: [number, number, number, number];
  cycles: number;
  label: string;
  hint?: string;
};

export type DeepeningTechniqueConfig = {
  kind: 'deepening';
  stages: DeepeningStage[];
  mouthExhale?: boolean;
};

export type BoxTechniqueConfig = {
  kind: 'box';
  pattern: [number, number, number, number];
  cycles: number;
  mouthExhale?: boolean;
};

export type SighTechniqueConfig = {
  kind: 'sigh';
  cycles: number;
};

export type WimHofTechniqueConfig = {
  kind: 'wim-hof';
  rounds: number;
  breathsPerRound: number;
  breathCycleSec: number;
  recoveryHoldSec: number;
};

export type BreathingTechnique = {
  id: BreathingTechniqueId;
  category: TechniqueCategory;
  isPrimary: boolean;
  name: string;
  tagline: string;
  description: string;
  source?: string;
  durationLabel: string;
  config:
    | BoxTechniqueConfig
    | SighTechniqueConfig
    | WimHofTechniqueConfig
    | DeepeningTechniqueConfig
    | PmrTechniqueConfig
    | BodyScanTechniqueConfig;
};

export type UserSettings = {
  soundEnabled: boolean;
  ambientEnabled: boolean;
  ambientPreset: AmbientPreset;
  ambientVolume: number;
  hapticsEnabled: boolean;
  hapticGuideEnabled: boolean;
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

