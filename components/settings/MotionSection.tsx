'use client';

import { SwitchRow } from '@/components/ui/Switch';
import { useSettings } from '@/context/SettingsContext';
import { SettingsSection } from './SettingsParts';

export function MotionSection() {
  const { settings, reducedMotion, update } = useSettings();
  const followsSystem = settings.motionPref === 'system';

  return (
    <SettingsSection title="Внешний вид">
      <SwitchRow
        label="Уменьшенная анимация"
        help={
          'Минимум движения, статичный круг дыхания.' +
          (followsSystem ? ' Сейчас — как в системе.' : '')
        }
        checked={reducedMotion}
        onChange={(v) => update({ motionPref: v ? 'reduce' : 'full' })}
      />
    </SettingsSection>
  );
}
