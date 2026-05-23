import Link from 'next/link';

// Footer carries the secondary nav (Pricing, etc.) that we deliberately
// keep out of the primary header. Three-column on desktop, stacks on mobile.

const PRODUCT = [
  { href: '/download', label: 'Download' },
  { href: '/docs',     label: 'Docs' },
  { href: '/pricing',  label: 'Pricing' },
  { href: '/security', label: 'Security' }
];

const COMPANY = [
  { href: '/blog',                  label: 'Blog' },
  { href: 'mailto:hello@hzsec.io',  label: 'Contact' }
];

const LEGAL = [
  { href: '/legal/privacy', label: 'Privacy' },
  { href: '/legal/terms',   label: 'Terms'   },
  { href: '/legal/eula',    label: 'EULA'    }
];

export function MarketingFooter() {
  return (
    <footer className="mt-0 border-t border-border bg-bg">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 sm:grid-cols-4">
        <div>
          <Link href="/" className="font-mono text-sm font-semibold tracking-tight">
            HZSec<span className="text-accent">.io</span>
          </Link>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
            Local-first security analysis for developers. Your code never
            leaves your machine.
          </p>
        </div>

        <FooterColumn title="Product" items={PRODUCT} />
        <FooterColumn title="Company" items={COMPANY} />
        <FooterColumn title="Legal"   items={LEGAL}   />
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <div>© {new Date().getFullYear()} HZSec. All rights reserved.</div>
          <div>Built for developers who don&apos;t want their source code in someone else&apos;s cloud.</div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title, items
}: {
  title: string; items: ReadonlyArray<{ href: string; label: string }>;
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-muted">{title}</div>
      <ul className="mt-4 space-y-2">
        {items.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              className="text-sm text-text/90 hover:text-accent transition-colors"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
