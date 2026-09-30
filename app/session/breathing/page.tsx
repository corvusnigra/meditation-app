'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageShell } from '@/components/shared/PageShell';
import { PhaseProgressBar } from '@/components/shared/PhaseProgressBar';
import { PauseOverlay } from '@/components/shared/PauseOverlay';
import { Countdown } from '@/components/shared/Countdown';
import { HapticButton } from '@/components/shared/HapticButton';
import { BreathingGuide, PHASE_LABEL } from '@/components/breathing/BreathingGuide';
import { AmbientVisualizer } from '@/components/breathing/AmbientVisualizer';
import { PracticeHeader } from '@/components/practice/PracticeHeader';
import { PracticeCircle, CIRCLE_REST_SCALE } from '@/components/practice/PracticeCircle';
import { StartCountdown } from '@/components/practice/StartCountdown';
import { SignalToggle } from '@/components/practice/SignalToggle';
import { PhaseAnnouncer } from '@/components/practice/PhaseAnnouncer';
import { useSession } from '@/context/SessionContext';
import { useSettings } from '@/context/SettingsContext';
import { useProgressionContext } from '@/context/ProgressionContext';
import { useBreathingAudio } from '@/hooks/useBreathingAudio';
import { usePhaseCycle } from '@/hooks/usePhaseCycle';
import { usePracticeController } from '@/hooks/usePracticeController';
import { RITUAL_ENTRAINMENT_HZ } from '@/lib/entrainment';
import { breathingPhases, phaseCounted, ritualCycles } from '@/lib/practice';
import type { BreathingPhase } from '@/lib/types';
import { formatTime } from '@/lib/utils';

const SCALE: Record<BreathingPhase, number> = {
  inhale: 1,
  holdIn: 1,
  exhale: CIRCLE_REST_SCALE,
  holdOut: CIRCLE_REST_SCALE,
};

export default function BreathingPage() {
  const router = useRouter();
  const { state, advance, reset } = useSession();
  const { settings, reducedMotion } = useSettings();
  const { durations } = useProgressionContext();
  const practice = usePracticeController();
  const { clock, signals } = practice;
  const [stage, setStage] = useState<'countdown' | 'running'>('countdown');
  const closedRef = useRef(false);

  const pattern = settings.breathingPattern;
  const phases = useMemo(() => breathingPhases(pattern), [pattern]);
  const cycleSec = pattern.reduce((a, b) => a + b, 0);
  const cycles = ritualCycles(durations.breathing, pattern);
  const totalSec = cycles * cycleSec;
  const running = stage === 'running';

  // Фон ведёт этот хук, сигналы фаз — practice.signals.
  useBreathingAudio({
    enabled: settings.ambientEnabled,
    preset: settings.ambientPreset,
    volume: settings.ambientVolume,
    active: running && !practice.paused,
    entrainment: settings.entrainmentEnabled,
    entrainmentHz: RITUAL_ENTRAINMENT_HZ,
  });

  const cycle = usePhaseCycle({
    phases,
    cycles,
    clock,
    enabled: running,
    onPhase: (phase, sec, info) => {
      if (!closedRef.current) signals.phase(phase, sec, info.resumed);
    },
    onComplete: () => goToGrounding(cycles),
  });

  const goToGrounding = (cyclesDone: number) => {
    if (closedRef.current) return;
    closedRef.current = true;
    signals.silence();
    signals.stage('step');
    advance('grounding', {
      phase: 'breathing',
      counted: phaseCounted(cyclesDone, cycles),
      activeMs: running ? clock.now() : 0,
    });
    practice.leave(() => router.replace('/session/grounding'));
  };

  useEffect(() => {
    if (state.status === 'idle') {
      router.replace('/');
    }
  }, [state.status, router]);

  const handleStart = () => {
    void signals.unlock();
    clock.restart();
    setStage('running');
  };

  // unlock в жесте: после сворачивания звук спит, пока его не разбудит касание.
  const handleSkip = () => {
    void signals.unlock();
    goToGrounding(running ? cycle.cycleIndex : 0);
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
          title={`Дыхание ${pattern.join('–')}`}
          counter={
            <span className="font-mono tabular-nums">
              {running ? (
                <Countdown clock={clock} endSec={totalSec} format="clock" />
              ) : (
                formatTime(totalSec)
              )}
            </span>
          }
          onClose={() => practice.pause('user')}
        />
        <PhaseProgressBar
          currentPhase="breathing"
          clock={clock}
          totalSec={running ? totalSec : null}
        />
      </div>

      <div className="relative flex-1 flex flex-col items-center justify-center gap-10">
        <PracticeCircle
          scale={running ? SCALE[cycle.phase] : CIRCLE_REST_SCALE}
          durationSec={
            running && (cycle.phase === 'inhale' || cycle.phase === 'exhale')
              ? cycle.phaseSec
              : 0.1
          }
          still={reducedMotion}
          paused={practice.paused}
          phase={running ? cycle.phase : undefined}
        />
        {running ? (
          <>
            <BreathingGuide
              phase={cycle.phase}
              remaining={
                <Countdown
                  clock={clock}
                  endSec={cycle.phaseStartSec + cycle.phaseSec}
                  min={1}
                />
              }
            />
            <AmbientVisualizer phase={cycle.phase} enabled={settings.ambientEnabled} />
          </>
        ) : (
          <StartCountdown
            clock={clock}
            onCount={() => signals.stage('count')}
            onDone={handleStart}
          />
        )}
      </div>

      <div className="flex justify-center gap-3 pb-6">
        <HapticButton variant="ghost" size="md" onClick={() => practice.pause('user')}>
          Пауза
        </HapticButton>
        <HapticButton variant="subtle" size="md" onClick={handleSkip}>
          Пропустить
        </HapticButton>
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
      <PhaseAnnouncer text={running ? PHASE_LABEL[cycle.phase] : 'Приготовьтесь'} />
    </PageShell>
  );
}
