import Link from 'next/link';
import { MarketingHeader } from '@/components/MarketingHeader';
import { MarketingFooter } from '@/components/MarketingFooter';
import { ShieldCheck, Eye, BookOpen, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'HZSec — Local-first security copilot for developers',
  description: 'Scan code locally, monitor changes, and review findings in a clean desktop workflow. No repo upload required.'
};

export default function Landing() {
  return (
    <>
      <MarketingHeader />

      <section className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
            Local-first security copilot<br />
            <span className="text-accent">for development teams.</span>
          </h1>
          <p className="mt-6 text-lg text-muted">
            HZSec is a desktop security platform for developers who want a clean,
            local workflow. Scan code, monitor changes, and review findings in
            one place without repo upload.
          </p>
          <div className="mt-10 flex gap-5">
            <Link href="/download" className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent/90">
              Download desktop app <ArrowRight size={16} />
            </Link>
            <Link href="/guide" className="rounded-md border border-border px-5 py-2.5 text-sm text-muted hover:text-text">
              How it works
            </Link>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted">
            <span className="rounded-full border border-border bg-panel px-3 py-1">No repo upload required</span>
            <span className="rounded-full border border-border bg-panel px-3 py-1">Local scans only</span>
            <Link href="/sample" className="rounded-full border border-border bg-panel px-3 py-1 hover:text-text">
              View sample scan
            </Link>
          </div>
          <p className="mt-4 text-sm text-text/75">
            Free for solo use with your own Anthropic key. Paid plans add a managed assistant,
            message limits, and team billing.
          </p>
        </div>
      </section>

      <section id="features" className="border-t border-border bg-panel">
        <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-3">
          <Feature
            Icon={ShieldCheck}
            title="Local scanning"
            body="Run detectors for secrets, misconfigurations, and code-quality issues directly on your machine."
          />
          <Feature
            Icon={Eye}
            title="Live monitor"
            body="Watch a folder and re-run scoped checks when files change, so findings stay current."
          />
          <Feature
            Icon={BookOpen}
            title="Guided remediation"
            body="Review findings with supporting context, playbooks, and a structured assistant workflow."
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-4 sm:grid-cols-3">
          <MiniStep title="1. Scan" body="Run a local scan or watch a folder for new changes." />
          <MiniStep title="2. Review" body="Open findings, read context, and follow the recommended next step." />
          <MiniStep title="3. Ship" body="Resolve issues, keep the log clean, and move to the next task." />
        </div>
      </section>

      <MarketingFooter />
    </>
  );
}

function Feature({
  Icon, title, body
}: {
  Icon: typeof ShieldCheck; title: string; body: string;
}) {
  return (
    <div className="bg-bg px-6 py-10">
      <Icon className="text-accent" size={22} />
      <h3 className="mt-4 text-lg font-medium">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
    </div>
  );
}

function MiniStep({
  title, body
}: {
  title: string; body: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-panel p-6">
      <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent/15 text-sm font-medium text-accent">•</div>
      <h3 className="mt-4 text-base font-medium">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
    </div>
  );
}
