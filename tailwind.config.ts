import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './data/**/*.{ts,tsx}',
    './config/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        paper: 'var(--paper)',
        surface: 'var(--surface)',
        ink: 'var(--ink)',
        'ink-soft': 'var(--ink-soft)',
        'ink-mute': 'var(--ink-mute)',
        'ink-faint': 'var(--ink-faint)',
        rule: 'var(--rule)',
        accent: 'var(--accent)',
        'accent-ink': 'var(--accent-ink)',
        'accent-deep': 'var(--accent-deep)',
        'accent-wash': 'var(--accent-wash)',
      },
      fontFamily: {
        sans: 'var(--font-sans)',
        serif: 'var(--font-serif)',
        mono: 'var(--font-mono)',
        arabic: 'var(--font-arabic)',
      },
      fontSize: {
        label: ['0.6875rem', { lineHeight: '1', letterSpacing: '0.16em' }],
      },
      maxWidth: {
        shell: '96rem',
      },
      transitionTimingFunction: {
        editorial: 'cubic-bezier(0.22, 1, 0.36, 1)',
        swift: 'cubic-bezier(0.65, 0, 0.35, 1)',
      },
      screens: {
        xs: '480px',
        '3xl': '1800px',
      },
    },
  },
  plugins: [],
};

export default config;
