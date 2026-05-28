'use client';

import { cn } from '@/lib/utils';

type Props = {
  total: number;
  current: number;
};

export function GroundingProgress({ total, current }: Props) {
  return (
    <div className="flex gap-2 justify-center" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={current}>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn(
            'w-2 h-2 rounded-full transition-colors duration-300',
            i <= current ? 'bg-accent-grounding' : 'bg-white/15',
          )}
        />
      ))}
    </div>
  );
}
