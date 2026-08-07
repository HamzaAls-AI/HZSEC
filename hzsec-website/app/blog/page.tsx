import Link from 'next/link';
import { MarketingHeader } from '@/components/MarketingHeader';
import { MarketingFooter } from '@/components/MarketingFooter';
import { Rss, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Blog · HZSec',
  description: 'Field notes on local-first security, vulnerability detection, and developer security workflows.',
};

const POSTS = [
  {
    slug: 'secrets-developers-commit',
    title: '5 secrets developers accidentally commit to Git',
    description:
      'API keys, database credentials, private certificates — the credentials that keep appearing in Git history, why it keeps happening, and how to catch them before they land.',
    date: 'July 14, 2026',
    category: 'Security',
    readTime: '6 min read',
  },
];

export default function BlogIndexPage() {
  return (
    <>
      <MarketingHeader />

      <section className="border-b border-border">
        <div className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted font-mono">
            <Rss size={14} /> Blog
          </div>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
            Field notes on local-first security.
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
            Practical writing on vulnerability detection, secret scanning, and developer
            security workflows — by the team building HZSec.
          </p>
        </div>
      </section>

      <section className="bg-panel border-b border-border">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <div className="space-y-6">
            {POSTS.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group block rounded-xl border border-border bg-bg p-7 hover:border-accent/40 transition-colors"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="rounded-full bg-accent/10 text-accent border border-accent/20 px-2.5 py-0.5 text-[11px] font-medium">
                    {post.category}
                  </span>
                  <span className="text-xs text-muted">{post.date}</span>
                  <span className="text-muted/30">·</span>
                  <span className="text-xs text-muted">{post.readTime}</span>
                </div>
                <h2 className="text-lg font-semibold text-text group-hover:text-accent transition-colors mb-2">
                  {post.title}
                </h2>
                <p className="text-sm text-muted leading-relaxed mb-4">
                  {post.description}
                </p>
                <span className="inline-flex items-center gap-1.5 text-sm text-accent">
                  Read post <ArrowRight size={13} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <MarketingFooter />
    </>
  );
}
