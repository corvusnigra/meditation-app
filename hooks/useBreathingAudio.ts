'use client';

import { useEffect } from 'react';
import {
  setActive,
  setEntrainment,
  setVolume,
  startAmbient,
  stopAmbient,
  stopCues,
} from '@/lib/breathing-audio';
import type { AmbientPreset } from '@/lib/types';

type UseBreathingAudioOptions = {
  enabled: boolean; // ambient (дрон/мерцание)
  preset: AmbientPreset;
  volume: number;
  active: boolean;
  entrainment?: boolean; // слой амплитудной модуляции
  entrainmentHz?: number;
};

// Фон практики. Сигналы фаз идут отдельно — через usePracticeSignals.
export function useBreathingAudio({
  enabled,
  preset,
  volume,
  active,
  entrainment = false,
  entrainmentHz = 10,
}: UseBreathingAudioOptions): void {
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
}
