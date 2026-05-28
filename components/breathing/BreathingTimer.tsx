'use client';

import { formatTime } from '@/lib/utils';

type Props = {
  remainingSec: number;
  totalSec: number;
};

export function BreathingTimer({ remainingSec, totalSec }: Props) {
  const progress = totalSec > 0 ? 1 - remainingSec / totalSec : 0;
  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-xs uppercase tracking-widest text-text-secondary">
          Box Breathing 4–4–4–4
        </span>
        <span className="font-mono text-sm text-text-secondary tabular-nums">
          {formatTime(remainingSec)}
        </span>
      </div>
      <div className="h-[2px] w-full rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full bg-accent-breathing/70"
          style={{ width: `${progress * 100}%`, transition: 'width 0.3s ease-out' }}
        />
      </div>
    </div>
  );
}
