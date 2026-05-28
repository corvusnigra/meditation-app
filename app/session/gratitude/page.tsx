'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { PageShell } from '@/components/shared/PageShell';
import { PhaseProgressBar } from '@/components/shared/PhaseProgressBar';
import { PauseOverlay } from '@/components/shared/PauseOverlay';
import { HapticButton } from '@/components/shared/HapticButton';
import { Timer } from '@/components/shared/Timer';
import { GratitudePrompt } from '@/components/gratitude/GratitudePrompt';
import { GratitudeInput } from '@/components/gratitude/GratitudeInput';
import { useSession } from '@/context/SessionContext';
import { useHistory } from '@/context/HistoryContext';
import { useProgressionContext } from '@/context/ProgressionContext';
import { useTimer } from '@/hooks/useTimer';
import { GRATITUDE_PLACEHOLDER, GRATITUDE_PROMPTS } from '@/lib/constants';
import { randomId } from '@/lib/utils';

export default function GratitudePage() {
  const router = useRouter();
  const { state, advance, pause, resume, setGratitude, reset } = useSession();
  const { add } = useHistory();
  const { state: progression, durations } = useProgressionContext();
  const [showPause, setShowPause] = useState(false);
  const [showField, setShowField] = useState(false);
  const [reachedMinimum, setReachedMinimum] = useState(false);

  const totalSec = durations.gratitude;

  // Таймер только для прогресса минимума — не завершает сессию.
  const timer = useTimer({
    durationSec: totalSec,
    autoStart: true,
    onComplete: () => setReachedMinimum(true),
  });

  const handleFinish = () => {
    const startMs = state.startedAt ? new Date(state.startedAt).getTime() : Date.now();
    add({
      id: randomId(),
      date: new Date().toISOString(),
      scenario: state.scenario,
      gratitudeText: state.gratitudeText.trim(),
      durationMs: Math.max(Date.now() - startMs, durations.total * 1000),
      completedPhases: ['breathing', 'grounding', 'gratitude'],
      level: progression.currentLevel,
    });
    advance('complete');
    router.push('/complete');
  };

  useEffect(() => {
    if (state.status === 'idle') {
      router.replace('/');
    }
  }, [state.status, router]);

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

  const handleExit = () => {
    setShowPause(false);
    reset();
    router.push('/');
  };

  const progressForRing = reachedMinimum ? 1 : timer.progress;

  return (
    <PageShell>
      <div className="space-y-4">
        <PhaseProgressBar
          currentPhase="gratitude"
          phaseProgress={progressForRing}
        />
        <div className="flex items-center justify-between text-xs text-text-secondary">
          <span className="uppercase tracking-widest">
            {reachedMinimum ? 'Минимум пройден' : 'Anchor'}
          </span>
          {reachedMinimum ? (
            <span className="text-accent-gratitude">можно записать или закончить</span>
          ) : (
            <Timer remainingSec={Math.ceil(timer.remaining)} />
          )}
        </div>
      </div>

      <motion.div
        className="flex-1 flex flex-col items-center justify-center gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <GratitudePrompt prompt={GRATITUDE_PROMPTS[state.scenario]} />

        {showField ? (
          <GratitudeInput
            value={state.gratitudeText}
            onChange={setGratitude}
            placeholder={GRATITUDE_PLACEHOLDER[state.scenario]}
            progress={progressForRing}
          />
        ) : (
          <HapticButton
            variant="ghost"
            size="sm"
            onClick={() => setShowField(true)}
          >
            Записать
          </HapticButton>
        )}
      </motion.div>

      <div className="flex justify-center gap-3 pb-6">
        <HapticButton variant="ghost" size="md" onClick={handlePauseToggle}>
          Пауза
        </HapticButton>
        <HapticButton
          variant="primary"
          size="md"
          onClick={handleFinish}
          haptic="success"
        >
          Готово
        </HapticButton>
      </div>

      <PauseOverlay
        visible={showPause}
        onResume={handlePauseToggle}
        onSkip={handleFinish}
        onExit={handleExit}
      />
    </PageShell>
  );
}
