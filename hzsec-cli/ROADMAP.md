# hzsec-cli Roadmap

Items are sequenced by value-to-strangers, not by complexity.

## Now — 7-day launch sprint (v1.1.0 → first 10 external users)

Goal: a stranger can install, scan, and understand results without help.

- [ ] Publish v1.1.0 to npm (tag `v1.1.0`, trigger GitHub Actions publish)
- [ ] Fix CONTRIBUTING.md placeholder URL (`REPLACE/hzsec-cli`)
- [ ] Fix website demo page `--deep` flag (doesn't exist — use `--mode full`)
- [ ] Fix website install page version-check example (`1.1.0` not `HZSec v1.1.0 (darwin/arm64)`)
- [ ] Add npx zero-install path to website download page and quickstart
- [x] Publish Phase 2 terminal demo with known-good fixture files
- [x] Publish user-testing kit (task list, feedback form, invite DM)
- [ ] Add AWS secret access key pattern to secret detector

## Near — v1.2.0 (after first 10 testers give feedback)

- Relative file paths in text output (show `src/config.js` not full abs path)
- Full `whyItMatters` text in text output (currently truncated at 120 chars)
- `hzsec init` — writes a starter `.hzsecignore`
- Homebrew tap

## Later

- `--sarif-category` flag for multi-tool GitHub Code Scanning setups
- Auto-update check (`npm outdated` hint on stdout when a new version exists)
- `hzsec scan --staged` — only scan files staged for commit (pre-commit fast path)
- Windows installer

## Won't do (CLI scope)
- Cloud upload / API calls to HZSec servers from the CLI
- Vulnerability database (CVE/NVD) — desktop app only
- AI explanations — desktop app only
