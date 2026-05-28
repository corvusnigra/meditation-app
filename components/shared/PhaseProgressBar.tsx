'use client';

import { motion } from 'framer-motion';
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
  phaseProgress: number;
};

export function PhaseProgressBar({ currentPhase, phaseProgress }: Props) {
  const currentIndex = PHASES.indexOf(currentPhase);

  return (
    <div className="w-full">
      <div className="flex gap-1.5">
        {PHASES.map((phase, idx) => {
          const isPast = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const fill = isPast ? 1 : isCurrent ? phaseProgress : 0;
          return (
            <div
              key={phase}
              className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden"
            >
              <motion.div
                className={cn('h-full', COLORS[phase])}
                style={{ width: `${fill * 100}%` }}
                animate={{ width: `${fill * 100}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-2 text-[11px] uppercase tracking-widest text-text-secondary">
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
