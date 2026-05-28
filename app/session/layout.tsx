import type { ReactNode } from 'react';

export default function SessionLayout({ children }: { children: ReactNode }) {
  return <div className="ambient-bg min-h-[100dvh]">{children}</div>;
}
