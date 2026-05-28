import type { AmbientPreset } from './types';

export type AmbientConfig = {
  droneFreq: number;
  shimmerFreqs: number[];
  cueFreq: number;
  shimmerWave: OscillatorType;
  filterCutoff: number;
  shimmerGain: number;
};

export const AMBIENT_PRESETS: Record<AmbientPreset, AmbientConfig> = {
  ocean: {
    droneFreq: 110,
    shimmerFreqs: [220, 330],
    cueFreq: 440,
    shimmerWave: 'sine',
    filterCutoff: 1800,
    shimmerGain: 0.12,
  },
  forest: {
    droneFreq: 147,
    shimmerFreqs: [294, 441],
    cueFreq: 588,
    shimmerWave: 'triangle',
    filterCutoff: 2400,
    shimmerGain: 0.1,
  },
  night: {
    droneFreq: 82,
    shimmerFreqs: [164],
    cueFreq: 246,
    shimmerWave: 'sine',
    filterCutoff: 900,
    shimmerGain: 0.06,
  },
  silence: {
    droneFreq: 0,
    shimmerFreqs: [],
    cueFreq: 528,
    shimmerWave: 'sine',
    filterCutoff: 2000,
    shimmerGain: 0,
  },
};

export const AMBIENT_LABEL: Record<AmbientPreset, string> = {
  ocean: 'Океан',
  forest: 'Лес',
  night: 'Ночь',
  silence: 'Тишина',
};

export const AMBIENT_DESCRIPTION: Record<AmbientPreset, string> = {
  ocean: 'Тёплый низкий дрон с широким мерцанием',
  forest: 'Светлее, триангулярные волны',
  night: 'Очень низкий, минимум мерцания',
  silence: 'Только мягкий тон на смене фаз',
};
