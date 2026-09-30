import { GROUNDING_SENSES } from './constants';
import type {
  BreathingPhase,
  BreathingTechnique,
  CompletedSession,
  PhaseId,
  PracticeUnit,
  ProgressionLevel,
  TechniqueKind,
} from './types';
import { plural } from './utils';

export type PhaseDef<Id extends string = string> = { id: Id; sec: number };

export type PhaseLocation = {
  done: boolean;
  // Сколько циклов уже завершено.
  cycle: number;
  index: number;
  phaseStartSec: number;
};

// Фаза вычисляется из прошедшего времени, а не шагами от тика к тику: после
// простоя получается одна текущая фаза, а не очередь пропущенных.
// Фазы нулевой длины пропускаются.
export function locatePhase(
  phases: readonly PhaseDef[],
  cycles: number,
  tSec: number,
): PhaseLocation {
  const cycleSec = phases.reduce((sum, p) => sum + Math.max(p.sec, 0), 0);
  if (cycleSec <= 0 || cycles <= 0) {
    return { done: true, cycle: 0, index: 0, phaseStartSec: 0 };
  }
  const t = Math.max(tSec, 0);
  const cycle = Math.floor(t / cycleSec);
  if (cycle >= cycles) {
    return { done: true, cycle: cycles, index: 0, phaseStartSec: cycles * cycleSec };
  }
  let start = cycle * cycleSec;
  let last = { index: 0, phaseStartSec: start };
  for (let i = 0; i < phases.length; i += 1) {
    const sec = phases[i].sec;
    if (sec <= 0) continue;
    last = { index: i, phaseStartSec: start };
    if (t < start + sec) break;
    start += sec;
  }
  return { done: false, cycle, ...last };
}

const BREATHING_ORDER: BreathingPhase[] = ['inhale', 'holdIn', 'exhale', 'holdOut'];

export function breathingPhases(
  pattern: readonly [number, number, number, number],
): PhaseDef<BreathingPhase>[] {
  return BREATHING_ORDER.map((id, i) => ({ id, sec: pattern[i] }));
}

// Плановое время округляется вверх до целого цикла, чтобы дыхание
// не обрывалось посреди задержки.
export function ritualCycles(
  sec: number,
  pattern: readonly [number, number, number, number],
): number {
  const cycleSec = pattern.reduce((a, b) => a + b, 0);
  if (cycleSec <= 0) return 1;
  return Math.max(1, Math.ceil(sec / cycleSec));
}

// Время заземления делится между шагами как 5:4:3:2:1 — по числу предметов в шаге.
export function groundingBudgets(sec: number): number[] {
  const weights = GROUNDING_SENSES.map((sense) => sense.count);
  const total = weights.reduce((a, b) => a + b, 0);
  const budgets = weights.map((w) => Math.floor((sec * w) / total));
  budgets[0] += sec - budgets.reduce((a, b) => a + b, 0);
  return budgets;
}

// Сколько единиц (циклов, раундов, групп) нужно завершить, чтобы практика
// попала в историю.
export function minUnits(kind: TechniqueKind, planned: number): number {
  const half = Math.ceil(planned / 2);
  const min =
    kind === 'box'
      ? Math.max(3, half)
      : kind === 'sigh'
        ? Math.max(2, half)
        : kind === 'wim-hof'
          ? 1
          : half;
  return Math.min(min, planned);
}

// Фаза ритуала засчитывается, если пройдена хотя бы половина.
export function phaseCounted(done: number, planned: number): boolean {
  return planned > 0 && done >= Math.ceil(planned / 2);
}

// Ритуал попадает в историю, если засчитаны хотя бы две фазы из трёх.
export function ritualCounted(phases: readonly PhaseId[]): boolean {
  return phases.length >= 2;
}

const UNIT_FORMS: Record<PracticeUnit, [string, string, string]> = {
  cycle: ['цикл', 'цикла', 'циклов'],
  round: ['раунд', 'раунда', 'раундов'],
  group: ['группа', 'группы', 'групп'],
};

// «5 циклов», «1 раунд».
export function unitsLabel(count: number, unit: PracticeUnit): string {
  return `${count} ${plural(count, UNIT_FORMS[unit])}`;
}

// «5 из 8 циклов», «2 из 21 цикла».
export function unitsOfLabel(done: number, planned: number, unit: PracticeUnit): string {
  const [, few, many] = UNIT_FORMS[unit];
  return `${done} из ${planned} ${plural(planned, [few, many, many])}`;
}

export type TechniqueResult = {
  id: string;
  done: number;
  planned: number;
  unit: PracticeUnit;
  durationMs: number;
};

export function buildTechniqueSession(
  technique: BreathingTechnique,
  result: TechniqueResult,
  level: ProgressionLevel,
): CompletedSession {
  return {
    id: result.id,
    date: new Date().toISOString(),
    scenario: 'custom',
    gratitudeText: '',
    durationMs: Math.max(Math.round(result.durationMs), 0),
    completedPhases: ['breathing'],
    level,
    kind: 'technique',
    techniqueId: technique.id,
    techniqueName: technique.name,
    done: result.done,
    planned: result.planned,
    unit: result.unit,
  };
}
