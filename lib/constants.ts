import type {
  LevelDurations,
  ProgressionLevel,
  Scenario,
  UserSettings,
} from './types';

// version/draft — легаси-ключи ранних версий; остаются в списке,
// чтобы clearAllStorage вычищал их у старых пользователей.
export const STORAGE_KEYS = {
  sessions: 'mm:sessions',
  settings: 'mm:settings',
  version: 'mm:version',
  draft: 'mm:draft',
  progression: 'mm:progression',
  techniqueLevels: 'mm:techniqueLevels',
} as const;

export const LEVEL_DURATIONS: Record<ProgressionLevel, LevelDurations> = {
  1: { breathing: 120, grounding: 120, gratitude: 60, total: 300 },
  2: { breathing: 180, grounding: 150, gratitude: 90, total: 420 },
  3: { breathing: 240, grounding: 210, gratitude: 150, total: 600 },
  4: { breathing: 0, grounding: 0, gratitude: 0, total: 0 },
};

export const LEVEL_STREAK_THRESHOLD: Record<ProgressionLevel, number> = {
  1: 0,
  2: 7,
  3: 14,
  4: 28,
};

export const LEVEL_LABEL: Record<ProgressionLevel, string> = {
  1: 'Начало',
  2: 'Привычка',
  3: 'Углубление',
  4: 'Мастерство',
};

export const DEFAULT_BREATHING_PATTERN: [number, number, number, number] = [4, 4, 4, 4];

export const DEFAULT_SETTINGS: UserSettings = {
  soundEnabled: true,
  ambientEnabled: false,
  ambientPreset: 'ocean',
  ambientVolume: 0.5,
  hapticsEnabled: true,
  hapticGuideEnabled: false,
  entrainmentEnabled: false,
  theme: 'dark',
  breathingPattern: DEFAULT_BREATHING_PATTERN,
  reducedMotion: false,
};

export const GROUNDING_SENSES: Array<{
  count: number;
  icon: string;
  label: string;
  prompts: Record<Scenario, string>;
}> = [
  {
    count: 5,
    icon: '👁',
    label: 'Увидьте',
    prompts: {
      morning: 'Назовите 5 вещей, которые видите. Текстура одеяла, свет из окна...',
      commute: 'Назовите 5 вещей, которые видите. Движение за окном, лица людей...',
      sunset: 'Назовите 5 вещей, которые видите. Экран монитора, ручка на столе...',
      custom: 'Назовите 5 вещей, которые видите прямо сейчас.',
    },
  },
  {
    count: 4,
    icon: '🤚',
    label: 'Почувствуйте',
    prompts: {
      morning: 'Отметьте 4 ощущения. Тепло простыни, прохлада воздуха...',
      commute: 'Отметьте 4 ощущения. Вибрация сиденья, ткань одежды...',
      sunset: 'Отметьте 4 ощущения. Спинка стула, температура клавиатуры...',
      custom: 'Отметьте 4 тактильных ощущения.',
    },
  },
  {
    count: 3,
    icon: '👂',
    label: 'Услышьте',
    prompts: {
      morning: 'Прислушайтесь к 3 звукам. Тишина дома, отдалённые шаги...',
      commute: 'Прислушайтесь к 3 звукам. Двигатель, разговоры, шуршание...',
      sunset: 'Прислушайтесь к 3 звукам. Вентилятор, клавиатура, голоса...',
      custom: 'Прислушайтесь к 3 звукам вокруг.',
    },
  },
  {
    count: 2,
    icon: '👃',
    label: 'Уловите',
    prompts: {
      morning: 'Различите 2 запаха. Кофе, простыни, утренний воздух...',
      commute: 'Различите 2 запаха. Воздух с улицы, ткань одежды...',
      sunset: 'Различите 2 запаха. Что-то остался от ужина, кожа...',
      custom: 'Попробуйте различить 2 запаха.',
    },
  },
  {
    count: 1,
    icon: '👅',
    label: 'Ощутите',
    prompts: {
      morning: 'Замечаете ли вкус? Зубная паста, чай, остаток сна...',
      commute: 'Замечаете ли вкус? Кофе, жвачка, свежесть воды...',
      sunset: 'Замечаете ли вкус? Усталость, ужин, мятный чай...',
      custom: 'Замечаете ли вкус прямо сейчас?',
    },
  },
];

export const GRATITUDE_PROMPTS: Record<Scenario, string> = {
  morning: 'Вспомните одну конкретную вещь со вчерашнего вечера, за которую вы благодарны.',
  commute: 'Вспомните одну конкретную вещь с сегодняшнего утра — маленькую, но настоящую.',
  sunset: 'Вспомните одну конкретную вещь за этот рабочий день, за которую вы благодарны.',
  custom: 'Вспомните одну конкретную вещь за последние 24 часа, за которую вы благодарны.',
};

export const GRATITUDE_PLACEHOLDER: Record<Scenario, string> = {
  morning: 'Вчера вечером...',
  commute: 'Сегодня утром...',
  sunset: 'За этот день...',
  custom: 'Сегодня...',
};

export const SCENARIO_LABEL: Record<Scenario, string> = {
  morning: 'Утро',
  commute: 'Дорога',
  sunset: 'Конец дня',
  custom: 'Свободно',
};

export const SCENARIO_DESCRIPTION: Record<Scenario, string> = {
  morning: 'Morning Edge — до телефона',
  commute: 'Commute Reset — пауза в движении',
  sunset: 'Digital Sunset — закрыть вкладки',
  custom: 'Без сценария',
};

export const COMPLETION_QUOTES: string[] = [
  'Mental fitness — это не пункт назначения, а практика.',
  'Вы показались на тренировке. Этого достаточно.',
  '5 минут внимания — это уже выбор.',
  'Маленькие шаги меняют нервную систему больше, чем большие планы.',
  'Сегодня вы выбрали себя на пять минут.',
];

export const DECLINE_GRACE_DAYS = 3;
export const STREAK_BREAK_GRACE_DAYS = 3;
