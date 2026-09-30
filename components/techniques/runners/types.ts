import type { ComponentType } from 'react';
import type { Tone } from '@/components/ui/tones';
import type { PracticeClock } from '@/hooks/usePracticeClock';
import type { PracticeSignals } from '@/hooks/usePracticeSignals';
import type { BreathingTechnique, PracticeUnit } from '@/lib/types';

export type RunnerProgress = {
  // Сколько единиц практики завершено и какая идёт сейчас (с нуля).
  done: number;
  index: number;
};

// Раннер — только тело практики: круг и подпись. Отсчёт, паузу, выход и запись
// в историю ведёт оболочка.
export type RunnerProps = {
  technique: BreathingTechnique;
  level: number;
  clock: PracticeClock;
  signals: PracticeSignals;
  // false, пока идёт отсчёт перед практикой.
  running: boolean;
  paused: boolean;
  reducedMotion: boolean;
  onProgress: (progress: RunnerProgress) => void;
  onFinish: () => void;
  // Фон замолкает на время этапа — например, на задержке дыхания.
  onQuiet: (quiet: boolean) => void;
};

export type RunnerDef = {
  Runner: ComponentType<RunnerProps>;
  unit: PracticeUnit;
  tone: Tone;
  // Нужен ли практике звуковой фон.
  ambient: boolean;
  // Длительность известна заранее — есть полоса прогресса по времени.
  timed: boolean;
  planned: (technique: BreathingTechnique, level: number) => number;
  steps: (technique: BreathingTechnique, level: number) => string[];
  summary: (technique: BreathingTechnique, level: number) => string;
  doneHint?: string;
  // Предупреждения, которые нужно подтвердить перед стартом; с ними интро
  // не пропускается даже при быстром входе.
  warnings?: string[];
};
