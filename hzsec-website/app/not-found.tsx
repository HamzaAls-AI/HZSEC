import Link from 'next/link';
import { MarketingHeader } from '@/components/MarketingHeader';
import { MarketingFooter } from '@/components/MarketingFooter';

export default function NotFound() {
  return (
    <>
      <MarketingHeader />

      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <div className="font-mono text-[80px] font-bold leading-none text-accent/20 select-none">
          404
        </div>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-text">
          Page not found
        </h1>
        <p className="mt-3 max-w-sm text-sm text-muted leading-relaxed">
          This page doesn&apos;t exist or may have moved. Try one of the links below.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent/90 transition-colors"
          >
            Go home
          </Link>
          <Link
            href="/docs"
            className="rounded-lg border border-border px-4 py-2.5 text-sm text-muted hover:text-text hover:border-accent/40 transition-colors"
          >
            Documentation
          </Link>
          <Link
            href="/pricing"
            className="rounded-lg border border-border px-4 py-2.5 text-sm text-muted hover:text-text hover:border-accent/40 transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg border border-border px-4 py-2.5 text-sm text-muted hover:text-text hover:border-accent/40 transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>

      <MarketingFooter />
    </>
  );
}
