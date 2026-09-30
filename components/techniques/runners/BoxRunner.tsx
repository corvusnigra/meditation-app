'use client';

import { useEffect, useMemo } from 'react';
import { BreathingGuide, PHASE_LABEL } from '@/components/breathing/BreathingGuide';
import { Countdown } from '@/components/shared/Countdown';
import { PhaseAnnouncer } from '@/components/practice/PhaseAnnouncer';
import {
  BREATH_SCALE,
  CIRCLE_REST_SCALE,
  PracticeCircle,
} from '@/components/practice/PracticeCircle';
import { usePhaseCycle } from '@/hooks/usePhaseCycle';
import { effectiveStep } from '@/lib/breathing-techniques';
import { breathingPhases } from '@/lib/practice';
import type { BoxTechniqueConfig } from '@/lib/types';
import { cn } from '@/lib/utils';
import type { RunnerProps } from './types';

export function BoxRunner({
  technique,
  level,
  clock,
  signals,
  running,
  paused,
  reducedMotion,
  onProgress,
  onFinish,
}: RunnerProps) {
  const config = technique.config as BoxTechniqueConfig;
  const step = effectiveStep(technique, level);
  const phases = useMemo(() => breathingPhases(step.pattern), [step.pattern]);

  const cycle = usePhaseCycle({
    phases,
    cycles: step.cycles,
    clock,
    enabled: running,
    onPhase: (phase, sec, info) => signals.phase(phase, sec, { resumed: info.resumed }),
    onComplete: onFinish,
  });

  useEffect(() => {
    onProgress({ done: cycle.cycleIndex, index: cycle.cycleIndex });
  }, [cycle.cycleIndex, onProgress]);

  const moving = cycle.phase === 'inhale' || cycle.phase === 'exhale';

  return (
    <>
      <PracticeCircle
        scale={running ? BREATH_SCALE[cycle.phase] : CIRCLE_REST_SCALE}
        durationSec={running && moving ? cycle.phaseSec : 0.1}
        still={reducedMotion}
        paused={paused}
        phase={running ? cycle.phase : undefined}
      />
      {running && (
        <div>
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
          {config.mouthExhale && (
            <p
              className={cn(
                'mt-3 text-center text-xs uppercase tracking-wider text-text-secondary',
                cycle.phase !== 'exhale' && 'invisible',
              )}
            >
              выдох ртом
            </p>
          )}
          <PhaseAnnouncer text={PHASE_LABEL[cycle.phase]} />
        </div>
      )}
    </>
  );
}
