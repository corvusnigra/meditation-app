'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { PageShell } from '@/components/shared/PageShell';
import { HapticButton } from '@/components/shared/HapticButton';
import { useStagedTimer } from '@/hooks/useStagedTimer';
import { useHaptics } from '@/hooks/useHaptics';
import { useWakeLock } from '@/hooks/useWakeLock';
import { useSettings } from '@/context/SettingsContext';
import { useHistory } from '@/context/HistoryContext';
import { useProgressionContext } from '@/context/ProgressionContext';
import { ensureAudio, startAmbient, stopAmbient } from '@/lib/breathing-audio';
import type { BreathingTechnique, BodyScanTechniqueConfig } from '@/lib/types';
import { randomId, cn } from '@/lib/utils';

type Props = { technique: BreathingTechnique };

export function BodyScanSession({ technique }: Props) {
  const router = useRouter();
  const { settings } = useSettings();
  const { add } = useHistory();
  const { state: progression } = useProgressionContext();
  const haptics = useHaptics(settings.hapticsEnabled);

  const config = technique.config as BodyScanTechniqueConfig;
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const startedAtRef = useRef<number | null>(null);

  useWakeLock(started && !completed);

  const handleComplete = () => {
    if (completed) return;
    setCompleted(true);
    stopAmbient();
    add({
      id: randomId(),
      date: new Date().toISOString(),
      scenario: 'custom',
      gratitudeText: '',
      durationMs: startedAtRef.current ? Date.now() - startedAtRef.current : 0,
      completedPhases: ['breathing'],
      level: progression.currentLevel,
      kind: 'technique',
      techniqueId: technique.id,
      techniqueName: technique.name,
    });
    haptics('success');
  };

  const { index, secondsInStage, stageDuration, totalProgress, goNext } =
    useStagedTimer({
      durations: config.areas.map(() => config.secondsPerArea),
      active: started && !completed,
      onStageChange: () => haptics('transition'),
      onComplete: handleComplete,
    });

  const area = config.areas[index];
  const stageProgress =
    stageDuration > 0 ? Math.min(secondsInStage / stageDuration, 1) : 0;

  if (!started) {
    return (
      <PageShell>
        <div className="flex items-baseline justify-between mb-6 text-xs">
          <Link
            href="/techniques"
            className="text-text-secondary hover:text-text-primary"
          >
            ← Техники
          </Link>
          <span className="uppercase tracking-widest text-text-secondary">
            {technique.name}
          </span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-5 py-6">
          <div className="text-6xl" aria-hidden>🧘</div>
          <div className="space-y-2">
            <h1 className="text-2xl font-medium">{technique.name}</h1>
            <p className="text-text-secondary text-sm max-w-xs mx-auto">
              {technique.description}
            </p>
          </div>
          <div className="rounded-2xl bg-bg-card/60 border border-white/5 p-4 text-left text-sm space-y-1.5 max-w-xs w-full">
            <p>
              <span className="text-text-secondary">·</span> Сядьте или лягте удобно,
              можно закрыть глаза
            </p>
            <p>
              <span className="text-text-secondary">·</span> {config.areas.length}{' '}
              областей от макушки до стоп, ~{config.secondsPerArea} секунд на каждую
            </p>
            <p>
              <span className="text-text-secondary">·</span> Ничего не меняйте —
              просто замечайте ощущения
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 pb-6">
          <HapticButton
            size="lg"
            haptic="success"
            onClick={async () => {
              if (settings.ambientEnabled) {
                const ok = await ensureAudio(
                  settings.ambientPreset,
                  settings.ambientVolume,
                );
                if (ok) startAmbient(settings.ambientPreset, settings.ambientVolume);
              }
              startedAtRef.current = Date.now();
              setStarted(true);
            }}
          >
            Начать
          </HapticButton>
        </div>
      </PageShell>
    );
  }

  if (completed) {
    return (
      <PageShell>
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-6 py-10">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="w-20 h-20 rounded-full bg-success/20 border border-success flex items-center justify-center"
          >
            <span className="text-success text-3xl" aria-hidden>✓</span>
          </motion.div>
          <div>
            <h1 className="text-2xl font-medium mb-2">Готово</h1>
            <p className="text-text-secondary text-sm">
              Всё тело пройдено. Задержитесь в этом состоянии ещё на пару вдохов.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 pb-6">
          <Link href="/" className="block">
            <HapticButton size="lg" className="w-full">
              На главную
            </HapticButton>
          </Link>
          <Link href="/techniques" className="block">
            <HapticButton variant="ghost" className="w-full">
              Другая техника
            </HapticButton>
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="space-y-3">
        <div className="flex items-baseline justify-between text-xs">
          <Link
            href="/techniques"
            className="text-text-secondary hover:text-text-primary"
          >
            ← Техники
          </Link>
          <span className="uppercase tracking-widest text-text-secondary">
            {index + 1} / {config.areas.length}
          </span>
        </div>
        <div className="h-1 w-full rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full bg-accent-grounding/70"
            style={{
              width: `${totalProgress * 100}%`,
              transition: 'width 0.4s ease-out',
            }}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        <div className="relative flex items-center justify-center" aria-hidden>
          <motion.div
            className="absolute rounded-full bg-accent-grounding/10"
            animate={{ scale: [1, 1.18, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            style={{ width: 220, height: 220 }}
          />
          <div
            className="relative rounded-full bg-gradient-to-br from-accent-grounding/50 to-accent-grounding/15"
            style={{ width: 160, height: 160 }}
          />
          <svg
            className="absolute"
            width={176}
            height={176}
            viewBox="0 0 176 176"
          >
            <circle
              cx="88"
              cy="88"
              r="84"
              fill="none"
              stroke="rgba(124, 140, 248, 0.5)"
              strokeWidth="2"
              strokeDasharray={`${stageProgress * 528} 528`}
              strokeLinecap="round"
              transform="rotate(-90 88 88)"
            />
          </svg>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="text-center px-4"
            aria-live="polite"
          >
            <p className="text-xl sm:text-2xl font-medium mb-2">{area?.label}</p>
            <p className="text-sm text-text-secondary leading-relaxed max-w-xs mx-auto">
              {area?.prompt}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-center gap-3 pb-6">
        <HapticButton variant="ghost" size="sm" onClick={goNext}>
          Дальше
        </HapticButton>
        <HapticButton variant="subtle" size="sm" onClick={handleComplete}>
          Завершить
        </HapticButton>
      </div>
    </PageShell>
  );
}
