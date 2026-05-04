'use client';

import { useState } from 'react';
import { ExternalLink } from 'lucide-react';

export function OpenPortalButton() {
  const [pending, setPending] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  async function open() {
    setPending(true); setError(null);
    try {
      const res = await fetch('/api/portal', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'portal_failed');
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'unknown_error');
      setPending(false);
    }
  }

  return (
    <div>
      <button
        onClick={open}
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm text-white hover:bg-accent/90 disabled:opacity-60"
      >
        {pending ? 'Opening…' : 'Open billing portal'}
        <ExternalLink size={14} />
      </button>
      {error && <div className="mt-2 text-xs text-danger">{error}</div>}
    </div>
  );
}
