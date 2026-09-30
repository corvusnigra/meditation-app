'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { buttonClass } from '@/components/ui/Button';
import { TONE } from '@/components/ui/tones';
import { useSettings } from '@/context/SettingsContext';
import { vibratePattern } from '@/hooks/useHaptics';
import { ensureAudio, playSignal } from '@/lib/breathing-audio';
import { cn } from '@/lib/utils';

function ToggleChip({
  pressed,
  disabled,
  onClick,
  children,
}: {
  pressed: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  const on = TONE.breathing;
  return (
    <button
      type="button"
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        buttonClass({ variant: 'ghost', size: 'sm' }),
        pressed && cn(on.border, on.soft, on.text),
      )}
    >
      <span aria-hidden>{pressed ? '✓' : '○'}</span>
      {children}
    </button>
  );
}

// Сигналы смены фазы для практики с закрытыми глазами. Стоит рядом с практикой,
// а не только в настройках: у установленных приложений новые значения
// по умолчанию сами не включатся.
export function SignalToggle() {
  const { settings, update } = useSettings();
  const [canVibrate, setCanVibrate] = useState(false);

  useEffect(() => {
    setCanVibrate(typeof navigator.vibrate === 'function');
  }, []);

  const toggleVibro = () => {
    const next = !settings.hapticGuideEnabled;
    update({ hapticGuideEnabled: next });
    if (next) vibratePattern('pulse');
  };

  const toggleSound = () => {
    const next = !settings.phaseSoundEnabled;
    update({ phaseSoundEnabled: next });
    if (!next) return;
    void ensureAudio(settings.ambientPreset, settings.ambientVolume).then((ready) => {
      if (ready) playSignal('count');
    });
  };

  return (
    <div role="group" aria-label="Сигналы смены фазы">
      <p className="mb-2 text-xs text-text-secondary">
        {settings.ambientEnabled
          ? 'Сигналы смены фазы · звук идёт вместе с фоном'
          : 'Сигналы смены фазы'}
      </p>
      <div className="flex justify-center gap-2">
        {canVibrate && (
          <ToggleChip pressed={settings.hapticGuideEnabled} onClick={toggleVibro}>
            Вибро
          </ToggleChip>
        )}
        <ToggleChip
          pressed={settings.phaseSoundEnabled || settings.ambientEnabled}
          disabled={settings.ambientEnabled}
          onClick={toggleSound}
        >
          Звук
        </ToggleChip>
      </div>
    </div>
  );
}
