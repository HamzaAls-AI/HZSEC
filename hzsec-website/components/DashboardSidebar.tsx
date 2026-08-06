'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import {
  LayoutGrid, KeyRound, CreditCard, Activity, Settings,
} from 'lucide-react';

const NAV: ReadonlyArray<{ href: string; label: string; Icon: typeof LayoutGrid }> = [
  { href: '/dashboard',         label: 'Overview', Icon: LayoutGrid },
  { href: '/dashboard/license', label: 'License',  Icon: KeyRound   },
  { href: '/dashboard/billing', label: 'Billing',  Icon: CreditCard },
  { href: '/dashboard/usage',   label: 'Usage',    Icon: Activity   },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-panel">
      <Link href="/" className="flex h-14 items-center px-4 font-mono text-sm font-semibold tracking-tight">
        HZSec<span className="text-accent">.io</span>
      </Link>

      <nav className="flex-1 overflow-y-auto px-3 pb-4 pt-1">
        <SectionLabel>Workspace</SectionLabel>
        <div className="space-y-1">
          {NAV.map(({ href, label, Icon }) => (
            <NavItem key={href} href={href} active={pathname === href} Icon={Icon} label={label} />
          ))}
        </div>

        <div className="mt-6 space-y-1">
          <SectionLabel>Settings</SectionLabel>
          <NavItem
            href="/dashboard/account"
            active={pathname === '/dashboard/account'}
            Icon={Settings}
            label="Account"
          />
        </div>
      </nav>

      {/* Avatar strip — visual only, not a nav link */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          {user?.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.imageUrl}
              alt={user.fullName ?? 'Avatar'}
              className="h-5 w-5 rounded-full object-cover"
            />
          ) : (
            <div className="h-5 w-5 rounded-full bg-accent/20 flex items-center justify-center text-[10px] text-accent font-semibold">
              {user?.firstName?.[0] ?? '?'}
            </div>
          )}
          <span className="text-sm text-muted truncate flex-1">
            {user?.firstName ?? user?.primaryEmailAddress?.emailAddress ?? 'Account'}
          </span>
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
  href, label, Icon, active,
}: {
  href: string; label: string; Icon: typeof LayoutGrid; active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors ${
        active ? 'bg-panel2 text-text' : 'text-muted hover:bg-panel2 hover:text-text'
      }`}
    >
      <Icon size={15} />
      {label}
    </Link>
  );
}
