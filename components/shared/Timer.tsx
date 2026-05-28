'use client';

import { formatTime } from '@/lib/utils';

type Props = {
  remainingSec: number;
};

export function Timer({ remainingSec }: Props) {
  return (
    <span className="font-mono text-text-secondary tabular-nums">
      {formatTime(remainingSec)}
    </span>
  );
}
