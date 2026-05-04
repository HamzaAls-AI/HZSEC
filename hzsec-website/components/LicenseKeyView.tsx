'use client';

import { useState } from 'react';
import { Copy, Check, Eye, EyeOff } from 'lucide-react';

export function LicenseKeyView({ licenseKey }: { licenseKey: string }) {
  const [revealed, setRevealed] = useState(false);
  const [copied,   setCopied]   = useState(false);
  const masked = licenseKey.replace(/[^-]/g, '•');

  async function copy() {
    try {
      await navigator.clipboard.writeText(licenseKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* ignore — older browsers */ }
  }

  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-panel p-1.5">
      <code className="flex-1 select-all px-3 py-1.5 font-mono text-sm">
        {revealed ? licenseKey : masked}
      </code>
      <button
        onClick={() => setRevealed(r => !r)}
        className="rounded p-1.5 text-muted hover:bg-panel2 hover:text-text"
        aria-label={revealed ? 'Hide' : 'Show'}
        title={revealed ? 'Hide' : 'Show'}
      >
        {revealed ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
      <button
        onClick={copy}
        className="rounded p-1.5 text-muted hover:bg-panel2 hover:text-text"
        aria-label="Copy"
        title="Copy"
      >
        {copied ? <Check size={15} className="text-ok" /> : <Copy size={15} />}
      </button>
    </div>
  );
}
