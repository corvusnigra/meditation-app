import type {
  BoxStep,
  BoxTechniqueConfig,
  BreathingTechnique,
  BreathingTechniqueId,
  TechniqueCategory,
  TechniqueFeedback,
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
      defaultStep: 1,
      ladder: [
        { pattern: [4, 4, 6, 0], cycles: 4 },
        { pattern: [4, 7, 8, 0], cycles: 4 },
        { pattern: [4, 7, 8, 0], cycles: 6 },
        { pattern: [5, 8, 9, 0], cycles: 6 },
      ],
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
      defaultStep: 1,
      ladder: [
        { pattern: [4, 4, 6, 0], cycles: 6 },
        { pattern: [4, 7, 8, 0], cycles: 8 },
        { pattern: [4, 7, 8, 0], cycles: 10 },
        { pattern: [5, 8, 9, 0], cycles: 10 },
      ],
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
    config: {
      kind: 'box',
      pattern: [4, 0, 8, 0],
      cycles: 30,
      defaultStep: 1,
      ladder: [
        { pattern: [4, 0, 6, 0], cycles: 24 },
        { pattern: [4, 0, 8, 0], cycles: 30 },
        { pattern: [4, 0, 10, 0], cycles: 30 },
        { pattern: [5, 0, 11, 0], cycles: 30 },
      ],
    },
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
    tagline: 'Вдох 6 · выдох 6, ~6 дыханий/мин',
    description:
      'Медленное ровное дыхание носом без задержек. Хорошо идёт фоном на длинных рабочих сессиях.',
    durationLabel: '5+ мин',
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

  pmr: {
    id: 'pmr',
    category: 'sleep',
    isPrimary: false,
    name: 'Мышечная релаксация',
    tagline: 'Напрячь 6 секунд — отпустить 12, по группам мышц',
    description:
      'Прогрессивная мышечная релаксация по Джекобсону. Поочерёдно напрягаете и отпускаете группы мышц — тело учится различать напряжение и само сбрасывает его. Одна из самых проверенных техник для сна и тревоги.',
    source: 'Jacobson, 1938; современные протоколы PMR',
    durationLabel: '~2.5 мин',
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

  'body-scan': {
    id: 'body-scan',
    category: 'anxiety',
    isPrimary: false,
    name: 'Сканирование тела',
    tagline: 'Внимание по телу сверху вниз, ~4 минуты',
    description:
      'Медленно проводите вниманием по телу от макушки до стоп, ничего не меняя — только замечая. Ядро программы MBSR: возвращает из мыслей в тело и снижает фоновое напряжение.',
    source: 'Kabat-Zinn, MBSR',
    durationLabel: '~4 мин',
    config: {
      kind: 'bodyscan',
      secondsPerArea: 24,
      areas: [
        { label: 'Макушка и лоб', prompt: 'Заметьте ощущения на коже головы. Лоб расслаблен или нахмурен?' },
        { label: 'Глаза и челюсть', prompt: 'Отпустите глаза. Разожмите зубы, пусть челюсть повиснет.' },
        { label: 'Шея и плечи', prompt: 'Где плечи относительно ушей? Позвольте им опуститься.' },
        { label: 'Руки', prompt: 'Пройдите вниманием от плеч до кончиков пальцев. Тепло, покалывание?' },
        { label: 'Грудь', prompt: 'Почувствуйте, как грудная клетка расширяется с каждым вдохом.' },
        { label: 'Живот', prompt: 'Живот мягкий? Дыхание доходит до него?' },
        { label: 'Спина', prompt: 'Ощутите контакт спины с опорой. Где касание сильнее?' },
        { label: 'Таз и бёдра', prompt: 'Вес тела на сиденье. Просто заметьте давление.' },
        { label: 'Голени', prompt: 'Икры, колени. Есть ли там напряжение, о котором вы не знали?' },
        { label: 'Стопы', prompt: 'Контакт стоп с полом. Пальцы, пятки, свод. Всё тело — единое целое.' },
      ],
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
