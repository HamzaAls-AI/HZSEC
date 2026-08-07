'use client';

import { useEffect, useState, useCallback } from 'react';
import { Check, Copy, ExternalLink, Sparkles, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

const LS_KEY = 'hzsec-anthropic-key';

type Tier = 'free' | 'pro' | 'team' | null;

export default function ApiKeysPage() {
  const [tier, setTier]       = useState<Tier>(null);
  const [loading, setLoading] = useState(true);
  const [key, setKey]         = useState('');
  const [visible, setVisible] = useState(false);
  const [saved, setSaved]     = useState(false);
  const [copied, setCopied]   = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LS_KEY);
      if (stored) setKey(stored);
    } catch {}

    fetch('/api/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => setTier((data?.license?.tier as Tier) ?? 'free'))
      .catch(() => setTier('free'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = useCallback(() => {
    try {
      if (key.trim()) localStorage.setItem(LS_KEY, key.trim());
      else localStorage.removeItem(LS_KEY);
    } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [key]);

  const handleCopy = useCallback(() => {
    const cmd = `hzsec config set anthropic-key ${key.trim() || 'YOUR_API_KEY'}`;
    navigator.clipboard.writeText(cmd).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [key]);

  const isPaid = tier === 'pro' || tier === 'team';
  const maskedKey = key ? '••••••••••••' + key.trim().slice(-4) : '';
  const displayKey = visible ? key.trim() : maskedKey;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">API Keys</h1>
        <p className="mt-1 text-sm text-muted">
          Manage AI assistant access for the HZSec CLI and desktop app.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="h-36 animate-pulse rounded-xl border border-border bg-panel" />
          <div className="h-24 animate-pulse rounded-xl border border-border bg-panel" />
        </div>
      ) : isPaid ? (
        /* ── Paid plan — managed key ── */
        <Section title="Anthropic API Key">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ok/10 border border-ok/20">
              <Sparkles size={18} className="text-ok" />
            </div>
            <div>
              <div className="font-medium text-text">Managed key — active</div>
              <p className="mt-1 text-sm text-muted leading-relaxed">
                Your {tierLabel(tier)} plan includes a managed Anthropic key through
                HZSec&apos;s proxy. The AI assistant works out of the box — no key
                setup needed.
              </p>
              <p className="mt-3 text-xs text-muted">
                Usage is metered against your plan quota.{' '}
                <Link href="/dashboard/usage" className="text-accent hover:underline underline-offset-4">
                  View usage →
                </Link>
              </p>
            </div>
          </div>
        </Section>
      ) : (
        /* ── Free plan — bring your own key ── */
        <>
          <Section title="Anthropic API Key">
            <p className="text-sm text-muted mb-6 leading-relaxed">
              The free tier uses your own Anthropic API key. Paste it below to
              generate the CLI setup command. Your key is saved in your browser
              only — it never leaves your machine.
            </p>

            <label htmlFor="api-key" className="block text-xs font-medium uppercase tracking-wider text-muted mb-2">
              Your API key
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  id="api-key"
                  type={visible ? 'text' : 'password'}
                  value={key}
                  onChange={e => setKey(e.target.value)}
                  placeholder="sk-ant-api03-…"
                  className="w-full rounded-lg border border-border bg-panel2 px-3 py-2.5 pr-10 text-sm text-text placeholder:text-muted/40 focus:border-accent/60 focus:outline-none font-mono"
                />
                {key && (
                  <button
                    type="button"
                    onClick={() => setVisible(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors"
                    aria-label={visible ? 'Hide key' : 'Show key'}
                  >
                    {visible ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                )}
              </div>
              <button
                onClick={handleSave}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                  saved
                    ? 'bg-ok/10 text-ok border border-ok/20'
                    : 'bg-accent text-white hover:bg-accent/90'
                }`}
              >
                {saved ? <Check size={14} /> : null}
                {saved ? 'Saved' : 'Save'}
              </button>
            </div>

            {key.trim() && (
              <div className="mt-6">
                <div className="text-xs font-medium uppercase tracking-wider text-muted mb-2">
                  CLI setup command
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-border bg-[#0d1117] px-4 py-3">
                  <code className="flex-1 font-mono text-xs text-[#c9d1d9] break-all">
                    hzsec config set anthropic-key{' '}
                    <span className="text-[#79c0ff]">{displayKey}</span>
                  </code>
                  <button
                    onClick={handleCopy}
                    className="shrink-0 text-muted hover:text-text transition-colors"
                    title="Copy command"
                  >
                    {copied
                      ? <Check size={14} className="text-ok" />
                      : <Copy size={14} />}
                  </button>
                </div>
                <p className="mt-2 text-xs text-muted">
                  Run this in your terminal. Restart the HZSec desktop app after saving.
                </p>
              </div>
            )}
          </Section>

          <Section title="Upgrade for managed access">
            <p className="text-sm text-muted mb-4 leading-relaxed">
              Pro and Team plans include a managed Anthropic key through
              HZSec&apos;s proxy — no key setup, no per-token billing on your end.
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90 transition-colors"
            >
              <Sparkles size={14} />
              View plans
            </Link>
          </Section>
        </>
      )}

      {/* Always show — link to Anthropic Console */}
      <Section title="Get an Anthropic API key">
        <p className="text-sm text-muted mb-3">
          Don&apos;t have an Anthropic key yet? Create one at console.anthropic.com.
          New accounts include free credits to get started.
        </p>
        <a
          href="https://console.anthropic.com/settings/keys"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-accent hover:underline underline-offset-4"
        >
          Open Anthropic Console
          <ExternalLink size={12} />
        </a>
      </Section>
    </div>
  );
}

function tierLabel(t: Tier) {
  if (t === 'pro') return 'Pro';
  if (t === 'team') return 'Team';
  return 'current';
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-panel p-6">
      <h2 className="text-xs font-medium uppercase tracking-wider text-muted mb-5">{title}</h2>
      {children}
    </div>
  );
}
