'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

type Props = {
  visible: boolean;
  onResume: () => void;
  onSkip: () => void;
  onExit: () => void;
};

export function PauseOverlay({ visible, onResume, onSkip, onExit }: Props) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/80 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="text-center max-w-sm px-6"
          >
            <h2 className="text-3xl font-medium mb-2">Пауза</h2>
            <p className="text-text-secondary mb-8">
              Можно вернуться, пропустить фазу или закончить сессию.
            </p>
            <div className="flex flex-col gap-3">
              <Button onClick={onResume} size="lg">
                Продолжить
              </Button>
              <Button onClick={onSkip} variant="ghost">
                Пропустить фазу
              </Button>
              <Button onClick={onExit} variant="pill" size="sm">
                Закончить сессию
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
