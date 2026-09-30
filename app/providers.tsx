'use client';

import type { ReactNode } from 'react';
import { MotionConfig } from 'framer-motion';
import { SettingsProvider, useSettings } from '@/context/SettingsContext';
import { HistoryProvider } from '@/context/HistoryContext';
import { ProgressionProvider } from '@/context/ProgressionContext';
import { SessionProvider } from '@/context/SessionContext';
import { useServiceWorker } from '@/hooks/useServiceWorker';
import type { MotionPref } from '@/lib/types';

const FRAMER_REDUCED_MOTION: Record<MotionPref, 'user' | 'always' | 'never'> = {
  system: 'user',
  reduce: 'always',
  full: 'never',
};

function MotionPreference({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  return (
    <MotionConfig reducedMotion={FRAMER_REDUCED_MOTION[settings.motionPref]}>
      {children}
    </MotionConfig>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  useServiceWorker();

  return (
    <SettingsProvider>
      <MotionPreference>
        <HistoryProvider>
          <ProgressionProvider>
            <SessionProvider>{children}</SessionProvider>
          </ProgressionProvider>
        </HistoryProvider>
      </MotionPreference>
    </SettingsProvider>
  );
}
