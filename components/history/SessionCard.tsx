'use client';

import { SCENARIO_LABEL, LEVEL_LABEL } from '@/lib/constants';
import { formatLongDate } from '@/lib/utils';
import type { CompletedSession } from '@/lib/types';

type Props = {
  session: CompletedSession;
};

export function SessionCard({ session }: Props) {
  const minutes = Math.max(Math.round(session.durationMs / 60000), 1);
  const isTechnique = session.kind === 'technique';
  const seconds = Math.round(session.durationMs / 1000);
  const durationLabel =
    isTechnique && seconds < 90 ? `${seconds} сек` : `${minutes} мин`;

  return (
    <div className="rounded-2xl bg-bg-card/60 border border-white/5 p-4">
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-sm text-text-secondary">
          {formatLongDate(session.date)}
        </span>
        <span className="text-xs text-text-secondary">
          {durationLabel}
          {!isTechnique && ` · ${LEVEL_LABEL[session.level]}`}
        </span>
      </div>
      <div
        className={
          'text-xs uppercase tracking-widest mb-2 ' +
          (isTechnique ? 'text-accent-gratitude' : 'text-accent-grounding')
        }
      >
        {isTechnique
          ? `Техника · ${session.techniqueName ?? ''}`.trim()
          : SCENARIO_LABEL[session.scenario]}
      </div>
      {isTechnique ? (
        <p className="text-sm text-text-secondary/80">
          {session.techniqueName ?? 'Дыхательная техника'}
        </p>
      ) : session.gratitudeText ? (
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
