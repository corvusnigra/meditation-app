'use client';

import { motion } from 'framer-motion';
import { PageShell } from '@/components/shared/PageShell';
import { PageHeader } from '@/components/shared/PageHeader';
import { CardLink } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { CATEGORY_TONE, TONE } from '@/components/ui/tones';
import {
  CATEGORY_LABEL,
  CATEGORY_ORDER,
  CATEGORY_TAGLINE,
  EVIDENCE_LABEL,
  isAdaptive,
  ladderLength,
  defaultLevel,
  clampLevel,
  techniqueDurationSec,
  techniquesByCategory,
} from '@/lib/breathing-techniques';
import { ensureAudio } from '@/lib/breathing-audio';
import { useSettings } from '@/context/SettingsContext';
import { useTechniqueLevels } from '@/hooks/useTechniqueLevel';
import { cn, formatApproxDuration } from '@/lib/utils';
import type { BreathingTechnique } from '@/lib/types';

export default function TechniquesPage() {
  const { settings } = useSettings();
  const { levels } = useTechniqueLevels();

  // Звук разблокируется жестом — нажатием на карточку, до перехода к технике.
  const unlockAudio = () => {
    if (
      settings.ambientEnabled ||
      settings.entrainmentEnabled ||
      settings.phaseSoundEnabled
    ) {
      void ensureAudio(settings.ambientPreset, settings.ambientVolume);
    }
  };

  const levelOf = (tech: BreathingTechnique): number => {
    const saved = levels[tech.id];
    return typeof saved === 'number' ? clampLevel(tech, saved) : defaultLevel(tech);
  };

  const meta = (tech: BreathingTechnique): string => {
    const level = levelOf(tech);
    const duration = formatApproxDuration(techniqueDurationSec(tech, level));
    return isAdaptive(tech)
      ? `${duration} · сложность ${level + 1} из ${ladderLength(tech)}`
      : duration;
  };

  return (
    <PageShell>
      <PageHeader back={{ href: '/', label: 'Главная' }} title="Техники" />

      <div className="text-center mb-6">
        <motion.p
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="text-2xl sm:text-3xl font-medium text-balance mb-2"
        >
          Что нужно сейчас?
        </motion.p>
        <motion.p
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="text-sm text-text-secondary"
        >
          На каждой карточке — для чего она.
        </motion.p>
      </div>

      <div className="space-y-7 pb-6">
        {CATEGORY_ORDER.map((category, idx) => {
          const tone = CATEGORY_TONE[category];
          return (
            <motion.section
              key={category}
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 + idx * 0.05, duration: 0.4 }}
            >
              <h2 className={cn('text-xs uppercase tracking-wider', TONE[tone].text)}>
                {CATEGORY_LABEL[category]}
              </h2>
              <p className="mt-1 mb-3 text-sm text-text-secondary">
                {CATEGORY_TAGLINE[category]}
              </p>
              <ul className="space-y-2">
                {techniquesByCategory(category).map((tech) => (
                  <li key={tech.id}>
                    <CardLink
                      href={`/techniques/${tech.id}`}
                      tone={tech.recommended ? tone : undefined}
                      onClick={unlockAudio}
                      className="px-4 py-3.5"
                    >
                      <div className="text-base font-medium text-text-primary text-balance">
                        {tech.purpose}
                      </div>
                      <div className="mt-1 text-sm text-text-secondary">
                        {tech.name}
                        {'\u00A0· '}
                        {tech.tagline}
                      </div>
                      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                        {tech.recommended && <Chip tone={tone}>Для начала</Chip>}
                        <Chip
                          tone={tech.evidence === 'strong' ? 'success' : undefined}
                          variant={tech.evidence === 'strong' ? 'soft' : 'outline'}
                        >
                          {EVIDENCE_LABEL[tech.evidence]}
                        </Chip>
                        <span className="text-xs text-text-secondary">{meta(tech)}</span>
                      </div>
                    </CardLink>
                  </li>
                ))}
              </ul>
            </motion.section>
          );
        })}
      </div>
    </PageShell>
  );
}
