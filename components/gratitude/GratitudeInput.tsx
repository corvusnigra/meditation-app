'use client';

import { motion } from 'framer-motion';

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  progress: number;
};

export function GratitudeInput({ value, onChange, placeholder, progress }: Props) {
  return (
    <motion.div
      initial={{ y: 12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.25 }}
      className="relative w-full"
    >
      <div
        className="absolute inset-0 rounded-3xl pointer-events-none"
        aria-hidden
        style={{
          background: `conic-gradient(var(--accent-gratitude) ${progress * 360}deg, transparent 0)`,
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
        className="relative w-full rounded-3xl bg-bg-card/80 border border-white/10 px-5 py-4 text-base text-text-primary placeholder-text-secondary/60 resize-none focus:outline-none focus:border-accent-gratitude/60 transition-colors"
      />
      <p className="mt-2 text-xs text-text-secondary text-center">
        Можно ничего не писать — достаточно подумать.
      </p>
    </motion.div>
  );
}
