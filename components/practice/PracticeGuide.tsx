import type { ReactNode } from 'react';
import { TONE, type Tone } from '@/components/ui/tones';
import { cn } from '@/lib/utils';

type Props = {
  eyebrow?: string;
  label: string;
  hint?: string;
  // Счёт этапа: число или компонент, читающий часы сам.
  value?: ReactNode;
  tone?: Tone;
};

// Подпись под кругом у техник: что делать сейчас и сколько осталось.
export function PracticeGuide({ eyebrow, label, hint, value, tone = 'breathing' }: Props) {
  const color = TONE[tone].text;
  return (
    <div className="px-4 text-center">
      {eyebrow && (
        <p className={cn('mb-2 text-xs uppercase tracking-wider', color)}>{eyebrow}</p>
      )}
      <p className="text-xl font-medium text-text-primary sm:text-2xl">{label}</p>
      {hint && (
        <p className="mx-auto mt-1 min-h-10 max-w-xs text-sm text-text-secondary text-balance">
          {hint}
        </p>
      )}
      {value !== undefined && (
        <p className={cn('mt-2 text-4xl font-light tabular-nums', color)}>{value}</p>
      )}
    </div>
  );
}
