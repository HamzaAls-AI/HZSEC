'use client';

import { useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = (localStorage.getItem('hzsec-theme') as Theme | null);
      const initial = stored === 'light' ? 'light' : 'dark';
      setTheme(initial);
      document.documentElement.setAttribute('data-theme', initial);
    } catch {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem('hzsec-theme', next);
    } catch {}
  }

  if (!mounted) return null;

  const isLight = theme === 'light';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${isLight ? 'dark' : 'light'} mode`}
      className="relative inline-flex h-7 w-14 items-center rounded-full border border-border bg-panel transition-colors hover:border-accent/50"
    >
      {/* Track fill */}
      <span
        className={`absolute inset-0 rounded-full transition-colors ${
          isLight ? 'bg-accent/10' : 'bg-panel'
        }`}
      />
      {/* Thumb */}
      <span
        className={`absolute top-0.5 h-6 w-6 rounded-full shadow transition-all duration-300 flex items-center justify-center text-base ${
          isLight
            ? 'left-0.5 bg-accent text-white'
            : 'left-[calc(100%-1.625rem)] bg-panel2 text-warn'
        }`}
      >
        {isLight ? '☀' : '🌙'}
      </span>
    </button>
  );
}
