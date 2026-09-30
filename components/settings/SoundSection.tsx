'use client';

import { useEffect, useId } from 'react';
import { OptionTile } from '@/components/ui/OptionTile';
import { SwitchRow } from '@/components/ui/Switch';
import { useSettings } from '@/context/SettingsContext';
import { AMBIENT_DESCRIPTION, AMBIENT_LABEL } from '@/lib/audio-presets';
import {
  ensureAudio,
  onBreathPhase,
  playPhaseCue,
  setEntrainment,
  setVolume,
  startAmbient,
  stopAmbient,
} from '@/lib/breathing-audio';
import { RITUAL_ENTRAINMENT_HZ } from '@/lib/entrainment';
import type { AmbientPreset, UserSettings } from '@/lib/types';
import { SettingsSection } from './SettingsParts';

const PRESETS: AmbientPreset[] = ['ocean', 'forest', 'night', 'silence'];

// Превью звучит так, как будет в практике при этих настройках:
// ambient на вдохе и звуковой ритм на альфа-частоте спокойных практик.
async function applyPreview(next: UserSettings): Promise<void> {
  if (!next.ambientEnabled && !next.entrainmentEnabled) {
    stopAmbient();
    return;
  }
  const ready = await ensureAudio(next.ambientPreset, next.ambientVolume);
  if (!ready) return;
  startAmbient(next.ambientPreset, next.ambientVolume);
  setEntrainment(next.entrainmentEnabled, RITUAL_ENTRAINMENT_HZ);
  if (next.ambientEnabled) onBreathPhase('inhale');
}

export function SoundSection() {
  const { settings, update } = useSettings();
  const presetLabelId = useId();
  // Пресет и громкость относятся к обоим слоям звука.
  const soundOn = settings.ambientEnabled || settings.entrainmentEnabled;
  // Громкость действует и на сигнал смены фазы.
  const volumeOn = soundOn || settings.phaseSoundEnabled;

  // Превью не выходит за экран настроек: глушится при уходе и при сворачивании.
  useEffect(() => {
    const silenceWhenHidden = () => {
      if (document.visibilityState === 'hidden') stopAmbient();
    };
    document.addEventListener('visibilitychange', silenceWhenHidden);
    return () => {
      document.removeEventListener('visibilitychange', silenceWhenHidden);
      stopAmbient();
    };
  }, []);

  // Звук выключили не переключателем, а сбросом данных.
  useEffect(() => {
    if (!soundOn) stopAmbient();
  }, [soundOn]);

  const changeSound = (patch: Partial<UserSettings>) => {
    update(patch);
    void applyPreview({ ...settings, ...patch });
  };

  const changePhaseSound = (enabled: boolean) => {
    update({ phaseSoundEnabled: enabled });
    if (!enabled) return;
    void ensureAudio(settings.ambientPreset, settings.ambientVolume).then((ready) => {
      if (ready) playPhaseCue('inhale', 2);
    });
  };

  return (
    <SettingsSection title="Звук и ambient">
      <SwitchRow
        label="Ambient звук"
        help="Генеративный фоновый звук в ритме дыхания. Включите, чтобы услышать."
        checked={settings.ambientEnabled}
        onChange={(v) => changeSound({ ambientEnabled: v })}
      />
      <SwitchRow
        label="Звуковой ритм"
        help="Громкость звука мягко пульсирует на частоте, подобранной под практику (фокус, спокойствие, сон), помогая мозгу настроиться. Работает через динамики, в наушниках чуть заметнее."
        checked={settings.entrainmentEnabled}
        onChange={(v) => changeSound({ entrainmentEnabled: v })}
      />
      <SwitchRow
        label="Звук смены фазы"
        help="Короткий тон на каждой фазе дыхания и на смене этапа — для практики с закрытыми глазами. С ambient звучит всегда."
        checked={settings.phaseSoundEnabled}
        onChange={changePhaseSound}
      />
      <div role="group" aria-labelledby={presetLabelId}>
        <div id={presetLabelId} className="mb-2 text-sm">
          Звучание
        </div>
        <div className="grid grid-cols-4 gap-2">
          {PRESETS.map((preset) => (
            <OptionTile
              key={preset}
              selected={settings.ambientPreset === preset}
              title={AMBIENT_LABEL[preset]}
              disabled={!soundOn}
              onClick={() => changeSound({ ambientPreset: preset })}
              className="px-1 text-center"
            />
          ))}
        </div>
        <p className="mt-2 text-xs text-text-secondary">
          {AMBIENT_DESCRIPTION[settings.ambientPreset]}
        </p>
      </div>
      <label className="flex min-h-11 items-center justify-between gap-4">
        <span className="text-sm">Громкость</span>
        <input
          type="range"
          className="mm-slider w-40"
          min={0}
          max={1}
          step={0.05}
          value={settings.ambientVolume}
          disabled={!volumeOn}
          onChange={(e) => {
            const volume = parseFloat(e.target.value);
            update({ ambientVolume: volume });
            setVolume(volume);
          }}
        />
      </label>
      <SwitchRow
        label="Вибрация"
        help="Лёгкая обратная связь на переходах фаз."
        checked={settings.hapticsEnabled}
        onChange={(v) => update({ hapticsEnabled: v })}
      />
      <SwitchRow
        label="Вибро-гид дыхания"
        help="Различимые вибрации фаз: вдох — длинная, выдох — две длинные, задержки — короткие. Практика с телефоном в руке или кармане, не глядя на экран. Только Android."
        checked={settings.hapticGuideEnabled}
        onChange={(v) => update({ hapticGuideEnabled: v })}
      />
    </SettingsSection>
  );
}
