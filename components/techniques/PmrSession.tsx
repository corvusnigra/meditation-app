'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PageShell } from '@/components/shared/PageShell';
import { HapticButton } from '@/components/shared/HapticButton';
import { useStagedTimer } from '@/hooks/useStagedTimer';
import { useHaptics } from '@/hooks/useHaptics';
import { useWakeLock } from '@/hooks/useWakeLock';
import { useSettings } from '@/context/SettingsContext';
import { useHistory } from '@/context/HistoryContext';
import { useProgressionContext } from '@/context/ProgressionContext';
import type { BreathingTechnique, PmrTechniqueConfig } from '@/lib/types';
import { randomId, cn } from '@/lib/utils';

type Props = { technique: BreathingTechnique };

export function PmrSession({ technique }: Props) {
  const router = useRouter();
  const { settings } = useSettings();
  const { add } = useHistory();
  const { state: progression } = useProgressionContext();
  const haptics = useHaptics(settings.hapticsEnabled);

  const config = technique.config as PmrTechniqueConfig;
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const startedAtRef = useRef<number | null>(null);

  useWakeLock(started && !completed);

  // Этапы: [напряжение, расслабление] × каждая группа.
  const durations = useMemo(
    () => config.groups.flatMap(() => [config.tenseSec, config.releaseSec]),
    [config],
  );

  const handleComplete = () => {
    if (completed) return;
    setCompleted(true);
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

  const { index, secondsInStage, stageDuration } = useStagedTimer({
    durations,
    active: started && !completed,
    onStageChange: (i) => {
      haptics(i % 2 === 0 ? 'tense' : 'release');
    },
    onComplete: handleComplete,
  });

  const groupIndex = Math.floor(index / 2);
  const isTense = index % 2 === 0;
  const group = config.groups[groupIndex];
  const remaining = Math.max(Math.ceil(stageDuration - secondsInStage), 1);

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
          <div className="text-6xl" aria-hidden>💪</div>
          <div className="space-y-2">
            <h1 className="text-2xl font-medium">{technique.name}</h1>
            <p className="text-text-secondary text-sm max-w-xs mx-auto">
              {technique.description}
            </p>
          </div>
          <div className="rounded-2xl bg-bg-card/60 border border-white/5 p-4 text-left text-sm space-y-1.5 max-w-xs w-full">
            <p>
              <span className="text-text-secondary">1.</span> Напрягаете группу мышц{' '}
              {config.tenseSec} секунд — сильно, но без боли
            </p>
            <p>
              <span className="text-text-secondary">2.</span> Резко отпускаете и{' '}
              {config.releaseSec} секунд чувствуете разницу
            </p>
            <p className="text-xs text-text-secondary pt-2">
              {config.groups.length} групп: {config.groups.map((g) => g.label.toLowerCase()).join(', ')}.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 pb-6">
          <HapticButton
            size="lg"
            haptic="success"
            onClick={() => {
              startedAtRef.current = Date.now();
              setStarted(true);
              haptics('tense');
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
              {config.groups.length} групп мышц · заметьте, каким тяжёлым стало тело
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
            {groupIndex + 1} / {config.groups.length}
          </span>
        </div>
        <div className="flex gap-1.5">
          {config.groups.map((_, i) => (
            <div
              key={i}
              className={cn(
                'flex-1 h-1 rounded-full',
                i < groupIndex
                  ? 'bg-accent-streak'
                  : i === groupIndex
                    ? 'bg-accent-streak/60'
                    : 'bg-white/10',
              )}
            />
          ))}
        </div>
      </div>

      <motion.div
        className="flex-1 flex flex-col items-center justify-center gap-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative flex items-center justify-center">
          <motion.div
            className={cn(
              'rounded-full',
              isTense
                ? 'bg-gradient-to-br from-accent-streak/80 to-accent-streak/30'
                : 'bg-gradient-to-br from-accent-breathing/60 to-accent-breathing/20',
            )}
            animate={{
              scale: isTense ? 1 : 0.7,
              boxShadow: isTense
                ? '0 0 90px -8px rgba(224, 122, 95, 0.6)'
                : '0 0 60px -12px rgba(78, 205, 196, 0.4)',
            }}
            transition={{ duration: isTense ? 0.5 : 1.6, ease: 'easeOut' }}
            style={{ width: 180, height: 180 }}
          />
        </div>

        <div className="text-center px-4">
          <p
            className={cn(
              'text-xs uppercase tracking-[0.25em] mb-2',
              isTense ? 'text-accent-streak' : 'text-accent-breathing',
            )}
          >
            {isTense ? 'Напрягите' : 'Отпустите'}
          </p>
          <p className="text-xl sm:text-2xl font-medium">{group?.label}</p>
          <p className="text-sm text-text-secondary mt-2 max-w-xs mx-auto">
            {isTense
              ? group?.instruction
              : 'Резко отпустите. Почувствуйте, как тепло разливается по мышцам.'}
          </p>
          <p
            className={cn(
              'mt-4 text-4xl font-light tabular-nums',
              isTense ? 'text-accent-streak' : 'text-accent-breathing',
            )}
          >
            {remaining}
          </p>
        </div>
      </motion.div>

      <div className="flex justify-center gap-3 pb-6">
        <HapticButton variant="subtle" size="sm" onClick={handleComplete}>
          Завершить
        </HapticButton>
        <HapticButton
          variant="ghost"
          size="sm"
          onClick={() => router.push('/')}
        >
          На главную
        </HapticButton>
      </div>
    </PageShell>
  );
}
