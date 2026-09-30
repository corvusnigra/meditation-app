'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageShell } from '@/components/shared/PageShell';
import { PauseOverlay } from '@/components/shared/PauseOverlay';
import { ProgressFill } from '@/components/shared/ProgressFill';
import { HapticButton } from '@/components/shared/HapticButton';
import { PracticeHeader } from '@/components/practice/PracticeHeader';
import { SignalToggle } from '@/components/practice/SignalToggle';
import { StartCountdown } from '@/components/practice/StartCountdown';
import { TONE } from '@/components/ui/tones';
import { useHistory } from '@/context/HistoryContext';
import { useProgressionContext } from '@/context/ProgressionContext';
import { useSettings } from '@/context/SettingsContext';
import { useBreathingAudio } from '@/hooks/useBreathingAudio';
import { usePracticeController } from '@/hooks/usePracticeController';
import { usePracticeSignals, unlockBounded } from '@/hooks/usePracticeSignals';
import { useTechniqueLevel } from '@/hooks/useTechniqueLevel';
import { techniqueDurationSec } from '@/lib/breathing-techniques';
import { entrainmentHzForCategory } from '@/lib/entrainment';
import { buildTechniqueSession, minUnits, unitsLabel } from '@/lib/practice';
import type { BreathingTechnique } from '@/lib/types';
import { randomId } from '@/lib/utils';
import { RUNNERS } from './runners';
import type { RunnerDef, RunnerProgress } from './runners/types';
import { TechniqueDone } from './TechniqueDone';
import { TechniqueIntro } from './TechniqueIntro';

type Stage = 'loading' | 'intro' | 'practice' | 'done';

type Outcome = {
  done: number;
  planned: number;
  durationMs: number;
  // Набран ли порог записи в историю.
  counted: boolean;
};

type Props = { technique: BreathingTechnique };

// Общий путь всех техник: интро → отсчёт → практика → «Готово».
export function TechniqueShell({ technique }: Props) {
  const router = useRouter();
  const { add } = useHistory();
  const { state: progression } = useProgressionContext();
  const { level, hydrated, applyFeedback } = useTechniqueLevel(technique);
  const signals = usePracticeSignals();
  const def = RUNNERS[technique.config.kind];

  const [stage, setStage] = useState<Stage>('loading');
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const quickRef = useRef(false);
  const sessionIdRef = useRef('');

  // Уровень грузится из localStorage: до него длительность практики неизвестна.
  // ?start=1 — быстрый вход без интро. Читается здесь, а не через
  // useSearchParams: страница собрана статически и офлайн отдаётся из кэша
  // без параметров. Параметр сразу убирается из адреса, чтобы «назад»
  // не запускал практику повторно.
  useEffect(() => {
    if (!hydrated) return;
    const quick = new URLSearchParams(window.location.search).get('start') === '1';
    if (quick) {
      quickRef.current = true;
      window.history.replaceState(null, '', window.location.pathname);
    }
    const skipIntro = quick && !def.warnings;
    if (skipIntro) sessionIdRef.current = randomId();
    setStage((current) =>
      current === 'loading' ? (skipIntro ? 'practice' : 'intro') : current,
    );
  }, [hydrated, def]);

  const handleStart = () => {
    sessionIdRef.current = randomId();
    void unlockBounded(signals).then(() => setStage('practice'));
  };

  // Ниже порога — выход без записи и без экрана «Готово».
  const handleEnd = (result: Outcome) => {
    if (!result.counted) {
      router.replace(quickRef.current ? '/' : '/techniques');
      return;
    }
    add(
      buildTechniqueSession(
        technique,
        {
          id: sessionIdRef.current,
          done: result.done,
          planned: result.planned,
          unit: def.unit,
          durationMs: result.durationMs,
        },
        progression.currentLevel,
      ),
    );
    setOutcome(result);
    setStage('done');
  };

  if (stage === 'intro') {
    return (
      <TechniqueIntro technique={technique} level={level} def={def} onStart={handleStart} />
    );
  }

  if (stage === 'practice') {
    return (
      <TechniquePractice technique={technique} level={level} def={def} onEnd={handleEnd} />
    );
  }

  if (stage === 'done' && outcome) {
    return (
      <TechniqueDone
        technique={technique}
        level={level}
        done={outcome.done}
        planned={outcome.planned}
        unit={def.unit}
        durationMs={outcome.durationMs}
        hint={def.doneHint}
        applyFeedback={applyFeedback}
      />
    );
  }

  return (
    <PageShell>
      <div className="flex flex-1 items-center justify-center">
        <div className="h-16 w-16 animate-gentle-pulse rounded-full bg-accent-breathing/30" />
      </div>
    </PageShell>
  );
}

type PracticeProps = {
  technique: BreathingTechnique;
  level: number;
  def: RunnerDef;
  onEnd: (result: Outcome) => void;
};

// Отсчёт и сама практика. Часы, пауза и перехват «назад» живут только здесь:
// на интро и на «Готово» они не нужны.
function TechniquePractice({ technique, level, def, onEnd }: PracticeProps) {
  const { settings, reducedMotion } = useSettings();
  const practice = usePracticeController();
  const { clock, signals } = practice;
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<RunnerProgress>({ done: 0, index: 0 });
  const [quiet, setQuiet] = useState(false);
  const progressRef = useRef(progress);
  const closedRef = useRef(false);

  const planned = def.planned(technique, level);
  const required = minUnits(technique.config.kind, planned);
  const totalSec = def.timed ? techniqueDurationSec(technique, level) : null;
  const { Runner } = def;

  // Фон ведёт этот хук, сигналы фаз — practice.signals.
  useBreathingAudio({
    enabled: def.ambient && settings.ambientEnabled,
    preset: settings.ambientPreset,
    volume: settings.ambientVolume,
    active: running && !practice.paused && !quiet,
    entrainment: def.ambient && settings.entrainmentEnabled,
    entrainmentHz: entrainmentHzForCategory(technique.category),
  });

  const handleProgress = useCallback((next: RunnerProgress) => {
    progressRef.current = next;
    setProgress(next);
  }, []);

  // Единственный путь завершения: и по концу практики, и по выходу из паузы.
  const finish = (completed: boolean) => {
    if (closedRef.current) return;
    closedRef.current = true;
    const done = completed ? planned : progressRef.current.done;
    const counted = done >= required;
    signals.silence();
    if (counted) signals.done();
    const durationMs = running ? clock.now() : 0;
    practice.leave(() => onEnd({ done, planned, durationMs, counted }));
  };

  const handleStart = () => {
    void signals.unlock();
    clock.restart();
    setRunning(true);
  };

  // Подпись выхода заранее говорит, попадёт ли практика в историю.
  const exitLabel = !running
    ? 'Выйти без записи'
    : progress.done >= required
      ? `Завершить: засчитать ${unitsLabel(progress.done, def.unit)}`
      : `Выйти без записи (${progress.done} из ${required})`;

  const current = Math.min(progress.index + 1, planned);

  return (
    <PageShell>
      <div className="space-y-4">
        <PracticeHeader
          title={technique.name}
          counter={
            running ? (
              <span className="tabular-nums">
                {current} из {planned}
              </span>
            ) : undefined
          }
          onClose={() => practice.pause('user')}
        />
        {totalSec !== null && (
          <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
            {running && (
              <ProgressFill
                clock={clock}
                totalSec={totalSec}
                className={TONE[def.tone].fill}
              />
            )}
          </div>
        )}
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center gap-10">
        <Runner
          technique={technique}
          level={level}
          clock={clock}
          signals={signals}
          running={running}
          paused={practice.paused}
          reducedMotion={reducedMotion}
          onProgress={handleProgress}
          onFinish={() => finish(true)}
          onQuiet={setQuiet}
        />
        {!running && (
          <StartCountdown
            clock={clock}
            onCount={() => signals.stage('count')}
            onDone={handleStart}
          />
        )}
      </div>

      <div className="flex justify-center pb-6">
        <HapticButton variant="ghost" size="md" onClick={() => practice.pause('user')}>
          Пауза
        </HapticButton>
      </div>

      <PauseOverlay
        visible={practice.paused}
        reason={practice.reason}
        onResume={practice.resume}
        onExit={() => finish(false)}
        exitLabel={exitLabel}
      >
        <SignalToggle />
      </PauseOverlay>
    </PageShell>
  );
}
