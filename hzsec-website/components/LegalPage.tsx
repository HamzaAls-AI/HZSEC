import { MarketingHeader } from './MarketingHeader';
import { MarketingFooter } from './MarketingFooter';
import { LEGAL } from '@/lib/legal-content';

// Shared shell for /legal/*. Renders the title/date and dangerouslySets the
// HTML body extracted from the original static site. The `prose` styles
// here are deliberately scoped — Tailwind utility classes target nested
// h2/p/ul produced by the original CMS-free hand-written HTML.

export function LegalPage({ slug }: { slug: 'privacy' | 'terms' | 'eula' }) {
  const doc = LEGAL[slug];
  return (
    <>
      <MarketingHeader />
      <article className="mx-auto max-w-3xl px-6 py-16">
        <div className="text-xs uppercase tracking-wider text-muted">Legal</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{doc.title}</h1>
        <div className="mt-2 text-sm text-muted">{doc.date}</div>

        <div
          className="legal-body mt-10"
          dangerouslySetInnerHTML={{ __html: doc.html }}
        />
      </article>
      <MarketingFooter />

      {/* Body styles reference theme tokens so the legal docs invert correctly
          when the user switches modes. Body copy is slightly de-emphasized
          vs. headings, kept above the AA contrast floor in both themes. */}
      <style>{`
        .legal-body h2  { margin-top: 2rem; margin-bottom: 0.5rem;
                          font-size: 1.125rem; font-weight: 500;
                          color: rgb(var(--text)); }
        .legal-body p   { margin: 0.75rem 0; line-height: 1.65;
                          color: rgb(var(--text) / 0.85); }
        .legal-body ul  { list-style: disc; padding-left: 1.25rem;
                          margin: 0.75rem 0; color: rgb(var(--text) / 0.85); }
        .legal-body li  { margin: 0.25rem 0; line-height: 1.55; }
        .legal-body strong { color: rgb(var(--text)); }
        .legal-body a   { color: rgb(var(--accent)); text-decoration: underline;
                          text-underline-offset: 2px; }
        .legal-body .highlight-box {
          margin: 1.5rem 0; padding: 1rem 1.25rem;
          border-left: 3px solid rgb(var(--accent));
          background: rgb(var(--accent-soft));
          border-radius: 6px;
        }
      `}</style>
    </>
  );
}
