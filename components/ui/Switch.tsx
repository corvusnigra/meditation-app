'use client';

import { useId } from 'react';
import { cn } from '@/lib/utils';

type Props = {
  label: string;
  help?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

// Вся строка — label: нажатие по подписи переключает так же, как по самому
// переключателю, а высота строки не меньше 44 px.
export function SwitchRow({ label, help, checked, onChange }: Props) {
  const id = useId();
  const labelId = `${id}-label`;
  const helpId = `${id}-help`;

  return (
    <label className="flex min-h-11 cursor-pointer items-center justify-between gap-4">
      <span className="min-w-0">
        <span id={labelId} className="block text-sm">
          {label}
        </span>
        {help && (
          <span id={helpId} className="mt-0.5 block text-xs text-text-secondary">
            {help}
          </span>
        )}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        aria-describedby={help ? helpId : undefined}
        onClick={() => onChange(!checked)}
        className={cn(
          'tap-target relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200',
          checked ? 'bg-accent-breathing' : 'bg-text-secondary/40',
        )}
      >
        <span
          aria-hidden
          className={cn(
            'absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-text-primary transition-transform duration-200',
            checked && 'translate-x-5',
          )}
        />
      </button>
    </label>
  );
}
