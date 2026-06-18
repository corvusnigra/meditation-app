'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PageShell } from '@/components/shared/PageShell';
import { HapticButton } from '@/components/shared/HapticButton';
import { useWimHof, type WimHofStage } from '@/hooks/useWimHof';
import { useHaptics } from '@/hooks/useHaptics';
import { useWakeLock } from '@/hooks/useWakeLock';
import { entrainmentHzForCategory } from '@/lib/entrainment';
import { useBreathingAudio } from '@/hooks/useBreathingAudio';
import { useSettings } from '@/context/SettingsContext';
import { useHistory } from '@/context/HistoryContext';
import { useProgressionContext } from '@/context/ProgressionContext';
import { ensureAudio, setActive } from '@/lib/breathing-audio';
import type {
  BreathingTechnique,
  WimHofTechniqueConfig,
} from '@/lib/types';
import { randomId, formatTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

type Props = { technique: BreathingTechnique };

const STAGE_LABEL: Record<WimHofStage, string> = {
  breathing: 'Быстрое дыхание',
  retention: 'Задержка на пустых',
  recovery: 'Задержка на полных',
  completed: 'Готово',
};

export function WimHofSession({ technique }: Props) {
  const router = useRouter();
  const { settings } = useSettings();
  const { add } = useHistory();
  const { state: progression } = useProgressionContext();
  const haptics = useHaptics(settings.hapticsEnabled);

  const config = technique.config as WimHofTechniqueConfig;
  const [started, setStarted] = useState(false);
  const [acknowledgedWarning, setAcknowledgedWarning] = useState(false);
  const startedAtRef = useRef<number | null>(null);
  const completedRef = useRef(false);

  useWakeLock(started);

  return started ? (
    <RunningSession
      technique={technique}
      config={config}
      onComplete={(saved) => {
        if (completedRef.current) return;
        completedRef.current = true;
        haptics('success');
        if (!saved) return;
        add({
          id: randomId(),
          date: new Date().toISOString(),
          scenario: 'custom',
          gratitudeText: '',
          durationMs: startedAtRef.current
            ? Date.now() - startedAtRef.current
            : 0,
          completedPhases: ['breathing'],
          level: progression.currentLevel,
          kind: 'technique',
          techniqueId: technique.id,
          techniqueName: technique.name,
        });
      }}
      onTap={() => haptics('tap')}
      router={router}
    />
  ) : (
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
        <div className="text-6xl" aria-hidden>⚡</div>
        <div className="space-y-2">
          <h1 className="text-2xl font-medium">{technique.name}</h1>
          <p className="text-text-secondary text-sm max-w-xs mx-auto">
            {technique.description}
          </p>
        </div>

        <div className="rounded-2xl bg-bg-card/60 border border-white/5 p-4 text-left text-sm space-y-1.5 max-w-xs w-full">
          <p>
            <span className="text-text-secondary">1.</span>{' '}
            {config.breathsPerRound} глубоких вдохов + пассивных выдохов
          </p>
          <p>
            <span className="text-text-secondary">2.</span> Задержка на пустых лёгких — сколько получится
          </p>
          <p>
            <span className="text-text-secondary">3.</span> Глубокий вдох и задержка{' '}
            {config.recoveryHoldSec} секунд
          </p>
          <p className="text-xs text-text-secondary pt-2">
            Повторим {config.rounds} раза.
          </p>
        </div>

        <details className="text-left max-w-xs w-full">
          <summary className="text-xs uppercase tracking-widest text-accent-streak cursor-pointer">
            Важно перед началом
          </summary>
          <ul className="text-xs text-text-secondary mt-2 space-y-1 list-disc pl-4">
            <li>Сидя или лёжа в безопасном месте.</li>
            <li>Никогда за рулём, в воде, на высоте.</li>
            <li>Не делать при беременности, эпилепсии, серьёзных сердечных проблемах.</li>
            <li>Лёгкое головокружение и покалывание — нормально.</li>
            <li>Если стало плохо — нормально дышите и остановитесь.</li>
          </ul>
        </details>

        <label className="flex items-start gap-2 text-xs text-text-secondary cursor-pointer max-w-xs">
          <input
            type="checkbox"
            checked={acknowledgedWarning}
            onChange={(e) => setAcknowledgedWarning(e.target.checked)}
            className="mt-0.5"
          />
          <span>
            Прочитал, делаю в безопасном месте.
          </span>
        </label>
      </div>

      <div className="flex flex-col gap-2 pb-6">
        <HapticButton
          size="lg"
          haptic="success"
          disabled={!acknowledgedWarning}
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

function RunningSession({
  technique,
  config,
  onComplete,
  onTap,
  router,
}: {
  technique: BreathingTechnique;
  config: WimHofTechniqueConfig;
  onComplete: (saved: boolean) => void;
  onTap: () => void;
  router: ReturnType<typeof useRouter>;
}) {
  const { settings } = useSettings();
  const halfCycle = config.breathCycleSec / 2;

  const audio = useBreathingAudio({
    enabled: settings.ambientEnabled,
    preset: settings.ambientPreset,
    volume: settings.ambientVolume,
    active: true,
    entrainment: settings.entrainmentEnabled,
    entrainmentHz: entrainmentHzForCategory(technique.category),
  });

  const {
    stage,
    round,
    breathCount,
    breathInhale,
    retentionElapsed,
    recoveryRemaining,
    endRetention,
    finishEarly,
  } = useWimHof({
    rounds: config.rounds,
    breathsPerRound: config.breathsPerRound,
    breathCycleSec: config.breathCycleSec,
    recoveryHoldSec: config.recoveryHoldSec,
    onStageChange: (s) => {
      if (s === 'completed') onComplete(true);
      if (s === 'retention') {
        if (settings.ambientEnabled) setActive(false);
      } else if (s === 'recovery') {
        if (settings.ambientEnabled) {
          setActive(true);
          audio.onPhase('holdIn', config.recoveryHoldSec);
        }
      } else if (s === 'breathing') {
        if (settings.ambientEnabled) setActive(true);
      }
    },
  });

  // Pulse audio in sync with the fast breath rhythm.
  const lastInhaleRef = useRef(breathInhale);
  useEffect(() => {
    if (stage !== 'breathing') return;
    if (!settings.ambientEnabled) return;
    if (lastInhaleRef.current !== breathInhale) {
      lastInhaleRef.current = breathInhale;
      audio.onPhase(breathInhale ? 'inhale' : 'exhale', halfCycle);
    }
  }, [breathInhale, stage, settings.ambientEnabled, audio, halfCycle]);

  // Force completion handler if completed at mount (safety)
  useEffect(() => {
    if (stage === 'completed') onComplete(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  if (stage === 'completed') {
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
              {config.rounds} {config.rounds === 1 ? 'раунд' : 'раунда'}{' '}
              Вим Хофа · посидите минуту в тишине
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
        <span className="uppercase tracking-widest text-text-secondary">
          Раунд {round + 1} из {config.rounds}
        </span>
        <span className="uppercase tracking-widest text-accent-gratitude">
          {STAGE_LABEL[stage]}
        </span>
      </div>

      <motion.div
        className="flex-1 flex flex-col items-center justify-center gap-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        key={stage}
      >
        {stage === 'breathing' && (
          <BreathingPhase
            breathCount={breathCount}
            total={config.breathsPerRound}
            inhale={breathInhale}
            onTap={onTap}
          />
        )}

        {stage === 'retention' && (
          <RetentionPhase
            elapsedSec={retentionElapsed}
            onDone={() => {
              onTap();
              endRetention();
            }}
          />
        )}

        {stage === 'recovery' && (
          <RecoveryPhase
            remainingSec={recoveryRemaining}
            holdSec={config.recoveryHoldSec}
          />
        )}
      </motion.div>

      <div className="flex justify-center gap-3 pb-6">
        <HapticButton
          variant="subtle"
          size="sm"
          onClick={() => {
            finishEarly();
            // Хотя бы один завершённый раунд — сессия засчитывается.
            onComplete(round >= 1 || stage === 'recovery');
            router.push('/techniques');
          }}
        >
          Завершить
        </HapticButton>
      </div>
    </PageShell>
  );
}

function BreathingPhase({
  breathCount,
  total,
  inhale,
  onTap,
}: {
  breathCount: number;
  total: number;
  inhale: boolean;
  onTap: () => void;
}) {
  const lastBreathRef = useRef(breathCount);
  useEffect(() => {
    if (breathCount !== lastBreathRef.current) {
      onTap();
      lastBreathRef.current = breathCount;
    }
  }, [breathCount, onTap]);

  return (
    <>
      <div className="relative flex items-center justify-center">
        <motion.div
          className={cn(
            'rounded-full bg-gradient-to-br from-accent-gratitude/70 to-accent-gratitude/30',
            'shadow-glow-gratitude',
          )}
          animate={{ scale: inhale ? 1 : 0.55 }}
          transition={{ duration: 0.9, ease: 'easeInOut' }}
          style={{ width: 180, height: 180 }}
        />
      </div>
      <div className="text-center">
        <p className="text-xl font-medium">{inhale ? 'Вдох' : 'Выдох'}</p>
        <p className="mt-1 text-5xl font-light text-accent-gratitude tabular-nums">
          {Math.min(breathCount + 1, total)}
        </p>
        <p className="mt-1 text-xs uppercase tracking-widest text-text-secondary">
          из {total}
        </p>
      </div>
    </>
  );
}

function RetentionPhase({
  elapsedSec,
  onDone,
}: {
  elapsedSec: number;
  onDone: () => void;
}) {
  return (
    <>
      <div className="relative flex items-center justify-center">
        <div
          className="rounded-full bg-bg-card/60 border border-white/10"
          style={{ width: 180, height: 180 }}
        />
      </div>
      <div className="text-center">
        <p className="text-xs uppercase tracking-widest text-text-secondary">
          Не дышите
        </p>
        <p className="mt-2 text-5xl font-light tabular-nums">
          {formatTime(Math.floor(elapsedSec))}
        </p>
        <p className="mt-2 text-xs text-text-secondary max-w-xs">
          Когда захочется вдохнуть — нажмите кнопку ниже.
        </p>
      </div>
      <HapticButton onClick={onDone} size="lg" haptic="transition">
        Вдохнуть
      </HapticButton>
    </>
  );
}

function RecoveryPhase({
  remainingSec,
  holdSec,
}: {
  remainingSec: number;
  holdSec: number;
}) {
  return (
    <>
      <div className="relative flex items-center justify-center">
        <motion.div
          className={cn(
            'rounded-full bg-gradient-to-br from-accent-breathing/70 to-accent-breathing/30',
            'shadow-glow-breathing',
          )}
          initial={{ scale: 0.6 }}
          animate={{ scale: 1.05 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{ width: 200, height: 200 }}
        />
      </div>
      <div className="text-center">
        <p className="text-xs uppercase tracking-widest text-text-secondary">
          Держите вдох
        </p>
        <p className="mt-2 text-5xl font-light text-accent-breathing tabular-nums">
          {Math.ceil(remainingSec)}
        </p>
        <p className="mt-1 text-xs uppercase tracking-widest text-text-secondary">
          из {holdSec} сек
        </p>
      </div>
    </>
  );
}
