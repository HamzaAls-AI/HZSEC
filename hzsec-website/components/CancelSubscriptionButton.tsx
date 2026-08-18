'use client';

import { useState } from 'react';

type State = 'idle' | 'confirming' | 'loading' | 'done' | 'error';

export function CancelSubscriptionButton({ periodEnd }: { periodEnd: string | null }) {
  const [state,     setState]     = useState<State>('idle');
  const [cancelAt,  setCancelAt]  = useState<string | null>(null);
  const [errorMsg,  setErrorMsg]  = useState<string>('');

  const endLabel = periodEnd
    ? new Date(periodEnd).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'the end of your billing period';

  async function confirm() {
    setState('loading');
    try {
      const res  = await fetch('/api/billing/cancel', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'cancel_failed');
      setCancelAt(
        data.cancelAt
          ? new Date(data.cancelAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
          : endLabel
      );
      setState('done');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong');
      setState('error');
    }
  }

  if (state === 'done') {
    return (
      <div className="rounded-lg border border-ok/30 bg-ok/8 px-4 py-3 text-sm text-ok">
        Cancellation scheduled. You'll keep access until <strong>{cancelAt}</strong>.
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="space-y-2">
        <div className="rounded-lg border border-danger/30 bg-danger/8 px-4 py-3 text-sm text-danger">
          {errorMsg}
        </div>
        <button onClick={() => setState('idle')} className="text-xs text-muted hover:text-text transition-colors">
          Try again
        </button>
      </div>
    );
  }

  if (state === 'confirming') {
    return (
      <div className="rounded-xl border border-danger/20 bg-danger/5 p-5 space-y-3">
        <p className="text-sm text-text font-medium">Cancel your subscription?</p>
        <p className="text-sm text-muted">
          You'll keep full Pro access until <strong className="text-text">{endLabel}</strong>. After that your account reverts to Free.
        </p>
        <div className="flex gap-3 pt-1">
          <button
            onClick={confirm}
            className="rounded-full bg-danger px-4 py-2 text-xs font-medium text-white hover:bg-danger/90 transition-colors"
          >
            Yes, cancel
          </button>
          <button
            onClick={() => setState('idle')}
            className="rounded-full border border-border px-4 py-2 text-xs font-medium text-muted hover:text-text hover:border-accent/40 transition-colors"
          >
            Keep subscription
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setState('confirming')}
      disabled={state === 'loading'}
      className="text-sm text-muted hover:text-danger transition-colors disabled:opacity-50"
    >
      Cancel subscription →
    </button>
  );
}
