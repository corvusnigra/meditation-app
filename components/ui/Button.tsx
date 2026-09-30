'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'ghost' | 'subtle' | 'pill' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export type ButtonStyle = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
};

const BASE =
  'items-center justify-center gap-2 rounded-full text-center font-medium select-none ' +
  'transition-[color,background-color,border-color,filter,transform] duration-200 ' +
  'active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed';

const VARIANT: Record<ButtonVariant, string> = {
  primary: 'bg-accent-breathing text-bg-primary shadow-glow hover:brightness-110',
  ghost: 'border border-white/10 bg-transparent text-text-primary hover:bg-white/5',
  subtle: 'bg-white/5 text-text-primary hover:bg-white/10',
  pill: 'bg-white/5 text-text-secondary hover:bg-white/10 hover:text-text-primary',
  // Заливка не плотнее 10 %: на 15 % коралловый текст уже читается хуже 4,5:1.
  danger:
    'border border-accent-streak/40 bg-accent-streak/10 text-accent-streak hover:bg-accent-streak/15',
};

// Высота: sm 44, md 48, lg 56, icon 44×44. Задана минимумом — длинная подпись
// переносится на вторую строку, а не обрезается.
const SIZE: Record<ButtonSize, string> = {
  sm: 'min-h-11 px-4 py-2 text-sm',
  md: 'min-h-12 px-5 py-2.5 text-base',
  lg: 'min-h-14 px-8 py-3 text-lg',
  icon: 'h-11 w-11 text-xl',
};

// Один вид для <button> и для ссылок, которые выглядят кнопкой (HapticLink).
export function buttonClass({
  variant = 'primary',
  size = 'md',
  block = false,
}: ButtonStyle = {}): string {
  return cn(block ? 'flex w-full' : 'inline-flex', BASE, VARIANT[variant], SIZE[size]);
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & ButtonStyle;

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant, size, block, className, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(buttonClass({ variant, size, block }), className)}
      {...rest}
    />
  );
});
