'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { PageShell } from '@/components/shared/PageShell';
import { PhaseProgressBar } from '@/components/shared/PhaseProgressBar';
import { PauseOverlay } from '@/components/shared/PauseOverlay';
import { HapticButton } from '@/components/shared/HapticButton';
import { Timer } from '@/components/shared/Timer';
import { GroundingProgress } from '@/components/grounding/GroundingProgress';
import { SenseCarousel } from '@/components/grounding/SenseCarousel';
import { GROUNDING_SENSES } from '@/lib/constants';
import { useSession } from '@/context/SessionContext';
import { useProgressionContext } from '@/context/ProgressionContext';
import { useTimer } from '@/hooks/useTimer';

export default function GroundingPage() {
  const router = useRouter();
  const { state, advance, pause, resume, setGroundingSense } = useSession();
  const { durations } = useProgressionContext();
  const [showPause, setShowPause] = useState(false);

  const totalSec = durations.grounding;

  const timer = useTimer({
    durationSec: totalSec,
    autoStart: true,
    onComplete: () => {
      advance('gratitude');
      router.push('/session/gratitude');
    },
  });

  useEffect(() => {
    if (state.status === 'idle') {
      router.replace('/');
    }
  }, [state.status, router]);

  const handleNext = () => {
    const next = state.groundingSense + 1;
    if (next >= GROUNDING_SENSES.length) {
      timer.finish();
      return;
    }
    setGroundingSense(next);
  };

  const handlePauseToggle = () => {
    if (showPause) {
      setShowPause(false);
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

  return (
    <PageShell>
      <div className="space-y-4">
        <PhaseProgressBar currentPhase="grounding" phaseProgress={timer.progress} />
        <div className="flex items-center justify-between text-xs text-text-secondary">
          <span className="uppercase tracking-widest">5–4–3–2–1</span>
          <Timer remainingSec={Math.ceil(timer.remaining)} />
        </div>
      </div>

      <motion.div
        className="flex-1 flex flex-col items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <SenseCarousel
          currentIndex={state.groundingSense}
          scenario={state.scenario}
          onNext={handleNext}
        />
      </motion.div>

      <div className="flex flex-col items-center gap-4 pb-6">
        <GroundingProgress total={GROUNDING_SENSES.length} current={state.groundingSense} />
        <div className="flex gap-3">
          <HapticButton variant="ghost" size="sm" onClick={handlePauseToggle}>
            Пауза
          </HapticButton>
          <HapticButton variant="subtle" size="sm" onClick={handleSkip}>
            Пропустить
          </HapticButton>
        </div>
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
