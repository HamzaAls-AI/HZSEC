import type { Config } from 'tailwindcss';

export default {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        // Theme tokens use CSS variables so the site can switch between
        // light, mid, and dark modes.
        bg:        'rgb(var(--color-bg) / <alpha-value>)',
        panel:     'rgb(var(--color-panel) / <alpha-value>)',
        panel2:    'rgb(var(--color-panel2) / <alpha-value>)',
        border:    'rgb(var(--color-border) / <alpha-value>)',
        text:      'rgb(var(--color-text) / <alpha-value>)',
        muted:     'rgb(var(--color-muted) / <alpha-value>)',
        accent:    'rgb(var(--color-accent) / <alpha-value>)',
        accentSoft:'rgb(var(--color-accent-soft) / <alpha-value>)',
        danger:    'rgb(var(--color-danger) / <alpha-value>)',
        warn:      'rgb(var(--color-warn) / <alpha-value>)',
        ok:        'rgb(var(--color-ok) / <alpha-value>)'
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'Inter', 'sans-serif'],
        mono: ['ui-monospace', 'SF Mono', 'Menlo', 'monospace']
      }
    }
  },
  plugins: []
} satisfies Config;
