'use client';

import { useEffect } from 'react';
import {
  ensureAudio,
  onBreathPhase,
  setActive,
  setVolume,
  startAmbient,
  stopAmbient,
} from '@/lib/breathing-audio';
import type { AmbientPreset, BreathingPhase } from '@/lib/types';

type UseBreathingAudioOptions = {
  enabled: boolean;
  preset: AmbientPreset;
  volume: number;
  active: boolean;
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
}: UseBreathingAudioOptions): UseBreathingAudioResult {
  useEffect(() => {
    if (!enabled) {
      stopAmbient();
      return;
    }
    startAmbient(preset, volume);
    return () => {
      stopAmbient();
    };
  }, [enabled, preset]);

  useEffect(() => {
    if (enabled) setVolume(volume);
  }, [enabled, volume]);

  useEffect(() => {
    if (enabled) setActive(active);
  }, [enabled, active]);

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
