'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { PageShell } from '@/components/shared/PageShell';
import { HapticButton } from '@/components/shared/HapticButton';
import { StreakCounter } from '@/components/history/StreakCounter';
import { UpgradeBanner } from '@/components/progression/UpgradeBanner';
import { useHistory } from '@/context/HistoryContext';
import { useSession } from '@/context/SessionContext';
import { useProgressionContext } from '@/context/ProgressionContext';
import { useHaptics } from '@/hooks/useHaptics';
import { useSettings } from '@/context/SettingsContext';
import { COMPLETION_QUOTES } from '@/lib/constants';
import { pickRandom } from '@/lib/utils';

export default function CompletePage() {
  const router = useRouter();
  const { sessions, streak } = useHistory();
  const { state, reset } = useSession();
  const { upgradeOffer, acceptUpgrade, declineUpgrade } = useProgressionContext();
  const { settings } = useSettings();
  const haptics = useHaptics(settings.hapticsEnabled);

  const quote = useMemo(() => pickRandom(COMPLETION_QUOTES), []);
  const lastGratitude = state.gratitudeText.trim() ||
    sessions[sessions.length - 1]?.gratitudeText ||
    '';
  const [canShare, setCanShare] = useState(false);

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

  const handleAccept = () => {
    if (upgradeOffer) acceptUpgrade(upgradeOffer.nextLvl);
  };

  const handleShare = async () => {
    if (typeof navigator === 'undefined') return;
    if ('share' in navigator) {
      try {
        await navigator.share({
          title: 'Микро-осознанность',
          text: `${streak} ${streak === 1 ? 'день' : 'дней'} подряд по 5 минут.`,
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
          <p className="text-text-secondary">5 минут — и вы здесь.</p>
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
            className="rounded-2xl bg-bg-card/60 border border-white/5 p-4 max-w-xs"
          >
            <p className="text-xs uppercase tracking-widest text-accent-gratitude mb-2">
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
            onAccept={handleAccept}
            onDecline={declineUpgrade}
          />
        </div>
      )}

      <div className="flex flex-col gap-2 pb-6">
        <Link href="/" className="block">
          <HapticButton size="lg" className="w-full">
            На главную
          </HapticButton>
        </Link>
        <div className="grid grid-cols-2 gap-2">
          {canShare && (
            <HapticButton variant="ghost" onClick={handleShare}>
              Поделиться
            </HapticButton>
          )}
          <Link
            href="/history"
            className={canShare ? 'block' : 'block col-span-2'}
          >
            <HapticButton variant="ghost" className="w-full">
              История
            </HapticButton>
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
