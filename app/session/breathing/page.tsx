'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { PageShell } from '@/components/shared/PageShell';
import { PhaseProgressBar } from '@/components/shared/PhaseProgressBar';
import { PauseOverlay } from '@/components/shared/PauseOverlay';
import { BreathingCircle } from '@/components/breathing/BreathingCircle';
import { BreathingGuide } from '@/components/breathing/BreathingGuide';
import { BreathingTimer } from '@/components/breathing/BreathingTimer';
import { AmbientVisualizer } from '@/components/breathing/AmbientVisualizer';
import { HapticButton } from '@/components/shared/HapticButton';
import { useSession } from '@/context/SessionContext';
import { useSettings } from '@/context/SettingsContext';
import { useProgressionContext } from '@/context/ProgressionContext';
import { useBreathingCycle } from '@/hooks/useBreathingCycle';
import { useBreathingAudio } from '@/hooks/useBreathingAudio';
import { useTimer } from '@/hooks/useTimer';
import { useHaptics } from '@/hooks/useHaptics';

export default function BreathingPage() {
  const router = useRouter();
  const { state, advance, pause, resume } = useSession();
  const { settings } = useSettings();
  const { durations } = useProgressionContext();
  const [showPause, setShowPause] = useState(false);
  const haptics = useHaptics(settings.hapticsEnabled);

  const totalSec = durations.breathing;
  const active = !showPause;

  const timer = useTimer({
    durationSec: totalSec,
    autoStart: true,
    onComplete: () => {
      advance('grounding');
      router.push('/session/grounding');
    },
  });

  const audio = useBreathingAudio({
    enabled: settings.ambientEnabled,
    preset: settings.ambientPreset,
    volume: settings.ambientVolume,
    active,
  });

  const { phase, secondsInPhase, phaseProgress } = useBreathingCycle({
    pattern: settings.breathingPattern,
    active,
    onPhaseChange: (newPhase, dur) => {
      haptics('tap');
      audio.onPhase(newPhase, dur);
    },
  });

  useEffect(() => {
    if (settings.ambientEnabled) {
      audio.onPhase('inhale', settings.breathingPattern[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.ambientEnabled]);

  useEffect(() => {
    if (state.status === 'idle') {
      router.replace('/');
    }
  }, [state.status, router]);

  const handlePauseToggle = () => {
    if (showPause) {
      setShowPause(false);
      pause();
      timer.resume();
      resume();
    } else {
      setShowPause(true);
      timer.pause();
      pause();
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

  const phaseDuration =
    settings.breathingPattern[
      phase === 'inhale' ? 0 : phase === 'holdIn' ? 1 : phase === 'exhale' ? 2 : 3
    ];

  return (
    <PageShell>
      <div className="space-y-4">
        <PhaseProgressBar currentPhase="breathing" phaseProgress={timer.progress} />
        <BreathingTimer remainingSec={Math.ceil(timer.remaining)} totalSec={totalSec} />
      </div>

      <motion.div
        className="flex-1 flex flex-col items-center justify-center gap-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <BreathingCircle
          phase={phase}
          pattern={settings.breathingPattern}
          active={active}
          reducedMotion={settings.reducedMotion}
        />
        <BreathingGuide
          phase={phase}
          secondsInPhase={secondsInPhase}
          phaseDuration={phaseDuration}
        />
        <AmbientVisualizer phase={phase} enabled={settings.ambientEnabled} />
      </motion.div>

      <div className="flex justify-center gap-3 pb-6">
        <HapticButton variant="ghost" size="md" onClick={handlePauseToggle}>
          Пауза
        </HapticButton>
        <HapticButton variant="subtle" size="md" onClick={handleSkip}>
          Пропустить
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
