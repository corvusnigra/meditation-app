'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { BreathingPhase } from '@/lib/types';

type Props = {
  phase: BreathingPhase;
  secondsInPhase: number;
  phaseDuration: number;
};

const LABEL: Record<BreathingPhase, string> = {
  inhale: 'Вдохните',
  holdIn: 'Задержите',
  exhale: 'Выдохните',
  holdOut: 'Задержите',
};

export function BreathingGuide({ phase, secondsInPhase, phaseDuration }: Props) {
  const remaining = Math.max(Math.ceil(phaseDuration - secondsInPhase), 1);
  return (
    <div className="text-center pointer-events-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-xl sm:text-2xl font-medium text-text-primary">
            {LABEL[phase]}
          </p>
          <p className="mt-1 text-4xl font-light text-accent-breathing tabular-nums">
            {remaining}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
