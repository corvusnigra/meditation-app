'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'ghost' | 'subtle' | 'pill';
type Size = 'sm' | 'md' | 'lg';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

const VARIANT: Record<Variant, string> = {
  primary:
    'bg-accent-breathing text-bg-primary hover:brightness-110 active:scale-[0.98] shadow-glow',
  ghost:
    'bg-transparent text-text-primary border border-white/10 hover:bg-white/5 active:scale-[0.98]',
  subtle:
    'bg-white/5 text-text-primary hover:bg-white/10 active:scale-[0.98]',
  pill:
    'bg-white/5 text-text-secondary hover:text-text-primary hover:bg-white/10 active:scale-[0.98]',
};

const SIZE: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-full',
  md: 'px-5 py-2.5 text-base rounded-full',
  lg: 'px-8 py-4 text-lg rounded-full',
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = 'primary', size = 'md', className, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        'font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed select-none',
        VARIANT[variant],
        SIZE[size],
        className,
      )}
      {...rest}
    />
  );
});
