'use client';

import { useRef } from 'react';
import { useClockTick, type PracticeClock } from '@/hooks/usePracticeClock';
import { cn } from '@/lib/utils';

type Props = {
  clock: PracticeClock;
  totalSec: number;
  className?: string;
};

// Заливка полосы по часам практики: ширина меняется через transform напрямую
// в DOM, без перерисовки React и без пересчёта вёрстки.
export function ProgressFill({ clock, totalSec, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useClockTick(clock, () => {
    const progress = totalSec > 0 ? Math.min(clock.now() / 1000 / totalSec, 1) : 0;
    if (ref.current) ref.current.style.transform = `scaleX(${progress})`;
  });

  return (
    <div
      ref={ref}
      className={cn('h-full w-full origin-left transition-transform duration-100 ease-linear', className)}
      style={{ transform: 'scaleX(0)' }}
    />
  );
}
