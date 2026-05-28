'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';
import type { BreathingPhase } from '@/lib/types';
import { cn } from '@/lib/utils';

type Props = {
  phase: BreathingPhase;
  pattern: [number, number, number, number];
  active: boolean;
  reducedMotion: boolean;
};

const SCALE: Record<BreathingPhase, number> = {
  inhale: 1,
  holdIn: 1,
  exhale: 0.55,
  holdOut: 0.55,
};

export function BreathingCircle({ phase, pattern, active, reducedMotion }: Props) {
  const duration = pattern[
    phase === 'inhale' ? 0 : phase === 'holdIn' ? 1 : phase === 'exhale' ? 2 : 3
  ];

  const transition = useMemo(() => {
    if (phase === 'inhale' || phase === 'exhale') {
      return { duration, ease: [0.4, 0, 0.2, 1] as const };
    }
    return { duration: 0.1 };
  }, [phase, duration]);

  return (
    <div className="relative flex items-center justify-center">
      <motion.div
        aria-hidden
        className="absolute rounded-full bg-accent-breathing/15"
        animate={{
          scale: active && !reducedMotion ? SCALE[phase] * 1.45 : 0.95,
          opacity: active ? 0.6 : 0.3,
        }}
        transition={transition}
        style={{ width: 280, height: 280 }}
      />
      <motion.div
        aria-hidden
        className="absolute rounded-full bg-accent-breathing/25"
        animate={{
          scale: active && !reducedMotion ? SCALE[phase] * 1.2 : 0.95,
          opacity: active ? 0.8 : 0.4,
        }}
        transition={transition}
        style={{ width: 240, height: 240 }}
      />
      <motion.div
        className={cn(
          'relative rounded-full',
          'bg-gradient-to-br from-accent-breathing/80 to-accent-breathing/30',
          'shadow-glow-breathing',
        )}
        animate={{
          scale: active && !reducedMotion ? SCALE[phase] : 0.85,
        }}
        transition={transition}
        style={{ width: 200, height: 200 }}
      />
    </div>
  );
}
