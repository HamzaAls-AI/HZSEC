# hzsec-cli

**Local-first security scanner for your codebase. Runs in CI. AI explanations available in the [HZSec desktop app](https://hzsec.io).**

40+ detectors for secrets, misconfigs, and unsafe patterns. No upload, no
telemetry, no account required. MIT-licensed.

```
npm install -g hzsec-cli
hzsec scan
```

```
HZSec scan — 3 findings
full mode · /your/project

  CRITICAL: 1  HIGH: 2

  CRITICAL  Hardcoded AWS access key
            src/config/secrets.js:14
            Long-lived static credentials in source control are the #1 cause
            of cloud breaches.

  HIGH      Public S3 bucket policy
            infra/buckets.tf:42
            All-users read on a customer-data bucket exposes the contents to
            the entire internet.

  HIGH      Insecure TLS configuration
            server.js:67
            TLS 1.0/1.1 are deprecated and vulnerable.
```

## Install

```bash
# npm (anywhere with Node 18+)
npm install -g hzsec-cli

# Homebrew (macOS / Linux)
brew install hzsec/tap/hzsec
```

Or run without installing:

```bash
npx hzsec-cli scan
```

## Usage

```
hzsec scan [path]                        scan a directory (default: .)
hzsec scan --mode quick                  faster, code+config+web only
hzsec scan --mode full                   default — all detectors
hzsec scan --mode secret                 secrets-only sweep
hzsec scan --format json                 JSON for jq / scripts
hzsec scan --format sarif                SARIF v2.1.0 for GitHub Code Scanning
hzsec scan --output report.sarif         write to file
hzsec scan --fail-on critical,high       exit 1 if any matching severity found
hzsec scan --no-color --quiet            CI-friendly text mode
hzsec --version
```

### Modes

| Mode        | Runs                                              | When to use            |
| ----------- | ------------------------------------------------- | ---------------------- |
| `quick`     | code + config + web                               | Pre-commit hook        |
| `full`      | code + config + secret + web + hardening          | CI on PR / nightly     |
| `secret`    | secret detector only                              | Pre-push hook          |
| `config`    | config files only                                 | After IaC change       |
| `web`       | HTML/CSP/cookie checks                            | Frontend repos         |
| `hardening` | OS/network configs (sshd, sudoers, sysctl…)       | Infra repos            |

### Exit codes

| Code | Meaning                                                  |
| ---- | -------------------------------------------------------- |
| `0`  | Scan succeeded; no `--fail-on` matches                   |
| `1`  | Scan succeeded; one or more `--fail-on` severities found |
| `2`  | Bad arguments, runtime error, target not found           |

## CI integrations

### GitHub Actions (Code Scanning)

```yaml
# .github/workflows/security.yml
name: Security

on: [push, pull_request]

permissions:
  contents:        read
  security-events: write   # required for the upload-sarif step

jobs:
  hzsec:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run:  npx hzsec-cli scan --format sarif --output hzsec.sarif
      - uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: hzsec.sarif
          category:   hzsec
```

Findings appear in the **Security** tab of your repo with file/line context.

There's also a [pre-built composite action](https://github.com/REPLACE/hzsec-action):

```yaml
- uses: hzsec/scan-action@v1
  with:
    path:    '.'
    mode:    'full'
    fail-on: 'critical,high'
```

### pre-commit (the framework)

`.pre-commit-config.yaml`:

```yaml
repos:
  - repo: https://github.com/REPLACE/hzsec-precommit
    rev:  v1.0.0
    hooks:
      - id: hzsec
        args: ['--mode', 'quick', '--fail-on', 'critical']
```

Then:

```bash
pre-commit install
git commit  # runs hzsec on staged files
```

### GitLab CI

```yaml
# .gitlab-ci.yml
hzsec:
  image: node:20-alpine
  stage: test
  script:
    - npx hzsec-cli scan --format sarif --output hzsec.sarif --fail-on critical,high
  artifacts:
    reports:
      sast: hzsec.sarif    # GitLab's SAST report integration
```

### CircleCI

```yaml
# .circleci/config.yml
version: 2.1
jobs:
  security:
    docker:
      - image: cimg/node:20.0
    steps:
      - checkout
      - run: npx hzsec-cli scan --fail-on critical,high
workflows:
  main:
    jobs:
      - security
```

## Programmatic API

```js
const { runSecurityScan, formatters } = require('hzsec-cli');

const report = await runSecurityScan('./my-project', { mode: 'full' });

console.log(`${report.findings.length} findings`);
for (const f of report.findings) {
  console.log(`${f.severity}\t${f.title}\t${f.filePath}:${f.lineNumber}`);
}

// Render to any of the bundled formats:
const sarif = formatters.sarif.formatSarif(report);
```

## How does this compare to…?

| Tool             | Free | Local-only | Secrets | SAST | Misconfig | AI-explained findings |
| ---------------- | :--: | :--------: | :-----: | :--: | :-------: | :-------------------: |
| **hzsec-cli**    |  ✓   |     ✓      |   ✓     |  ✓   |    ✓      |  ◐ (paid desktop app) |
| TruffleHog       |  ✓   |     ✓      |   ✓     |      |           |                        |
| GitGuardian      |  ◐   |            |   ✓     |      |           |                        |
| Semgrep (OSS)    |  ✓   |     ✓      |   ◐     |  ✓   |    ◐      |                        |
| Snyk Code (free) |  ◐   |            |   ◐     |  ✓   |    ✓      |                        |

We're being honest: TruffleHog has deeper secrets coverage. Semgrep has a
larger SAST rule library. Snyk has bigger CVE coverage. **hzsec-cli is the
best choice when you want one tool that does competent coverage across all
five categories with zero setup, then optionally upgrades to AI-explained
findings + live monitoring + breach intelligence in the desktop app.**

## Want AI explanations and live monitoring?

The CLI is the scanner core. The [HZSec desktop app](https://hzsec.io)
adds:

- AI assistant that reads your code and explains every finding
- Live monitor (watch a folder, alert on new issues as you save)
- Breach Library — real-world incidents keyed to your findings
- Auto-fix with reviewable diffs
- Compliance scoring (OWASP, CIS, SOC 2)

Free tier uses your own Anthropic API key. Pro is $19/mo with 1,000 managed
assistant messages — no key to manage. 7-day trial.

## Detectors

40+ patterns across these categories:

- **Secrets** — AWS, GCP, Azure, Stripe, GitHub PATs, JWTs, generic
  high-entropy strings, base64/hex blobs in suspicious contexts.
- **Configs** — open S3 buckets, public security groups, weak TLS, debug
  endpoints, default passwords, world-writable mounts.
- **Code** — SQL injection, XSS, command injection, path traversal,
  insecure deserialization, weak crypto (MD5, SHA-1, ECB), hardcoded URLs.
- **Web** — missing CSP, weak cookie flags, mixed content, dangerous
  innerHTML.
- **Hardening** — sshd weak ciphers, sudoers NOPASSWD, world-writable
  files, sysctl gaps, firewall holes.

## Privacy

This CLI:

- Reads your files **on your machine**.
- Never sends them anywhere.
- Has zero telemetry. We don't even know you're running it.

## Contributing

PRs welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md). All contributors
follow the [Code of Conduct](./CODE_OF_CONDUCT.md).

## License

MIT — see [LICENSE](./LICENSE).
