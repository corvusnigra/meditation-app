'use client';

import { ProgressFill } from '@/components/shared/ProgressFill';
import type { PracticeClock } from '@/hooks/usePracticeClock';
import { cn } from '@/lib/utils';
import type { PhaseId } from '@/lib/types';

const PHASES: PhaseId[] = ['breathing', 'grounding', 'gratitude'];
const COLORS: Record<PhaseId, string> = {
  breathing: 'bg-accent-breathing',
  grounding: 'bg-accent-grounding',
  gratitude: 'bg-accent-gratitude',
};
const LABELS: Record<PhaseId, string> = {
  breathing: 'Дыхание',
  grounding: 'Заземление',
  gratitude: 'Благодарность',
};

type Props = {
  currentPhase: PhaseId;
  clock: PracticeClock;
  // Плановая длительность текущей фазы; null — фаза ещё не началась.
  totalSec: number | null;
};

export function PhaseProgressBar({ currentPhase, clock, totalSec }: Props) {
  const currentIndex = PHASES.indexOf(currentPhase);

  return (
    <div className="w-full">
      <div className="flex gap-1.5">
        {PHASES.map((phase, idx) => (
          <div
            key={phase}
            className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden"
          >
            {idx < currentIndex && <div className={cn('h-full', COLORS[phase])} />}
            {idx === currentIndex && totalSec !== null && (
              <ProgressFill clock={clock} totalSec={totalSec} className={COLORS[phase]} />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2 text-xs uppercase tracking-wide text-text-secondary">
        {PHASES.map((phase, idx) => (
          <span
            key={phase}
            className={cn(
              'transition-colors',
              idx === currentIndex && 'text-text-primary',
            )}
          >
            {LABELS[phase]}
          </span>
        ))}
      </div>
    </div>
  );
}
