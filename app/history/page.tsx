'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { PageShell } from '@/components/shared/PageShell';
import { StreakCounter } from '@/components/history/StreakCounter';
import { CalendarGrid } from '@/components/history/CalendarGrid';
import { SessionCard } from '@/components/history/SessionCard';
import { useHistory } from '@/context/HistoryContext';
import { isoDayKey } from '@/lib/utils';
import { HapticButton } from '@/components/shared/HapticButton';

export default function HistoryPage() {
  const { sessions, streak, longest, totalMinutes, hydrated } = useHistory();
  const [filterDay, setFilterDay] = useState<string | null>(null);

  const recent = useMemo(() => {
    const list = [...sessions].reverse();
    if (!filterDay) return list.slice(0, 10);
    return list.filter((s) => isoDayKey(s.date) === filterDay);
  }, [sessions, filterDay]);

  const challengeProgress = Math.min(streak, 7);

  return (
    <PageShell>
      <header className="flex items-center justify-between mb-6 text-sm">
        <Link href="/" className="text-text-secondary hover:text-text-primary transition-colors">
          ← Главная
        </Link>
        <span className="text-text-secondary">История</span>
      </header>

      <section className="text-center mb-6">
        <StreakCounter count={streak} />
      </section>

      {hydrated && streak > 0 && (
        <section className="mb-6">
          <p className="text-xs uppercase tracking-widest text-text-secondary mb-2">
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
        <CalendarGrid sessions={sessions} onSelect={(iso) => setFilterDay((prev) => (prev === iso ? null : iso))} />
      </section>

      <section className="grid grid-cols-3 gap-2 mb-6">
        <Stat label="Сессии" value={sessions.length} />
        <Stat label="Лучшая серия" value={longest} suffix="дн." />
        <Stat label="Минуты" value={totalMinutes} />
      </section>

      <section className="space-y-3 pb-6">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm uppercase tracking-widest text-text-secondary">
            {filterDay ? 'За день' : 'Последние сессии'}
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
    <div className="rounded-2xl bg-bg-card/60 border border-white/5 p-3 text-center">
      <div className="text-xl font-medium tabular-nums">
        {value}
        {suffix && <span className="text-sm text-text-secondary ml-1">{suffix}</span>}
      </div>
      <div className="text-[11px] uppercase tracking-widest text-text-secondary mt-1">
        {label}
      </div>
    </div>
  );
}
