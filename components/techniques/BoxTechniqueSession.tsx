'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PageShell } from '@/components/shared/PageShell';
import { BreathingCircle } from '@/components/breathing/BreathingCircle';
import { BreathingTimer } from '@/components/breathing/BreathingTimer';
import { BreathingGuide } from '@/components/breathing/BreathingGuide';
import { HapticButton } from '@/components/shared/HapticButton';
import { PauseOverlay } from '@/components/shared/PauseOverlay';
import { useTimer } from '@/hooks/useTimer';
import { useBreathingCycle } from '@/hooks/useBreathingCycle';
import { useBreathingAudio } from '@/hooks/useBreathingAudio';
import { useHaptics, usePhaseHaptics } from '@/hooks/useHaptics';
import { useWakeLock } from '@/hooks/useWakeLock';
import { useTechniqueLevel } from '@/hooks/useTechniqueLevel';
import { entrainmentHzForCategory } from '@/lib/entrainment';
import { useSettings } from '@/context/SettingsContext';
import { useHistory } from '@/context/HistoryContext';
import { useProgressionContext } from '@/context/ProgressionContext';
import {
  effectiveStep,
  isAdaptive,
  ladderLength,
} from '@/lib/breathing-techniques';
import type {
  BoxStep,
  BoxTechniqueConfig,
  BreathingPhase,
  BreathingTechnique,
  TechniqueFeedback,
} from '@/lib/types';
import { randomId, cn } from '@/lib/utils';

type Props = { technique: BreathingTechnique };

const LABEL: Record<BreathingPhase, string> = {
  inhale: 'Вдох',
  holdIn: 'Задержка',
  exhale: 'Выдох',
  holdOut: 'Задержка',
};

export function BoxTechniqueSession({ technique }: Props) {
  const { level, hydrated, applyFeedback } = useTechniqueLevel(technique);
  const [completed, setCompleted] = useState(false);

  // Уровень грузится из localStorage асинхронно — стартуем сессию только
  // после гидрации, иначе таймер инициализируется с базовой длительностью,
  // а потом она поменяется на лету.
  if (!hydrated) {
    return (
      <PageShell>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-accent-breathing/30 animate-gentle-pulse" />
        </div>
      </PageShell>
    );
  }

  if (completed) {
    return (
      <DoneView
        technique={technique}
        level={level}
        applyFeedback={applyFeedback}
      />
    );
  }

  const step = effectiveStep(technique, level);
  return (
    <RunningBox
      technique={technique}
      step={step}
      level={level}
      onFinish={() => setCompleted(true)}
    />
  );
}

function RunningBox({
  technique,
  step,
  level,
  onFinish,
}: {
  technique: BreathingTechnique;
  step: BoxStep;
  level: number;
  onFinish: () => void;
}) {
  const router = useRouter();
  const { settings } = useSettings();
  const { add } = useHistory();
  const { state: progression } = useProgressionContext();
  const haptics = useHaptics(settings.hapticsEnabled);
  const phaseHaptics = usePhaseHaptics(
    settings.hapticGuideEnabled,
    settings.hapticsEnabled,
  );
  const config = technique.config as BoxTechniqueConfig;

  const [showPause, setShowPause] = useState(false);
  const [done, setDone] = useState(false);
  const startedAtRef = useRef(Date.now());

  useWakeLock(!done);

  const pattern = step.pattern;
  const cycleLen = useMemo(() => pattern.reduce((a, b) => a + b, 0), [pattern]);
  const totalSec = cycleLen * step.cycles;
  const active = !showPause && !done;

  const handleFinish = () => {
    if (done) return;
    setDone(true);
    add({
      id: randomId(),
      date: new Date().toISOString(),
      scenario: 'custom',
      gratitudeText: '',
      durationMs: Math.max(Date.now() - startedAtRef.current, 0),
      completedPhases: ['breathing'],
      level: progression.currentLevel,
      kind: 'technique',
      techniqueId: technique.id,
      techniqueName: technique.name,
    });
    haptics('success');
    onFinish();
  };

  const timer = useTimer({
    durationSec: totalSec,
    autoStart: true,
    onComplete: handleFinish,
  });

  const audio = useBreathingAudio({
    enabled: settings.ambientEnabled,
    preset: settings.ambientPreset,
    volume: settings.ambientVolume,
    active,
    entrainment: settings.entrainmentEnabled,
    entrainmentHz: entrainmentHzForCategory(technique.category),
  });

  const { phase, secondsInPhase } = useBreathingCycle({
    pattern,
    active,
    onPhaseChange: (newPhase, dur) => {
      phaseHaptics(newPhase);
      audio.onPhase(newPhase, dur);
    },
  });

  useEffect(() => {
    if (settings.ambientEnabled) audio.onPhase('inhale', pattern[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.ambientEnabled]);

  const phaseDuration =
    pattern[
      phase === 'inhale' ? 0 : phase === 'holdIn' ? 1 : phase === 'exhale' ? 2 : 3
    ];

  const handlePauseToggle = () => {
    if (showPause) {
      setShowPause(false);
      timer.resume();
    } else {
      setShowPause(true);
      timer.pause();
    }
  };

  const handleSkip = () => {
    setShowPause(false);
    timer.finish();
  };

  const handleExit = () => {
    setShowPause(false);
    router.push('/');
  };

  const adaptive = isAdaptive(technique);

  return (
    <PageShell>
      <div className="space-y-3">
        <div className="flex items-baseline justify-between text-xs">
          <Link
            href="/techniques"
            className="text-text-secondary hover:text-text-primary"
          >
            ← Техники
          </Link>
          <span className="uppercase tracking-widest text-text-secondary">
            {technique.name}
            {adaptive && (
              <span className="ml-2 text-accent-breathing">
                ур. {level + 1}/{ladderLength(technique)}
              </span>
            )}
          </span>
        </div>
        <BreathingTimer
          remainingSec={Math.ceil(timer.remaining)}
          totalSec={totalSec}
          label={technique.tagline}
        />
      </div>

      <motion.div
        className="flex-1 flex flex-col items-center justify-center gap-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <BreathingCircle
          phase={phase}
          pattern={pattern}
          active={active}
          reducedMotion={settings.reducedMotion}
        />
        {phaseDuration > 0 ? (
          <BreathingGuide
            phase={phase}
            secondsInPhase={secondsInPhase}
            phaseDuration={phaseDuration}
          />
        ) : (
          <div className="text-center">
            <p className="text-xl font-medium">{LABEL[phase]}</p>
          </div>
        )}
        {config.mouthExhale && phase === 'exhale' && (
          <p className="text-xs text-text-secondary uppercase tracking-widest">
            выдох ртом
          </p>
        )}
        {config.humExhale && (
          <p className="text-xs text-accent-grounding uppercase tracking-widest">
            {phase === 'exhale' ? 'гудите «ммм»' : 'вдох через нос'}
          </p>
        )}
      </motion.div>

      <div className="flex justify-center gap-3 pb-6">
        <HapticButton variant="ghost" size="md" onClick={handlePauseToggle}>
          Пауза
        </HapticButton>
        <HapticButton variant="subtle" size="md" onClick={handleSkip}>
          Завершить
        </HapticButton>
      </div>

      <PauseOverlay
        visible={showPause}
        onResume={handlePauseToggle}
        onSkip={handleSkip}
        onExit={handleExit}
      />
    </PageShell>
  );
}

function DoneView({
  technique,
  level,
  applyFeedback,
}: {
  technique: BreathingTechnique;
  level: number;
  applyFeedback: (fb: TechniqueFeedback) => number;
}) {
  const adaptive = isAdaptive(technique);
  const [result, setResult] = useState<string | null>(null);

  const onFeedback = (fb: TechniqueFeedback) => {
    const next = applyFeedback(fb);
    if (next > level) setResult('В следующий раз — чуть длиннее и глубже.');
    else if (next < level) setResult('В следующий раз сделаем мягче.');
    else if (fb === 'easy') setResult('Это уже самый глубокий уровень.');
    else if (fb === 'hard') setResult('Это уже самый мягкий уровень.');
    else setResult('Отлично — оставляем как есть.');
  };

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
          <p className="text-text-secondary text-sm">{technique.name}</p>
        </div>

        {adaptive && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="w-full max-w-xs"
          >
            {result === null ? (
              <>
                <p className="text-sm text-text-secondary mb-3">Как было?</p>
                <div className="grid grid-cols-3 gap-2">
                  <FeedbackButton
                    emoji="😮‍💨"
                    label="Легко"
                    onClick={() => onFeedback('easy')}
                  />
                  <FeedbackButton
                    emoji="🙂"
                    label="В самый раз"
                    onClick={() => onFeedback('right')}
                  />
                  <FeedbackButton
                    emoji="😮"
                    label="Сложно"
                    onClick={() => onFeedback('hard')}
                  />
                </div>
              </>
            ) : (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-accent-breathing"
              >
                {result}
              </motion.p>
            )}
          </motion.div>
        )}
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

function FeedbackButton({
  emoji,
  label,
  onClick,
}: {
  emoji: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-2xl bg-bg-card/60 hover:bg-bg-card/90 border border-white/5',
        'px-2 py-3 flex flex-col items-center gap-1 transition-colors active:scale-[0.97]',
      )}
    >
      <span className="text-xl" aria-hidden>
        {emoji}
      </span>
      <span className="text-[11px] text-text-secondary leading-tight text-center">
        {label}
      </span>
    </button>
  );
}
