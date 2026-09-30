'use client';

import { motion } from 'framer-motion';
import { plural } from '@/lib/utils';

type Props = {
  count: number;
  label?: string;
};

export function StreakCounter({ count, label }: Props) {
  if (count === 0) {
    return (
      <p className="text-sm text-text-secondary">
        {label ?? 'Серия начнётся с первого ритуала'}
      </p>
    );
  }
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-streak/15 text-accent-streak">
      <span aria-hidden>🔥</span>
      <motion.span
        key={count}
        initial={{ scale: 0.9, opacity: 0.6 }}
        animate={{ scale: 1, opacity: 1 }}
        className="font-medium"
      >
        {count} {plural(count, ['день', 'дня', 'дней'])} подряд
      </motion.span>
    </div>
  );
}
