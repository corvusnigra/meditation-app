'use client';

import { useEffect, useMemo } from 'react';
import { Countdown } from '@/components/shared/Countdown';
import { PhaseAnnouncer } from '@/components/practice/PhaseAnnouncer';
import { CIRCLE_REST_SCALE, PracticeCircle } from '@/components/practice/PracticeCircle';
import { PracticeGuide } from '@/components/practice/PracticeGuide';
import { usePhaseCycle } from '@/hooks/usePhaseCycle';
import type { PhaseDef } from '@/lib/practice';
import type { PmrTechniqueConfig } from '@/lib/types';
import type { RunnerProps } from './types';

type PmrPhase = 'tense' | 'release';

const EYEBROW: Record<PmrPhase, string> = {
  tense: 'Напрягите',
  release: 'Отпустите',
};

const RELEASE_HINT = 'Резко отпустите. Почувствуйте, как тепло разливается по мышцам.';

export function PmrRunner({
  technique,
  clock,
  signals,
  running,
  paused,
  reducedMotion,
  onProgress,
  onFinish,
}: RunnerProps) {
  const config = technique.config as PmrTechniqueConfig;

  // Группа мышц — один цикл: напряжение, потом расслабление.
  const phases = useMemo<PhaseDef<PmrPhase>[]>(
    () => [
      { id: 'tense', sec: config.tenseSec },
      { id: 'release', sec: config.releaseSec },
    ],
    [config.tenseSec, config.releaseSec],
  );

  const cycle = usePhaseCycle({
    phases,
    cycles: config.groups.length,
    clock,
    enabled: running,
    onPhase: (phase) => signals.stage(phase),
    onComplete: onFinish,
  });

  useEffect(() => {
    onProgress({ done: cycle.cycleIndex, index: cycle.cycleIndex });
  }, [cycle.cycleIndex, onProgress]);

  const group = config.groups[Math.min(cycle.cycleIndex, config.groups.length - 1)];
  const tense = cycle.phase === 'tense';
  const tone = tense ? 'streak' : 'breathing';

  return (
    <>
      <PracticeCircle
        scale={running && tense ? 1 : CIRCLE_REST_SCALE}
        durationSec={running ? (tense ? 0.5 : 1.6) : 0.1}
        tone={running ? tone : 'breathing'}
        still={reducedMotion}
        paused={paused}
        phase={running ? cycle.phase : undefined}
      />
      {running && (
        <>
          <PracticeGuide
            eyebrow={EYEBROW[cycle.phase]}
            label={group.label}
            hint={tense ? group.instruction : RELEASE_HINT}
            tone={tone}
            value={
              <Countdown
                clock={clock}
                endSec={cycle.phaseStartSec + cycle.phaseSec}
                min={1}
              />
            }
          />
          <PhaseAnnouncer text={`${EYEBROW[cycle.phase]}: ${group.label}`} />
        </>
      )}
    </>
  );
}
