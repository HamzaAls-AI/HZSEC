# Changelog

All notable changes to HZSec are tracked here. Mirror new entries into the
`CHANGELOG` array at the bottom of `renderer.js` so the in-app "What's new"
popup stays in sync.

## [1.1.0] - Phase 3

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
