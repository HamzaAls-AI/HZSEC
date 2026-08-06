'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import {
  LayoutGrid, KeyRound, CreditCard, Activity, User,
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

  const accountActive = pathname === '/dashboard/account';

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-panel">
      <Link href="/" className="flex h-14 items-center px-4 font-mono text-sm font-semibold tracking-tight">
        HZSec<span className="text-accent">.io</span>
      </Link>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4 pt-1">
        <SectionLabel>Workspace</SectionLabel>
        {NAV.map(({ href, label, Icon }) => (
          <NavItem key={href} href={href} active={pathname === href} Icon={Icon} label={label} />
        ))}
      </nav>

      {/* Account row — navigates to /dashboard/account */}
      <div className="border-t border-border p-3">
        <Link
          href="/dashboard/account"
          className={`flex items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors ${
            accountActive
              ? 'bg-panel2 text-text'
              : 'text-muted hover:bg-panel2 hover:text-text'
          }`}
        >
          {user?.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.imageUrl}
              alt={user.fullName ?? 'Avatar'}
              className="h-5 w-5 rounded-full object-cover"
            />
          ) : (
            <User size={15} />
          )}
          <span className="text-sm truncate flex-1">
            {user?.firstName ?? 'Account'}
          </span>
        </Link>
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
