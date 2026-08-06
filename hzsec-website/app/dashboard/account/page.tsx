'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useRef } from 'react';
import { Sun, Moon, Monitor, LogOut, BookOpen, Send } from 'lucide-react';
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
  const [feedback, setFeedback] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const feedbackRef = useRef<HTMLTextAreaElement>(null);

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

  const handleFeedback = useCallback(() => {
    const text = feedback.trim();
    if (!text) { feedbackRef.current?.focus(); return; }
    const url = `mailto:hello@hzsec.io?subject=${encodeURIComponent('HZSec Feedback')}&body=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    setFeedback('');
    setFeedbackSent(true);
    setTimeout(() => setFeedbackSent(false), 3000);
  }, [feedback]);

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
        <div className="space-y-5">
          {/* Feedback form */}
          <div>
            <div className="text-sm font-medium text-text mb-1">Send feedback</div>
            <div className="text-xs text-muted mb-2">Tell us what's working and what isn't.</div>
            <textarea
              ref={feedbackRef}
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              rows={3}
              placeholder="What's on your mind?"
              className="w-full rounded-lg border border-border bg-panel2 px-3 py-2 text-sm text-text placeholder:text-muted/50 focus:border-accent/60 focus:outline-none resize-none"
            />
            <button
              onClick={handleFeedback}
              className="mt-2 flex items-center gap-2 rounded-md bg-accent px-3 py-1.5 text-sm text-white hover:bg-accent/90 transition-colors"
            >
              <Send size={13} />
              {feedbackSent ? 'Opening your email client…' : 'Send feedback'}
            </button>
          </div>

          <div className="border-t border-border pt-5 space-y-3">
            {/* Docs */}
            <Link
              href="/docs"
              className="flex items-center gap-3 text-sm text-muted hover:text-text transition-colors group"
            >
              <BookOpen size={14} className="shrink-0 group-hover:text-accent transition-colors" />
              Documentation
              <span className="ml-auto text-xs text-muted/40 group-hover:text-accent transition-colors">→</span>
            </Link>
            {/* Support — opens pre-filled email */}
            <button
              onClick={() => window.open('mailto:hello@hzsec.io?subject=HZSec%20Support', '_blank')}
              className="flex w-full items-center gap-3 text-sm text-muted hover:text-text transition-colors group"
            >
              <Send size={14} className="shrink-0 group-hover:text-accent transition-colors" />
              Contact support
              <span className="ml-auto text-xs text-muted/40 group-hover:text-accent transition-colors">hello@hzsec.io</span>
            </button>
          </div>
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
