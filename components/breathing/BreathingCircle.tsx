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

// При уменьшенном движении круг не меняет размер — фазу показывает прозрачность.
const REDUCED_OPACITY: Record<BreathingPhase, number> = {
  inhale: 1,
  holdIn: 1,
  exhale: 0.5,
  holdOut: 0.5,
};

// Внешнее кольцо на вдохе растёт в 1.45 раза. Базовый размер колец ограничен так,
// чтобы на пике оно помещалось в ширину экрана с полями по 16px.
const RING_FIT = 'calc((100vw - 32px) / 1.45)';

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
        initial={{ scale: reducedMotion ? 0.95 : SCALE.exhale * 1.45 }}
        animate={{
          scale: active && !reducedMotion ? SCALE[phase] * 1.45 : 0.95,
          opacity: active ? 0.6 : 0.3,
        }}
        transition={transition}
        style={{
          width: `min(280px, ${RING_FIT})`,
          height: `min(280px, ${RING_FIT})`,
        }}
      />
      <motion.div
        aria-hidden
        className="absolute rounded-full bg-accent-breathing/25"
        initial={{ scale: reducedMotion ? 0.95 : SCALE.exhale * 1.2 }}
        animate={{
          scale: active && !reducedMotion ? SCALE[phase] * 1.2 : 0.95,
          opacity: active ? 0.8 : 0.4,
        }}
        transition={transition}
        style={{
          width: `min(240px, ${RING_FIT})`,
          height: `min(240px, ${RING_FIT})`,
        }}
      />
      <motion.div
        className={cn(
          'relative rounded-full',
          'bg-gradient-to-br from-accent-breathing/80 to-accent-breathing/30',
          'shadow-glow-breathing',
        )}
        initial={{ scale: reducedMotion ? 0.85 : SCALE.exhale }}
        animate={{
          scale: active && !reducedMotion ? SCALE[phase] : 0.85,
          opacity: reducedMotion ? REDUCED_OPACITY[phase] : 1,
        }}
        transition={transition}
        style={{ width: 200, height: 200 }}
      />
    </div>
  );
}
