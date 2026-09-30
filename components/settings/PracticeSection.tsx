'use client';

import { useState } from 'react';
import { HapticButton } from '@/components/shared/HapticButton';
import { DurationSliders } from '@/components/progression/DurationSliders';
import { useProgressionContext } from '@/context/ProgressionContext';
import { LEVEL_DURATIONS, LEVEL_LABEL } from '@/lib/constants';
import type { CustomDurations } from '@/lib/types';
import { ConfirmPrompt, SettingsRow, SettingsSection } from './SettingsParts';

export function PracticeSection() {
  const { state: progression, resetLevel, setCustomDurations } = useProgressionContext();
  const [confirmingReset, setConfirmingReset] = useState(false);

  const customDurations: CustomDurations =
    progression.customDurations ?? {
      breathing: LEVEL_DURATIONS[3].breathing,
      grounding: LEVEL_DURATIONS[3].grounding,
      gratitude: LEVEL_DURATIONS[3].gratitude,
    };

  return (
    <SettingsSection title="Практика">
      {confirmingReset ? (
        <ConfirmPrompt
          question={`Вернуть уровень 1 — ${LEVEL_LABEL[1]}? История и серия сохранятся.`}
          confirmLabel="Да, сбросить"
          onConfirm={() => {
            resetLevel();
            setConfirmingReset(false);
          }}
          onCancel={() => setConfirmingReset(false)}
        />
      ) : (
        <SettingsRow
          label="Текущий уровень"
          help={`Уровень ${progression.currentLevel} — ${LEVEL_LABEL[progression.currentLevel]}`}
          control={
            <HapticButton
              variant="ghost"
              size="sm"
              className="shrink-0"
              disabled={progression.currentLevel === 1}
              onClick={() => setConfirmingReset(true)}
            >
              Сбросить
            </HapticButton>
          }
        />
      )}
      {progression.currentLevel === 4 && (
        <DurationSliders
          durations={customDurations}
          onChange={(d) => setCustomDurations(d)}
        />
      )}
    </SettingsSection>
  );
}
