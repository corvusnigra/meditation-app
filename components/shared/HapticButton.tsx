'use client';

import Link from 'next/link';
import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ComponentProps,
} from 'react';
import { useSettings } from '@/context/SettingsContext';
import { useHaptics, type HapticPattern } from '@/hooks/useHaptics';
import { Button, buttonClass, type ButtonStyle } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

type Haptic = { haptic?: HapticPattern };

type Props = ButtonHTMLAttributes<HTMLButtonElement> & ButtonStyle & Haptic;

export const HapticButton = forwardRef<HTMLButtonElement, Props>(
  function HapticButton({ haptic = 'tap', onClick, ...rest }, ref) {
    const { settings } = useSettings();
    const vibrate = useHaptics(settings.hapticsEnabled);
    return (
      <Button
        ref={ref}
        onClick={(e) => {
          vibrate(haptic);
          onClick?.(e);
        }}
        {...rest}
      />
    );
  },
);

type LinkProps = ComponentProps<typeof Link> & ButtonStyle & Haptic;

// Переход, который выглядит кнопкой: одна ссылка вместо <Link><button>.
export function HapticLink({
  haptic = 'tap',
  variant,
  size,
  block,
  className,
  onClick,
  ...rest
}: LinkProps) {
  const { settings } = useSettings();
  const vibrate = useHaptics(settings.hapticsEnabled);
  return (
    <Link
      className={cn(buttonClass({ variant, size, block }), className)}
      onClick={(e) => {
        vibrate(haptic);
        onClick?.(e);
      }}
      {...rest}
    />
  );
}
