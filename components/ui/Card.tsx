import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-3xl bg-bg-card/80 backdrop-blur-md border border-white/5 p-6',
        className,
      )}
      {...rest}
    />
  );
}
