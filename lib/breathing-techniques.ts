import type {
  BoxStep,
  BoxTechniqueConfig,
  BreathingTechnique,
  BreathingTechniqueId,
  TechniqueCategory,
  TechniqueEvidence,
  TechniqueFeedback,
} from './types';

export const TECHNIQUES: Record<BreathingTechniqueId, BreathingTechnique> = {
  'physiological-sigh': {
    id: 'physiological-sigh',
    category: 'anxiety',
    isPrimary: true,
    name: 'Физиологический вздох',
    tagline: 'Два вдоха носом\u00A0+ длинный выдох ртом',
    purpose: 'Сбросить тревогу за минуту',
    evidence: 'strong',
    recommended: true,
    description:
      'Самый быстрый способ сбить возбуждение нервной системы: хватает нескольких вздохов. Подходит, когда нет минуты сесть.',
    source: 'Huberman / Balban et al., Cell Reports Medicine 2023',
    config: { kind: 'sigh', cycles: 3 },
  },

  'sleep-4-7-8': {
    id: 'sleep-4-7-8',
    category: 'sleep',
    isPrimary: true,
    name: '4-7-8 на засыпание',
    tagline: 'Вдох\u00A04 · задержка\u00A07 · выдох ртом\u00A08',
    purpose: 'Помогает уснуть',
    evidence: 'moderate',
    description:
      'Вдох на 4, задержка на 7, выдох ртом на 8 — лёжа на спине. Удлинённый выдох тормозит нервную систему и помогает уснуть.',
    config: {
      kind: 'box',
      pattern: [4, 7, 8, 0],
      cycles: 8,
      mouthExhale: true,
      defaultStep: 1,
      ladder: [
        { pattern: [4, 4, 6, 0], cycles: 6 },
        { pattern: [4, 7, 8, 0], cycles: 8 },
        { pattern: [4, 7, 8, 0], cycles: 10 },
        { pattern: [5, 8, 9, 0], cycles: 10 },
      ],
    },
  },

  'box-4-4-4-4': {
    id: 'box-4-4-4-4',
    category: 'focus',
    isPrimary: true,
    name: 'Квадратное дыхание',
    tagline: 'Вдох\u00A04 · задержка\u00A04 · выдох\u00A04 · задержка\u00A04',
    purpose: 'Собранность под давлением',
    evidence: 'moderate',
    description:
      '«Квадратное дыхание» из подготовки спецназа. Даёт спокойный фокус. 2–5 минут перед сложной задачей.',
    config: {
      kind: 'box',
      pattern: [4, 4, 4, 4],
      cycles: 8,
      defaultStep: 1,
      ladder: [
        { pattern: [3, 3, 3, 3], cycles: 6 },
        { pattern: [4, 4, 4, 4], cycles: 8 },
        { pattern: [5, 5, 5, 5], cycles: 8 },
        { pattern: [6, 6, 6, 6], cycles: 8 },
      ],
    },
  },

  'coherent-6-6': {
    id: 'coherent-6-6',
    category: 'focus',
    isPrimary: false,
    name: 'Когерентное 6/6',
    tagline: 'Вдох\u00A06 · выдох\u00A06, ~5\u00A0дыханий/мин',
    purpose: 'Тренировать стрессоустойчивость',
    evidence: 'strong',
    recommended: true,
    description:
      'Медленное ровное дыхание носом без задержек. Хорошо идёт фоном на длинных рабочих сессиях.',
    config: {
      kind: 'box',
      pattern: [6, 0, 6, 0],
      cycles: 30,
      defaultStep: 1,
      ladder: [
        { pattern: [5, 0, 5, 0], cycles: 30 },
        { pattern: [6, 0, 6, 0], cycles: 30 },
        { pattern: [7, 0, 7, 0], cycles: 26 },
        { pattern: [8, 0, 8, 0], cycles: 24 },
      ],
    },
  },

  'wim-hof': {
    id: 'wim-hof',
    category: 'energy',
    isPrimary: true,
    name: 'Метод Вим Хофа',
    tagline: '3\u00A0раунда · 30\u00A0быстрых дыханий · задержка',
    purpose: 'Бодрость без кофе',
    evidence: 'emerging',
    description:
      '30 глубоких вдохов + пассивных выдохов, потом задержка на пустых лёгких, потом восстановительный вдох и 15 секунд задержки. Заменяет утренний кофе.',
    source: 'Wim Hof Method',
    config: {
      kind: 'wim-hof',
      rounds: 3,
      breathsPerRound: 30,
      breathCycleSec: 1.8,
      recoveryHoldSec: 15,
    },
  },

  'cyclic-sigh-5': {
    id: 'cyclic-sigh-5',
    category: 'anxiety',
    isPrimary: false,
    name: 'Циклический вздох (5 мин)',
    tagline: 'Полный протокол: 5\u00A0минут двойных вздохов',
    purpose: 'Выровнять настроение за 5 минут',
    evidence: 'strong',
    description:
      'Та же механика, что у быстрого вздоха, но 5 минут подряд — ровно как в исследовании Стэнфорда (Balban, 2023), где из всех практик циклический вздох сильнее всего улучшал настроение и снижал частоту дыхания.',
    source: 'Balban et al., Cell Reports Medicine 2023',
    config: { kind: 'sigh', cycles: 40 },
  },

  pmr: {
    id: 'pmr',
    category: 'sleep',
    isPrimary: false,
    name: 'Мышечная релаксация',
    tagline: 'Напрячь 6\u00A0секунд\u00A0— отпустить 12, по группам мышц',
    purpose: 'Отпустить телесное напряжение',
    evidence: 'strong',
    description:
      'Прогрессивная мышечная релаксация по Джекобсону. Поочерёдно напрягаете и отпускаете группы мышц — тело учится различать напряжение и само сбрасывает его. Одна из самых проверенных техник для сна и тревоги.',
    source: 'Jacobson, 1938; современные протоколы PMR',
    config: {
      kind: 'pmr',
      tenseSec: 6,
      releaseSec: 12,
      groups: [
        { label: 'Кулаки', instruction: 'Сожмите кулаки изо всех сил' },
        { label: 'Плечи', instruction: 'Поднимите плечи к ушам' },
        { label: 'Лицо', instruction: 'Зажмурьтесь и наморщите лицо' },
        { label: 'Живот', instruction: 'Напрягите мышцы живота' },
        { label: 'Бёдра и ягодицы', instruction: 'Напрягите бёдра и ягодицы' },
        { label: 'Стопы', instruction: 'Потяните носки на себя' },
        { label: 'Всё тело', instruction: 'Напрягите всё тело разом' },
      ],
    },
  },

};

export const TECHNIQUES_LIST: BreathingTechnique[] = Object.values(TECHNIQUES);

export const CATEGORY_LABEL: Record<TechniqueCategory, string> = {
  anxiety: 'Тревога / паника',
  sleep: 'Сон / засыпание',
  focus: 'Концентрация / работа',
  energy: 'Энергия / пробуждение',
};

export const CATEGORY_TAGLINE: Record<TechniqueCategory, string> = {
  anxiety: 'Сбросить возбуждение за минуту',
  sleep: 'Затормозить нервную систему',
  focus: 'Войти в спокойный фокус',
  energy: 'Поднять заряд без кофе',
};

export const CATEGORY_ORDER: TechniqueCategory[] = [
  'anxiety',
  'sleep',
  'focus',
  'energy',
];

const EVIDENCE_RANK: Record<TechniqueEvidence, number> = {
  strong: 2,
  moderate: 1,
  emerging: 0,
};

export const EVIDENCE_LABEL: Record<TechniqueEvidence, string> = {
  strong: 'Доказано',
  moderate: 'Есть данные',
  emerging: 'Ранние данные',
};

// Самое доказательное — наверх: сначала «главная» техника состояния,
// затем по силе доказательной базы.
export function techniquesByCategory(
  category: TechniqueCategory,
): BreathingTechnique[] {
  return TECHNIQUES_LIST.filter((t) => t.category === category).sort((a, b) => {
    if (a.isPrimary !== b.isPrimary) return Number(b.isPrimary) - Number(a.isPrimary);
    return EVIDENCE_RANK[b.evidence] - EVIDENCE_RANK[a.evidence];
  });
}

// В истории встречаются техники, которых уже нет в каталоге, — для них undefined.
export function findTechnique(id: string | undefined): BreathingTechnique | undefined {
  if (!id) return undefined;
  if (!Object.hasOwn(TECHNIQUES, id)) return undefined;
  return (TECHNIQUES as Record<string, BreathingTechnique>)[id];
}

// --- Адаптивная прогрессия (только box-техники с лестницей) ---

function boxConfig(t: BreathingTechnique): BoxTechniqueConfig | null {
  return t.config.kind === 'box' ? t.config : null;
}

export function isAdaptive(t: BreathingTechnique): boolean {
  const c = boxConfig(t);
  return !!c?.ladder && c.ladder.length > 1;
}

export function ladderLength(t: BreathingTechnique): number {
  return boxConfig(t)?.ladder?.length ?? 0;
}

export function defaultLevel(t: BreathingTechnique): number {
  return boxConfig(t)?.defaultStep ?? 0;
}

export function clampLevel(t: BreathingTechnique, level: number): number {
  const len = ladderLength(t);
  if (len === 0) return 0;
  return Math.min(Math.max(level, 0), len - 1);
}

// Фактические паттерн и циклы с учётом уровня; без лестницы — базовый конфиг.
export function effectiveStep(t: BreathingTechnique, level: number): BoxStep {
  const c = boxConfig(t);
  if (!c) return { pattern: [4, 4, 4, 4], cycles: 8 };
  if (c.ladder && c.ladder.length > 0) {
    const idx = clampLevel(t, level);
    return c.ladder[idx] as BoxStep;
  }
  return { pattern: c.pattern, cycles: c.cycles };
}

export function adjustLevel(
  t: BreathingTechnique,
  level: number,
  feedback: TechniqueFeedback,
): number {
  if (feedback === 'easy') return clampLevel(t, level + 1);
  if (feedback === 'hard') return clampLevel(t, level - 1);
  return clampLevel(t, level);
}

// --- Расчётная длительность ---

// Один двойной вздох: вдох 1,5 с, довдох 0,5 с, выдох 5 с (components/techniques/runners/SighRunner.tsx).
const SIGH_CYCLE_SEC = 7;

// Задержку на выдохе в методе Вим Хофа человек заканчивает сам;
// для оценки берётся минута на раунд.
const WIM_HOF_RETENTION_ESTIMATE_SEC = 60;

// Сколько займёт техника на уровне level — по её конфигу, а не по подписи.
export function techniqueDurationSec(t: BreathingTechnique, level: number): number {
  const c = t.config;
  switch (c.kind) {
    case 'box': {
      const step = effectiveStep(t, level);
      return step.cycles * step.pattern.reduce((sum, sec) => sum + sec, 0);
    }
    case 'sigh':
      return c.cycles * SIGH_CYCLE_SEC;
    case 'wim-hof':
      return (
        c.rounds *
        (c.breathsPerRound * c.breathCycleSec +
          WIM_HOF_RETENTION_ESTIMATE_SEC +
          c.recoveryHoldSec)
      );
    case 'pmr':
      return c.groups.length * (c.tenseSec + c.releaseSec);
  }
}
