import Link from 'next/link';
import { MarketingHeader } from '@/components/MarketingHeader';
import { MarketingFooter } from '@/components/MarketingFooter';
import { ShieldCheck, Eye, BookOpen, ArrowRight } from 'lucide-react';

export default function Landing() {
  return (
    <>
      <MarketingHeader />

      <section className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
            Catch security bugs<br />
            <span className="text-accent">before they ship.</span>
          </h1>
          <p className="mt-6 text-lg text-muted">
            HZSec is a local-first security platform. Scan your code, watch
            it live, ask the AI assistant what to fix — all from a desktop
            app that never sends your code anywhere except where you tell it.
          </p>
          <div className="mt-10 flex gap-4">
            <Link href="/pricing" className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent/90">
              Start free trial <ArrowRight size={16} />
            </Link>
            <Link href="#features" className="rounded-md border border-border px-5 py-2.5 text-sm text-muted hover:text-text">
              See features
            </Link>
          </div>
        </div>
      </section>

      <section id="features" className="border-t border-border bg-panel">
        <div className="mx-auto grid max-w-6xl gap-px border-x border-border bg-border sm:grid-cols-3">
          <Feature
            Icon={ShieldCheck}
            title="Local scanning"
            body="Detectors for secrets, misconfigs, and code-quality issues that run entirely on your machine. No cloud upload."
          />
          <Feature
            Icon={Eye}
            title="Live monitor"
            body="Watch a folder. Every save runs scoped detectors. Quiet during work, loud about real issues."
          />
          <Feature
            Icon={BookOpen}
            title="Breach library + AI assistant"
            body="Real-world breach cases keyed to findings. Tool-using assistant that reads, greps, and blames your code."
          />
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
