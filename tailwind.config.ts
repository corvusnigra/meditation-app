import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0F1729',
          secondary: '#1A2340',
          card: '#1E2A45',
        },
        text: {
          primary: '#E8ECF4',
          secondary: '#8B95A8',
        },
        accent: {
          breathing: '#4ECDC4',
          grounding: '#7C8CF8',
          gratitude: '#F4A261',
          streak: '#E07A5F',
        },
        success: '#6BCB77',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'breath-inhale': {
          '0%': { transform: 'scale(0.6)' },
          '100%': { transform: 'scale(1)' },
        },
        'breath-exhale': {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(0.6)' },
        },
        'gentle-pulse': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'gentle-pulse': 'gentle-pulse 4s ease-in-out infinite',
        'fade-in': 'fade-in 600ms ease-out',
        'fade-up': 'fade-up 500ms ease-out',
      },
      boxShadow: {
        glow: '0 0 60px -10px rgba(78, 205, 196, 0.45)',
        'glow-breathing': '0 0 80px -8px rgba(78, 205, 196, 0.55)',
        'glow-grounding': '0 0 80px -8px rgba(124, 140, 248, 0.55)',
        'glow-gratitude': '0 0 80px -8px rgba(244, 162, 97, 0.55)',
      },
    },
  },
  plugins: [],
};

export default config;
