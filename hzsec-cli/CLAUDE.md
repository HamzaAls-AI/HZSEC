# hzsec-cli — CLAUDE.md

## Project purpose
CLI-first, MIT-licensed local security scanner. Finds secrets, misconfigs,
and unsafe code patterns. No upload, no telemetry, no account required.
Published to npm as `hzsec-cli`. Powers the HZSec desktop app scanner core.

## Architecture in one paragraph
`bin/hzsec.js` is the CLI entry point (Commander). It calls
`lib/scanner/scan-engine.js`, which walks the target directory, calls
`lib/scanner/scan-file.js` per file, and fans out to the five detectors in
`lib/detectors/` (secret, config, code, web, hardening). Findings are
collected, deduped, and scored in `lib/core/findings.js` and
`lib/scoring/`. Three formatters live in `lib/formatters/` (text, json,
sarif). `lib/index.js` is the programmatic API surface.

## Key constraints
- **CommonJS only** — no ESM except lazy `import()` for chalk and ora (both
  ESM-only). Do not add ESM-only dependencies without lazy-loading them.
- **No new runtime dependencies** without opening an issue first. Keep the
  package tiny.
- **Zero telemetry** — never add any network call that isn't user-triggered.
- Node 18+ is the minimum engine.

## Scan modes
Defined in `lib/config/modes.js`. Adding a mode requires updating the enum
there and the `--mode` choices in `bin/hzsec.js`.

## Detector contract
Each detector exports `detectXIssue(filePath, line)` and returns `null` or
a finding object `{ title, severity, why, fix, fixType }`. Wire new
detectors in `lib/scanner/scan-file.js` mirroring an existing one.

## Testing
`npm test` runs `test/smoke.js` — a dependency-free Node script.
Fixtures live in `test/fixtures/`. Adding a detector requires adding both a
triggering fixture and a clean non-triggering fixture.

## Release process (requires maintainer)
1. Bump `version` in `package.json`.
2. Update `CHANGELOG.md`.
3. `git tag vX.Y.Z && git push --tags` — GitHub Actions runs `npm publish`.
4. Verify: `npm view hzsec-cli version` matches expected.

## Stop and ask before
- Publishing to npm
- Adding telemetry or any network call
- Changing exit code contract (0/1/2)
- Adding a new mode
- Changing the `hzsec.report.v1` schema shape
