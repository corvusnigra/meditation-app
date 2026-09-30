import { effectiveStep } from '@/lib/breathing-techniques';
import type {
  BoxTechniqueConfig,
  BreathingTechnique,
  PmrTechniqueConfig,
  SighTechniqueConfig,
  TechniqueKind,
  WimHofTechniqueConfig,
} from '@/lib/types';
import { plural } from '@/lib/utils';
import { BoxRunner } from './BoxRunner';
import { PmrRunner } from './PmrRunner';
import { SighRunner } from './SighRunner';
import { WimHofRunner } from './WimHofRunner';
import type { RunnerDef } from './types';

const sigh = (t: BreathingTechnique) => t.config as SighTechniqueConfig;
const wimHof = (t: BreathingTechnique) => t.config as WimHofTechniqueConfig;
const pmr = (t: BreathingTechnique) => t.config as PmrTechniqueConfig;

const TIMES: [string, string, string] = ['раз', 'раза', 'раз'];

function boxSteps(technique: BreathingTechnique, level: number): string[] {
  const [inhale, holdIn, exhale, holdOut] = effectiveStep(technique, level).pattern;
  const mouth = (technique.config as BoxTechniqueConfig).mouthExhale;
  return [
    `Вдох носом — ${inhale} с`,
    holdIn > 0 ? `Задержка — ${holdIn} с` : null,
    `${mouth ? 'Выдох ртом' : 'Выдох'} — ${exhale} с`,
    holdOut > 0 ? `Задержка — ${holdOut} с` : null,
  ].filter((step): step is string => step !== null);
}

// Раннеры подключены статически: ленивые чанки не попали бы в офлайн-кэш.
export const RUNNERS: Record<TechniqueKind, RunnerDef> = {
  box: {
    Runner: BoxRunner,
    unit: 'cycle',
    tone: 'breathing',
    ambient: true,
    timed: true,
    planned: (t, level) => effectiveStep(t, level).cycles,
    steps: boxSteps,
    summary: (t, level) => {
      const cycles = effectiveStep(t, level).cycles;
      return `Повторим ${cycles} ${plural(cycles, TIMES)}`;
    },
  },
  sigh: {
    Runner: SighRunner,
    unit: 'cycle',
    tone: 'grounding',
    ambient: true,
    timed: true,
    planned: (t) => sigh(t).cycles,
    steps: () => [
      'Короткий вдох носом',
      'Ещё один короткий вдох носом сверху',
      'Длинный выдох через рот',
    ],
    summary: (t) => `Повторим ${sigh(t).cycles} ${plural(sigh(t).cycles, TIMES)}`,
    doneHint: 'Чувствуете разницу?',
  },
  'wim-hof': {
    Runner: WimHofRunner,
    unit: 'round',
    tone: 'gratitude',
    ambient: true,
    timed: false,
    planned: (t) => wimHof(t).rounds,
    steps: (t) => [
      `${wimHof(t).breathsPerRound} глубоких вдохов + пассивных выдохов`,
      'Задержка на пустых лёгких — сколько получится',
      `Глубокий вдох и задержка ${wimHof(t).recoveryHoldSec} секунд`,
    ],
    summary: (t) => `Повторим ${wimHof(t).rounds} ${plural(wimHof(t).rounds, TIMES)}`,
    doneHint: 'Посидите минуту в тишине.',
    warnings: [
      'Сидя или лёжа в безопасном месте.',
      'Никогда за рулём, в воде, на высоте.',
      'Не делать при беременности, эпилепсии, серьёзных сердечных проблемах.',
      'Лёгкое головокружение и покалывание — нормально.',
      'Если стало плохо — нормально дышите и остановитесь.',
    ],
  },
  pmr: {
    Runner: PmrRunner,
    unit: 'group',
    tone: 'streak',
    ambient: false,
    timed: true,
    planned: (t) => pmr(t).groups.length,
    steps: (t) => [
      `Напрягаете группу мышц ${pmr(t).tenseSec} секунд — сильно, но без боли`,
      `Резко отпускаете и ${pmr(t).releaseSec} секунд чувствуете разницу`,
    ],
    summary: (t) =>
      `${pmr(t).groups.length} групп: ${pmr(t)
        .groups.map((group) => group.label.toLowerCase())
        .join(', ')}`,
    doneHint: 'Заметьте, каким тяжёлым стало тело.',
  },
};
