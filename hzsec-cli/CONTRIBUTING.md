# Contributing to hzsec-cli

Thanks for considering it! This project is intentionally small — adding new
detectors and improving existing ones is the highest-value contribution.

## Quick start

```bash
git clone https://github.com/REPLACE/hzsec-cli
cd hzsec-cli
npm install
npm run start -- scan ./test/fixtures
```

## Adding a detector

Detectors live in `lib/detectors/`. Each one exports a single
`detect<Category>Issue` function with this shape:

```js
function detectMyIssue(rawLine, lineNumber, filePath, options) {
  // Return null if no issue, or an object that buildFinding accepts:
  return {
    title:     'Hardcoded webhook URL',
    severity:  'MEDIUM',
    why:       'Webhook URLs in source can be replayed or exfiltrated.',
    fix:       'Move to env var WEBHOOK_URL.',
    type:      'webhook-url',
    rawLine
  };
}

module.exports = { detectMyIssue };
```

Then wire it in `lib/scanner/scan-file.js` (mirror an existing detector's
pattern). Add a fixture file under `test/fixtures/` that proves it triggers,
and a clean file that proves it doesn't false-positive.

## Coding style

- No new dependencies without discussion in an issue. We're staying small.
- Plain `module.exports` (CommonJS) — same as the rest of the codebase.
- Two-space indent. Single quotes. No semicolons-at-end optional — be
  consistent with the file you're editing.
- Comments explain *why*, not *what*.

## Pull request flow

1. Open an issue first for anything bigger than a one-line fix. We may
   already have a plan for it.
2. Fork, branch, push, PR.
3. CI runs the smoke test against `test/fixtures/`. Don't let it go red.
4. Squash-merge after one approving review.

## Releases

Maintainers only:

```bash
# bump version, update CHANGELOG, then:
git tag v1.2.3
git push --tags
# GitHub Actions runs `npm publish`
```

## Code of Conduct

By participating you agree to follow the
[Contributor Covenant 2.1](./CODE_OF_CONDUCT.md). Bad-faith behaviour gets
a warning then a ban.

## Questions

- Bug or feature → open an issue.
- Security report → email `security@hzsec.io` (don't open a public issue).
- Anything else → discussions tab.
