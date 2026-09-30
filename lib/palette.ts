// Единственный источник цветов. Отсюда их берут tailwind.config.ts и app/layout.tsx,
// а styles/globals.css — через theme().
export const PALETTE = {
  bg: {
    primary: '#0F1729',
    secondary: '#1A2340',
    card: '#1E2A45',
  },
  text: {
    primary: '#E8ECF4',
    secondary: '#98A2B5',
  },
  accent: {
    breathing: '#4ECDC4',
    grounding: '#7C8CF8',
    gratitude: '#F4A261',
    streak: '#E07A5F',
  },
  success: '#6BCB77',
} as const;

export function withAlpha(hex: string, alpha: number): string {
  const value = parseInt(hex.slice(1), 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgb(${r} ${g} ${b} / ${alpha})`;
}
