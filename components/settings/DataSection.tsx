'use client';

import { useState } from 'react';
import { HapticButton } from '@/components/shared/HapticButton';
import { useHistory } from '@/context/HistoryContext';
import { useProgressionContext } from '@/context/ProgressionContext';
import { useSettings } from '@/context/SettingsContext';
import { clearAllStorage } from '@/lib/storage';
import { ConfirmPrompt, SettingsSection } from './SettingsParts';

export function DataSection() {
  const { reset: resetSettings } = useSettings();
  const { clear: clearHistory } = useHistory();
  const { resetLevel } = useProgressionContext();
  const [confirmingReset, setConfirmingReset] = useState(false);

  const resetAll = () => {
    clearAllStorage();
    clearHistory();
    resetSettings();
    resetLevel();
    setConfirmingReset(false);
  };

  return (
    <SettingsSection title="Данные">
      {confirmingReset ? (
        <ConfirmPrompt
          question="Удалить все сессии, настройки и уровень? Действие необратимо."
          confirmLabel="Да, удалить"
          onConfirm={resetAll}
          onCancel={() => setConfirmingReset(false)}
        />
      ) : (
        <HapticButton
          variant="ghost"
          size="sm"
          onClick={() => setConfirmingReset(true)}
        >
          Сбросить данные
        </HapticButton>
      )}
      <p className="text-xs text-text-secondary">
        Данные хранятся только в этом браузере.
      </p>
    </SettingsSection>
  );
}
