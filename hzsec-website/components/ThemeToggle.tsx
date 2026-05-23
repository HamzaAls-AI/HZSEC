'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

// The toggle has to look correct in BOTH themes. Common failure: a single
// color (e.g. text-muted) that drops out against one of the backgrounds —
// so we use theme-aware tokens (border, panel2, text) that flip with the
// rest of the palette.

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch and the "wrong icon on first paint" flash:
  // wait for client mount before showing a theme-dependent icon.
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === 'dark';
  const next = isDark ? 'light' : 'dark';

  return (
    <button
      type="button"
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      onClick={() => setTheme(next)}
      className={
        'inline-flex h-8 w-8 items-center justify-center rounded-md ' +
        'border border-border bg-panel2/60 text-text ' +
        'hover:bg-panel2 hover:border-accent/60 ' +
        'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ' +
        className
      }
    >
      {!mounted ? (
        <span aria-hidden className="block h-[15px] w-[15px]" />
      ) : isDark ? (
        <Moon size={15} />
      ) : (
        <Sun size={15} />
      )}
    </button>
  );
}
