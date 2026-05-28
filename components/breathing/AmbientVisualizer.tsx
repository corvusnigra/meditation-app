'use client';

import { motion } from 'framer-motion';
import type { BreathingPhase } from '@/lib/types';

type Props = {
  phase: BreathingPhase;
  enabled: boolean;
};

const PHASE_INTENSITY: Record<BreathingPhase, number> = {
  inhale: 1,
  holdIn: 0.85,
  exhale: 0.4,
  holdOut: 0.15,
};

export function AmbientVisualizer({ phase, enabled }: Props) {
  if (!enabled) return null;
  return (
    <div className="flex gap-1 items-center h-3" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.span
          key={i}
          className="block w-1 rounded-full bg-accent-breathing"
          animate={{
            height: `${(PHASE_INTENSITY[phase] * (8 + ((i * 13) % 7))).toFixed(1)}px`,
            opacity: 0.4 + PHASE_INTENSITY[phase] * 0.5,
          }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}
