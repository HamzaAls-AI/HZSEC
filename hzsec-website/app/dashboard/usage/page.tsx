'use client';

import { useEffect, useState } from 'react';

interface UsageData {
  used: number;
  cap: number;
  month: string;
}

export default function UsagePage() {
  const [data, setData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/me')
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (json?.usage) setData(json.usage);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const used = data?.used ?? 0;
  const cap  = data?.cap  ?? 0;
  const month = data?.month ?? '';

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight">Usage &amp; limits</h1>
      <p className="text-muted text-sm">
        Assistant messages routed through HZSec&apos;s managed proxy. Usage resets on the 1st of each month (UTC).
      </p>

      <div className="rounded-xl border border-border bg-panel p-6">
        {loading ? (
          <div className="h-16 animate-pulse rounded-lg bg-panel2" />
        ) : data === null ? (
          <p className="text-sm text-muted">
            Usage data isn&apos;t available yet — it appears once you&apos;re on a paid plan and have sent your first assistant message.
          </p>
        ) : (
          <>
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted">
                  {month ? formatMonth(month) : 'This month'}
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-semibold">{used.toLocaleString()}</span>
                  <span className="text-muted">
                    / {cap === 0 ? '∞' : cap.toLocaleString()} messages
                  </span>
                </div>
              </div>
              {cap > 0 && (
                <div className="text-xs text-muted">
                  {Math.max(0, cap - used).toLocaleString()} remaining
                </div>
              )}
            </div>

            <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-panel2">
              <div
                className="h-full bg-accent transition-[width]"
                style={{ width: cap === 0 ? '0%' : `${Math.min(100, (used / cap) * 100)}%` }}
              />
            </div>
          </>
        )}
      </div>

      <div className="rounded-xl border border-border bg-panel p-6">
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted mb-4">History</h2>
        <p className="text-sm text-muted">
          Multi-month history will appear here once your account has a few months of data.
        </p>
      </div>
    </div>
  );
}

function formatMonth(yyyymm: string) {
  const [y, m] = yyyymm.split('-').map(Number);
  if (!y || !m) return yyyymm;
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString(undefined, {
    month: 'long', year: 'numeric',
  });
}
