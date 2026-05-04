'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import {
  LayoutGrid, KeyRound, CreditCard, Activity,
  ShieldCheck, Bell, Code2, AlertTriangle
} from 'lucide-react';

// Linear/Notion-style left sidebar. Top: nav. Bottom: account control.
// Settings sub-menu lives inside this component instead of a separate one
// because the spec calls for everything to be reachable from one rail.

const NAV: ReadonlyArray<{ href: string; label: string; Icon: typeof LayoutGrid }> = [
  { href: '/dashboard',          label: 'Overview',  Icon: LayoutGrid    },
  { href: '/dashboard/license',  label: 'License',   Icon: KeyRound      },
  { href: '/dashboard/billing',  label: 'Billing',   Icon: CreditCard    },
  { href: '/dashboard/usage',    label: 'Usage',     Icon: Activity      }
];

const SETTINGS: ReadonlyArray<{ href: string; label: string; Icon: typeof LayoutGrid; disabled?: boolean }> = [
  { href: '/dashboard/api-access',    label: 'API access',    Icon: Code2,         disabled: true },
  { href: '/dashboard/notifications', label: 'Notifications', Icon: Bell,          disabled: true },
  { href: '/dashboard/security',      label: 'Security',      Icon: ShieldCheck,   disabled: true },
  { href: '/dashboard/danger',        label: 'Danger zone',   Icon: AlertTriangle, disabled: true }
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-panel">
      <Link href="/" className="flex h-14 items-center px-4 font-mono text-sm font-semibold tracking-tight">
        HZSec<span className="text-accent">.io</span>
      </Link>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-4">
        <div>
          <SectionLabel>Workspace</SectionLabel>
          {NAV.map(({ href, label, Icon }) => (
            <NavItem key={href} href={href} active={pathname === href} Icon={Icon} label={label} />
          ))}
        </div>

        <div>
          <SectionLabel>Settings</SectionLabel>
          {SETTINGS.map(({ href, label, Icon, disabled }) => (
            <NavItem key={href} href={href} active={pathname === href} Icon={Icon} label={label} disabled={disabled} />
          ))}
        </div>
      </nav>

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-panel2">
          <UserButton afterSignOutUrl="/" />
          <span className="text-sm text-muted">Account</span>
        </div>
      </div>
    </aside>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-2 pb-1.5 pt-2 text-[11px] font-medium uppercase tracking-wider text-muted">
      {children}
    </div>
  );
}

function NavItem({
  href, label, Icon, active, disabled
}: {
  href: string; label: string; Icon: typeof LayoutGrid;
  active?: boolean; disabled?: boolean;
}) {
  const cls = `flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors ${
    active
      ? 'bg-panel2 text-text'
      : disabled
        ? 'cursor-not-allowed text-muted/50'
        : 'text-muted hover:bg-panel2 hover:text-text'
  }`;
  if (disabled) {
    return (
      <span className={cls}>
        <Icon size={15} />
        {label}
        <span className="ml-auto text-[10px] uppercase tracking-wider text-muted/70">soon</span>
      </span>
    );
  }
  return (
    <Link href={href} className={cls}>
      <Icon size={15} />
      {label}
    </Link>
  );
}
