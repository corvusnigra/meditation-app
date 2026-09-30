'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useSession } from '@/context/SessionContext';
import { PALETTE } from '@/lib/palette';
import type { SessionStatus } from '@/lib/types';

// Фон ритуала подсвечен цветом текущей фазы (--phase-color в styles/globals.css).
const PHASE_COLOR: Partial<Record<SessionStatus, string>> = {
  breathing: PALETTE.accent.breathing,
  grounding: PALETTE.accent.grounding,
  gratitude: PALETTE.accent.gratitude,
};

export default function SessionLayout({ children }: { children: ReactNode }) {
  const { state } = useSession();
  const color = PHASE_COLOR[state.status];
  return (
    <div
      className="ambient-bg min-h-[100dvh]"
      style={color ? ({ '--phase-color': color } as CSSProperties) : undefined}
    >
      {children}
    </div>
  );
}
