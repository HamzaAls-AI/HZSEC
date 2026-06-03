import Link from 'next/link';

const colTitle = 'font-mono text-[10px] uppercase tracking-widest text-muted mb-4';
const colLink  = 'block text-sm text-muted hover:text-accent transition-colors';

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-panel pt-16 pb-8">
      <div className="max-w-[1180px] mx-auto px-[6%]">

        {/* ── Top grid ── */}
        <div className="grid grid-cols-2 gap-10 min-[900px]:grid-cols-5 min-[900px]:gap-8">

          {/* Column 1 — Brand (spans 2 cols on desktop) */}
          <div className="col-span-2 min-[900px]:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <svg
                className="text-accent"
                width="20"
                height="24"
                viewBox="0 0 48 56"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M4 4 L44 4 L44 32 Q44 48 24 54 Q4 48 4 32 Z"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinejoin="round"
                />
                <line x1="10" y1="16" x2="10" y2="36" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
                <line x1="10" y1="26" x2="20" y2="26" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
                <line x1="20" y1="16" x2="20" y2="36" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
                <line x1="25" y1="16" x2="38" y2="16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                <line x1="38" y1="16" x2="25" y2="32" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                <line x1="25" y1="32" x2="38" y2="32" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
              <span className="font-mono text-sm font-bold tracking-tight">
                <span className="text-text">HZ</span>
                <span className="text-accent">Sec</span>
              </span>
            </Link>

            <p className="text-sm text-muted leading-relaxed mt-4 max-w-[320px]">
              Local-first security for developers. Find what&apos;s broken, fix it
              with AI, and prove you&apos;re compliant — without a single line of
              code leaving your machine.
            </p>

            {/* Social icons */}
            <div className="flex gap-3 mt-6">
              <a
                href="https://github.com/HamzaAls-AI/HZSEC"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="text-muted hover:text-accent transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2 — Product */}
          <div>
            <div className={colTitle}>Product</div>
            <ul className="space-y-2.5">
              <li><Link href="/product/scan" className={colLink}>Security Scanner</Link></li>
              <li><Link href="/product/defend" className={colLink}>AI Assistant</Link></li>
              <li><Link href="/product/defend" className={colLink}>Live Monitor</Link></li>
              <li><Link href="/pricing" className={colLink}>Pricing</Link></li>
              <li><Link href="/download" className={colLink}>Download</Link></li>
            </ul>
          </div>

          {/* Column 3 — Resources */}
          <div>
            <div className={colTitle}>Resources</div>
            <ul className="space-y-2.5">
              <li><Link href="/docs" className={colLink}>Documentation</Link></li>
              <li><Link href="/blog" className={colLink}>Blog</Link></li>
              <li><Link href="/security" className={colLink}>Security</Link></li>
              <li><Link href="/docs" className={colLink}>How it works</Link></li>
            </ul>
          </div>

          {/* Column 4 — Company */}
          <div>
            <div className={colTitle}>Company</div>
            <ul className="space-y-2.5">
              <li><a href="mailto:hello@hzsec.io" className={colLink}>Contact</a></li>
              <li><Link href="/legal/privacy" className={colLink}>Privacy</Link></li>
              <li><Link href="/legal/terms" className={colLink}>Terms</Link></li>
              <li><Link href="/legal/eula" className={colLink}>EULA</Link></li>
            </ul>
          </div>

        </div>

        {/* ── Bottom bar ── */}
        <div className="border-t border-border mt-12 pt-8 flex flex-col gap-3 min-[700px]:flex-row min-[700px]:items-center min-[700px]:justify-between text-xs text-muted">
          <div>© {new Date().getFullYear()} HZSec. All rights reserved.</div>
          <div>Built for developers who don&apos;t want their source code in someone else&apos;s cloud.</div>
        </div>

      </div>
    </footer>
  );
}
