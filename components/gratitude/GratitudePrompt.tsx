'use client';

import { motion } from 'framer-motion';

type Props = {
  prompt: string;
};

export function GratitudePrompt({ prompt }: Props) {
  return (
    <motion.div
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1 }}
      className="text-center px-2"
    >
      <p className="text-xs uppercase tracking-[0.25em] text-text-secondary mb-3">
        Благодарность
      </p>
      <p className="text-base sm:text-lg text-text-primary/90 leading-relaxed">
        {prompt}
      </p>
      <p className="text-sm text-text-secondary mt-2">
        Не «здоровье», а «как солнце упало на чашку кофе утром».
      </p>
    </motion.div>
  );
}
