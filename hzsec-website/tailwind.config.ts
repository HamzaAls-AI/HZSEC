import type { Config } from 'tailwindcss';

export default {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        // HZSec palette — dark by default, neutral grays + a single accent.
        bg:        '#0b0c0f',
        panel:     '#13151a',
        panel2:    '#1a1d24',
        border:    '#252932',
        text:      '#e8eaed',
        muted:     '#8b8f99',
        accent:    '#7c3aed',  // violet-600
        accentSoft:'#1f1530',
        danger:    '#ef4444',
        warn:      '#f59e0b',
        ok:        '#10b981'
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'Inter', 'sans-serif'],
        mono: ['ui-monospace', 'SF Mono', 'Menlo', 'monospace']
      }
    }
  },
  plugins: []
} satisfies Config;
