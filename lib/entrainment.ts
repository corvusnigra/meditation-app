import type { TechniqueCategory } from './types';

// Целевые частоты слухового энтрейнмента (амплитудная модуляция).
// alpha ~10 — спокойствие; beta ~15 — фокус; theta/delta ~4 — сон; gamma 40 — энергия.
export const ENTRAINMENT_HZ = {
  alpha: 10,
  beta: 15,
  theta: 4,
  gamma: 40,
} as const;

// Ритуал (дыхание/заземление/благодарность) — спокойное альфа-состояние.
export const RITUAL_ENTRAINMENT_HZ = ENTRAINMENT_HZ.alpha;

export function entrainmentHzForCategory(category: TechniqueCategory): number {
  switch (category) {
    case 'focus':
      return ENTRAINMENT_HZ.beta;
    case 'sleep':
      return ENTRAINMENT_HZ.theta;
    case 'energy':
      return ENTRAINMENT_HZ.gamma;
    case 'anxiety':
    default:
      return ENTRAINMENT_HZ.alpha;
  }
}
