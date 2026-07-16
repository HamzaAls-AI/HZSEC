# Current Sprint — 7-Day Launch Sprint

**Start:** 2026-07-16  
**End:** 2026-07-23  
**Goal:** 10 external developers complete a first scan without help.

---

## Blocker (needs your action)

### B1 — v1.1.0 not published to npm
`npx hzsec-cli` gives users v1.0.0. The v1.1.0 commit exists
(`cf542fd`) but no `v1.1.0` git tag was pushed so GitHub Actions never ran.

**To fix:** `git tag v1.1.0 && git push --tags` in `hzsec-cli/`.

Confirm before proceeding — this is a publish action.

---

## Safe fixes (low-risk, implement + commit)

### S1 — CONTRIBUTING.md placeholder URL ✅ done
`git clone https://github.com/REPLACE/hzsec-cli` → real URL.

### S2 — Website demo page invalid flag ✅ done
`hzsec scan ./src --deep` doesn't exist → `hzsec scan ./src --mode full`.

### S3 — Website install docs version format ✅ done
`# HZSec v1.1.0 (darwin/arm64)` → `# 1.1.0` (matches actual CLI output).

### S4 — Add npx zero-install path to website ✅ done
Download page and quickstart lead with `npx hzsec-cli scan .`.

### S5 — AWS secret key pattern ✅ done
`wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` style values not detected.
Added pattern for `[A-Za-z0-9/+]{40}` in AWS-context variable names.

---

## Deliverables

- [x] CLAUDE.md
- [x] ROADMAP.md
- [x] CURRENT_SPRINT.md (this file)
- [x] RELEASE_CHECKLIST.md
- [x] Phase 1 audit (see below)
- [x] Phase 2 demo fixtures (`test/fixtures/demo-project/`)
- [x] Phase 3 user-testing kit (`user-testing/`)

---

## Phase 1 Audit Results

### BROKEN

| # | Issue | Impact |
|---|-------|--------|
| B1 | npm has v1.0.0; local is v1.1.0; v1.1.0 never published | Critical — strangers get old scanner |
| B2 | AWS secret access key not detected (`wJalrXUtnFEMI/...`) | HIGH miss in README-listed category |
| B3 | CONTRIBUTING.md has `REPLACE/hzsec-cli` placeholder | Contributor can't clone |

### MISLEADING

| # | Issue | Impact |
|---|-------|--------|
| M1 | Website quickstart and guide lead with desktop app download | CLI users hit a dead end |
| M2 | Website `/docs/install` version-check shows `HZSec v1.1.0 (darwin/arm64)` | Actual output is `1.1.0` — user thinks install broken |
| M3 | Website demo page uses `hzsec scan ./src --deep` | Flag doesn't exist; exits 2 |

### CONFUSING

| # | Issue | Impact |
|---|-------|--------|
| C1 | Text output shows full absolute paths | `--deep` in 50-char tempdir path makes output hard to read |
| C2 | `whyItMatters` truncated at 120 chars with `…` | Full remediation guidance invisible in default mode |

### WORKING CORRECTLY

- `--version` ✓
- `--help` ✓
- `scan` on clean project → "No findings." with exit 0 ✓
- `scan` on secret-containing project → CRITICAL finding with file+line ✓
- JSON output → valid, correct schema ✓
- SARIF output → valid v2.1.0 with correct uri ✓
- `--output <file>` ✓
- `--fail-on critical` → exit 1 ✓
- `--fail-on info` on clean → exit 0 ✓
- Invalid path → "target not found" with exit 2 ✓
- `node_modules/` excluded ✓
- `.git/` excluded ✓
- All 8 smoke tests pass ✓
