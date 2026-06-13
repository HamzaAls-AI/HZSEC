# Changelog

All notable changes to HZSec are tracked here. Mirror new entries into the
`CHANGELOG` array at the bottom of `renderer.js` so the in-app "What's new"
popup stays in sync.

## [1.1.0] - 2026-06-12

### Finding Suppressions

- Suppress any finding in one click: ignore by individual finding, rule,
  file, or entire folder (glob pattern).
- Acknowledge a risk separately from suppressing it — acknowledged findings
  appear in a collapsible section so you keep visibility without noise.
- Unsuppress findings at any time. Changes are applied on the next scan.
- Suppression state is stored locally in `~/.shieldops/suppressions.json`
  and survives restarts and rescans.
- Posture bar now shows acknowledged and suppressed counts when non-zero.
- All suppress and unsuppress actions are recorded in the audit log.
- CLI (`hzsec-cli`) respects the same suppression file — suppressions set in
  the desktop app apply to CI runs from the same machine.

### Scanner Improvements

- Secret, config, and web detectors no longer fire on comment lines, reducing
  false positives from docs, disabled config, and example code.
- Config and web detectors correctly ignore local development addresses
  (`127.x`, `[::1]`) in addition to `localhost`.
- Dependency Health removed from the posture score formula — the placeholder
  value of 82 was misleading. Weights redistributed across the five real
  components (sum = 1.00).

### Welcome tour and account sign-in (Phase 3)

- 8-slide welcome tour. Re-open from Settings → Help & tour.
- Sign in to HZSec from Settings → Account to use the managed assistant —
  no Anthropic key required.
- Floating chat bubble shows a ⌘J reminder on hover.
- Scan Center has a friendlier empty-state when no scan has run yet.
- Custom URL scheme `hzsec://license/HZSEC-...` for sign-in deep links.

## [1.0.0] - Initial release

- Local security scanner with the assistant, live monitor, and Breach Library.
- 40+ detectors across code, configs, secrets, hardening.
- Per-finding playbooks for the assistant; agentic tool-use loop.
- AES-256-GCM encrypted local API key store.
