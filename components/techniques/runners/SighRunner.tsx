'use client';

import { useEffect } from 'react';
import { Countdown } from '@/components/shared/Countdown';
import { PhaseAnnouncer } from '@/components/practice/PhaseAnnouncer';
import { CIRCLE_REST_SCALE, PracticeCircle } from '@/components/practice/PracticeCircle';
import { PracticeGuide } from '@/components/practice/PracticeGuide';
import { usePhaseCycle } from '@/hooks/usePhaseCycle';
import type { PhaseDef } from '@/lib/practice';
import type { BreathingPhase, SighTechniqueConfig } from '@/lib/types';
import type { RunnerProps } from './types';

type SighPhase = 'inhale1' | 'inhale2' | 'exhale';

// Один двойной вздох — 7 секунд (SIGH_CYCLE_SEC в lib/breathing-techniques.ts).
const PHASES: PhaseDef<SighPhase>[] = [
  { id: 'inhale1', sec: 1.5 },
  { id: 'inhale2', sec: 0.5 },
  { id: 'exhale', sec: 5 },
];

// Довдох звучит и вибрирует как задержка на вдохе: короткий и высокий.
const SIGNAL: Record<SighPhase, BreathingPhase> = {
  inhale1: 'inhale',
  inhale2: 'holdIn',
  exhale: 'exhale',
};

const SCALE: Record<SighPhase, number> = {
  inhale1: 0.85,
  inhale2: 1,
  exhale: CIRCLE_REST_SCALE,
};

const LABEL: Record<SighPhase, string> = {
  inhale1: 'Вдох носом',
  inhale2: 'Ещё вдох',
  exhale: 'Длинный выдох ртом',
};

const HINT: Record<SighPhase, string> = {
  inhale1: 'короткий',
  inhale2: 'довдох сверху',
  exhale: 'медленно через рот',
};

export function SighRunner({
  technique,
  clock,
  signals,
  running,
  paused,
  reducedMotion,
  onProgress,
  onFinish,
}: RunnerProps) {
  const config = technique.config as SighTechniqueConfig;

  const cycle = usePhaseCycle({
    phases: PHASES,
    cycles: config.cycles,
    clock,
    enabled: running,
    onPhase: (phase, sec, info) => {
      signals.phase(SIGNAL[phase], sec, { resumed: info.resumed });
    },
    onComplete: onFinish,
  });

  useEffect(() => {
    onProgress({ done: cycle.cycleIndex, index: cycle.cycleIndex });
  }, [cycle.cycleIndex, onProgress]);

  return (
    <>
      <PracticeCircle
        scale={running ? SCALE[cycle.phase] : CIRCLE_REST_SCALE}
        durationSec={running ? cycle.phaseSec : 0.1}
        tone="grounding"
        still={reducedMotion}
        paused={paused}
        phase={running ? cycle.phase : undefined}
      />
      {running && (
        <>
          <PracticeGuide
            label={LABEL[cycle.phase]}
            hint={HINT[cycle.phase]}
            tone="grounding"
            value={
              <Countdown
                clock={clock}
                endSec={cycle.phaseStartSec + cycle.phaseSec}
                min={1}
              />
            }
          />
          <PhaseAnnouncer text={LABEL[cycle.phase]} />
        </>
      )}
    </>
  );
}
