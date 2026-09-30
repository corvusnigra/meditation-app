import { DEFAULT_PROGRESSION, DEFAULT_SETTINGS } from './constants';
import type {
  AmbientPreset,
  CompletedSession,
  CustomDurations,
  MotionPref,
  PhaseId,
  PracticeUnit,
  ProgressionLevel,
  ProgressionState,
  Scenario,
  TechniqueLevels,
  UserSettings,
} from './types';
import { clamp } from './utils';

// В localStorage может лежать что угодно: запись старой версии, ручная правка,
// оборванный JSON. Нормализаторы принимают любое значение и всегда возвращают
// данные нужного типа, чтобы приложение не падало на чтении.

const SCENARIOS: readonly Scenario[] = ['morning', 'commute', 'sunset', 'custom'];
const PHASES: readonly PhaseId[] = ['breathing', 'grounding', 'gratitude'];
const LEVELS: readonly ProgressionLevel[] = [1, 2, 3, 4];
const AMBIENT_PRESETS: readonly AmbientPreset[] = ['ocean', 'forest', 'night', 'silence'];
const MOTION_PREFS: readonly MotionPref[] = ['system', 'reduce', 'full'];

// Тот же диапазон, что у ползунков в components/progression/DurationSliders.tsx.
const CUSTOM_DURATION_MIN_SEC = 60;
const CUSTOM_DURATION_MAX_SEC = 300;

type Dict = Record<string, unknown>;

function isDict(value: unknown): value is Dict {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function oneOf<T>(value: unknown, allowed: readonly T[]): value is T {
  return (allowed as readonly unknown[]).includes(value);
}

function isCount(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= 0;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isDateString(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(new Date(value).getTime());
}

const SESSION_KINDS: readonly NonNullable<CompletedSession['kind']>[] = [
  'ritual',
  'technique',
];
const UNITS: readonly PracticeUnit[] = ['cycle', 'round', 'group'];

// Запись чинится, а не отбрасывается: при следующем сохранении список в хранилище
// перезаписывается целиком, и отброшенное пропало бы навсегда. Спасти нельзя только
// запись без даты — её негде показать в истории. Поля, о которых эта версия не
// знает, остаются. techniqueId проверяется только как строка: в истории есть
// техники, которых уже нет в каталоге.
function repairSession(value: unknown, index: number): CompletedSession | null {
  if (!isDict(value) || !isDateString(value.date)) return null;
  const session: Dict = { ...value };
  if (typeof session.id !== 'string' || session.id === '') {
    session.id = `restored-${value.date}-${index}`;
  }
  if (!oneOf(session.scenario, SCENARIOS)) session.scenario = 'custom';
  if (typeof session.gratitudeText !== 'string') session.gratitudeText = '';
  if (!isFiniteNumber(session.durationMs) || session.durationMs < 0) {
    session.durationMs = 0;
  }
  session.completedPhases = Array.isArray(session.completedPhases)
    ? session.completedPhases.filter((phase) => oneOf(phase, PHASES))
    : [];
  if (!oneOf(session.level, LEVELS)) session.level = 1;
  if (typeof session.techniqueId !== 'string') delete session.techniqueId;
  if (typeof session.techniqueName !== 'string') delete session.techniqueName;
  if (session.kind !== undefined && !oneOf(session.kind, SESSION_KINDS)) {
    // Неизвестный вид: запись с техникой остаётся техникой и не продлевает серию.
    if (typeof session.techniqueId === 'string') session.kind = 'technique';
    else delete session.kind;
  }
  // Счёт единиц показывается только целиком: без любой из трёх частей его нет.
  if (
    !isCount(session.done) ||
    !isCount(session.planned) ||
    session.planned < 1 ||
    session.done > session.planned ||
    !oneOf(session.unit, UNITS)
  ) {
    delete session.done;
    delete session.planned;
    delete session.unit;
  }
  return session as CompletedSession;
}

export function normalizeSessions(raw: unknown): CompletedSession[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item, index) => repairSession(item, index) ?? []);
}

function isBreathingPattern(
  value: unknown,
): value is UserSettings['breathingPattern'] {
  return (
    Array.isArray(value) &&
    value.length === 4 &&
    value.every((sec) => isFiniteNumber(sec) && sec >= 0) &&
    value.some((sec) => sec > 0)
  );
}

// До motionPref хранился флаг reducedMotion. Включённый означает явный выбор;
// выключенный записывался и без участия человека, поэтому читается как «как в системе».
function motionPrefOf(raw: Dict, fallback: MotionPref): MotionPref {
  if (oneOf(raw.motionPref, MOTION_PREFS)) return raw.motionPref;
  return raw.reducedMotion === true ? 'reduce' : fallback;
}

// Собирается по полям этой версии, поэтому ушедшие поля (theme, reducedMotion)
// отбрасываются сами.
export function normalizeSettings(raw: unknown): UserSettings {
  if (!isDict(raw)) return { ...DEFAULT_SETTINGS };
  const d = DEFAULT_SETTINGS;
  const bool = (value: unknown, fallback: boolean): boolean =>
    typeof value === 'boolean' ? value : fallback;
  return {
    ambientEnabled: bool(raw.ambientEnabled, d.ambientEnabled),
    ambientPreset: oneOf(raw.ambientPreset, AMBIENT_PRESETS)
      ? raw.ambientPreset
      : d.ambientPreset,
    ambientVolume: isFiniteNumber(raw.ambientVolume)
      ? clamp(raw.ambientVolume, 0, 1)
      : d.ambientVolume,
    hapticsEnabled: bool(raw.hapticsEnabled, d.hapticsEnabled),
    hapticGuideEnabled: bool(raw.hapticGuideEnabled, d.hapticGuideEnabled),
    phaseSoundEnabled: bool(raw.phaseSoundEnabled, d.phaseSoundEnabled),
    entrainmentEnabled: bool(raw.entrainmentEnabled, d.entrainmentEnabled),
    breathingPattern: isBreathingPattern(raw.breathingPattern)
      ? raw.breathingPattern
      : d.breathingPattern,
    motionPref: motionPrefOf(raw, d.motionPref),
  };
}

function normalizeCustomDurations(raw: unknown): CustomDurations | null {
  if (!isDict(raw)) return null;
  const { breathing, grounding, gratitude } = raw;
  if (
    !isFiniteNumber(breathing) ||
    !isFiniteNumber(grounding) ||
    !isFiniteNumber(gratitude)
  ) {
    return null;
  }
  const fit = (sec: number): number =>
    clamp(sec, CUSTOM_DURATION_MIN_SEC, CUSTOM_DURATION_MAX_SEC);
  return {
    breathing: fit(breathing),
    grounding: fit(grounding),
    gratitude: fit(gratitude),
  };
}

// Поля берутся по одному, поэтому старый формат (offeredUpgrade,
// lastStreakBeforeBreak) читается без миграции: лишнее игнорируется.
export function normalizeProgression(raw: unknown): ProgressionState {
  if (!isDict(raw)) return { ...DEFAULT_PROGRESSION };
  const notice = raw.rollbackNotice;
  return {
    currentLevel: oneOf(raw.currentLevel, LEVELS) ? raw.currentLevel : 1,
    customDurations: normalizeCustomDurations(raw.customDurations),
    declinedAt: isDateString(raw.declinedAt) ? raw.declinedAt : null,
    lastUpgradeAt: isDateString(raw.lastUpgradeAt) ? raw.lastUpgradeAt : null,
    rollbackAnchor: isDateString(raw.rollbackAnchor) ? raw.rollbackAnchor : null,
    rollbackNotice:
      isDict(notice) && oneOf(notice.from, LEVELS) && oneOf(notice.to, LEVELS)
        ? { from: notice.from, to: notice.to }
        : null,
  };
}

export function normalizeTechniqueLevels(raw: unknown): TechniqueLevels {
  if (!isDict(raw)) return {};
  const levels: TechniqueLevels = {};
  for (const [id, level] of Object.entries(raw)) {
    // Уровень — индекс шага в лестнице техники, годится только целое от нуля.
    if (typeof level === 'number' && Number.isInteger(level) && level >= 0) {
      levels[id] = level;
    }
  }
  return levels;
}
