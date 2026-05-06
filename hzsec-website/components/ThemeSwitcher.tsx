'use client';

import { useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'mid';

const THEMES: Array<{ id: Theme; label: string }> = [
  { id: 'light', label: 'Light' },
  { id: 'mid', label: 'Mid' },
  { id: 'dark', label: 'Dark' }
];

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    try {
      const stored = (localStorage.getItem('hzsec-theme') as Theme | null) || 'dark';
      setTheme(stored);
      document.documentElement.setAttribute('data-theme', stored);
    } catch {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  function apply(next: Theme) {
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem('hzsec-theme', next);
    } catch {}
  }

  return (
    <div className="inline-flex rounded-md border border-border bg-panel p-0.5 text-[11px]">
      {THEMES.map(t => (
        <button
          key={t.id}
          type="button"
          onClick={() => apply(t.id)}
          aria-pressed={theme === t.id}
          className={`rounded px-2 py-1 transition-colors ${
            theme === t.id ? 'bg-accent text-white' : 'text-muted hover:text-text'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
