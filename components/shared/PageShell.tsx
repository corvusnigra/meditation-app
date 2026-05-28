import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

export function PageShell({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <main
      className={cn(
        'mx-auto w-full max-w-md min-h-[100dvh] px-5 py-6 flex flex-col',
        className,
      )}
      {...rest}
    >
      {children}
    </main>
  );
}
