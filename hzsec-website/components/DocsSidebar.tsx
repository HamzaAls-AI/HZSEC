'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  {
    group: 'Getting Started',
    items: [
      { label: 'Overview',     href: '/docs' },
      { label: 'Quickstart',   href: '/docs/quickstart' },
      { label: 'Installation', href: '/docs/install' },
      { label: 'First Scan',   href: '/docs/first-scan' },
    ],
  },
  {
    group: 'Scanning',
    items: [
      { label: 'Scan Modes',    href: '/docs/scan-modes' },
      { label: 'CLI Reference', href: '/docs/cli' },
    ],
  },
  {
    group: 'Platform',
    items: [
      { label: 'Architecture', href: '/docs/architecture' },
    ],
  },
  {
    group: 'Defend',
    items: [
      { label: 'AI Assistant', href: '/docs/ai-assistant' },
      { label: 'Live Monitor', href: '/docs/live-monitor' },
    ],
  },
  {
    group: 'Govern',
    items: [
      { label: 'Compliance', href: '/docs/compliance' },
    ],
  },
];

export function DocsSidebar() {
  const pathname = usePathname();

  return (
    <nav aria-label="Documentation navigation">
      {NAV.map(({ group, items }) => (
        <div key={group} className="mb-6">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted mb-2 px-3">
            {group}
          </div>
          <ul className="space-y-0.5">
            {items.map(({ label, href }) => {
              const isActive = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`block px-3 py-1.5 rounded-md text-sm transition-colors ${
                      isActive
                        ? 'bg-accent/10 text-accent font-medium border-l-2 border-accent'
                        : 'text-muted hover:text-text hover:bg-panel'
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
