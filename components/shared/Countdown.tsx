'use client';

import { useState } from 'react';
import { useClockTick, type PracticeClock } from '@/hooks/usePracticeClock';
import { formatTime } from '@/lib/utils';

type Props = {
  clock: PracticeClock;
  // Момент на часах практики, до которого идёт отсчёт.
  endSec: number;
  format?: 'seconds' | 'clock';
  // Наименьшее показываемое число: счёт фазы не опускается до нуля.
  min?: number;
  className?: string;
};

// Остаток времени читает из часов сам и перерисовывается раз в секунду —
// страница практики при этом не обновляется.
export function Countdown({ clock, endSec, format = 'seconds', min = 0, className }: Props) {
  const remaining = () => Math.max(Math.ceil(endSec - clock.now() / 1000), min);
  const [value, setValue] = useState(remaining);

  useClockTick(clock, () => setValue(remaining()));

  return (
    <span className={className}>{format === 'clock' ? formatTime(value) : value}</span>
  );
}
