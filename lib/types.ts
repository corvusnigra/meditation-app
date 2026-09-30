export type Scenario = 'morning' | 'commute' | 'sunset' | 'custom';

export type PhaseId = 'breathing' | 'grounding' | 'gratitude';

export type BreathingPhase = 'inhale' | 'holdIn' | 'exhale' | 'holdOut';

export type ProgressionLevel = 1 | 2 | 3 | 4;

export type AmbientPreset = 'ocean' | 'forest' | 'night' | 'silence';

// system — как в настройках устройства, reduce и full — явный выбор в приложении.
export type MotionPref = 'system' | 'reduce' | 'full';

export type SessionStatus =
  | 'idle'
  | 'breathing'
  | 'grounding'
  | 'gratitude'
  | 'complete';

export type SessionState = {
  status: SessionStatus;
  scenario: Scenario;
  groundingSense: number;
  gratitudeText: string;
  startedAt: string | null;
  // Засчитанные фазы и активное время уже пройденных фаз ритуала.
  completedPhases: PhaseId[];
  activeMs: number;
};

export type PracticeUnit = 'cycle' | 'round' | 'group';

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
  // Сколько единиц практики выполнено из плана.
  done?: number;
  planned?: number;
  unit?: PracticeUnit;
};

export type TechniqueCategory = 'anxiety' | 'sleep' | 'focus' | 'energy';

export type TechniqueKind = 'box' | 'sigh' | 'wim-hof' | 'pmr';

export type BreathingTechniqueId =
  | 'physiological-sigh'
  | 'sleep-4-7-8'
  | 'box-4-4-4-4'
  | 'coherent-6-6'
  | 'wim-hof'
  | 'pmr'
  | 'cyclic-sigh-5';

export type PmrTechniqueConfig = {
  kind: 'pmr';
  groups: Array<{ label: string; instruction: string }>;
  tenseSec: number;
  releaseSec: number;
};

export type BoxStep = {
  pattern: [number, number, number, number];
  cycles: number;
};

export type BoxTechniqueConfig = {
  kind: 'box';
  pattern: [number, number, number, number];
  cycles: number;
  mouthExhale?: boolean;
  // Лестница сложности easy→hard для адаптивной прогрессии.
  // Если задана, фактический паттерн/циклы берутся из шага по уровню пользователя.
  ladder?: BoxStep[];
  defaultStep?: number;
};

export type TechniqueFeedback = 'easy' | 'right' | 'hard';

// Персональный уровень сложности по каждой технике (индекс в ladder).
export type TechniqueLevels = Record<string, number>;

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

export type TechniqueEvidence = 'strong' | 'moderate' | 'emerging';

export type BreathingTechnique = {
  id: BreathingTechniqueId;
  category: TechniqueCategory;
  isPrimary: boolean;
  name: string;
  tagline: string;
  // Короткое «для чего/когда» — главная строка карточки.
  purpose: string;
  // Сила доказательной базы (для сортировки и бейджа).
  evidence: TechniqueEvidence;
  // Отметить в списке как технику, с которой стоит начать.
  recommended?: boolean;
  description: string;
  source?: string;
  config:
    | BoxTechniqueConfig
    | SighTechniqueConfig
    | WimHofTechniqueConfig
    | PmrTechniqueConfig;
};

export type UserSettings = {
  soundEnabled: boolean;
  ambientEnabled: boolean;
  ambientPreset: AmbientPreset;
  ambientVolume: number;
  hapticsEnabled: boolean;
  hapticGuideEnabled: boolean;
  // Тон на смене фазы без фонового звука.
  phaseSoundEnabled: boolean;
  entrainmentEnabled: boolean;
  breathingPattern: [number, number, number, number];
  motionPref: MotionPref;
};

export type CustomDurations = {
  breathing: number;
  grounding: number;
  gratitude: number;
};

export type ProgressionState = {
  currentLevel: ProgressionLevel;
  customDurations: CustomDurations | null;
  // Когда отказались от перехода на currentLevel + 1.
  declinedAt: string | null;
  lastUpgradeAt: string | null;
  // date ритуала, перерыв после которого уже учтён откатом.
  rollbackAnchor: string | null;
  rollbackNotice: { from: ProgressionLevel; to: ProgressionLevel } | null;
};

export type LevelProgress =
  | { kind: 'max' }
  | { kind: 'ready'; next: ProgressionLevel }
  | { kind: 'wait'; next: ProgressionLevel; daysLeft: number };

export type LevelDurations = {
  breathing: number;
  grounding: number;
  gratitude: number;
  total: number;
};

