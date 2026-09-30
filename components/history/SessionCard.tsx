'use client';

import { Card } from '@/components/ui/Card';
import { TONE } from '@/components/ui/tones';
import { findTechnique } from '@/lib/breathing-techniques';
import { SCENARIO_LABEL, LEVEL_LABEL } from '@/lib/constants';
import { cn, formatLongDate } from '@/lib/utils';
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
  // Имя — из каталога, чтобы старые записи показывали нынешнее название;
  // у техник, которых в каталоге уже нет, остаётся сохранённое.
  const techniqueName =
    findTechnique(session.techniqueId)?.name ??
    session.techniqueName ??
    'Дыхательная техника';

  return (
    <Card className="p-4">
      <div className="flex items-baseline justify-between gap-3 mb-1">
        <span className="text-sm text-text-secondary">
          {formatLongDate(session.date)}
        </span>
        <span className="text-xs text-text-secondary">
          {durationLabel}
          {!isTechnique && ` · ${LEVEL_LABEL[session.level]}`}
        </span>
      </div>
      <div
        className={cn(
          'text-xs uppercase tracking-wider mb-2',
          isTechnique ? TONE.gratitude.text : TONE.grounding.text,
        )}
      >
        {isTechnique ? 'Техника' : SCENARIO_LABEL[session.scenario]}
      </div>
      {isTechnique ? (
        <p className="text-sm text-text-primary/80">{techniqueName}</p>
      ) : session.gratitudeText ? (
        <p className="text-sm text-text-primary/80 leading-relaxed">
          «{session.gratitudeText}»
        </p>
      ) : (
        <p className="text-sm text-text-secondary italic">
          Без записи — просто подумал(а)
        </p>
      )}
    </Card>
  );
}
