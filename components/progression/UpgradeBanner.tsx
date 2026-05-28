'use client';

import { motion } from 'framer-motion';
import { LEVEL_DURATIONS, LEVEL_LABEL } from '@/lib/constants';
import type { ProgressionLevel } from '@/lib/types';
import { HapticButton } from '@/components/shared/HapticButton';

type Props = {
  nextLevel: ProgressionLevel;
  streak: number;
  onAccept: () => void;
  onDecline: () => void;
};

export function UpgradeBanner({ nextLevel, streak, onAccept, onDecline }: Props) {
  const minutes = Math.round(LEVEL_DURATIONS[nextLevel].total / 60);
  return (
    <motion.div
      initial={{ y: 12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="rounded-3xl border border-accent-breathing/30 bg-accent-breathing/5 p-5 text-left"
    >
      <p className="text-sm text-accent-breathing mb-1">🌱 {streak} дней подряд — впечатляет</p>
      <h3 className="text-lg font-medium mb-2">
        Попробуем {minutes} минут завтра?
      </h3>
      <p className="text-sm text-text-secondary mb-4">
        Перейдём на уровень {nextLevel} — {LEVEL_LABEL[nextLevel]}. Добавим времени к
        фазам, ничего нового изучать не нужно.
      </p>
      <div className="flex gap-2">
        <HapticButton onClick={onAccept} size="sm" haptic="success">
          Попробую
        </HapticButton>
        <HapticButton onClick={onDecline} variant="ghost" size="sm">
          Пока на текущем
        </HapticButton>
      </div>
    </motion.div>
  );
}
