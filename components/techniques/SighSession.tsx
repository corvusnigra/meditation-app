'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PageShell } from '@/components/shared/PageShell';
import { HapticButton } from '@/components/shared/HapticButton';
import { useSighCycle, type SighPhase } from '@/hooks/useSighCycle';
import { useHaptics } from '@/hooks/useHaptics';
import { useSettings } from '@/context/SettingsContext';
import { useHistory } from '@/context/HistoryContext';
import { useProgressionContext } from '@/context/ProgressionContext';
import type {
  BreathingTechnique,
  SighTechniqueConfig,
} from '@/lib/types';
import { randomId } from '@/lib/utils';
import { cn } from '@/lib/utils';

type Props = { technique: BreathingTechnique };

const SCALE: Record<SighPhase, number> = {
  inhale1: 0.95,
  inhale2: 1.15,
  exhale: 0.55,
};

const LABEL: Record<SighPhase, string> = {
  inhale1: 'Вдох носом',
  inhale2: 'Ещё вдох',
  exhale: 'Длинный выдох ртом',
};

const HINT: Record<SighPhase, string> = {
  inhale1: 'короткий',
  inhale2: 'довдох сверху',
  exhale: 'медленно через рот',
};

export function SighSession({ technique }: Props) {
  const router = useRouter();
  const { settings } = useSettings();
  const { add } = useHistory();
  const { state: progression } = useProgressionContext();
  const haptics = useHaptics(settings.hapticsEnabled);

  const config = technique.config as SighTechniqueConfig;
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const startedAtRef = useRef<number | null>(null);

  const handleComplete = () => {
    if (completed) return;
    setCompleted(true);
    const durationMs = startedAtRef.current
      ? Date.now() - startedAtRef.current
      : config.cycles * 7000;
    add({
      id: randomId(),
      date: new Date().toISOString(),
      scenario: 'custom',
      gratitudeText: '',
      durationMs,
      completedPhases: ['breathing'],
      level: progression.currentLevel,
      kind: 'technique',
      techniqueId: technique.id,
      techniqueName: technique.name,
    });
    haptics('success');
  };

  const { phase, cycleIndex, secondsInPhase, phaseDuration } = useSighCycle({
    cycles: config.cycles,
    active: started && !completed,
    onPhaseChange: () => haptics('tap'),
    onComplete: handleComplete,
  });

  const remainingInPhase = Math.max(Math.ceil(phaseDuration - secondsInPhase), 1);

  if (!started) {
    return (
      <PageShell>
        <div className="flex items-baseline justify-between mb-6 text-xs">
          <Link
            href="/techniques"
            className="text-text-secondary hover:text-text-primary"
          >
            ← Техники
          </Link>
          <span className="uppercase tracking-widest text-text-secondary">
            {technique.name}
          </span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-6 py-10">
          <div className="text-6xl" aria-hidden>🌬</div>
          <div className="space-y-2">
            <h1 className="text-2xl font-medium">{technique.name}</h1>
            <p className="text-text-secondary text-sm max-w-xs mx-auto">
              {technique.description}
            </p>
          </div>
          <div className="rounded-2xl bg-bg-card/60 border border-white/5 p-4 text-left text-sm space-y-1.5 max-w-xs">
            <p><span className="text-text-secondary">1.</span> Короткий вдох носом</p>
            <p><span className="text-text-secondary">2.</span> Ещё один короткий вдох носом сверху</p>
            <p><span className="text-text-secondary">3.</span> Длинный выдох через рот</p>
            <p className="text-xs text-text-secondary pt-2">
              Повторим {config.cycles}{' '}
              {config.cycles === 1 ? 'раз' : config.cycles < 5 ? 'раза' : 'раз'}.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 pb-6">
          <HapticButton
            size="lg"
            haptic="success"
            onClick={() => {
              startedAtRef.current = Date.now();
              setStarted(true);
            }}
          >
            Начать
          </HapticButton>
        </div>
      </PageShell>
    );
  }

  if (completed) {
    return (
      <PageShell>
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-6 py-10">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="w-20 h-20 rounded-full bg-success/20 border border-success flex items-center justify-center"
          >
            <span className="text-success text-3xl" aria-hidden>
              ✓
            </span>
          </motion.div>
          <div>
            <h1 className="text-2xl font-medium mb-2">Готово</h1>
            <p className="text-text-secondary text-sm">
              {config.cycles}{' '}
              {config.cycles === 1 ? 'вздох' : 'вздоха'} ·{' '}
              чувствуете разницу?
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 pb-6">
          <Link href="/" className="block">
            <HapticButton size="lg" className="w-full">
              На главную
            </HapticButton>
          </Link>
          <Link href="/techniques" className="block">
            <HapticButton variant="ghost" className="w-full">
              Другая техника
            </HapticButton>
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="flex items-baseline justify-between text-xs">
        <Link
          href="/techniques"
          className="text-text-secondary hover:text-text-primary"
        >
          ← Техники
        </Link>
        <span className="uppercase tracking-widest text-text-secondary">
          Цикл {cycleIndex + 1} из {config.cycles}
        </span>
      </div>

      <motion.div
        className="flex-1 flex flex-col items-center justify-center gap-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="relative flex items-center justify-center">
          <motion.div
            aria-hidden
            className="absolute rounded-full bg-accent-grounding/15"
            animate={{ scale: SCALE[phase] * 1.4 }}
            transition={{
              duration: phase === 'exhale' ? 4 : phase === 'inhale1' ? 1.5 : 0.4,
              ease: 'easeInOut',
            }}
            style={{ width: 240, height: 240 }}
          />
          <motion.div
            className={cn(
              'relative rounded-full bg-gradient-to-br from-accent-grounding/80 to-accent-grounding/30',
              'shadow-glow-grounding',
            )}
            animate={{ scale: SCALE[phase] }}
            transition={{
              duration: phase === 'exhale' ? 4 : phase === 'inhale1' ? 1.5 : 0.4,
              ease: 'easeInOut',
            }}
            style={{ width: 180, height: 180 }}
          />
        </div>

        <div className="text-center">
          <p className="text-xl sm:text-2xl font-medium text-text-primary">
            {LABEL[phase]}
          </p>
          <p className="mt-1 text-xs uppercase tracking-widest text-text-secondary">
            {HINT[phase]}
          </p>
          <p className="mt-3 text-3xl font-light text-accent-grounding tabular-nums">
            {remainingInPhase}
          </p>
        </div>
      </motion.div>

      <div className="flex justify-center gap-3 pb-6">
        <HapticButton
          variant="subtle"
          size="sm"
          onClick={() => {
            handleComplete();
          }}
        >
          Хватит
        </HapticButton>
        <HapticButton
          variant="ghost"
          size="sm"
          onClick={() => router.push('/')}
        >
          На главную
        </HapticButton>
      </div>
    </PageShell>
  );
}
