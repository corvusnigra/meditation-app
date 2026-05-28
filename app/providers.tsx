'use client';

import type { ReactNode } from 'react';
import { SettingsProvider } from '@/context/SettingsContext';
import { HistoryProvider } from '@/context/HistoryContext';
import { ProgressionProvider } from '@/context/ProgressionContext';
import { SessionProvider } from '@/context/SessionContext';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SettingsProvider>
      <HistoryProvider>
        <ProgressionProvider>
          <SessionProvider>{children}</SessionProvider>
        </ProgressionProvider>
      </HistoryProvider>
    </SettingsProvider>
  );
}
