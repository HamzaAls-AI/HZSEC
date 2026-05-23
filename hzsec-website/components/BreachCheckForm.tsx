'use client';

import { useState } from 'react';
import { ArrowRight, ShieldAlert, ShieldCheck, Loader2 } from 'lucide-react';
import Link from 'next/link';

type Breach = {
  name:        string;
  title:       string;
  domain:      string;
  breachDate:  string;
  pwnCount:    number;
  description: string;
  dataClasses: string[];
  sensitive:   boolean;
};

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'clean'; email: string }
  | { status: 'breached'; email: string; breaches: Breach[] }
  | { status: 'error'; message: string };

export function BreachCheckForm() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<State>({ status: 'idle' });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState({ status: 'loading' });
    try {
      const res = await fetch('/api/check', {
        method:  'POST',
        headers: { 'content-type': 'application/json' },
        body:    JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.error === 'invalid_email' ? 'That doesn’t look like a valid email.'
                  : data.error === 'rate_limited'   ? 'Too many checks right now — wait a few seconds and try again.'
                  : 'Couldn’t reach the breach database. Try again in a moment.';
        setState({ status: 'error', message: msg });
        return;
      }
      if (data.breaches.length === 0) setState({ status: 'clean',    email });
      else                            setState({ status: 'breached', email, breaches: data.breaches });
    } catch {
      setState({ status: 'error', message: 'Network error. Try again.' });
    }
  }

  return (
    <div className="w-full">
      <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={state.status === 'loading'}
          className="flex-1 rounded-md border border-border bg-panel px-4 py-3 text-text placeholder:text-muted focus:border-accent focus:outline-none disabled:opacity-50"
          aria-label="Email address"
        />
        <button
          type="submit"
          disabled={state.status === 'loading' || !email}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-accent px-5 py-3 text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-50"
        >
          {state.status === 'loading'
            ? <><Loader2 size={16} className="animate-spin" /> Checking</>
            : <>Check now <ArrowRight size={16} /></>}
        </button>
      </form>

      {state.status === 'error' && (
        <p className="mt-4 text-sm text-danger">{state.message}</p>
      )}

      {state.status === 'clean' && (
        <CleanResult email={state.email} />
      )}

      {state.status === 'breached' && (
        <BreachedResult email={state.email} breaches={state.breaches} />
      )}

      <p className="mt-6 text-xs text-muted">
        Checks against the public breach database at haveibeenpwned.com. Your
        email is sent to the breach service for this check and is not stored by HZSec.
      </p>
    </div>
  );
}

function CleanResult({ email }: { email: string }) {
  return (
    <div className="mt-8 rounded-xl border border-border bg-panel p-6">
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 shrink-0 text-ok" size={22} />
        <div>
          <h2 className="text-lg font-medium">No public breaches found</h2>
          <p className="mt-1 text-sm text-muted">
            <span className="font-mono text-text">{email}</span> doesn&apos;t appear in
            any breach we know about. Good news.
          </p>
        </div>
      </div>
      <UpsellCTA tone="clean" />
    </div>
  );
}

function BreachedResult({ email, breaches }: { email: string; breaches: Breach[] }) {
  return (
    <div className="mt-8 space-y-4">
      <div className="rounded-xl border border-danger/40 bg-danger/5 p-6">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 shrink-0 text-danger" size={22} />
          <div>
            <h2 className="text-lg font-medium">
              Found in {breaches.length} {breaches.length === 1 ? 'breach' : 'breaches'}
            </h2>
            <p className="mt-1 text-sm text-muted">
              <span className="font-mono text-text">{email}</span> appeared in
              public breach data. Rotate passwords for these services and
              anything that shares a password with them.
            </p>
          </div>
        </div>
      </div>

      <ul className="space-y-3">
        {breaches.map(b => (
          <li key={b.name} className="rounded-xl border border-border bg-panel p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-medium">{b.title}</h3>
              <span className="text-xs text-muted">{b.breachDate}</span>
            </div>
            <p className="mt-1 text-xs text-muted">
              {b.domain} &middot; {b.pwnCount.toLocaleString()} accounts exposed
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {b.dataClasses.map(c => (
                <span key={c} className="rounded bg-panel2 px-2 py-0.5 text-xs text-muted">
                  {c}
                </span>
              ))}
            </div>
          </li>
        ))}
      </ul>

      <UpsellCTA tone="breached" />
    </div>
  );
}

function UpsellCTA({ tone }: { tone: 'clean' | 'breached' }) {
  const headline = tone === 'breached'
    ? 'Your password isn’t the only leak risk.'
    : 'Your email looks safe. What about your code?';
  const body = tone === 'breached'
    ? 'API keys, database passwords, and tokens get hard-coded into source by accident every day. HZSec scans your codebase for them — locally, before they ship.'
    : 'Most secret leaks happen in source code, not breaches. HZSec scans your codebase for hard-coded API keys, tokens, and passwords — locally, before they ship.';

  return (
    <div className="mt-6 rounded-lg border border-accent/30 bg-accentSoft p-5">
      <h3 className="text-base font-medium">{headline}</h3>
      <p className="mt-1.5 text-sm text-muted">{body}</p>
      <Link
        href="/pricing"
        className="mt-4 inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90"
      >
        Try HZSec free for 7 days <ArrowRight size={16} />
      </Link>
    </div>
  );
}
