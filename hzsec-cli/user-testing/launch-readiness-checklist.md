# Launch Readiness Checklist

Check every box before sending the invite to external testers.

## CLI

- [x] `npm test` passes (8/8 smoke tests)
- [ ] `npm view hzsec-cli version` returns `1.1.0` ← **BLOCKED on publish**
- [x] `npx hzsec-cli --version` returns version (currently `1.0.0` — blocked on publish)
- [x] `npx hzsec-cli scan .` on clean project → "No findings."
- [x] `npx hzsec-cli scan <demo-project>` → ≥2 CRITICAL findings
- [x] `--format json` → valid JSON with `schema: "hzsec.report.v1"`
- [x] `--format sarif` → valid SARIF v2.1.0
- [x] `--fail-on critical` → exit 1 on dirty project
- [x] Invalid path → exit 2 with clear message
- [x] `node_modules/` excluded from results
- [x] AWS secret access key detected

## Documentation

- [x] README install instructions accurate
- [x] CONTRIBUTING.md placeholder URL fixed
- [x] `hzsec --version` example in website matches actual output
- [x] Website demo page has no invalid flags
- [ ] Website quickstart leads with `npx hzsec-cli scan .` (CLI path)

## User-testing kit

- [x] Tester task list written (`user-testing/tester-task-list.md`)
- [x] Feedback form written (`user-testing/feedback-form.md`)
- [x] Invite DM written (`user-testing/dm-invite.md`)
- [x] Demo project fixtures exist and produce expected findings

## Gate: do not send invites until

- [ ] v1.1.0 published to npm (B1 — needs your action: `git tag v1.1.0 && git push --tags`)
- [ ] All boxes above are checked
