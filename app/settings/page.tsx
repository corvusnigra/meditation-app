'use client';

import Link from 'next/link';
import { useState } from 'react';
import { PageShell } from '@/components/shared/PageShell';
import { HapticButton } from '@/components/shared/HapticButton';
import { DurationSliders } from '@/components/progression/DurationSliders';
import { useSettings } from '@/context/SettingsContext';
import { useHistory } from '@/context/HistoryContext';
import { useProgressionContext } from '@/context/ProgressionContext';
import { AMBIENT_DESCRIPTION, AMBIENT_LABEL } from '@/lib/audio-presets';
import type { AmbientPreset, CustomDurations, ThemeMode } from '@/lib/types';
import { LEVEL_DURATIONS, LEVEL_LABEL } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { clearAllStorage } from '@/lib/storage';
import { ensureAudio, startAmbient, stopAmbient, onBreathPhase, setVolume, setEntrainment } from '@/lib/breathing-audio';
import { RITUAL_ENTRAINMENT_HZ } from '@/lib/entrainment';

const PRESETS: AmbientPreset[] = ['ocean', 'forest', 'night', 'silence'];
const THEMES: { value: ThemeMode; label: string }[] = [
  { value: 'dark', label: 'Тёмная' },
  { value: 'light', label: 'Светлая' },
  { value: 'auto', label: 'Авто' },
];

export default function SettingsPage() {
  const { settings, update, reset } = useSettings();
  const { clear: clearHistory } = useHistory();
  const { state: progression, resetLevel, setCustomDurations } = useProgressionContext();
  const [confirmingReset, setConfirmingReset] = useState(false);

  const customDurations: CustomDurations =
    progression.customDurations ?? {
      breathing: LEVEL_DURATIONS[3].breathing,
      grounding: LEVEL_DURATIONS[3].grounding,
      gratitude: LEVEL_DURATIONS[3].gratitude,
    };

  const handleReset = () => {
    clearAllStorage();
    clearHistory();
    reset();
    resetLevel();
    setConfirmingReset(false);
  };

  const handleAmbientToggle = async (v: boolean) => {
    update({ ambientEnabled: v });
    if (v) {
      const ok = await ensureAudio(settings.ambientPreset, settings.ambientVolume);
      if (ok) {
        startAmbient(settings.ambientPreset, settings.ambientVolume);
        onBreathPhase('inhale');
      }
    } else {
      stopAmbient();
    }
  };

  const handleEntrainmentToggle = async (v: boolean) => {
    update({ entrainmentEnabled: v });
    if (v) {
      const ok = await ensureAudio(settings.ambientPreset, settings.ambientVolume);
      if (ok) {
        startAmbient(settings.ambientPreset, settings.ambientVolume);
        // Превью на альфа-ритме (как в спокойных практиках).
        setEntrainment(true, RITUAL_ENTRAINMENT_HZ);
      }
    } else {
      setEntrainment(false, RITUAL_ENTRAINMENT_HZ);
      if (!settings.ambientEnabled) stopAmbient();
    }
  };

  const handlePresetChange = async (p: typeof settings.ambientPreset) => {
    update({ ambientPreset: p });
    if (settings.ambientEnabled) {
      const ok = await ensureAudio(p, settings.ambientVolume);
      if (ok) {
        startAmbient(p, settings.ambientVolume);
        onBreathPhase('inhale');
      }
    }
  };

  return (
    <PageShell>
      <header className="flex items-center justify-between mb-6 text-sm">
        <Link href="/" className="text-text-secondary hover:text-text-primary transition-colors">
          ← Главная
        </Link>
        <span className="text-text-secondary">Настройки</span>
      </header>

      <Section title="Звук и ambient">
        <Row
          label="Ambient звук"
          help="Генеративный фоновый звук в ритме дыхания. Включите, чтобы услышать."
          control={
            <Toggle
              on={settings.ambientEnabled}
              onChange={(v) => void handleAmbientToggle(v)}
            />
          }
        />
        <div className="grid grid-cols-2 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => void handlePresetChange(p)}
              disabled={!settings.ambientEnabled}
              className={cn(
                'rounded-2xl px-3 py-2 text-left text-sm border transition-colors disabled:opacity-40',
                settings.ambientPreset === p
                  ? 'border-accent-breathing/60 bg-accent-breathing/10'
                  : 'border-white/5 bg-white/[0.03] hover:bg-white/[0.06]',
              )}
            >
              <div className="font-medium">{AMBIENT_LABEL[p]}</div>
              <div className="text-[11px] text-text-secondary mt-0.5">
                {AMBIENT_DESCRIPTION[p]}
              </div>
            </button>
          ))}
        </div>
        <Row
          label="Громкость"
          control={
            <input
              type="range"
              className="mm-slider w-32"
              min={0}
              max={1}
              step={0.05}
              value={settings.ambientVolume}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                update({ ambientVolume: v });
                if (settings.ambientEnabled) setVolume(v);
              }}
              disabled={!settings.ambientEnabled}
            />
          }
        />
        <Row
          label="Вибрация"
          help="Лёгкая обратная связь на переходах фаз."
          control={
            <Toggle
              on={settings.hapticsEnabled}
              onChange={(v) => update({ hapticsEnabled: v })}
            />
          }
        />
        <Row
          label="Вибро-гид дыхания"
          help="Различимые вибрации фаз: вдох — длинная, выдох — две длинные, задержки — короткие. Практика с телефоном в руке или кармане, не глядя на экран. Только Android."
          control={
            <Toggle
              on={settings.hapticGuideEnabled}
              onChange={(v) => update({ hapticGuideEnabled: v })}
            />
          }
        />
        <Row
          label="Звуковой ритм"
          help="Громкость звука мягко пульсирует на частоте, подобранной под практику (фокус, спокойствие, сон), помогая мозгу настроиться. Работает через динамики, в наушниках чуть заметнее."
          control={
            <Toggle
              on={settings.entrainmentEnabled}
              onChange={(v) => void handleEntrainmentToggle(v)}
            />
          }
        />
      </Section>

      <Section title="Практика">
        <Row
          label="Текущий уровень"
          help={`Уровень ${progression.currentLevel} — ${LEVEL_LABEL[progression.currentLevel]}`}
          control={
            <HapticButton variant="ghost" size="sm" onClick={resetLevel}>
              Сбросить
            </HapticButton>
          }
        />
        {progression.currentLevel === 4 && (
          <DurationSliders
            durations={customDurations}
            onChange={(d) => setCustomDurations(d)}
          />
        )}
      </Section>

      <Section title="Внешний вид">
        <div className="flex gap-2">
          {THEMES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => update({ theme: t.value })}
              className={cn(
                'flex-1 px-3 py-2 rounded-2xl border text-sm transition-colors',
                settings.theme === t.value
                  ? 'border-accent-breathing/60 bg-accent-breathing/10'
                  : 'border-white/5 bg-white/[0.03] hover:bg-white/[0.06]',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <Row
          label="Уменьшенная анимация"
          help="Минимум движения, статичный круг дыхания."
          control={
            <Toggle
              on={settings.reducedMotion}
              onChange={(v) => update({ reducedMotion: v })}
            />
          }
        />
      </Section>

      <Section title="Данные">
        {confirmingReset ? (
          <div className="space-y-2">
            <p className="text-sm text-text-secondary">
              Удалит все сессии, настройки, уровень. Действие необратимо.
            </p>
            <div className="flex gap-2">
              <HapticButton variant="primary" size="sm" onClick={handleReset}>
                Да, удалить
              </HapticButton>
              <HapticButton
                variant="ghost"
                size="sm"
                onClick={() => setConfirmingReset(false)}
              >
                Отмена
              </HapticButton>
            </div>
          </div>
        ) : (
          <HapticButton
            variant="ghost"
            size="sm"
            onClick={() => setConfirmingReset(true)}
          >
            Сбросить данные
          </HapticButton>
        )}
      </Section>

      <p className="text-xs text-text-secondary text-center pb-6">
        Данные хранятся только в этом браузере.
      </p>
    </PageShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-7">
      <h2 className="text-xs uppercase tracking-widest text-text-secondary mb-3">
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Row({
  label,
  help,
  control,
}: {
  label: string;
  help?: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <div className="text-sm">{label}</div>
        {help && <div className="text-xs text-text-secondary mt-0.5">{help}</div>}
      </div>
      {control}
    </div>
  );
}

function Toggle({
  on,
  onChange,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="mm-toggle"
      data-on={on}
    />
  );
}
