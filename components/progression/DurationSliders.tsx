'use client';

import type { CustomDurations } from '@/lib/types';
import { clamp } from '@/lib/utils';

type Props = {
  durations: CustomDurations;
  onChange: (d: CustomDurations) => void;
};

const ROWS: Array<{ key: keyof CustomDurations; label: string }> = [
  { key: 'breathing', label: 'Дыхание' },
  { key: 'grounding', label: 'Заземление' },
  { key: 'gratitude', label: 'Благодарность' },
];

export function DurationSliders({ durations, onChange }: Props) {
  return (
    <div className="space-y-5">
      {ROWS.map((row) => {
        const val = durations[row.key];
        const minutes = Math.round(val / 60);
        return (
          <label key={row.key} className="block">
            <div className="flex justify-between text-sm mb-1.5">
              <span>{row.label}</span>
              <span className="text-text-secondary tabular-nums">
                {minutes} мин
              </span>
            </div>
            <input
              type="range"
              className="mm-slider w-full"
              min={60}
              max={300}
              step={30}
              value={val}
              onChange={(e) =>
                onChange({
                  ...durations,
                  [row.key]: clamp(parseInt(e.target.value, 10), 60, 300),
                })
              }
            />
          </label>
        );
      })}
      <p className="text-xs text-text-secondary text-center">
        Минимум 1 мин, максимум 5 мин на каждую фазу.
      </p>
    </div>
  );
}
