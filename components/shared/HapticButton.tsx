'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { useHaptics, type HapticPattern } from '@/hooks/useHaptics';
import { Button } from '@/components/ui/Button';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  haptic?: HapticPattern;
  variant?: 'primary' | 'ghost' | 'subtle' | 'pill';
  size?: 'sm' | 'md' | 'lg';
};

export const HapticButton = forwardRef<HTMLButtonElement, Props>(
  function HapticButton(
    { haptic = 'tap', onClick, variant, size, ...rest },
    ref,
  ) {
    const { settings } = useSettings();
    const vibrate = useHaptics(settings.hapticsEnabled);
    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        onClick={(e) => {
          vibrate(haptic);
          onClick?.(e);
        }}
        {...rest}
      />
    );
  },
);
