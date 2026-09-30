import type { TechniqueCategory } from '@/lib/types';

export type Tone = 'breathing' | 'grounding' | 'gratitude' | 'streak' | 'success';

type ToneClasses = {
  text: string;
  fill: string;
  soft: string;
  border: string;
  card: string;
  cardHover: string;
  circle: string;
  glow: string;
};

// Классы записаны целиком: Tailwind находит их в исходниках только готовыми строками.
export const TONE: Record<Tone, ToneClasses> = {
  breathing: {
    text: 'text-accent-breathing',
    fill: 'bg-accent-breathing',
    soft: 'bg-accent-breathing/15',
    border: 'border-accent-breathing/40',
    card: 'border-accent-breathing/30 bg-accent-breathing/5',
    cardHover: 'hover:bg-accent-breathing/10',
    circle: 'bg-gradient-to-br from-accent-breathing/80 to-accent-breathing/30',
    glow: 'shadow-glow-breathing',
  },
  grounding: {
    text: 'text-accent-grounding',
    fill: 'bg-accent-grounding',
    soft: 'bg-accent-grounding/15',
    border: 'border-accent-grounding/40',
    card: 'border-accent-grounding/30 bg-accent-grounding/5',
    cardHover: 'hover:bg-accent-grounding/10',
    circle: 'bg-gradient-to-br from-accent-grounding/80 to-accent-grounding/30',
    glow: 'shadow-glow-grounding',
  },
  gratitude: {
    text: 'text-accent-gratitude',
    fill: 'bg-accent-gratitude',
    soft: 'bg-accent-gratitude/15',
    border: 'border-accent-gratitude/40',
    card: 'border-accent-gratitude/30 bg-accent-gratitude/5',
    cardHover: 'hover:bg-accent-gratitude/10',
    circle: 'bg-gradient-to-br from-accent-gratitude/80 to-accent-gratitude/30',
    glow: 'shadow-glow-gratitude',
  },
  streak: {
    text: 'text-accent-streak',
    fill: 'bg-accent-streak',
    soft: 'bg-accent-streak/15',
    border: 'border-accent-streak/40',
    card: 'border-accent-streak/30 bg-accent-streak/5',
    cardHover: 'hover:bg-accent-streak/10',
    circle: 'bg-gradient-to-br from-accent-streak/80 to-accent-streak/30',
    glow: 'shadow-glow-streak',
  },
  success: {
    text: 'text-success',
    fill: 'bg-success',
    soft: 'bg-success/15',
    border: 'border-success/40',
    card: 'border-success/30 bg-success/5',
    cardHover: 'hover:bg-success/10',
    circle: 'bg-gradient-to-br from-success/80 to-success/30',
    glow: 'shadow-glow-success',
  },
};

export const CATEGORY_TONE: Record<TechniqueCategory, Tone> = {
  anxiety: 'grounding',
  sleep: 'breathing',
  focus: 'streak',
  energy: 'gratitude',
};
