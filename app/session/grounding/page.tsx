'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { PageShell } from '@/components/shared/PageShell';
import { PhaseProgressBar } from '@/components/shared/PhaseProgressBar';
import { PauseOverlay } from '@/components/shared/PauseOverlay';
import { Countdown } from '@/components/shared/Countdown';
import { HapticButton } from '@/components/shared/HapticButton';
import { GroundingProgress } from '@/components/grounding/GroundingProgress';
import { SenseCarousel } from '@/components/grounding/SenseCarousel';
import { PracticeHeader } from '@/components/practice/PracticeHeader';
import { SignalToggle } from '@/components/practice/SignalToggle';
import { GROUNDING_SENSES } from '@/lib/constants';
import { useSession } from '@/context/SessionContext';
import { useProgressionContext } from '@/context/ProgressionContext';
import { useClockTick } from '@/hooks/usePracticeClock';
import { usePracticeController } from '@/hooks/usePracticeController';
import { groundingBudgets, phaseCounted } from '@/lib/practice';

export default function GroundingPage() {
  const router = useRouter();
  const { state, advance, reset, setGroundingSense } = useSession();
  const { durations } = useProgressionContext();
  const practice = usePracticeController();
  const { clock, signals } = practice;
  const closedRef = useRef(false);

  const totalSec = durations.grounding;
  const budgets = useMemo(() => groundingBudgets(totalSec), [totalSec]);

  // Шаги заканчивает сам человек. У каждого шага свой бюджет времени:
  // когда он вышел, звучит мягкий сигнал и появляется подсказка — без перехода.
  const [stepStartSec, setStepStartSec] = useState(0);
  const [overBudget, setOverBudget] = useState(false);
  const signalledRef = useRef(false);
  const stepEndSec = stepStartSec + (budgets[state.groundingSense] ?? 0);

  useClockTick(clock, () => {
    if (signalledRef.current || clock.isPaused()) return;
    if (clock.now() / 1000 < stepEndSec) return;
    signalledRef.current = true;
    setOverBudget(true);
    signals.stage('soft');
  });

  const goToGratitude = (stepsDone: number) => {
    if (closedRef.current) return;
    closedRef.current = true;
    signals.silence();
    signals.stage('step');
    advance('gratitude', {
      phase: 'grounding',
      counted: phaseCounted(stepsDone, GROUNDING_SENSES.length),
      activeMs: clock.now(),
    });
    practice.leave(() => router.replace('/session/gratitude'));
  };

  useEffect(() => {
    if (state.status === 'idle') {
      router.replace('/');
    }
  }, [state.status, router]);

  const handleNext = () => {
    const next = state.groundingSense + 1;
    if (next >= GROUNDING_SENSES.length) {
      goToGratitude(GROUNDING_SENSES.length);
      return;
    }
    setGroundingSense(next);
    setStepStartSec(clock.now() / 1000);
    signalledRef.current = false;
    setOverBudget(false);
  };

  const handleSkip = () => {
    void signals.unlock();
    goToGratitude(state.groundingSense);
  };

  const handleExit = () => {
    if (closedRef.current) return;
    closedRef.current = true;
    practice.leave(() => {
      reset();
      router.replace('/');
    });
  };

  return (
    <PageShell>
      <div className="space-y-4">
        <PracticeHeader
          title="5–4–3–2–1"
          counter={
            overBudget ? (
              <span className="text-xs text-accent-grounding">
                не спешите — закончите шаг
              </span>
            ) : (
              <Countdown
                key={state.groundingSense}
                clock={clock}
                endSec={stepEndSec}
                format="clock"
                className="font-mono tabular-nums"
              />
            )
          }
          onClose={() => practice.pause('user')}
        />
        <PhaseProgressBar currentPhase="grounding" clock={clock} totalSec={totalSec} />
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
          <HapticButton variant="ghost" size="sm" onClick={() => practice.pause('user')}>
            Пауза
          </HapticButton>
          <HapticButton variant="subtle" size="sm" onClick={handleSkip}>
            Пропустить
          </HapticButton>
        </div>
      </div>

      <PauseOverlay
        visible={practice.paused}
        reason={practice.reason}
        onResume={practice.resume}
        onSkip={handleSkip}
        onExit={handleExit}
      >
        <SignalToggle />
      </PauseOverlay>
    </PageShell>
  );
}
