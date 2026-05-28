'use client';

import { SCENARIO_LABEL, LEVEL_LABEL } from '@/lib/constants';
import { formatLongDate } from '@/lib/utils';
import type { CompletedSession } from '@/lib/types';

type Props = {
  session: CompletedSession;
};

export function SessionCard({ session }: Props) {
  const minutes = Math.round(session.durationMs / 60000);
  return (
    <div className="rounded-2xl bg-bg-card/60 border border-white/5 p-4">
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-sm text-text-secondary">
          {formatLongDate(session.date)}
        </span>
        <span className="text-xs text-text-secondary">
          {minutes} мин · {LEVEL_LABEL[session.level]}
        </span>
      </div>
      <div className="text-xs uppercase tracking-widest text-accent-grounding mb-2">
        {SCENARIO_LABEL[session.scenario]}
      </div>
      {session.gratitudeText ? (
        <p className="text-sm text-text-primary/80 leading-relaxed">
          «{session.gratitudeText}»
        </p>
      ) : (
        <p className="text-sm text-text-secondary/60 italic">
          Без записи — просто подумал(а)
        </p>
      )}
    </div>
  );
}
