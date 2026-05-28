'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSession } from '@/context/SessionContext';
import { useHistory } from '@/context/HistoryContext';
import { useProgressionContext } from '@/context/ProgressionContext';
import { useSettings } from '@/context/SettingsContext';
import { ensureAudio } from '@/lib/breathing-audio';
import { PageShell } from '@/components/shared/PageShell';
import { HapticButton } from '@/components/shared/HapticButton';
import { StreakCounter } from '@/components/history/StreakCounter';
import { LevelBadge } from '@/components/progression/LevelBadge';
import { SCENARIO_DESCRIPTION, SCENARIO_LABEL } from '@/lib/constants';
import type { Scenario } from '@/lib/types';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const SCENARIOS: Scenario[] = ['morning', 'commute', 'sunset', 'custom'];

export default function HomePage() {
  const router = useRouter();
  const { start } = useSession();
  const { streak, sessions } = useHistory();
  const { durations, state: progression } = useProgressionContext();
  const { settings } = useSettings();
  const [selected, setSelected] = useState<Scenario>('custom');

  const onStart = () => {
    if (settings.ambientEnabled) {
      void ensureAudio(settings.ambientPreset, settings.ambientVolume);
    }
    start(selected);
    router.push('/session/breathing');
  };

  return (
    <PageShell>
      <header className="flex items-center justify-between text-sm text-text-secondary">
        <span>Микро-осознанность</span>
        <nav className="flex items-center gap-3">
          <Link href="/history" aria-label="История" className="hover:text-text-primary transition-colors">
            История
          </Link>
          <Link href="/settings" aria-label="Настройки" className="hover:text-text-primary transition-colors">
            Настройки
          </Link>
        </nav>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center text-center gap-8 py-10">
        <motion.div
          aria-hidden
          className="w-56 h-56 rounded-full bg-gradient-to-br from-accent-breathing/60 via-accent-breathing/20 to-transparent breath-circle shadow-glow"
        />

        <div className="space-y-3">
          <motion.h1
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="text-3xl sm:text-4xl font-medium text-balance"
          >
            5 минут. 3 шага. Один ритуал.
          </motion.h1>
          <motion.p
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="text-text-secondary"
          >
            Дыхание → Заземление → Благодарность
          </motion.p>
        </div>

        <div className="flex flex-col items-center gap-3">
          <HapticButton onClick={onStart} size="lg" haptic="success">
            Начать практику
          </HapticButton>
          <LevelBadge level={progression.currentLevel} durations={durations} />
        </div>

        {streak > 0 && (
          <StreakCounter count={streak} />
        )}
      </div>

      <section className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-text-secondary text-center">
          Сценарий
        </p>
        <div className="grid grid-cols-2 gap-2">
          {SCENARIOS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSelected(s)}
              className={cn(
                'rounded-2xl px-4 py-3 text-left border transition-colors',
                selected === s
                  ? 'border-accent-breathing/60 bg-accent-breathing/10'
                  : 'border-white/5 bg-white/[0.03] hover:bg-white/[0.06]',
              )}
            >
              <div className="text-sm font-medium text-text-primary">
                {SCENARIO_LABEL[s]}
              </div>
              <div className="text-[11px] text-text-secondary mt-0.5">
                {SCENARIO_DESCRIPTION[s]}
              </div>
            </button>
          ))}
        </div>
        {sessions.length > 0 && (
          <p className="text-xs text-text-secondary text-center pt-3">
            Всего сессий: {sessions.length}
          </p>
        )}
      </section>
    </PageShell>
  );
}
