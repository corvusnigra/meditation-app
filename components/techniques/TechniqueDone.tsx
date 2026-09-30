'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { PageShell } from '@/components/shared/PageShell';
import { HapticLink } from '@/components/shared/HapticButton';
import { isAdaptive } from '@/lib/breathing-techniques';
import { unitsLabel, unitsOfLabel } from '@/lib/practice';
import type { BreathingTechnique, PracticeUnit, TechniqueFeedback } from '@/lib/types';
import { cn, formatSpentDuration } from '@/lib/utils';

type Props = {
  technique: BreathingTechnique;
  level: number;
  done: number;
  planned: number;
  unit: PracticeUnit;
  durationMs: number;
  hint?: string;
  applyFeedback: (feedback: TechniqueFeedback) => number;
};

export function TechniqueDone({
  technique,
  level,
  done,
  planned,
  unit,
  durationMs,
  hint,
  applyFeedback,
}: Props) {
  const complete = done >= planned;
  // «Как было?» — только после полной практики: по её части о сложности не судят.
  const askFeedback = complete && isAdaptive(technique);
  const [verdict, setVerdict] = useState<string | null>(null);

  const onFeedback = (feedback: TechniqueFeedback) => {
    const next = applyFeedback(feedback);
    if (next > level) setVerdict('В следующий раз — чуть длиннее и глубже.');
    else if (next < level) setVerdict('В следующий раз сделаем мягче.');
    else if (feedback === 'easy') setVerdict('Это уже самый глубокий уровень.');
    else if (feedback === 'hard') setVerdict('Это уже самый мягкий уровень.');
    else setVerdict('Отлично — оставляем как есть.');
  };

  const fact = complete ? unitsLabel(planned, unit) : unitsOfLabel(done, planned, unit);

  return (
    <PageShell>
      <div className="flex flex-1 flex-col items-center justify-center gap-6 py-10 text-center">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex h-20 w-20 items-center justify-center rounded-full border border-success bg-success/20"
        >
          <span className="text-3xl text-success" aria-hidden>
            ✓
          </span>
        </motion.div>
        <div>
          <h1 className="mb-2 text-2xl font-medium">Готово</h1>
          <p className="text-sm text-text-secondary">{technique.name}</p>
          <p className="mt-1 text-sm text-text-secondary">
            {fact} · {formatSpentDuration(durationMs)}
          </p>
          {complete && hint && (
            <p className="mt-3 text-sm text-text-primary/80">{hint}</p>
          )}
        </div>

        {askFeedback && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="w-full max-w-xs"
          >
            {verdict === null ? (
              <>
                <p className="mb-3 text-sm text-text-secondary">Как было?</p>
                <div className="grid grid-cols-3 gap-2">
                  <FeedbackButton
                    emoji="😮‍💨"
                    label="Легко"
                    onClick={() => onFeedback('easy')}
                  />
                  <FeedbackButton
                    emoji="🙂"
                    label="В самый раз"
                    onClick={() => onFeedback('right')}
                  />
                  <FeedbackButton
                    emoji="😮"
                    label="Сложно"
                    onClick={() => onFeedback('hard')}
                  />
                </div>
              </>
            ) : (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-accent-breathing"
              >
                {verdict}
              </motion.p>
            )}
          </motion.div>
        )}
      </div>

      <div className="flex flex-col gap-2 pb-6">
        <HapticLink href="/" size="lg" block>
          На главную
        </HapticLink>
        <HapticLink href="/techniques" variant="ghost" block>
          Другая техника
        </HapticLink>
      </div>
    </PageShell>
  );
}

function FeedbackButton({
  emoji,
  label,
  onClick,
}: {
  emoji: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-2xl border border-white/5 bg-bg-card/60 hover:bg-bg-card/90',
        'flex flex-col items-center gap-1 px-2 py-3 transition-colors active:scale-[0.97]',
      )}
    >
      <span className="text-xl" aria-hidden>
        {emoji}
      </span>
      <span className="text-center text-xs leading-tight text-text-secondary">
        {label}
      </span>
    </button>
  );
}
