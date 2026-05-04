import './globals.css';
import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';

export const metadata: Metadata = {
  title:       'HZSec — Local AI security platform',
  description: 'AI-assisted code security scanning, live monitoring, and breach intelligence for developers.',
  metadataBase: new URL('https://hzsec.io')
};

// Clerk's dark theme is a separate optional package (@clerk/themes). We
// stick with the default light theme for now and only override accent
// colors via CSS variables — keeps the dependency footprint smaller. To
// switch to Clerk's prebuilt dark theme later: `npm i @clerk/themes` and
// import { dark } from '@clerk/themes', pass appearance.baseTheme.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider appearance={{ variables: { colorPrimary: '#7c3aed' } }}>
      <html lang="en">
        <body className="min-h-screen bg-bg text-text font-sans">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
