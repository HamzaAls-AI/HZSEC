import Link from 'next/link';
import { MarketingHeader } from '@/components/MarketingHeader';
import { MarketingFooter } from '@/components/MarketingFooter';
import { Terminal, BookOpen, ArrowRight } from 'lucide-react';

// /docs — placeholder while the real documentation site is built. We give
// the user the install command + a sketch of upcoming sections so this
// route doesn't feel like a 404 in nicer clothing.

export const metadata = {
  title: 'Docs · HZSec',
  description: 'Installation, usage, and rule reference for HZSec.'
};

const SECTIONS = [
  { title: 'Installation',       summary: 'Install on macOS, Linux, and Windows. Verify signatures. Pin a version.' },
  { title: 'CLI reference',      summary: 'Every command and flag, with examples.' },
  { title: 'Scan rules',         summary: 'What each detector looks for and how to tune it.' },
  { title: 'Output formats',     summary: 'JSON, SARIF, plain text. Piping into your tooling.' },
  { title: 'CI integration',     summary: 'GitHub Actions, GitLab CI, generic exit codes.' },
  { title: 'Editor integration', summary: 'VS Code, JetBrains, and language-server clients.' },
  { title: 'Custom rules',       summary: 'Author and ship your own detectors.' },
  { title: 'Privacy model',      summary: 'What HZSec sends and when — short answer: nothing, by default.' }
];

export default function DocsPage() {
  return (
    <>
      <MarketingHeader />

      <section className="border-b border-border">
        <div className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
          <div className="text-xs uppercase tracking-wider text-muted">Documentation</div>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
            HZSec docs
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
            Full documentation is in the works. In the meantime, here&apos;s enough
            to install HZSec and run your first scan.
          </p>

          <div className="mt-10 rounded-lg border border-border bg-panel2/60 p-5">
            <div className="flex items-center gap-2 text-xs text-muted">
              <Terminal size={14} className="text-accent" /> Install
            </div>
            <pre className="mt-3 overflow-x-auto rounded-md border border-border bg-bg p-4 font-mono text-sm text-text">
              <code>curl -fsSL get.hzsec.io | sh</code>
            </pre>

            <div className="mt-6 flex items-center gap-2 text-xs text-muted">
              <Terminal size={14} className="text-accent" /> Run your first scan
            </div>
            <pre className="mt-3 overflow-x-auto rounded-md border border-border bg-bg p-4 font-mono text-sm text-text">
              <code>hzsec scan ./src</code>
            </pre>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-panel">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-accent" />
            <h2 className="text-2xl font-semibold tracking-tight">What&apos;s coming</h2>
          </div>
          <p className="mt-2 text-sm text-muted">A sketch of the documentation we&apos;re writing.</p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {SECTIONS.map(({ title, summary }) => (
              <li
                key={title}
                className="rounded-md border border-border bg-bg p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-medium text-text">{title}</h3>
                  <span className="rounded-sm border border-border/70 px-1 text-[10px] uppercase tracking-wider text-muted">
                    soon
                  </span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-muted">{summary}</p>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap gap-3 text-sm">
            <Link
              href="/download"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-bg px-4 py-2 text-text hover:border-accent/60 transition-colors"
            >
              Download HZSec <ArrowRight size={14} />
            </Link>
            <Link
              href="/security"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-bg px-4 py-2 text-text hover:border-accent/60 transition-colors"
            >
              Security model <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </>
  );
}
