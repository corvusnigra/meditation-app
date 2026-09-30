import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'title'> & {
  selected: boolean;
  title: string;
  description?: string;
};

export function OptionTile({
  selected,
  title,
  description,
  className,
  ...rest
}: Props) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        'min-h-11 rounded-2xl border px-3 py-2 text-left text-sm transition-colors',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        selected
          ? 'border-accent-breathing/60 bg-accent-breathing/10'
          : 'border-white/5 bg-white/[0.03] enabled:hover:bg-white/[0.06]',
        className,
      )}
      {...rest}
    >
      <span className="block font-medium">{title}</span>
      {description && (
        <span className="mt-0.5 block text-xs text-text-secondary">{description}</span>
      )}
    </button>
  );
}
