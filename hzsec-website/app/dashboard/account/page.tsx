'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Sun, Moon, Monitor, LogOut, BookOpen, Mail, MessageSquare } from 'lucide-react';
import Link from 'next/link';

// The app uses a manual data-theme attribute system (set by layout.tsx Script tag
// and ThemeSwitcher). next-themes ThemeProvider is not mounted, so useTheme()
// won't work here. We manage theme state directly via localStorage + data-theme.
type ThemePref = 'light' | 'dark' | 'system';
const STORAGE_KEY = 'hzsec-theme';

function getStoredPref(): ThemePref {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'light' || v === 'dark') return v;
  } catch {}
  return 'system';
}

function applyTheme(pref: ThemePref) {
  const resolved =
    pref === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      : pref;
  document.documentElement.setAttribute('data-theme', resolved);
  try {
    if (pref === 'system') localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, pref);
  } catch {}
}

export default function AccountPage() {
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const router = useRouter();

  const [themePref, setThemePref] = useState<ThemePref>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setThemePref(getStoredPref());
  }, []);

  const handleTheme = useCallback((pref: ThemePref) => {
    setThemePref(pref);
    applyTheme(pref);
  }, []);

  const handleSignOut = useCallback(async () => {
    await signOut();
    router.push('/');
  }, [signOut, router]);

  const handleManageAccount = useCallback(() => {
    if (typeof openUserProfile === 'function') {
      openUserProfile();
    }
  }, [openUserProfile]);

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">Account</h1>

      {/* ── Profile ── */}
      <Section title="Profile">
        <div className="flex items-center gap-4">
          {user?.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.imageUrl}
              alt={user.fullName ?? 'Avatar'}
              className="h-12 w-12 rounded-full object-cover ring-2 ring-border"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/20 text-accent font-semibold text-lg ring-2 ring-border">
              {user?.firstName?.[0] ?? '?'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="font-medium text-text truncate">
              {user?.fullName || user?.firstName || 'No name set'}
            </div>
            <div className="text-sm text-muted truncate">
              {user?.primaryEmailAddress?.emailAddress}
            </div>
          </div>
          <button
            onClick={handleManageAccount}
            className="shrink-0 rounded-md border border-border px-3 py-1.5 text-sm text-muted hover:border-accent/60 hover:text-text transition-colors"
          >
            Manage account
          </button>
        </div>
      </Section>

      {/* ── Appearance ── */}
      <Section title="Appearance">
        <p className="text-sm text-muted mb-4">
          Choose how HZSec looks. System follows your OS preference.
        </p>
        <div className="flex gap-3">
          {([
            { value: 'light'  as ThemePref, label: 'Light',  Icon: Sun     },
            { value: 'dark'   as ThemePref, label: 'Dark',   Icon: Moon    },
            { value: 'system' as ThemePref, label: 'System', Icon: Monitor },
          ]).map(({ value, label, Icon }) => {
            const active = mounted && themePref === value;
            return (
              <button
                key={value}
                onClick={() => handleTheme(value)}
                className={`flex flex-1 flex-col items-center gap-2 rounded-xl border px-4 py-4 text-sm font-medium transition-colors ${
                  active
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-border bg-panel text-muted hover:border-accent/40 hover:text-text'
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            );
          })}
        </div>
      </Section>

      {/* ── Help & Feedback ── */}
      <Section title="Help & Feedback">
        <div className="divide-y divide-border">
          <HelpRow
            Icon={MessageSquare}
            label="Send feedback"
            description="Tell us what's working and what isn't."
            href="mailto:hello@hzsec.io?subject=HZSec%20Feedback"
          />
          <HelpRow
            Icon={BookOpen}
            label="Documentation"
            description="Guides, CLI reference, and quickstart."
            href="/docs"
            internal
          />
          <HelpRow
            Icon={Mail}
            label="Contact support"
            description="Get help with billing, license keys, or bugs."
            href="mailto:hello@hzsec.io?subject=HZSec%20Support"
          />
        </div>
      </Section>

      {/* ── Session ── */}
      <Section title="Session">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-text">Sign out</div>
            <div className="text-xs text-muted mt-0.5">
              Ends your current session on this device.
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 rounded-md border border-danger/40 px-3 py-1.5 text-sm text-danger hover:bg-danger/10 hover:border-danger transition-colors"
          >
            <LogOut size={14} />
            Log out
          </button>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-panel p-6">
      <h2 className="text-xs font-medium uppercase tracking-wider text-muted mb-5">{title}</h2>
      {children}
    </div>
  );
}

function HelpRow({
  Icon, label, description, href, internal,
}: {
  Icon: typeof Mail;
  label: string;
  description: string;
  href: string;
  internal?: boolean;
}) {
  const cls = 'flex items-center gap-4 py-3.5 group cursor-pointer';
  const inner = (
    <>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-panel2 text-muted group-hover:border-accent/40 group-hover:text-accent transition-colors">
        <Icon size={15} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-text">{label}</div>
        <div className="text-xs text-muted">{description}</div>
      </div>
      <span className="text-muted/40 group-hover:text-accent transition-colors text-xs">→</span>
    </>
  );
  return internal ? (
    <Link href={href} className={cls}>{inner}</Link>
  ) : (
    <a href={href} className={cls}>{inner}</a>
  );
}
