'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { cn, dayKeyToDate, getMonthGrid, isoDayKey } from '@/lib/utils';
import type { CompletedSession } from '@/lib/types';

type Props = {
  sessions: CompletedSession[];
  // Ключ сегодняшнего дня. До монтирования — null: при пререндере «сегодня»
  // было бы днём сборки, а не днём человека.
  today: string | null;
  onSelect?: (iso: string) => void;
};

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

// Отметка прижата к низу ячейки и не сдвигает число: числа в ряду стоят на одной линии.
const MARK_IN_CELL = 'absolute bottom-0.5 left-1/2 -translate-x-1/2';

function monthTitle(month: Date): string {
  const name = month.toLocaleDateString('ru-RU', { month: 'long' });
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} ${month.getFullYear()}`;
}

function dayTitle(iso: string): string {
  return dayKeyToDate(iso).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
  });
}

export function CalendarGrid({ sessions, today, onSelect }: Props) {
  const [monthOffset, setMonthOffset] = useState(0);

  const month = useMemo(() => {
    if (!today) return null;
    const base = dayKeyToDate(today);
    return new Date(base.getFullYear(), base.getMonth() + monthOffset, 1);
  }, [today, monthOffset]);

  const cells = useMemo(() => (month ? getMonthGrid(month) : null), [month]);

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

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Button
          variant="pill"
          size="icon"
          onClick={() => setMonthOffset((offset) => offset - 1)}
          aria-label="Предыдущий месяц"
        >
          ‹
        </Button>
        <span className="text-sm">{month ? monthTitle(month) : ''}</span>
        <Button
          variant="pill"
          size="icon"
          onClick={() => setMonthOffset((offset) => offset + 1)}
          aria-label="Следующий месяц"
        >
          ›
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map((w) => (
          <span
            key={w}
            className="text-xs uppercase tracking-wider text-text-secondary text-center"
          >
            {w}
          </span>
        ))}
      </div>
      {cells && today ? (
        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell, i) => {
            if (!cell) return <span key={i} className="aspect-square" />;
            const ritual = ritualDays.has(cell.iso);
            const techniqueOnly = techniqueOnlyDays.has(cell.iso);
            // Ключи дней — YYYY-MM-DD, поэтому сравниваются как строки.
            const isFuture = cell.iso > today;
            const className = cn(
              'relative aspect-square rounded-lg border flex items-center justify-center text-xs',
              cell.iso === today ? 'border-accent-breathing/70' : 'border-transparent',
              ritual
                ? 'bg-success/15 text-success'
                : techniqueOnly
                  ? 'bg-accent-gratitude/10 text-accent-gratitude'
                  : isFuture
                    ? 'text-text-secondary'
                    : 'bg-white/5 text-text-secondary',
            );
            const content = (
              <>
                <span>{cell.day}</span>
                {ritual && <RitualMark className={MARK_IN_CELL} />}
                {techniqueOnly && <TechniqueMark className={MARK_IN_CELL} />}
              </>
            );
            // Нажимается только прошедший день с записями: по остальным
            // фильтровать нечего.
            if (isFuture || (!ritual && !techniqueOnly)) {
              return (
                <span key={cell.iso} className={className}>
                  {content}
                </span>
              );
            }
            return (
              <button
                key={cell.iso}
                type="button"
                onClick={() => onSelect?.(cell.iso)}
                aria-label={`${dayTitle(cell.iso)}: ${ritual ? 'ритуал' : 'только техника'}`}
                className={cn(className, 'tap-target')}
              >
                {content}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="aspect-[7/5]" />
      )}
      <ul className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-text-secondary">
        <li className="flex items-center gap-1.5">
          <RitualMark />
          ритуал
        </li>
        <li className="flex items-center gap-1.5">
          <TechniqueMark />
          только техника
        </li>
        <li className="flex items-center gap-1.5">
          <span
            aria-hidden
            className="h-3 w-3 rounded border border-accent-breathing/70"
          />
          сегодня
        </li>
      </ul>
    </div>
  );
}

// Отметки различаются формой, а не только цветом: точка и кольцо.
function RitualMark({ className }: { className?: string }) {
  return <span aria-hidden className={cn('h-2 w-2 rounded-full bg-success', className)} />;
}

function TechniqueMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'h-2 w-2 rounded-full border-[1.5px] border-accent-gratitude',
        className,
      )}
    />
  );
}
