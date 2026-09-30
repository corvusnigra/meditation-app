'use client';

import { useEffect } from 'react';
import {
  ensureAudio,
  onBreathPhase,
  playPhaseCue,
  setActive,
  setEntrainment,
  setVolume,
  startAmbient,
  stopAmbient,
  stopCues,
} from '@/lib/breathing-audio';
import type { AmbientPreset, BreathingPhase } from '@/lib/types';

type UseBreathingAudioOptions = {
  enabled: boolean; // ambient (дрон/мерцание)
  preset: AmbientPreset;
  volume: number;
  active: boolean;
  entrainment?: boolean; // слой амплитудной модуляции
  entrainmentHz?: number;
  phaseSound?: boolean; // тон смены фазы без ambient
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
  phaseSound = false,
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

  // Сигнал фазы идёт мимо master: на паузе и при уходе его глушим отдельно.
  useEffect(() => {
    if (!active) stopCues();
  }, [active]);

  useEffect(() => stopCues, []);

  useEffect(() => {
    if (engineOn) setEntrainment(entrainment, entrainmentHz);
  }, [engineOn, entrainment, entrainmentHz]);

  return {
    unlock: async () => {
      await ensureAudio(preset, volume);
    },
    onPhase: (phase, durationSec) => {
      if (enabled) onBreathPhase(phase, durationSec);
      else if (phaseSound) playPhaseCue(phase, durationSec);
    },
    stop: () => {
      stopAmbient();
    },
  };
}
