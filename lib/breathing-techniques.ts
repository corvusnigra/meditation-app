import type {
  BreathingTechnique,
  BreathingTechniqueId,
  TechniqueCategory,
} from './types';

export const TECHNIQUES: Record<BreathingTechniqueId, BreathingTechnique> = {
  'physiological-sigh': {
    id: 'physiological-sigh',
    category: 'anxiety',
    isPrimary: true,
    name: 'Физиологический вздох',
    tagline: 'Два вдоха носом + длинный выдох ртом',
    description:
      'Самый быстрый способ сбить возбуждение нервной системы. Эффект приходит за 30–60 секунд. Подходит когда нет минуты сесть.',
    source: 'Huberman / Balban et al., Cell Reports Medicine 2023',
    durationLabel: '30–60 секунд',
    config: { kind: 'sigh', cycles: 3 },
  },

  'relax-4-7-8': {
    id: 'relax-4-7-8',
    category: 'anxiety',
    isPrimary: false,
    name: '4-7-8 расслабление',
    tagline: 'Вдох 4 · задержка 7 · выдох ртом 8',
    description:
      'Удлинённый выдох с задержкой тормозит симпатическую активацию. Подходит когда есть пара минут и можно закрыть глаза.',
    source: 'Andrew Weil',
    durationLabel: '~1.5 мин',
    config: {
      kind: 'box',
      pattern: [4, 7, 8, 0],
      cycles: 4,
      mouthExhale: true,
    },
  },

  'sleep-4-7-8': {
    id: 'sleep-4-7-8',
    category: 'sleep',
    isPrimary: true,
    name: '4-7-8 на засыпание',
    tagline: 'Вдох 4 · задержка 7 · выдох ртом 8',
    description:
      'Та же техника, но 8 циклов лёжа на спине. Удлинённый выдох тормозит нервную систему и помогает уснуть.',
    durationLabel: '~3 мин',
    config: {
      kind: 'box',
      pattern: [4, 7, 8, 0],
      cycles: 8,
      mouthExhale: true,
    },
  },

  'coherent-4-8': {
    id: 'coherent-4-8',
    category: 'sleep',
    isPrimary: false,
    name: 'Резонансное 4/8',
    tagline: 'Вдох 4 · выдох 8, ровно носом',
    description:
      'Без задержек, монотонно как метроном. Удлинённый выдох усиливает парасимпатику. Хорошо если 4-7-8 неудобно.',
    durationLabel: '5–10 мин',
    config: { kind: 'box', pattern: [4, 0, 8, 0], cycles: 30 },
  },

  'box-4-4-4-4': {
    id: 'box-4-4-4-4',
    category: 'focus',
    isPrimary: true,
    name: 'Box Breathing 4-4-4-4',
    tagline: 'Вдох 4 · задержка 4 · выдох 4 · задержка 4',
    description:
      '«Квадратное дыхание» из подготовки спецназа. Даёт спокойный фокус. 2–5 минут перед сложной задачей.',
    durationLabel: '~2 мин',
    config: { kind: 'box', pattern: [4, 4, 4, 4], cycles: 8 },
  },

  'coherent-6-6': {
    id: 'coherent-6-6',
    category: 'focus',
    isPrimary: false,
    name: 'Когерентное 6/6',
    tagline: 'Вдох 6 · выдох 6, ~6 дыханий/мин',
    description:
      'Медленное ровное дыхание носом без задержек. Хорошо идёт фоном на длинных рабочих сессиях.',
    durationLabel: '5+ мин',
    config: { kind: 'box', pattern: [6, 0, 6, 0], cycles: 30 },
  },

  'wim-hof': {
    id: 'wim-hof',
    category: 'energy',
    isPrimary: true,
    name: 'Метод Вим Хофа',
    tagline: '3 раунда · 30 быстрых дыханий · задержка',
    description:
      '30 глубоких вдохов + пассивных выдохов, потом задержка на пустых лёгких, потом восстановительный вдох и 15 секунд задержки. Заменяет утренний кофе.',
    source: 'Wim Hof Method',
    durationLabel: '5–7 мин',
    config: {
      kind: 'wim-hof',
      rounds: 3,
      breathsPerRound: 30,
      breathCycleSec: 1.8,
      recoveryHoldSec: 15,
    },
  },

  diaphragmatic: {
    id: 'diaphragmatic',
    category: 'anxiety',
    isPrimary: false,
    name: 'Диафрагмальное дыхание',
    tagline: 'Дышим животом, всё глубже от стадии к стадии',
    description:
      'Медленное брюшное дыхание. Рука на животе — он расширяется на вдохе, опускается на выдохе. Грудь почти не двигается. Каждая стадия — чуть глубже предыдущей.',
    durationLabel: '4–5 мин',
    config: {
      kind: 'deepening',
      stages: [
        {
          pattern: [4, 1, 5, 0],
          cycles: 3,
          label: 'Привыкаем',
          hint: 'Положите руку на живот. Дышите медленно носом.',
        },
        {
          pattern: [5, 1, 7, 0],
          cycles: 3,
          label: 'Глубже',
          hint: 'Чувствуйте, как живот поднимается выше на вдохе.',
        },
        {
          pattern: [6, 2, 9, 0],
          cycles: 4,
          label: 'Ещё глубже',
          hint: 'Выдох длиннее вдоха. Не торопитесь.',
        },
        {
          pattern: [7, 2, 11, 0],
          cycles: 4,
          label: 'Самое глубокое',
          hint: 'Полное брюшное дыхание. Тело тяжелеет.',
        },
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

export function techniquesByCategory(
  category: TechniqueCategory,
): BreathingTechnique[] {
  return TECHNIQUES_LIST.filter((t) => t.category === category).sort(
    (a, b) => Number(b.isPrimary) - Number(a.isPrimary),
  );
}
