import Link from 'next/link';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

// Public-page header — landing, pricing, legal. Linear-ish: minimal, mono-
// adjacent typography for the brand mark, hover-only nav underline.

export function MarketingHeader() {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="font-mono text-sm font-semibold tracking-tight">
          HZSec<span className="text-accent">.io</span>
        </Link>

        <nav className="flex items-center gap-7 text-sm">
          <Link href="/pricing" className="text-muted hover:text-text">Pricing</Link>
          <Link href="/guide" className="text-muted hover:text-text">How it works</Link>
          <Link href="/download" className="text-muted hover:text-text">Download</Link>
          <Link href="/legal/privacy" className="text-muted hover:text-text">Privacy</Link>
          <Link href="/legal/terms" className="text-muted hover:text-text">Terms</Link>

          <SignedOut>
            <Link href="/login"  className="text-muted hover:text-text">Sign in</Link>
            <Link href="/signup" className="rounded-md bg-accent px-3 py-1.5 text-white hover:bg-accent/90">
              Get started
            </Link>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard" className="text-muted hover:text-text">Dashboard</Link>
            {clerkKey ? <UserButton afterSignOutUrl="/" /> : null}
          </SignedIn>
        </nav>
      </div>
    </header>
  );
}
