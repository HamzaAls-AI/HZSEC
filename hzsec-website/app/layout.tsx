import './globals.css';
import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import Script from 'next/script';

export const metadata: Metadata = {
  title:       'HZSec — Local-first security scanning for developers',
  description: 'HZSec is a desktop security platform for local scanning, live monitoring, and guided remediation.',
  metadataBase: new URL('https://hzsec.io')
};

// Clerk's publishable key must be present in production. For local builds and
// CI environments that don't have secrets injected yet, render the app without
// Clerk so `next build` can still complete. Authenticated routes will still need
// the real Clerk env vars in deployment.
// Clerk's dark theme is a separate optional package (@clerk/themes). We
// stick with the default light theme for now and only override accent
// colors via CSS variables — keeps the dependency footprint smaller. To
// switch to Clerk's prebuilt dark theme later: `npm i @clerk/themes` and
// import { dark } from '@clerk/themes', pass appearance.baseTheme.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  const app = (
    <html lang="en">
      <head>
        <Script id="hzsec-theme-init" strategy="beforeInteractive">{`(function(){try{var t=localStorage.getItem('hzsec-theme')||'dark';document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`}</Script>
      </head>
      <body className="min-h-screen bg-bg text-text font-sans">
        {children}
      </body>
    </html>
  );

  if (!clerkKey) return app;

  return (
    <ClerkProvider publishableKey={clerkKey} appearance={{ variables: { colorPrimary: '#7c3aed' } }}>
      {app}
    </ClerkProvider>
  );
}
