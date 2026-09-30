'use client';

import { useState } from 'react';
import { PageShell } from '@/components/shared/PageShell';
import { PageHeader } from '@/components/shared/PageHeader';
import { HapticButton } from '@/components/shared/HapticButton';
import { SignalToggle } from '@/components/practice/SignalToggle';
import { Card } from '@/components/ui/Card';
import { CATEGORY_TONE, TONE } from '@/components/ui/tones';
import {
  isAdaptive,
  ladderLength,
  techniqueDurationSec,
} from '@/lib/breathing-techniques';
import type { BreathingTechnique } from '@/lib/types';
import { cn, formatApproxDuration } from '@/lib/utils';
import type { RunnerDef } from './runners/types';

type Props = {
  technique: BreathingTechnique;
  level: number;
  def: RunnerDef;
  onStart: () => void;
};

export function TechniqueIntro({ technique, level, def, onStart }: Props) {
  const [acknowledged, setAcknowledged] = useState(false);
  const tone = TONE[CATEGORY_TONE[technique.category]];

  const meta = [
    def.summary(technique, level),
    formatApproxDuration(techniqueDurationSec(technique, level)),
  ];
  if (isAdaptive(technique)) {
    meta.push(`сложность ${level + 1} из ${ladderLength(technique)}`);
  }

  return (
    <PageShell>
      <PageHeader back={{ href: '/techniques', label: 'Техники' }} />

      <div className="flex flex-1 flex-col items-center justify-center gap-5 pb-6 text-center">
        <div className="space-y-2">
          <p className={cn('text-xs uppercase tracking-wider', tone.text)}>
            {technique.purpose}
          </p>
          <h1 className="text-2xl font-medium text-balance">{technique.name}</h1>
          <p className="mx-auto max-w-xs text-sm text-text-secondary">
            {technique.description}
          </p>
        </div>

        <Card className="w-full max-w-xs p-4 text-left text-sm">
          <ol className="space-y-1.5">
            {def.steps(technique, level).map((step, index) => (
              <li key={index}>
                <span className="text-text-secondary">{index + 1}.</span> {step}
              </li>
            ))}
          </ol>
          <p className="pt-3 text-xs text-text-secondary">{meta.join(' · ')}.</p>
        </Card>

        {def.warnings && (
          <div className="w-full max-w-xs space-y-2 text-left">
            <details>
              <summary className="flex min-h-11 cursor-pointer items-center text-xs uppercase tracking-wider text-accent-streak">
                Важно перед началом
              </summary>
              <ul className="list-disc space-y-1 pl-4 text-xs text-text-secondary">
                {def.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </details>
            <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-text-secondary">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(event) => setAcknowledged(event.target.checked)}
                className="h-5 w-5 shrink-0 accent-accent-breathing"
              />
              <span>Прочитал, делаю в безопасном месте.</span>
            </label>
          </div>
        )}

        <SignalToggle />
      </div>

      <div className="pb-6">
        <HapticButton
          size="lg"
          block
          haptic="transition"
          disabled={!!def.warnings && !acknowledged}
          onClick={onStart}
        >
          Начать
        </HapticButton>
      </div>
    </PageShell>
  );
}
