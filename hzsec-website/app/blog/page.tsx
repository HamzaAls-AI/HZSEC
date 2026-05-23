import Link from 'next/link';
import { MarketingHeader } from '@/components/MarketingHeader';
import { MarketingFooter } from '@/components/MarketingFooter';
import { Rss, ArrowRight } from 'lucide-react';

// /blog — empty-state landing until MDX content lands in /content/blog/.
// The page is intentionally informative rather than just "coming soon" —
// readers should be able to tell what to expect when posts ship.

export const metadata = {
  title: 'Blog · HZSec',
  description: 'Field notes on local-first security, vulnerability detection, and developer security workflows.'
};

const PLANNED_TOPICS = [
  'How HZSec scans without uploading your code',
  'Why secret detection breaks in monorepos — and how to fix it',
  'Building auditable rules: every detector readable by a human',
  'Live-session scanning: catching the issues your linter misses',
  'CI integration patterns for local-first scanners'
];

export default function BlogIndexPage() {
  return (
    <>
      <MarketingHeader />

      <section className="border-b border-border">
        <div className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted">
            <Rss size={14} /> Blog
          </div>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
            Field notes on local-first security.
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
            Practical writing on vulnerability detection, secret scanning, and
            developer security workflows — by the team building HZSec.
          </p>
        </div>
      </section>

      <section className="border-b border-border bg-panel">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <div className="rounded-lg border border-dashed border-border bg-bg p-8 text-center">
            <div className="text-sm font-medium text-text">No posts yet.</div>
            <p className="mt-2 text-sm text-muted">
              The first posts are being drafted. Subscribe to follow along, or skim what&apos;s planned below.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link
                href="/download"
                className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90 transition-colors"
              >
                Try HZSec instead <ArrowRight size={14} />
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 rounded-md border border-border bg-bg px-4 py-2 text-sm text-text hover:border-accent/60 transition-colors"
              >
                Read the docs
              </Link>
            </div>
          </div>

          <div className="mt-10">
            <div className="text-xs uppercase tracking-wider text-muted">In the queue</div>
            <ul className="mt-4 space-y-2">
              {PLANNED_TOPICS.map((t) => (
                <li
                  key={t}
                  className="flex items-start gap-3 rounded-md border border-border bg-bg p-4 text-sm text-text"
                >
                  <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </>
  );
}
