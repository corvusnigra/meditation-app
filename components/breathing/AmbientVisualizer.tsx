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

// Полная высота каждой полоски; фаза сжимает её через scaleY, без пересчёта вёрстки.
const BAR_HEIGHTS = [8, 14, 13, 12, 11];

export function AmbientVisualizer({ phase, enabled }: Props) {
  if (!enabled) return null;
  return (
    <div className="flex gap-1 items-center h-3" aria-hidden>
      {BAR_HEIGHTS.map((height, i) => (
        <motion.span
          key={i}
          className="block w-1 rounded-full bg-accent-breathing"
          style={{ height }}
          animate={{
            scaleY: PHASE_INTENSITY[phase],
            opacity: 0.4 + PHASE_INTENSITY[phase] * 0.5,
          }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}
