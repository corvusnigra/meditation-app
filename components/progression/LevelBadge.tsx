'use client';

import { LEVEL_LABEL } from '@/lib/constants';
import type { LevelDurations, ProgressionLevel } from '@/lib/types';

type Props = {
  level: ProgressionLevel;
  durations: LevelDurations;
};

export function LevelBadge({ level, durations }: Props) {
  const minutes = Math.round(durations.total / 60);
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 text-xs text-text-secondary">
      <span className="text-text-primary">
        {durations.total > 0 ? `${minutes} мин` : 'Кастом'}
      </span>
      <span aria-hidden>·</span>
      <span>Уровень {level} — {LEVEL_LABEL[level]}</span>
    </div>
  );
}
