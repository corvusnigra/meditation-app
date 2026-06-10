'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PageShell } from '@/components/shared/PageShell';
import { BreathingCircle } from '@/components/breathing/BreathingCircle';
import { BreathingTimer } from '@/components/breathing/BreathingTimer';
import { BreathingGuide } from '@/components/breathing/BreathingGuide';
import { HapticButton } from '@/components/shared/HapticButton';
import { PauseOverlay } from '@/components/shared/PauseOverlay';
import { useTimer } from '@/hooks/useTimer';
import { useBreathingCycle } from '@/hooks/useBreathingCycle';
import { useBreathingAudio } from '@/hooks/useBreathingAudio';
import { useHaptics } from '@/hooks/useHaptics';
import { useSettings } from '@/context/SettingsContext';
import { useHistory } from '@/context/HistoryContext';
import { useProgressionContext } from '@/context/ProgressionContext';
import type {
  BoxTechniqueConfig,
  BreathingPhase,
  BreathingTechnique,
} from '@/lib/types';
import { randomId } from '@/lib/utils';

type Props = { technique: BreathingTechnique };

const LABEL: Record<BreathingPhase, string> = {
  inhale: 'Вдох',
  holdIn: 'Задержка',
  exhale: 'Выдох',
  holdOut: 'Задержка',
};

export function BoxTechniqueSession({ technique }: Props) {
  const router = useRouter();
  const { settings } = useSettings();
  const { add } = useHistory();
  const { state: progression } = useProgressionContext();
  const haptics = useHaptics(settings.hapticsEnabled);
  const [showPause, setShowPause] = useState(false);
  const [completed, setCompleted] = useState(false);
  const startedAtRef = useRef(Date.now());

  const config = technique.config as BoxTechniqueConfig;
  const pattern = config.pattern;
  const cycleLen = useMemo(
    () => pattern.reduce((a, b) => a + b, 0),
    [pattern],
  );
  const totalSec = cycleLen * config.cycles;
  const active = !showPause && !completed;

  const handleFinish = () => {
    if (completed) return;
    setCompleted(true);
    add({
      id: randomId(),
      date: new Date().toISOString(),
      scenario: 'custom',
      gratitudeText: '',
      durationMs: Math.max(Date.now() - startedAtRef.current, 0),
      completedPhases: ['breathing'],
      level: progression.currentLevel,
      kind: 'technique',
      techniqueId: technique.id,
      techniqueName: technique.name,
    });
    haptics('success');
  };

  const timer = useTimer({
    durationSec: totalSec,
    autoStart: true,
    onComplete: handleFinish,
  });

  const audio = useBreathingAudio({
    enabled: settings.ambientEnabled,
    preset: settings.ambientPreset,
    volume: settings.ambientVolume,
    active,
  });

  const { phase, secondsInPhase } = useBreathingCycle({
    pattern,
    active,
    onPhaseChange: (newPhase, dur) => {
      haptics('tap');
      audio.onPhase(newPhase, dur);
    },
  });

  useEffect(() => {
    if (settings.ambientEnabled) audio.onPhase('inhale', pattern[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.ambientEnabled]);

  const phaseDuration =
    pattern[
      phase === 'inhale' ? 0 : phase === 'holdIn' ? 1 : phase === 'exhale' ? 2 : 3
    ];

  const handlePauseToggle = () => {
    if (showPause) {
      setShowPause(false);
      timer.resume();
    } else {
      setShowPause(true);
      timer.pause();
    }
  };

  const handleSkip = () => {
    setShowPause(false);
    timer.finish();
  };

  const handleExit = () => {
    setShowPause(false);
    router.push('/');
  };

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
            <span className="text-success text-3xl" aria-hidden>
              ✓
            </span>
          </motion.div>
          <div>
            <h1 className="text-2xl font-medium mb-2">Готово</h1>
            <p className="text-text-secondary text-sm">
              {technique.name} · {config.cycles}{' '}
              {config.cycles === 1 ? 'цикл' : 'циклов'}
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
        <BreathingTimer
          remainingSec={Math.ceil(timer.remaining)}
          totalSec={totalSec}
        />
      </div>

      <motion.div
        className="flex-1 flex flex-col items-center justify-center gap-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <BreathingCircle
          phase={phase}
          pattern={pattern}
          active={active}
          reducedMotion={settings.reducedMotion}
        />
        {phaseDuration > 0 ? (
          <BreathingGuide
            phase={phase}
            secondsInPhase={secondsInPhase}
            phaseDuration={phaseDuration}
          />
        ) : (
          <div className="text-center">
            <p className="text-xl font-medium">{LABEL[phase]}</p>
          </div>
        )}
        {config.mouthExhale && phase === 'exhale' && (
          <p className="text-xs text-text-secondary uppercase tracking-widest">
            выдох ртом
          </p>
        )}
      </motion.div>

      <div className="flex justify-center gap-3 pb-6">
        <HapticButton variant="ghost" size="md" onClick={handlePauseToggle}>
          Пауза
        </HapticButton>
        <HapticButton variant="subtle" size="md" onClick={handleSkip}>
          Завершить
        </HapticButton>
      </div>

      <PauseOverlay
        visible={showPause}
        onResume={handlePauseToggle}
        onSkip={handleSkip}
        onExit={handleExit}
      />
    </PageShell>
  );
}
