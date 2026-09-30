'use client';

import { useEffect, useState } from 'react';
import { Countdown } from '@/components/shared/Countdown';
import { HapticButton } from '@/components/shared/HapticButton';
import { PhaseAnnouncer } from '@/components/practice/PhaseAnnouncer';
import { CIRCLE_REST_SCALE, PracticeCircle } from '@/components/practice/PracticeCircle';
import { PracticeGuide } from '@/components/practice/PracticeGuide';
import { useClockTick, type PracticeClock } from '@/hooks/usePracticeClock';
import { useWimHof, type WimHofStage } from '@/hooks/useWimHof';
import type { WimHofTechniqueConfig } from '@/lib/types';
import { formatTime } from '@/lib/utils';
import type { RunnerProps } from './types';

const STAGE_LABEL: Record<WimHofStage, string> = {
  breathing: 'Быстрое дыхание',
  retention: 'Задержка на пустых',
  recovery: 'Задержка на полных',
};

// Время с начала этапа: читает часы сам и перерисовывается раз в секунду.
function Elapsed({ clock, startSec }: { clock: PracticeClock; startSec: number }) {
  const elapsed = () => Math.max(Math.floor(clock.now() / 1000 - startSec), 0);
  const [value, setValue] = useState(elapsed);

  useClockTick(clock, () => setValue(elapsed()));

  return <>{formatTime(value)}</>;
}

export function WimHofRunner({
  technique,
  clock,
  signals,
  running,
  paused,
  reducedMotion,
  onProgress,
  onFinish,
  onQuiet,
}: RunnerProps) {
  const config = technique.config as WimHofTechniqueConfig;
  const { stage, round, roundsDone, startSec, breath, inhaling, endRetention } = useWimHof({
    config,
    clock,
    signals,
    running,
    onComplete: onFinish,
  });

  useEffect(() => {
    onProgress({ done: roundsDone, index: round });
  }, [roundsDone, round, onProgress]);

  // На задержке после выдоха фон молчит.
  useEffect(() => {
    onQuiet(stage === 'retention');
    return () => onQuiet(false);
  }, [stage, onQuiet]);

  const breathPhase = inhaling ? 'inhale' : 'exhale';
  const circle =
    !running || stage === 'retention'
      ? { scale: CIRCLE_REST_SCALE, durationSec: 0.4, tone: 'gratitude' as const }
      : stage === 'recovery'
        ? { scale: 1, durationSec: 1, tone: 'breathing' as const }
        : {
            scale: inhaling ? 1 : CIRCLE_REST_SCALE,
            durationSec: config.breathCycleSec / 2,
            tone: 'gratitude' as const,
          };

  return (
    <>
      <PracticeCircle
        {...circle}
        still={reducedMotion}
        paused={paused}
        phase={running ? (stage === 'breathing' ? breathPhase : stage) : undefined}
      />
      {running && stage === 'breathing' && (
        <PracticeGuide
          eyebrow={STAGE_LABEL.breathing}
          label={inhaling ? 'Вдох' : 'Выдох'}
          hint={`из ${config.breathsPerRound}`}
          tone="gratitude"
          value={Math.min(breath + 1, config.breathsPerRound)}
        />
      )}
      {running && stage === 'retention' && (
        <PracticeGuide
          eyebrow={STAGE_LABEL.retention}
          label="Не дышите"
          hint="Когда захочется вдохнуть — нажмите кнопку ниже."
          tone="gratitude"
          value={<Elapsed clock={clock} startSec={startSec} />}
        />
      )}
      {running && stage === 'recovery' && (
        <PracticeGuide
          eyebrow={STAGE_LABEL.recovery}
          label="Держите вдох"
          hint={`из ${config.recoveryHoldSec} сек`}
          value={
            <Countdown clock={clock} endSec={startSec + config.recoveryHoldSec} min={1} />
          }
        />
      )}
      {running && (
        <HapticButton
          size="lg"
          haptic="transition"
          onClick={endRetention}
          className={stage === 'retention' ? undefined : 'invisible'}
        >
          Вдохнуть
        </HapticButton>
      )}
      {running && <PhaseAnnouncer text={STAGE_LABEL[stage]} />}
    </>
  );
}
