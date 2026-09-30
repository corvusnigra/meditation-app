'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useClockTick, type PracticeClock } from '@/hooks/usePracticeClock';

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  // Кольцо вокруг поля заполняется до минимума времени фазы.
  clock: PracticeClock;
  totalSec: number;
};

export function GratitudeInput({ value, onChange, placeholder, clock, totalSec }: Props) {
  const ringRef = useRef<HTMLDivElement>(null);

  useClockTick(clock, () => {
    const progress = totalSec > 0 ? Math.min(clock.now() / 1000 / totalSec, 1) : 1;
    if (ringRef.current) {
      ringRef.current.style.background = `conic-gradient(currentColor ${progress * 360}deg, transparent 0)`;
    }
  });

  return (
    <motion.div
      initial={{ y: 12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.25 }}
      className="relative w-full"
    >
      <div
        ref={ringRef}
        className="absolute inset-0 rounded-2xl pointer-events-none text-accent-gratitude"
        aria-hidden
        style={{
          opacity: 0.25,
          padding: 2,
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      />
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={5}
        className="relative w-full rounded-2xl bg-bg-card/80 border border-white/10 px-5 py-4 text-base text-text-primary placeholder-text-secondary resize-none focus:outline-none focus:border-accent-gratitude/60 transition-colors"
      />
      <p className="mt-2 text-xs text-text-secondary text-center">
        Можно ничего не писать — достаточно подумать.
      </p>
    </motion.div>
  );
}
