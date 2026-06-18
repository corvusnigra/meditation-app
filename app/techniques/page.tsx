'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { PageShell } from '@/components/shared/PageShell';
import {
  CATEGORY_LABEL,
  CATEGORY_ORDER,
  CATEGORY_TAGLINE,
  EVIDENCE_LABEL,
  isAdaptive,
  ladderLength,
  defaultLevel,
  clampLevel,
  recommendedTechniques,
  techniquesByCategory,
} from '@/lib/breathing-techniques';
import { ensureAudio } from '@/lib/breathing-audio';
import { useSettings } from '@/context/SettingsContext';
import { useTechniqueLevels } from '@/hooks/useTechniqueLevel';
import { cn } from '@/lib/utils';
import type { BreathingTechnique, TechniqueCategory } from '@/lib/types';

const CATEGORY_COLOR: Record<TechniqueCategory, string> = {
  anxiety: 'text-accent-grounding',
  sleep: 'text-accent-breathing',
  focus: 'text-accent-streak',
  energy: 'text-accent-gratitude',
};

// Подпись «когда» для рекомендованных карточек.
const RECOMMENDED_TAG: Record<string, string> = {
  'physiological-sigh': 'В моменте',
  'coherent-6-6': 'Тренировка',
};

export default function TechniquesPage() {
  const router = useRouter();
  const { settings } = useSettings();
  const { levels, hydrated } = useTechniqueLevels();

  const go = (id: string) => {
    if (settings.ambientEnabled || settings.entrainmentEnabled) {
      void ensureAudio(settings.ambientPreset, settings.ambientVolume);
    }
    router.push(`/techniques/${id}`);
  };

  const levelOf = (tech: BreathingTechnique): number => {
    const saved = levels[tech.id];
    return typeof saved === 'number' ? clampLevel(tech, saved) : defaultLevel(tech);
  };

  const rightMeta = (tech: BreathingTechnique): string => {
    if (hydrated && isAdaptive(tech)) {
      return `ур. ${levelOf(tech) + 1}/${ladderLength(tech)}`;
    }
    return tech.durationLabel;
  };

  const recommended = recommendedTechniques();

  return (
    <PageShell>
      <header className="flex items-center justify-between mb-6 text-sm">
        <Link
          href="/"
          className="text-text-secondary hover:text-text-primary transition-colors"
        >
          ← Главная
        </Link>
        <span className="text-text-secondary">Техники</span>
      </header>

      <div className="text-center mb-6">
        <motion.h1
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="text-2xl sm:text-3xl font-medium text-balance mb-2"
        >
          Что нужно сейчас?
        </motion.h1>
        <motion.p
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="text-sm text-text-secondary"
        >
          На каждой карточке — для чего она.
        </motion.p>
      </div>

      {/* Рекомендуем — самое доказательное наверху */}
      <motion.section
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="mb-7"
      >
        <h2 className="text-xs uppercase tracking-widest text-text-secondary mb-2">
          С чего начать
        </h2>
        <div className="space-y-2">
          {recommended.map((tech) => (
            <button
              key={tech.id}
              type="button"
              onClick={() => go(tech.id)}
              className="block w-full text-left rounded-2xl border border-accent-breathing/30 bg-accent-breathing/5 hover:bg-accent-breathing/10 px-4 py-4 transition-colors"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {RECOMMENDED_TAG[tech.id] && (
                      <span className="text-[10px] uppercase tracking-widest text-accent-breathing border border-accent-breathing/40 rounded-full px-2 py-0.5">
                        {RECOMMENDED_TAG[tech.id]}
                      </span>
                    )}
                    <span className="text-[10px] uppercase tracking-widest text-success">
                      {EVIDENCE_LABEL[tech.evidence]}
                    </span>
                  </div>
                  <div className="text-base font-medium text-text-primary">
                    {tech.purpose}
                  </div>
                  <div className="text-[11px] text-text-secondary mt-0.5 truncate">
                    {tech.name} · {tech.durationLabel}
                  </div>
                </div>
                <span aria-hidden className="text-text-secondary text-lg shrink-0">
                  →
                </span>
              </div>
            </button>
          ))}
        </div>
      </motion.section>

      {/* Состояния */}
      <div className="space-y-6 pb-6">
        {CATEGORY_ORDER.map((category, idx) => {
          const list = techniquesByCategory(category);
          return (
            <motion.section
              key={category}
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 + idx * 0.05, duration: 0.4 }}
            >
              <div className="flex items-baseline justify-between mb-2">
                <h2
                  className={cn(
                    'text-xs uppercase tracking-widest',
                    CATEGORY_COLOR[category],
                  )}
                >
                  {CATEGORY_LABEL[category]}
                </h2>
                <span className="text-[11px] text-text-secondary">
                  {CATEGORY_TAGLINE[category]}
                </span>
              </div>
              <div className="space-y-2">
                {list.map((tech) => (
                  <button
                    key={tech.id}
                    type="button"
                    onClick={() => go(tech.id)}
                    className="block w-full text-left rounded-2xl bg-bg-card/60 hover:bg-bg-card/80 border border-white/5 px-4 py-3 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-text-primary truncate">
                            {tech.purpose}
                          </span>
                          {tech.evidence === 'strong' && (
                            <span className="text-[10px] uppercase tracking-widest text-success shrink-0">
                              ✓ доказано
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-text-secondary mt-0.5 truncate">
                          {tech.name} · {tech.tagline}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[11px] text-text-secondary">
                          {rightMeta(tech)}
                        </div>
                        <span aria-hidden className="text-text-secondary text-base">
                          →
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.section>
          );
        })}
      </div>
    </PageShell>
  );
}
