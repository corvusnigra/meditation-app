'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PageShell } from '@/components/shared/PageShell';
import { HapticButton } from '@/components/shared/HapticButton';
import { PauseOverlay } from '@/components/shared/PauseOverlay';
import { BreathingGuide } from '@/components/breathing/BreathingGuide';
import { useDeepeningCycle } from '@/hooks/useDeepeningCycle';
import { useBreathingAudio } from '@/hooks/useBreathingAudio';
import { useHaptics, usePhaseHaptics } from '@/hooks/useHaptics';
import { useWakeLock } from '@/hooks/useWakeLock';
import { useSettings } from '@/context/SettingsContext';
import { useHistory } from '@/context/HistoryContext';
import { useProgressionContext } from '@/context/ProgressionContext';
import { ensureAudio } from '@/lib/breathing-audio';
import type {
  BreathingPhase,
  BreathingTechnique,
  DeepeningTechniqueConfig,
} from '@/lib/types';
import { randomId } from '@/lib/utils';
import { cn } from '@/lib/utils';

type Props = { technique: BreathingTechnique };

const PHASE_LABEL: Record<BreathingPhase, string> = {
  inhale: 'Вдох животом',
  holdIn: 'Задержка',
  exhale: 'Длинный выдох',
  holdOut: 'Пауза',
};

const SCALE_FOR_PHASE: Record<BreathingPhase, number> = {
  inhale: 1,
  holdIn: 1,
  exhale: 0.55,
  holdOut: 0.55,
};

export function DeepeningSession({ technique }: Props) {
  const router = useRouter();
  const { settings } = useSettings();
  const { add } = useHistory();
  const { state: progression } = useProgressionContext();
  const haptics = useHaptics(settings.hapticsEnabled);
  const phaseHaptics = usePhaseHaptics(
    settings.hapticGuideEnabled,
    settings.hapticsEnabled,
  );
  const config = technique.config as DeepeningTechniqueConfig;
  const stages = config.stages;

  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showPause, setShowPause] = useState(false);
  const startedAtRef = useRef<number | null>(null);
  const audioReadyRef = useRef(false);

  useWakeLock(started && !completed);

  const audio = useBreathingAudio({
    enabled: settings.ambientEnabled,
    preset: settings.ambientPreset,
    volume: settings.ambientVolume,
    active: started && !completed && !showPause,
  });

  const handleComplete = () => {
    if (completed) return;
    setCompleted(true);
    const durationMs = startedAtRef.current
      ? Date.now() - startedAtRef.current
      : 0;
    add({
      id: randomId(),
      date: new Date().toISOString(),
      scenario: 'custom',
      gratitudeText: '',
      durationMs,
      completedPhases: ['breathing'],
      level: progression.currentLevel,
      kind: 'technique',
      techniqueId: technique.id,
      techniqueName: technique.name,
    });
    haptics('success');
  };

  const {
    phase,
    stageIndex,
    stage,
    secondsInPhase,
    phaseDuration,
    totalCycles,
    cyclesDone,
  } = useDeepeningCycle({
    stages,
    active: started && !completed && !showPause,
    onPhaseChange: (next, dur) => {
      phaseHaptics(next);
      if (settings.ambientEnabled) audio.onPhase(next, dur);
    },
    onComplete: handleComplete,
  });

  useEffect(() => {
    if (started && settings.ambientEnabled && !audioReadyRef.current) {
      audioReadyRef.current = true;
      audio.onPhase('inhale', stages[0]?.pattern[0] ?? 4);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, settings.ambientEnabled]);

  // Размер круга растёт от стадии к стадии — визуальный «deepening».
  const circleSize = 150 + stageIndex * 22;

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
          <div className="text-6xl" aria-hidden>🫁</div>
          <div className="space-y-2">
            <h1 className="text-2xl font-medium">{technique.name}</h1>
            <p className="text-text-secondary text-sm max-w-xs mx-auto">
              {technique.description}
            </p>
          </div>
          <div className="rounded-2xl bg-bg-card/60 border border-white/5 p-4 text-left text-sm space-y-2 max-w-xs w-full">
            <p className="text-xs uppercase tracking-widest text-accent-grounding">
              {stages.length}{' '}
              {stages.length === 1 ? 'стадия' : stages.length < 5 ? 'стадии' : 'стадий'}
            </p>
            {stages.map((s, i) => (
              <p key={i} className="flex justify-between text-text-secondary">
                <span>{i + 1}. {s.label}</span>
                <span className="tabular-nums">
                  {s.pattern[0]}–{s.pattern[1]}–{s.pattern[2]}
                </span>
              </p>
            ))}
            <p className="text-xs text-text-secondary pt-2">
              Положите руку на живот. Дышите так, чтобы поднималась только она, а не грудь.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 pb-6">
          <HapticButton
            size="lg"
            haptic="success"
            onClick={async () => {
              if (settings.ambientEnabled) {
                await ensureAudio(settings.ambientPreset, settings.ambientVolume);
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
              {stages.length}{' '}
              {stages.length === 1 ? 'стадия' : 'стадий'} · {totalCycles} циклов
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
            {technique.name}
          </span>
        </div>
        {/* Стадии — индикаторы */}
        <div className="flex gap-1.5">
          {stages.map((_, i) => (
            <div
              key={i}
              className={cn(
                'flex-1 h-1 rounded-full',
                i < stageIndex
                  ? 'bg-accent-grounding'
                  : i === stageIndex
                    ? 'bg-accent-grounding/60'
                    : 'bg-white/10',
              )}
            />
          ))}
        </div>
        <div className="flex justify-between items-baseline">
          <span className="text-xs uppercase tracking-widest text-accent-grounding">
            {stage.label}
          </span>
          <span className="text-xs text-text-secondary tabular-nums">
            {cyclesDone + 1} / {totalCycles}
          </span>
        </div>
        {stage.hint && (
          <p className="text-xs text-text-secondary leading-relaxed">
            {stage.hint}
          </p>
        )}
      </div>

      <motion.div
        className="flex-1 flex flex-col items-center justify-center gap-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="relative flex items-center justify-center">
          <motion.div
            aria-hidden
            className="absolute rounded-full bg-accent-grounding/15"
            animate={{
              scale: SCALE_FOR_PHASE[phase] * 1.45,
              width: circleSize * 1.4,
              height: circleSize * 1.4,
            }}
            transition={{
              duration: phaseDuration > 0 ? phaseDuration * 0.95 : 0.3,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className={cn(
              'relative rounded-full bg-gradient-to-br from-accent-grounding/80 to-accent-grounding/30',
              'shadow-glow-grounding',
            )}
            animate={{
              scale: SCALE_FOR_PHASE[phase],
              width: circleSize,
              height: circleSize,
            }}
            transition={{
              duration: phaseDuration > 0 ? phaseDuration * 0.95 : 0.3,
              ease: 'easeInOut',
            }}
          />
        </div>
        {phaseDuration > 0 ? (
          <BreathingGuide
            phase={phase}
            secondsInPhase={secondsInPhase}
            phaseDuration={phaseDuration}
          />
        ) : (
          <div className="text-center">
            <p className="text-xl font-medium">{PHASE_LABEL[phase]}</p>
          </div>
        )}
      </motion.div>

      <div className="flex justify-center gap-3 pb-6">
        <HapticButton
          variant="ghost"
          size="md"
          onClick={() => {
            if (showPause) setShowPause(false);
            else setShowPause(true);
          }}
        >
          Пауза
        </HapticButton>
        <HapticButton
          variant="subtle"
          size="md"
          onClick={handleComplete}
        >
          Завершить
        </HapticButton>
      </div>

      <PauseOverlay
        visible={showPause}
        onResume={() => setShowPause(false)}
        onSkip={handleComplete}
        onExit={() => router.push('/techniques')}
      />
    </PageShell>
  );
}
