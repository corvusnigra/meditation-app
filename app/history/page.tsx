'use client';

import { useMemo, useState } from 'react';
import { PageShell } from '@/components/shared/PageShell';
import { PageHeader } from '@/components/shared/PageHeader';
import { HapticButton } from '@/components/shared/HapticButton';
import { Card } from '@/components/ui/Card';
import { StreakCounter } from '@/components/history/StreakCounter';
import { CalendarGrid } from '@/components/history/CalendarGrid';
import { SessionCard } from '@/components/history/SessionCard';
import { useHistory } from '@/context/HistoryContext';
import { dayKeyToDate, isoDayKey, plural } from '@/lib/utils';

export default function HistoryPage() {
  const { sessions, streak, longest, totalMinutes, todayKey, hydrated } = useHistory();
  const [filterDay, setFilterDay] = useState<string | null>(null);

  const recent = useMemo(() => {
    const list = [...sessions].reverse();
    if (!filterDay) return list.slice(0, 10);
    return list.filter((s) => isoDayKey(s.date) === filterDay);
  }, [sessions, filterDay]);

  const challengeProgress = Math.min(streak, 7);

  const listTitle = filterDay
    ? dayKeyToDate(filterDay).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
      })
    : 'Последние сессии';

  return (
    <PageShell>
      <PageHeader back={{ href: '/', label: 'Главная' }} title="История" />

      <section className="text-center mb-6">
        <StreakCounter count={streak} />
      </section>

      {hydrated && streak > 0 && (
        <section className="mb-6">
          <p className="text-xs uppercase tracking-wider text-text-secondary mb-2">
            Челлендж 7 дней
          </p>
          <div className="flex gap-1.5">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className={
                  i < challengeProgress
                    ? 'flex-1 h-2 rounded-full bg-accent-streak'
                    : 'flex-1 h-2 rounded-full bg-white/10'
                }
              />
            ))}
          </div>
          {streak >= 7 && (
            <p className="text-sm text-success mt-2">Челлендж пройден.</p>
          )}
        </section>
      )}

      <section className="mb-6">
        <CalendarGrid
          sessions={sessions}
          today={hydrated ? todayKey : null}
          onSelect={(iso) => setFilterDay((prev) => (prev === iso ? null : iso))}
        />
      </section>

      <section className="grid grid-cols-3 gap-2 mb-6">
        <Stat
          label={plural(sessions.length, ['Сессия', 'Сессии', 'Сессий'])}
          value={sessions.length}
        />
        <Stat label="Лучшая серия" value={longest} suffix="дн." />
        <Stat
          label={plural(totalMinutes, ['Минута', 'Минуты', 'Минут'])}
          value={totalMinutes}
        />
      </section>

      <section className="space-y-3 pb-6">
        <div className="flex min-h-11 items-center justify-between gap-3">
          <h2 className="text-xs uppercase tracking-wider text-text-secondary">
            {listTitle}
          </h2>
          {filterDay && (
            <HapticButton variant="pill" size="sm" onClick={() => setFilterDay(null)}>
              Сбросить
            </HapticButton>
          )}
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-text-secondary">Здесь появятся сессии.</p>
        ) : (
          recent.map((s) => <SessionCard key={s.id} session={s} />)
        )}
      </section>
    </PageShell>
  );
}

function Stat({ label, value, suffix }: { label: string; value: number; suffix?: string }) {
  return (
    <Card className="p-3 text-center">
      <div className="text-xl font-medium tabular-nums">
        {value}
        {suffix && <span className="text-sm text-text-secondary ml-1">{suffix}</span>}
      </div>
      <div className="text-xs uppercase tracking-wider text-text-secondary mt-1">
        {label}
      </div>
    </Card>
  );
}
