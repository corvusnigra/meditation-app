'use client';

import { AnimatePresence } from 'framer-motion';
import { GROUNDING_SENSES } from '@/lib/constants';
import type { Scenario } from '@/lib/types';
import { SenseCard } from './SenseCard';

type Props = {
  currentIndex: number;
  scenario: Scenario;
  onNext: () => void;
};

export function SenseCarousel({ currentIndex, scenario, onNext }: Props) {
  const sense = GROUNDING_SENSES[currentIndex];
  if (!sense) return null;
  return (
    <div className="flex-1 flex items-center justify-center w-full">
      <AnimatePresence mode="wait">
        <SenseCard
          key={currentIndex}
          icon={sense.icon}
          count={sense.count}
          label={sense.label}
          prompt={sense.prompts[scenario]}
          isLast={currentIndex === GROUNDING_SENSES.length - 1}
          onNext={onNext}
        />
      </AnimatePresence>
    </div>
  );
}
