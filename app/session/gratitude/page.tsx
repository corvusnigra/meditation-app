'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { PageShell } from '@/components/shared/PageShell';
import { PhaseProgressBar } from '@/components/shared/PhaseProgressBar';
import { PauseOverlay } from '@/components/shared/PauseOverlay';
import { Countdown } from '@/components/shared/Countdown';
import { HapticButton } from '@/components/shared/HapticButton';
import { GratitudePrompt } from '@/components/gratitude/GratitudePrompt';
import { GratitudeInput } from '@/components/gratitude/GratitudeInput';
import { PracticeHeader } from '@/components/practice/PracticeHeader';
import { useSession } from '@/context/SessionContext';
import { useHistory } from '@/context/HistoryContext';
import { useProgressionContext } from '@/context/ProgressionContext';
import { useClockTick } from '@/hooks/usePracticeClock';
import { usePracticeController } from '@/hooks/usePracticeController';
import { GRATITUDE_PLACEHOLDER, GRATITUDE_PROMPTS } from '@/lib/constants';
import { ritualCounted } from '@/lib/practice';
import type { PhaseId } from '@/lib/types';
import { randomId } from '@/lib/utils';

export default function GratitudePage() {
  const router = useRouter();
  const { state, advance, setGratitude, reset } = useSession();
  const { add } = useHistory();
  const { state: progression, durations } = useProgressionContext();
  const practice = usePracticeController();
  const { clock } = practice;
  const [showField, setShowField] = useState(false);
  const [reachedMinimum, setReachedMinimum] = useState(false);
  const reachedRef = useRef(false);
  const closedRef = useRef(false);

  // Время здесь — минимум, а не предел: сессию завершает кнопка «Готово».
  const totalSec = durations.gratitude;

  useClockTick(clock, () => {
    if (reachedRef.current || clock.now() / 1000 < totalSec) return;
    reachedRef.current = true;
    setReachedMinimum(true);
  });

  // Благодарность засчитывается кнопкой «Готово». Если обе фазы до неё
  // пропущены, ритуал в историю не попадает — кнопка говорит об этом заранее.
  const phases: PhaseId[] = [...state.completedPhases, 'gratitude'];
  const counted = ritualCounted(phases);

  const handleExit = () => {
    if (closedRef.current) return;
    closedRef.current = true;
    practice.leave(() => {
      reset();
      router.replace('/');
    });
  };

  const handleFinish = () => {
    if (!counted) {
      handleExit();
      return;
    }
    if (closedRef.current) return;
    closedRef.current = true;
    add({
      id: randomId(),
      date: new Date().toISOString(),
      scenario: state.scenario,
      gratitudeText: state.gratitudeText.trim(),
      durationMs: Math.round(state.activeMs + clock.now()),
      completedPhases: phases,
      level: progression.currentLevel,
    });
    advance('complete');
    practice.leave(() => router.replace('/complete'));
  };

  useEffect(() => {
    if (state.status === 'idle') {
      router.replace('/');
    }
  }, [state.status, router]);

  return (
    <PageShell>
      <div className="space-y-4">
        <PracticeHeader
          title={reachedMinimum ? 'Минимум пройден' : 'До минимума'}
          counter={
            reachedMinimum ? (
              <span className="text-xs text-accent-gratitude">
                можно записать или закончить
              </span>
            ) : (
              <Countdown
                clock={clock}
                endSec={totalSec}
                format="clock"
                className="font-mono tabular-nums"
              />
            )
          }
          onClose={() => practice.pause('user')}
        />
        <PhaseProgressBar currentPhase="gratitude" clock={clock} totalSec={totalSec} />
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
            clock={clock}
            totalSec={totalSec}
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

      <div className="space-y-3 pb-6">
        {!counted && (
          <p className="text-center text-xs text-text-secondary text-balance">
            Дыхание и заземление пропущены — такой ритуал в историю не попадёт.
          </p>
        )}
        <div className="flex justify-center gap-3">
          <HapticButton variant="ghost" size="md" onClick={() => practice.pause('user')}>
            Пауза
          </HapticButton>
          <HapticButton
            variant={counted ? 'primary' : 'subtle'}
            size="md"
            onClick={handleFinish}
            haptic={counted ? 'success' : 'tap'}
          >
            {counted ? 'Готово' : 'Выйти без записи'}
          </HapticButton>
        </div>
      </div>

      <PauseOverlay
        visible={practice.paused}
        reason={practice.reason}
        onResume={practice.resume}
        onExit={handleExit}
      />
    </PageShell>
  );
}
