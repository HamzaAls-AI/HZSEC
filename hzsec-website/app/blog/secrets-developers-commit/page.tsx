import Link from 'next/link';
import { MarketingHeader } from '@/components/MarketingHeader';
import { MarketingFooter } from '@/components/MarketingFooter';

export const metadata = {
  title: '5 secrets developers accidentally commit to Git · HZSec Blog',
  description:
    'API keys, database URLs, private keys — the most common credentials that end up in Git history, why it keeps happening, and how to stop it.',
};

export default function BlogPost() {
  return (
    <>
      <MarketingHeader />

      <article className="mx-auto max-w-2xl px-6 py-16 sm:py-20">

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Link
              href="/blog"
              className="text-xs text-muted hover:text-accent transition-colors"
            >
              ← Blog
            </Link>
            <span className="text-muted/30">·</span>
            <span className="text-xs text-muted">Security</span>
          </div>
          <h1 className="text-[clamp(28px,4vw,40px)] font-bold tracking-tight text-text leading-[1.15] mb-4">
            5 secrets developers accidentally commit to Git
          </h1>
          <p className="text-lg text-muted leading-relaxed mb-6">
            API keys, database credentials, private certificates — the credentials that
            keep appearing in Git history, why it keeps happening, and how to catch them
            before they land.
          </p>
          <div className="flex items-center gap-3 text-xs text-muted border-t border-border pt-6">
            <span>HZSec Team</span>
            <span className="text-muted/30">·</span>
            <time dateTime="2026-07-14">July 14, 2026</time>
            <span className="text-muted/30">·</span>
            <span>6 min read</span>
          </div>
        </div>

        {/* Body */}
        <div className="prose-hzsec space-y-8 text-[15px] leading-[1.75] text-text/85">

          <p>
            A developer rushes to debug a production issue. They hardcode a database
            URL to test locally, fix the bug, and open a PR. The credential goes along
            for the ride. Three days later a bot finds it in the public repo, and a
            $40,000 AWS bill arrives before anyone notices.
          </p>
          <p>
            This scenario plays out thousands of times a year. Not because developers
            are careless — but because the tooling that should catch it either runs
            too late (CI), costs too much (enterprise SAST), or sends your code to
            someone else&apos;s server to find out. Here are the five credential types
            that show up most often in accidental commits, and what each one looks like
            in the wild.
          </p>

          <Heading>1. Cloud provider API keys</Heading>
          <p>
            AWS access keys, GCP service account JSON, and Azure client secrets are
            the most valuable credentials an attacker can find because they grant
            direct access to infrastructure. AWS keys follow a predictable
            format — <Code>AKIA</Code> prefix for long-term keys,{' '}
            <Code>ASIA</Code> for short-term — which makes them trivially detectable
            by any scanner worth using.
          </p>
          <p>
            The typical path: a developer exports <Code>AWS_ACCESS_KEY_ID</Code> to
            their shell for a quick test, then copies that line into a config file,
            then commits the config file. The <Code>.gitignore</Code> entry for
            <Code>.env</Code> doesn&apos;t help if the file is named{' '}
            <Code>config.js</Code>.
          </p>
          <CallOut type="example">
            <strong>Real pattern HZSec detects:</strong>{' '}
            <Code>AKIA[0-9A-Z]{"{16}"}</Code> — AWS long-term access key ID appearing
            anywhere in tracked files.
          </CallOut>

          <Heading>2. Database connection strings</Heading>
          <p>
            Connection strings are dangerous because they bundle hostname, port,
            username, and password into a single string that looks innocuous to the
            untrained eye. They appear in ORMs, migration scripts, docker-compose
            overrides, and copied Stack Overflow snippets that never got cleaned up.
          </p>
          <CodeBlock>{`# These all end up in Git more often than you'd think
DATABASE_URL=postgres://admin:hunter2@prod.db.example.com:5432/main
MONGO_URI=mongodb+srv://user:pass@cluster0.mongodb.net/mydb
REDIS_URL=redis://:secret@cache.internal:6379`}</CodeBlock>
          <p>
            The fix is not just adding these to <Code>.gitignore</Code>. Once a
            credential has appeared in any commit — even one you deleted in the next
            commit — it lives in Git history until you rewrite it.
          </p>

          <Heading>3. Private keys and certificates</Heading>
          <p>
            SSH private keys, TLS certificates with embedded private keys, and PGP
            secret keys all begin with the same PEM header:{' '}
            <Code>-----BEGIN RSA PRIVATE KEY-----</Code> or its modern equivalent
            <Code>-----BEGIN OPENSSH PRIVATE KEY-----</Code>. They&apos;re easy to
            spot once you know what to look for, but easy to miss in a large diff.
          </p>
          <p>
            These often appear when developers generate a keypair for a service
            integration, check it in &quot;temporarily&quot; to share with a teammate,
            and never remove it. The file with the private key stays; the plan to
            remove it does not.
          </p>

          <Heading>4. Environment files committed directly</Heading>
          <p>
            <Code>.env</Code> files are the most obvious offender, but they also show
            up as <Code>.env.local</Code>, <Code>.env.development</Code>,{' '}
            <Code>.env.production</Code>, <Code>env.json</Code>,{' '}
            <Code>settings.env</Code>, and a dozen other names that slip past a
            naive <Code>.gitignore</Code> pattern.
          </p>
          <p>
            The subtler variant: a CI configuration file (GitHub Actions, CircleCI,
            GitLab CI) that has secrets inlined as plain text rather than referenced
            via the secrets store. These are sometimes added in a hurry to &quot;just
            make the pipeline pass&quot; and end up in the repo permanently.
          </p>
          <CallOut type="tip">
            Use a blanket-deny approach in your <Code>.gitignore</Code>:{' '}
            <Code>*.env</Code>, <Code>.env*</Code>, and <Code>*secret*</Code> catch
            most variants. Then explicitly allow the files you actually want to
            track.
          </CallOut>

          <Heading>5. Hardcoded tokens in source code</Heading>
          <p>
            This is the hardest category to catch because it looks like any other
            string literal. Slack webhook URLs, Stripe API keys, Twilio auth tokens,
            and internal service tokens all end up hardcoded when a developer is
            moving fast and intends to &quot;refactor it into config later.&quot;
          </p>
          <CodeBlock>{`// token buried in a 400-line file
const client = new Stripe('sk_live_<your-stripe-secret-key>');

// or hidden in a test fixture
const TEST_WEBHOOK = 'https://hooks.slack.com/services/T00000/B00000/XXXXXXXXX';`}</CodeBlock>
          <p>
            The problem with tokens in source code — as opposed to environment files
            — is that they&apos;re much harder to grep for. There is no consistent
            filename pattern. You need a scanner that understands what these strings
            look like semantically, not just syntactically.
          </p>

          <Heading>What to do if it&apos;s already in history</Heading>
          <p>
            First: rotate the credential immediately. Assume it has been read.
            Do not wait for the history rewrite.
          </p>
          <p>
            Then rewrite the history. <Link href="https://github.com/newren/git-filter-repo" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline underline-offset-4">git-filter-repo</Link>{' '}
            is the recommended tool. Force-push to all remotes, contact GitHub/GitLab
            support to purge cached views, and notify any forks if the repo was public.
          </p>

          <Heading>How to stop it before it happens</Heading>
          <p>
            The only reliable place to catch a secret before it lands is pre-commit —
            on the developer&apos;s machine, before the push. CI catches secrets after
            the fact (the code is already in the repo). Code review catches them
            only if a reviewer happens to notice.
          </p>
          <p>
            HZSec runs locally. It scans your working tree before you commit and flags
            credentials matching 40+ patterns across cloud providers, payment
            processors, source control, databases, and messaging services.
            Nothing leaves your machine.
          </p>
          <CodeBlock>{`# Install
npm install -g hzsec-cli

# Scan your project right now
hzsec scan .`}</CodeBlock>

          {/* CTA */}
          <div className="not-prose rounded-xl border border-accent/20 bg-accent/5 p-6 mt-10">
            <div className="font-medium text-text mb-1">Try HZSec for free</div>
            <p className="text-sm text-muted mb-4">
              Scan your repo in under a minute. No account required for the CLI,
              no code leaves your machine.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/pricing#download"
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90 transition-colors"
              >
                Get started free
              </Link>
              <Link
                href="/docs/quickstart"
                className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-muted hover:text-text hover:border-accent/40 transition-colors"
              >
                Read the quickstart →
              </Link>
            </div>
          </div>
        </div>

      </article>

      <MarketingFooter />
    </>
  );
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xl font-semibold text-text mt-10 mb-3">{children}</h2>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-panel2 border border-border px-1.5 py-0.5 font-mono text-[13px] text-text/90">
      {children}
    </code>
  );
}

function CodeBlock({ children }: { children: React.ReactNode }) {
  return (
    <pre className="overflow-x-auto rounded-xl border border-border bg-[#0d1117] px-5 py-4 font-mono text-xs text-[#c9d1d9] leading-relaxed my-4">
      <code>{children}</code>
    </pre>
  );
}

function CallOut({ type, children }: { type: 'tip' | 'example'; children: React.ReactNode }) {
  const styles = {
    tip:     'border-accent/20 bg-accent/5 text-text/80',
    example: 'border-border bg-panel2 text-text/80',
  };
  return (
    <div className={`rounded-lg border px-5 py-4 text-sm leading-relaxed my-4 ${styles[type]}`}>
      {children}
    </div>
  );
}
