'use client';

import { motion } from 'framer-motion';
import { HapticButton } from '@/components/shared/HapticButton';

type Props = {
  icon: string;
  count: number;
  label: string;
  prompt: string;
  isLast: boolean;
  onNext: () => void;
};

export function SenseCard({ icon, count, label, prompt, isLast, onNext }: Props) {
  return (
    <motion.div
      className="flex flex-col items-center text-center"
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -40, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 18 }}
    >
      <div className="text-7xl mb-4" aria-hidden>
        {icon}
      </div>
      <div className="text-xs uppercase tracking-[0.2em] text-text-secondary mb-2">
        {label}
      </div>
      <div className="text-5xl font-light text-accent-grounding mb-6 tabular-nums">
        {count}
      </div>
      <p className="text-base sm:text-lg text-text-primary/90 max-w-xs mb-10 leading-relaxed">
        {prompt}
      </p>
      <HapticButton onClick={onNext} size="lg" haptic="transition">
        {isLast ? 'Завершить' : 'Готово'}
      </HapticButton>
    </motion.div>
  );
}
