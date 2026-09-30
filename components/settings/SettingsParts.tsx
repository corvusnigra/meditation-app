import type { ReactNode } from 'react';
import { HapticButton } from '@/components/shared/HapticButton';

export function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-7">
      <h2 className="mb-3 text-xs uppercase tracking-wider text-text-secondary">
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export function SettingsRow({
  label,
  help,
  control,
}: {
  label: string;
  help?: string;
  control: ReactNode;
}) {
  return (
    <div className="flex min-h-11 items-center justify-between gap-4">
      <div className="min-w-0">
        <div className="text-sm">{label}</div>
        {help && <div className="mt-0.5 text-xs text-text-secondary">{help}</div>}
      </div>
      {control}
    </div>
  );
}

// Вопрос перед необратимым действием: занимает место строки, из которой вызван.
export function ConfirmPrompt({
  question,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  question: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-text-secondary">{question}</p>
      <div className="flex flex-wrap gap-2">
        <HapticButton variant="danger" size="sm" onClick={onConfirm}>
          {confirmLabel}
        </HapticButton>
        <HapticButton variant="ghost" size="sm" onClick={onCancel}>
          Отмена
        </HapticButton>
      </div>
    </div>
  );
}
