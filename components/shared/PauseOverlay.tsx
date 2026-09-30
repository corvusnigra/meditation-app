'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import type { PauseReason } from '@/hooks/usePracticeClock';

type Props = {
  visible: boolean;
  reason?: PauseReason | null;
  onResume: () => void;
  // Без onSkip кнопки «Пропустить фазу» нет.
  onSkip?: () => void;
  onExit: () => void;
  exitLabel?: string;
  // Место под переключатель сигналов.
  children?: ReactNode;
};

// Esc и системный «назад» сюда приходят через useBackGuard страницы —
// своего обработчика клавиш у оверлея нет.
export function PauseOverlay({
  visible,
  reason,
  onResume,
  onSkip,
  onExit,
  exitLabel = 'Выйти без записи',
  children,
}: Props) {
  const titleId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const resumeRef = useRef<HTMLButtonElement>(null);

  // Пока пауза открыта, страница под ней недоступна ни с клавиатуры, ни для
  // программы чтения; после закрытия фокус возвращается туда, где был.
  useEffect(() => {
    if (!visible) return;
    const root = rootRef.current;
    const previous = document.activeElement;
    const siblings = root?.parentElement
      ? Array.from(root.parentElement.children).filter((el) => el !== root)
      : [];
    siblings.forEach((el) => el.setAttribute('inert', ''));
    resumeRef.current?.focus();
    return () => {
      siblings.forEach((el) => el.removeAttribute('inert'));
      if (previous instanceof HTMLElement && previous.isConnected) previous.focus();
    };
  }, [visible]);

  const text =
    reason === 'hidden'
      ? 'Приложение было свёрнуто — время остановлено.'
      : onSkip
        ? 'Можно вернуться, пропустить фазу или выйти.'
        : 'Можно вернуться или выйти.';

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={rootRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
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
            <h2 id={titleId} className="text-3xl font-medium mb-2">
              Пауза
            </h2>
            <p className="text-text-secondary mb-8">{text}</p>
            <div className="flex flex-col gap-3">
              <Button ref={resumeRef} onClick={onResume} size="lg">
                Продолжить
              </Button>
              {onSkip && (
                <Button onClick={onSkip} variant="ghost">
                  Пропустить фазу
                </Button>
              )}
              <Button onClick={onExit} variant="pill" size="sm">
                {exitLabel}
              </Button>
            </div>
            {children && <div className="mt-8">{children}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
