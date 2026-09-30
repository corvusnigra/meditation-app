import Link from 'next/link';
import type { ComponentProps, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { TONE, type Tone } from './tones';

type CardStyle = {
  tone?: Tone;
  interactive?: boolean;
};

// Без tone — обычная карточка, с tone — акцентная. Отступы задаёт место применения.
export function cardClass({ tone, interactive = false }: CardStyle = {}): string {
  return cn(
    'rounded-2xl border',
    tone ? TONE[tone].card : 'border-white/5 bg-bg-card/60',
    interactive && 'transition-colors',
    interactive && (tone ? TONE[tone].cardHover : 'hover:bg-bg-card/80'),
  );
}

type CardProps = HTMLAttributes<HTMLDivElement> & { tone?: Tone };

export function Card({ tone, className, ...rest }: CardProps) {
  return <div className={cn(cardClass({ tone }), className)} {...rest} />;
}

type CardLinkProps = ComponentProps<typeof Link> & { tone?: Tone };

export function CardLink({ tone, className, ...rest }: CardLinkProps) {
  return (
    <Link
      className={cn('block', cardClass({ tone, interactive: true }), className)}
      {...rest}
    />
  );
}
