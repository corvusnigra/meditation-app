'use client';

import type { ReactNode } from 'react';
import { HapticButton } from '@/components/shared/HapticButton';

type Props = {
  title: string;
  counter?: ReactNode;
  // ✕ не уводит со страницы сразу: открывает паузу, где есть выход.
  onClose: () => void;
};

export function PracticeHeader({ title, counter, onClose }: Props) {
  return (
    <div className="flex items-center gap-3">
      <HapticButton
        variant="pill"
        size="icon"
        className="shrink-0"
        aria-label="Пауза и выход"
        onClick={onClose}
      >
        <span aria-hidden>✕</span>
      </HapticButton>
      <span className="min-w-0 flex-1 truncate text-xs uppercase tracking-wider text-text-secondary">
        {title}
      </span>
      {counter && (
        <span className="shrink-0 text-right text-sm text-text-secondary">{counter}</span>
      )}
    </div>
  );
}
