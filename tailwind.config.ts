import type { Config } from 'tailwindcss';
import { PALETTE, withAlpha } from './lib/palette';

const toneGlow = (color: string): string => `0 0 80px -8px ${withAlpha(color, 0.55)}`;

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: PALETTE,
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'gentle-pulse': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        'gentle-pulse': 'gentle-pulse 4s ease-in-out infinite',
      },
      boxShadow: {
        glow: `0 0 60px -10px ${withAlpha(PALETTE.accent.breathing, 0.45)}`,
        'glow-breathing': toneGlow(PALETTE.accent.breathing),
        'glow-grounding': toneGlow(PALETTE.accent.grounding),
        'glow-gratitude': toneGlow(PALETTE.accent.gratitude),
        'glow-streak': toneGlow(PALETTE.accent.streak),
        'glow-success': toneGlow(PALETTE.success),
      },
    },
  },
  plugins: [],
};

export default config;
