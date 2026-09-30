'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { settingsStorage } from '@/lib/storage';
import type { UserSettings } from '@/lib/types';
import { DEFAULT_SETTINGS } from '@/lib/constants';

type SettingsContextValue = {
  settings: UserSettings;
  // Итог settings.motionPref с учётом настройки устройства.
  reducedMotion: boolean;
  update: (patch: Partial<UserSettings>) => void;
  reset: () => void;
  hydrated: boolean;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);
  const [systemReducedMotion, setSystemReducedMotion] = useState(false);

  useEffect(() => {
    setSettings(settingsStorage.load());
    setHydrated(true);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setSystemReducedMotion(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  // По этому атрибуту стили решают, уменьшать ли движение (styles/globals.css).
  useEffect(() => {
    document.documentElement.dataset.motion = settings.motionPref;
  }, [settings.motionPref]);

  const reducedMotion =
    settings.motionPref === 'reduce' ||
    (settings.motionPref === 'system' && systemReducedMotion);

  const update = useCallback((patch: Partial<UserSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      settingsStorage.save(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    settingsStorage.save(DEFAULT_SETTINGS);
  }, []);

  const value = useMemo(
    () => ({ settings, reducedMotion, update, reset, hydrated }),
    [settings, reducedMotion, update, reset, hydrated],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used inside SettingsProvider');
  }
  return ctx;
}
