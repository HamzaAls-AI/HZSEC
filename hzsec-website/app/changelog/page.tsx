import { MarketingHeader } from '@/components/MarketingHeader';
import { MarketingFooter } from '@/components/MarketingFooter';

export const metadata = {
  title: 'Changelog · HZSec',
  description: 'Every release, every fix, every improvement to HZSec.',
};

type ChangeType = 'new' | 'improved' | 'fixed';

interface Release {
  version: string;
  date: string;
  latest?: boolean;
  changes: { type: ChangeType; text: string }[];
}

const RELEASES: Release[] = [
  {
    version: '1.1.0',
    date: 'July 28, 2026',
    latest: true,
    changes: [
      { type: 'new',      text: 'Dashboard: API Keys page — paste your Anthropic key and get the CLI setup command instantly' },
      { type: 'new',      text: 'Dashboard: dedicated Feedback page with 500-char form and success state' },
      { type: 'new',      text: 'Dashboard: Usage page rewritten as a client component — no longer crashes when the backend is offline' },
      { type: 'new',      text: 'Dashboard: Overview now includes a CLI quick-start panel for subscribed users and a 4-step onboarding checklist for new users' },
      { type: 'new',      text: 'CLI: hzsec auth login for account-linked sessions' },
      { type: 'improved', text: 'Dashboard sidebar: Account, API Keys, and Feedback are now visible named nav items under Settings — no more hunting for the profile' },
      { type: 'improved', text: 'Account page: Appearance switcher now correctly applies dark/light/system via localStorage + data-theme (was a no-op in v1.0)' },
      { type: 'improved', text: 'Account page: Log out now works correctly (Clerk v6 API fix)' },
      { type: 'improved', text: 'Desktop app: marked as Beta with Gatekeeper bypass instructions on the install page and download section' },
      { type: 'fixed',    text: 'Download route: artifact filename now matches the actual CI output (HZSec-arm64.dmg)' },
      { type: 'fixed',    text: 'Feedback and Contact support: mailto links now use window.location.href — no more stuck blank tabs' },
      { type: 'fixed',    text: 'ESLint: unescaped apostrophes in account page that were failing Vercel builds' },
    ],
  },
  {
    version: '1.0.0',
    date: 'May 18, 2026',
    changes: [
      { type: 'new', text: 'CLI scanner: secret detection across 40+ credential patterns (AWS, Stripe, GitHub, and more)' },
      { type: 'new', text: 'CLI scanner: dependency audit against OSV and NVD databases' },
      { type: 'new', text: 'CLI scanner: SAST rules for SQL injection, XSS, path traversal, command injection' },
      { type: 'new', text: 'Desktop app: macOS (Apple Silicon) and Windows builds with full GUI' },
      { type: 'new', text: 'AI assistant: managed Anthropic proxy for Pro and Team (no key setup), BYOK for Free' },
      { type: 'new', text: 'Breach Library: check email addresses against known data breach databases' },
      { type: 'new', text: 'Live monitor: watch for credential leaks in running processes' },
      { type: 'new', text: 'Dashboard: License, Billing, and Usage management for subscribers' },
      { type: 'new', text: 'Docs: Installation, Quickstart, First Scan, CLI reference, AI assistant guide' },
      { type: 'new', text: 'Theme system: light, dark, and system — persisted via localStorage' },
    ],
  },
];

const typeConfig: Record<ChangeType, { label: string; cls: string }> = {
  new:      { label: 'New',      cls: 'bg-accent/10 text-accent border-accent/20'   },
  improved: { label: 'Improved', cls: 'bg-ok/10 text-ok border-ok/20'               },
  fixed:    { label: 'Fixed',    cls: 'bg-warn/10 text-warn border-warn/20'         },
};

export default function ChangelogPage() {
  return (
    <>
      <MarketingHeader />

      <section className="border-b border-border">
        <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
          <div className="text-xs uppercase tracking-wider text-muted font-mono mb-2">Changelog</div>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            What&apos;s new in HZSec.
          </h1>
          <p className="mt-4 text-lg text-muted leading-relaxed max-w-xl">
            Every release, every fix, every improvement. New releases ship to the CLI
            via npm and to the desktop app as a direct download.
          </p>
        </div>
      </section>

      <section className="bg-panel border-b border-border">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <div className="space-y-16">
            {RELEASES.map((release) => (
              <div key={release.version} className="relative grid sm:grid-cols-[140px_1fr] gap-6 sm:gap-10">
                {/* Left: version + date */}
                <div className="flex sm:flex-col sm:items-start gap-3 sm:gap-1.5 sm:pt-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-semibold text-text">
                      v{release.version}
                    </span>
                    {release.latest && (
                      <span className="rounded-full bg-ok/15 text-ok px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider">
                        Latest
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted">{release.date}</span>
                </div>

                {/* Right: changes */}
                <div className="rounded-xl border border-border bg-bg p-6">
                  <ul className="space-y-3">
                    {release.changes.map((c, i) => {
                      const { label, cls } = typeConfig[c.type];
                      return (
                        <li key={i} className="flex items-start gap-3">
                          <span className={`shrink-0 mt-0.5 rounded border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${cls}`}>
                            {label}
                          </span>
                          <span className="text-sm text-text/80 leading-relaxed">{c.text}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 rounded-xl border border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted">
              Older releases will be archived here as the product matures.
            </p>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </>
  );
}
