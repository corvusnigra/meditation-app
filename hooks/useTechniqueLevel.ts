'use client';

import { useCallback, useEffect, useState } from 'react';
import { techniqueLevelsStorage } from '@/lib/storage';
import {
  adjustLevel,
  defaultLevel,
  clampLevel,
} from '@/lib/breathing-techniques';
import type {
  BreathingTechnique,
  TechniqueFeedback,
  TechniqueLevels,
} from '@/lib/types';

type SingleResult = {
  level: number;
  hydrated: boolean;
  applyFeedback: (feedback: TechniqueFeedback) => number;
};

// Персональный уровень одной техники: загрузка из localStorage,
// дефолт из пресета, обновление по фидбеку «легко/сложно».
export function useTechniqueLevel(technique: BreathingTechnique): SingleResult {
  const [level, setLevel] = useState(() => defaultLevel(technique));
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = techniqueLevelsStorage.load();
    const saved = stored[technique.id];
    setLevel(
      typeof saved === 'number'
        ? clampLevel(technique, saved)
        : defaultLevel(technique),
    );
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [technique.id]);

  const applyFeedback = useCallback(
    (feedback: TechniqueFeedback): number => {
      const next = adjustLevel(technique, level, feedback);
      setLevel(next);
      const stored = techniqueLevelsStorage.load();
      stored[technique.id] = next;
      techniqueLevelsStorage.save(stored);
      return next;
    },
    [technique, level],
  );

  return { level, hydrated, applyFeedback };
}

// Все уровни сразу — для списка техник (бейджи).
export function useTechniqueLevels(): {
  levels: TechniqueLevels;
  hydrated: boolean;
} {
  const [levels, setLevels] = useState<TechniqueLevels>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLevels(techniqueLevelsStorage.load());
    setHydrated(true);
  }, []);

  return { levels, hydrated };
}
