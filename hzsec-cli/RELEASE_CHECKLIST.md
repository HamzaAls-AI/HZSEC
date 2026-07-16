# Release Checklist — hzsec-cli

Use this for every version bump before publishing.

**Publishing is MANUAL** — there is no GitHub Actions npm publish step.
Run `npm publish` from inside `hzsec-cli/` after logging in as `hamza-asl`.

## Pre-release

- [ ] `package.json` version bumped
- [ ] `CHANGELOG.md` entry written (date, version, what changed)
- [ ] `npm test` passes (`node test/smoke.js` — 11/11 green)
- [ ] Tested locally: `node bin/hzsec.js --version` returns new version
- [ ] Tested locally: scan a directory with a known secret, confirm finding appears
- [ ] Tested locally: scan a clean directory, confirm "No findings."
- [ ] Tested locally: `--format json` and `--format sarif` output valid JSON
- [ ] Tested locally: `--fail-on critical` exits 1 on dirty project, 0 on clean
- [ ] Tested locally: invalid path exits 2 with clear message
- [ ] No new runtime dependencies added (or dependency decision documented)
- [ ] No telemetry or network calls added

## Publish

```bash
# Must run from inside hzsec-cli/ subdirectory, not monorepo root
cd path/to/HZSEC/hzsec-cli
npm login           # as hamza-asl if not already logged in
npm publish

# After confirming publish succeeded, tag the source commit:
cd ..               # back to monorepo root
git tag vX.Y.Z
git push --tags     # for reference only — does NOT trigger any CI publish
```

## Post-release verification (within 15 minutes)

- [ ] `npm view hzsec-cli version` returns new version
- [ ] `npx hzsec-cli --version` returns new version (may need `npx clear-npx-cache` first)
- [ ] `npx hzsec-cli scan .` on a temp secret file finds at least one finding
- [ ] GitHub release created (optional but recommended — add changelog notes)

## Website updates (if API surface changed)

- [ ] `/docs/cli` page reflects any new flags or modes
- [ ] `/docs/install` version-check example updated
- [ ] README version badge updated (if using shields.io badge)

## Rollback

If a bad version reaches npm:
```bash
npm deprecate hzsec-cli@X.Y.Z "Broken — use X.Y.Z+1"
# Fix, bump patch, publish new version
# Do not unpublish unless version is <24h old and critically broken
```
