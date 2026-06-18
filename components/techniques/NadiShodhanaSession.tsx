'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PageShell } from '@/components/shared/PageShell';
import { HapticButton } from '@/components/shared/HapticButton';
import { useNostrilCycle } from '@/hooks/useNostrilCycle';
import { useBreathingAudio } from '@/hooks/useBreathingAudio';
import { usePhaseHaptics } from '@/hooks/useHaptics';
import { useWakeLock } from '@/hooks/useWakeLock';
import { entrainmentHzForCategory } from '@/lib/entrainment';
import { useSettings } from '@/context/SettingsContext';
import { useHistory } from '@/context/HistoryContext';
import { useProgressionContext } from '@/context/ProgressionContext';
import { ensureAudio } from '@/lib/breathing-audio';
import type {
  BreathingTechnique,
  NostrilPhase,
  NostrilTechniqueConfig,
} from '@/lib/types';
import { randomId, plural, cn } from '@/lib/utils';

type Props = { technique: BreathingTechnique };

const ACTION: Record<NostrilPhase, string> = {
  'inhale-left': 'Вдох',
  'exhale-right': 'Выдох',
  'inhale-right': 'Вдох',
  'exhale-left': 'Выдох',
};

const HINT: Record<NostrilPhase, string> = {
  'inhale-left': 'Закройте правую ноздрю · вдох через левую',
  'exhale-right': 'Откройте правую, закройте левую · выдох',
  'inhale-right': 'Вдох через правую ноздрю',
  'exhale-left': 'Закройте правую · выдох через левую',
};

const isLeftActive = (p: NostrilPhase) =>
  p === 'inhale-left' || p === 'exhale-left';
const isInhale = (p: NostrilPhase) =>
  p === 'inhale-left' || p === 'inhale-right';

export function NadiShodhanaSession({ technique }: Props) {
  const router = useRouter();
  const { settings } = useSettings();
  const { add } = useHistory();
  const { state: progression } = useProgressionContext();
  const phaseHaptics = usePhaseHaptics(
    settings.hapticGuideEnabled,
    settings.hapticsEnabled,
  );
  const config = technique.config as NostrilTechniqueConfig;

  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const startedAtRef = useRef<number | null>(null);

  useWakeLock(started && !completed);

  const audio = useBreathingAudio({
    enabled: settings.ambientEnabled,
    preset: settings.ambientPreset,
    volume: settings.ambientVolume,
    active: started && !completed,
    entrainment: settings.entrainmentEnabled,
    entrainmentHz: entrainmentHzForCategory(technique.category),
  });

  const handleComplete = () => {
    if (completed) return;
    setCompleted(true);
    add({
      id: randomId(),
      date: new Date().toISOString(),
      scenario: 'custom',
      gratitudeText: '',
      durationMs: startedAtRef.current ? Date.now() - startedAtRef.current : 0,
      completedPhases: ['breathing'],
      level: progression.currentLevel,
      kind: 'technique',
      techniqueId: technique.id,
      techniqueName: technique.name,
    });
  };

  const { phase, cycleIndex, secondsInPhase, phaseDuration } = useNostrilCycle({
    inhaleSec: config.inhaleSec,
    exhaleSec: config.exhaleSec,
    cycles: config.cycles,
    active: started && !completed,
    onPhaseChange: (next) => {
      const bp = isInhale(next) ? 'inhale' : 'exhale';
      phaseHaptics(bp);
      audio.onPhase(bp, isInhale(next) ? config.inhaleSec : config.exhaleSec);
    },
    onComplete: handleComplete,
  });

  const remaining = Math.max(Math.ceil(phaseDuration - secondsInPhase), 1);

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
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-5 py-6">
          <div className="text-6xl" aria-hidden>👃</div>
          <div className="space-y-2">
            <h1 className="text-2xl font-medium">{technique.name}</h1>
            <p className="text-text-secondary text-sm max-w-xs mx-auto">
              {technique.description}
            </p>
          </div>
          <div className="rounded-2xl bg-bg-card/60 border border-white/5 p-4 text-left text-sm space-y-1.5 max-w-xs w-full">
            <p>
              <span className="text-text-secondary">·</span> Большим пальцем
              правой руки закрывайте правую ноздрю, безымянным — левую
            </p>
            <p>
              <span className="text-text-secondary">·</span> Вдох одной ноздрёй —
              выдох другой, затем наоборот
            </p>
            <p className="text-xs text-text-secondary pt-2">
              {config.cycles}{' '}
              {plural(config.cycles, ['цикл', 'цикла', 'циклов'])} · следуйте
              подсказкам на экране.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 pb-6">
          <HapticButton
            size="lg"
            haptic="success"
            onClick={async () => {
              if (settings.ambientEnabled || settings.entrainmentEnabled) {
                await ensureAudio(settings.ambientPreset, settings.ambientVolume);
              }
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
            <span className="text-success text-3xl" aria-hidden>✓</span>
          </motion.div>
          <div>
            <h1 className="text-2xl font-medium mb-2">Готово</h1>
            <p className="text-text-secondary text-sm">
              {config.cycles}{' '}
              {plural(config.cycles, ['цикл', 'цикла', 'циклов'])} · опустите
              руку, подышите свободно
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

  const leftActive = isLeftActive(phase);
  const inhaling = isInhale(phase);

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
          Цикл {Math.min(cycleIndex + 1, config.cycles)} / {config.cycles}
        </span>
      </div>

      <motion.div
        className="flex-1 flex flex-col items-center justify-center gap-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Две ноздри: активная подсвечена и «дышит», закрытая затемнена */}
        <div className="flex items-center gap-6" aria-hidden>
          <Nostril active={leftActive} inhaling={inhaling} label="Л" />
          <Nostril active={!leftActive} inhaling={inhaling} label="П" />
        </div>

        <div className="text-center px-4" aria-live="polite">
          <p
            className={cn(
              'text-xs uppercase tracking-[0.25em] mb-1',
              inhaling ? 'text-accent-breathing' : 'text-accent-grounding',
            )}
          >
            {ACTION[phase]} · {leftActive ? 'левая' : 'правая'}
          </p>
          <p className="text-3xl font-light tabular-nums mb-2">{remaining}</p>
          <p className="text-sm text-text-secondary max-w-xs mx-auto">
            {HINT[phase]}
          </p>
        </div>
      </motion.div>

      <div className="flex justify-center gap-3 pb-6">
        <HapticButton variant="subtle" size="sm" onClick={handleComplete}>
          Завершить
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

function Nostril({
  active,
  inhaling,
  label,
}: {
  active: boolean;
  inhaling: boolean;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <motion.div
        className={cn(
          'rounded-full flex items-center justify-center text-sm font-medium',
          active
            ? 'bg-gradient-to-br from-accent-breathing/70 to-accent-breathing/25 text-bg-primary shadow-glow-breathing'
            : 'bg-white/5 text-text-secondary border border-white/10',
        )}
        animate={{
          scale: active ? (inhaling ? 1 : 0.7) : 0.6,
          opacity: active ? 1 : 0.35,
        }}
        transition={{ duration: active && !inhaling ? 1.2 : 0.9, ease: 'easeInOut' }}
        style={{ width: 96, height: 96 }}
      >
        {label}
      </motion.div>
      {!active && (
        <span className="text-[10px] uppercase tracking-widest text-text-secondary">
          закрыта
        </span>
      )}
    </div>
  );
}
