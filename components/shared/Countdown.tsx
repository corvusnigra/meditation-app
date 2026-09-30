'use client';

import { useLayoutEffect, useState } from 'react';
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

function remainingSec(clock: PracticeClock, endSec: number, min: number): number {
  return Math.max(Math.ceil(endSec - clock.now() / 1000), min);
}

// Остаток времени читает из часов сам и перерисовывается раз в секунду —
// страница практики при этом не обновляется.
export function Countdown({ clock, endSec, format = 'seconds', min = 0, className }: Props) {
  const [value, setValue] = useState(() => remainingSec(clock, endSec, min));

  useClockTick(clock, () => setValue(remainingSec(clock, endSec, min)));
  useLayoutEffect(() => setValue(remainingSec(clock, endSec, min)), [clock, endSec, min]);

  return (
    <span className={className}>{format === 'clock' ? formatTime(value) : value}</span>
  );
}
