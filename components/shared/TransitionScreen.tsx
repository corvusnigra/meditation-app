'use client';

import { motion } from 'framer-motion';

type Props = {
  title: string;
  subtitle?: string;
};

export function TransitionScreen({ title, subtitle }: Props) {
  return (
    <motion.div
      className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-bg-primary text-center px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.h2
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-3xl sm:text-4xl font-medium mb-3"
      >
        {title}
      </motion.h2>
      {subtitle ? (
        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-text-secondary"
        >
          {subtitle}
        </motion.p>
      ) : null}
    </motion.div>
  );
}
