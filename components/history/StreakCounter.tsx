'use client';

import { motion } from 'framer-motion';

type Props = {
  count: number;
  label?: string;
};

function pluralDays(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'день';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'дня';
  return 'дней';
}

export function StreakCounter({ count, label }: Props) {
  if (count === 0) {
    return (
      <p className="text-sm text-text-secondary">
        {label ?? 'Серия начнётся с первой сессии'}
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
        {count} {pluralDays(count)} подряд
      </motion.span>
    </div>
  );
}
