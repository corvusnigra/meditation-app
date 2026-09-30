import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { TONE, type Tone } from './tones';

type Props = HTMLAttributes<HTMLSpanElement> & {
  tone?: Tone;
  variant?: 'outline' | 'soft';
};

// Без tone — нейтральный чип. Индиго и коралл на заливке карточки читаются хуже
// 4,5:1, поэтому для них подходит только outline.
export function Chip({ tone, variant = 'outline', className, ...rest }: Props) {
  const color = tone ? TONE[tone] : null;
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        color ? color.text : 'text-text-secondary',
        variant === 'soft'
          ? cn('border-transparent', color ? color.soft : 'bg-white/5')
          : color
            ? color.border
            : 'border-white/15',
        className,
      )}
      {...rest}
    />
  );
}
