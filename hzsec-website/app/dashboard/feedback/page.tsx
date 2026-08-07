'use client';

import { useState, useCallback } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';

const MAX_CHARS = 500;

export default function FeedbackPage() {
  const [text, setText] = useState('');
  const [sent, setSent] = useState(false);

  const charCount = text.length;
  const nearLimit = charCount >= 450;
  const atLimit = charCount >= MAX_CHARS;

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value.slice(0, MAX_CHARS));
  }, []);

  const handleSubmit = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const url =
      `mailto:hello@hzsec.io` +
      `?subject=${encodeURIComponent('HZSec Feedback')}` +
      `&body=${encodeURIComponent(trimmed)}`;
    window.location.href = url;
    setText('');
    setSent(true);
  }, [text]);

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[420px] text-center px-4">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-ok/10 border border-ok/20 mb-6">
          <CheckCircle2 size={30} className="text-ok" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-text mb-2">
          Thank you!
        </h1>
        <p className="text-sm text-muted max-w-xs leading-relaxed mb-8">
          Your feedback has been sent. We read everything and use it to shape
          what HZSec becomes next.
        </p>
        <button
          onClick={() => setSent(false)}
          className="text-sm text-accent hover:underline underline-offset-4"
        >
          Send more feedback
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-text mb-1">
          Feedback
        </h1>
        <p className="text-sm text-muted">Help us improve HZSec.</p>
      </div>

      {/* Form card */}
      <div className="rounded-xl border border-border bg-panel p-6 sm:p-8">
        <label
          htmlFor="feedback-body"
          className="block text-sm font-medium text-text mb-1"
        >
          Send us your suggestions, ideas, or comments.
        </label>
        <p className="text-xs text-muted mb-4">We read every submission.</p>

        <textarea
          id="feedback-body"
          value={text}
          onChange={handleChange}
          rows={9}
          placeholder="Type your feedback here..."
          className={`w-full rounded-lg border bg-panel2 px-4 py-3 text-sm text-text placeholder:text-muted/40 focus:outline-none resize-none transition-colors ${
            atLimit
              ? 'border-warn/60 focus:border-warn'
              : 'border-border focus:border-accent/60'
          }`}
        />

        {/* Character counter */}
        <div className="flex items-center justify-between mt-2 mb-6">
          <span
            className={`text-xs tabular-nums transition-colors ${
              atLimit
                ? 'text-warn'
                : nearLimit
                ? 'text-warn/70'
                : 'text-muted'
            }`}
          >
            {charCount} / {MAX_CHARS}
          </span>
          {atLimit && (
            <span className="text-xs text-warn">Character limit reached</span>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!text.trim()}
          className="flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          <Send size={14} />
          Send feedback
        </button>
      </div>

      {/* Support note */}
      <p className="mt-5 text-xs text-muted leading-relaxed">
        Need help? This form is for general feedback. For support, contact{' '}
        <a
          href="mailto:hello@hzsec.io"
          className="text-accent hover:underline underline-offset-4"
        >
          hello@hzsec.io
        </a>
        .
      </p>
    </div>
  );
}
