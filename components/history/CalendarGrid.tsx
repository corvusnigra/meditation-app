'use client';

import { useMemo, useState } from 'react';
import { getMonthGrid, isoDayKey } from '@/lib/utils';
import type { CompletedSession } from '@/lib/types';
import { cn } from '@/lib/utils';

type Props = {
  sessions: CompletedSession[];
  onSelect?: (iso: string) => void;
};

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export function CalendarGrid({ sessions, onSelect }: Props) {
  const [cursor, setCursor] = useState(() => new Date());
  const cells = useMemo(() => getMonthGrid(cursor), [cursor]);
  const todayKey = isoDayKey(new Date());

  const { ritualDays, techniqueOnlyDays } = useMemo(() => {
    const rituals = new Set<string>();
    const techniques = new Set<string>();
    sessions.forEach((sess) => {
      const key = isoDayKey(sess.date);
      if (sess.kind === 'technique') techniques.add(key);
      else rituals.add(key);
    });
    rituals.forEach((key) => techniques.delete(key));
    return { ritualDays: rituals, techniqueOnlyDays: techniques };
  }, [sessions]);

  const monthTitle = cursor.toLocaleDateString('ru-RU', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() =>
            setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1))
          }
          className="text-text-secondary hover:text-text-primary px-2 py-1 rounded"
          aria-label="Предыдущий месяц"
        >
          ‹
        </button>
        <span className="text-sm capitalize">{monthTitle}</span>
        <button
          type="button"
          onClick={() =>
            setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1))
          }
          className="text-text-secondary hover:text-text-primary px-2 py-1 rounded"
          aria-label="Следующий месяц"
        >
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map((w) => (
          <span
            key={w}
            className="text-[10px] uppercase tracking-widest text-text-secondary text-center"
          >
            {w}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          if (!cell) return <span key={i} className="aspect-square" />;
          const ritual = ritualDays.has(cell.iso);
          const techniqueOnly = techniqueOnlyDays.has(cell.iso);
          const isToday = cell.iso === todayKey;
          return (
            <button
              key={cell.iso}
              type="button"
              onClick={() => onSelect?.(cell.iso)}
              className={cn(
                'aspect-square rounded-lg flex flex-col items-center justify-center gap-0.5 text-xs',
                'transition-colors',
                isToday ? 'border border-accent-breathing/70' : 'border border-transparent',
                ritual
                  ? 'bg-success/15 text-success'
                  : techniqueOnly
                    ? 'bg-accent-gratitude/10 text-accent-gratitude'
                    : 'bg-white/5 text-text-secondary hover:bg-white/10',
              )}
            >
              <span>{cell.day}</span>
              {ritual && (
                <span className="w-1.5 h-1.5 rounded-full bg-success" aria-hidden />
              )}
              {!ritual && techniqueOnly && (
                <span
                  className="w-1.5 h-1.5 rounded-full bg-accent-gratitude"
                  aria-hidden
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
