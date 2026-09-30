'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { PageShell } from '@/components/shared/PageShell';
import { HapticButton, HapticLink } from '@/components/shared/HapticButton';
import { cardClass } from '@/components/ui/Card';
import { StreakCounter } from '@/components/history/StreakCounter';
import { UpgradeBanner } from '@/components/progression/UpgradeBanner';
import { useHistory } from '@/context/HistoryContext';
import { useSession } from '@/context/SessionContext';
import { useProgressionContext } from '@/context/ProgressionContext';
import { useHaptics } from '@/hooks/useHaptics';
import { useSettings } from '@/context/SettingsContext';
import { COMPLETION_QUOTES } from '@/lib/constants';
import { cn, pickRandom, plural } from '@/lib/utils';

export default function CompletePage() {
  const { sessions, streak, lastRitual } = useHistory();
  const { state, reset } = useSession();
  const { durations, upgradeOffer, acceptUpgrade, declineUpgrade } =
    useProgressionContext();
  const { settings } = useSettings();
  const haptics = useHaptics(settings.hapticsEnabled);

  const quote = useMemo(() => pickRandom(COMPLETION_QUOTES), []);
  const lastGratitude = state.gratitudeText.trim() ||
    sessions[sessions.length - 1]?.gratitudeText ||
    '';
  const [canShare, setCanShare] = useState(false);

  const levelMinutes = Math.round(durations.total / 60);
  // Сколько длился только что законченный ритуал — по записи в истории.
  const sessionMinutes = lastRitual
    ? Math.max(Math.round(lastRitual.durationMs / 60000), 1)
    : null;

  useEffect(() => {
    haptics('success');
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      setCanShare(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  const handleShare = async () => {
    if (typeof navigator === 'undefined') return;
    if ('share' in navigator) {
      try {
        await navigator.share({
          title: 'Микро-осознанность',
          text:
            `${streak} ${plural(streak, ['день', 'дня', 'дней'])} подряд — ` +
            `по ${levelMinutes} ${plural(levelMinutes, ['минуте', 'минуты', 'минут'])}.`,
        });
      } catch {
        // user dismissed
      }
    }
  };

  return (
    <PageShell>
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-8 py-10">
        <div className="relative w-40 h-40 flex items-center justify-center">
          {[...Array(6)].map((_, i) => (
            <motion.span
              key={i}
              aria-hidden
              className="absolute inset-0 rounded-full border border-success/40"
              initial={{ scale: 0.4, opacity: 0.8 }}
              animate={{ scale: 1.4 + i * 0.15, opacity: 0 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
                ease: 'easeOut',
              }}
            />
          ))}
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-20 h-20 rounded-full bg-success/20 border border-success flex items-center justify-center"
          >
            <span className="text-success text-3xl" aria-hidden>✓</span>
          </motion.div>
        </div>

        <motion.div
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h1 className="text-3xl font-medium mb-2">Готово.</h1>
          <p className="text-text-secondary">
            {sessionMinutes
              ? `${sessionMinutes} ${plural(sessionMinutes, ['минута', 'минуты', 'минут'])} — и вы здесь.`
              : 'Вы здесь.'}
          </p>
        </motion.div>

        {streak > 0 && <StreakCounter count={streak} />}

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-sm text-text-secondary italic max-w-xs text-balance"
        >
          «{quote}»
        </motion.p>

        {lastGratitude && (
          <motion.div
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1 }}
            className={cn(cardClass(), 'p-4 max-w-xs')}
          >
            <p className="text-xs uppercase tracking-wider text-accent-gratitude mb-2">
              Сегодняшняя благодарность
            </p>
            <p className="text-sm text-text-primary/80">«{lastGratitude}»</p>
          </motion.div>
        )}
      </div>

      {upgradeOffer && (
        <div className="pb-4">
          <UpgradeBanner
            nextLevel={upgradeOffer.nextLvl}
            streak={streak}
            onAccept={acceptUpgrade}
            onDecline={declineUpgrade}
          />
        </div>
      )}

      <div className="flex flex-col gap-2 pb-6">
        <HapticLink href="/" size="lg" block>
          На главную
        </HapticLink>
        <div className="grid grid-cols-2 gap-2">
          {canShare && (
            <HapticButton variant="ghost" onClick={handleShare}>
              Поделиться
            </HapticButton>
          )}
          <HapticLink
            href="/history"
            variant="ghost"
            className={canShare ? undefined : 'col-span-2'}
          >
            История
          </HapticLink>
        </div>
      </div>
    </PageShell>
  );
}
