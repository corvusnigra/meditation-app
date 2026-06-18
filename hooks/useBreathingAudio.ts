'use client';

import { useEffect } from 'react';
import {
  ensureAudio,
  onBreathPhase,
  setActive,
  setEntrainment,
  setVolume,
  startAmbient,
  stopAmbient,
} from '@/lib/breathing-audio';
import type { AmbientPreset, BreathingPhase } from '@/lib/types';

type UseBreathingAudioOptions = {
  enabled: boolean; // ambient (дрон/мерцание)
  preset: AmbientPreset;
  volume: number;
  active: boolean;
  entrainment?: boolean; // слой амплитудной модуляции
  entrainmentHz?: number;
};

type UseBreathingAudioResult = {
  unlock: () => Promise<void>;
  onPhase: (phase: BreathingPhase, durationSec?: number) => void;
  stop: () => void;
};

export function useBreathingAudio({
  enabled,
  preset,
  volume,
  active,
  entrainment = false,
  entrainmentHz = 10,
}: UseBreathingAudioOptions): UseBreathingAudioResult {
  // Движок нужен, если включён ambient ИЛИ энтрейнмент.
  const engineOn = enabled || entrainment;

  useEffect(() => {
    if (!engineOn) {
      stopAmbient();
      return;
    }
    startAmbient(preset, volume);
    return () => {
      stopAmbient();
    };
  }, [engineOn, preset]);

  useEffect(() => {
    if (engineOn) setVolume(volume);
  }, [engineOn, volume]);

  useEffect(() => {
    if (engineOn) setActive(active);
  }, [engineOn, active]);

  useEffect(() => {
    if (engineOn) setEntrainment(entrainment, entrainmentHz);
  }, [engineOn, entrainment, entrainmentHz]);

  return {
    unlock: async () => {
      await ensureAudio(preset, volume);
    },
    onPhase: (phase, durationSec) => {
      if (enabled) onBreathPhase(phase, durationSec);
    },
    stop: () => {
      stopAmbient();
    },
  };
}
