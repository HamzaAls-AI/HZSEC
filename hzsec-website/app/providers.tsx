'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { ThemeProvider, useTheme } from 'next-themes';
import type { ReactNode } from 'react';

// next-themes owns the resolved theme; ClerkProvider needs to be re-rendered
// with a matching `baseTheme` so its modal/forms don't render white inside
// our dark page (the bug the audit surfaced).
function ClerkWithTheme({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  return (
    <ClerkProvider
      appearance={{
        baseTheme: isDark ? dark : undefined,
        variables: {
          colorPrimary: isDark ? '#7c3aed' : '#6d28d9',
          colorBackground: isDark ? '#13151a' : '#ffffff',
          colorText: isDark ? '#e8eaed' : '#111827',
          colorTextSecondary: isDark ? '#8b8f99' : '#4b5563',
          colorInputBackground: isDark ? '#0b0c0f' : '#ffffff',
          colorInputText: isDark ? '#e8eaed' : '#111827'
        }
      }}
    >
      {children}
    </ClerkProvider>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange={false}
    >
      <ClerkWithTheme>{children}</ClerkWithTheme>
    </ThemeProvider>
  );
}
