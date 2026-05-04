# Release checklist

Walk through these in order. Don't skip the VM tests — auto-update is the
one thing you can't smoke-test on your laptop.

## 1. Pre-flight

- [ ] `git status` clean on `main` (or your release branch).
- [ ] All Phase 4 secrets exist as GitHub repo secrets:
      `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, `APPLE_TEAM_ID`,
      `CSC_LINK`, `CSC_KEY_PASSWORD`,
      `WIN_CSC_LINK`, `WIN_CSC_KEY_PASSWORD`.
- [ ] `package.json` `build.publish.owner` and `build.publish.repo` point at the
      real GitHub repo (not the `REPLACE` placeholder).
- [ ] `package.json` `build.mac.notarize.teamId` is a real 10-char team ID.
- [ ] `build/icon.icns`, `build/icon.ico`, `build/icon.png` all exist (see
      `build/README.md` if any are missing).

## 2. Bump version + changelog

- [ ] Bump `package.json` `"version"` (semver: patch for fixes, minor for
      features, major for breaking changes).
- [ ] Add a new entry at the top of `CHANGELOG.md` matching the version.
- [ ] Mirror the same entry in the `CHANGELOG` array at the bottom of
      `renderer.js` so the in-app "What's new" popup shows on first launch
      after the update.
- [ ] Commit: `chore: bump version to vX.Y.Z`.

## 3. Local sanity check

- [ ] `npm run start` — app launches, no console errors.
- [ ] `npm run pack` — produces `dist/`, no signing required, just confirms
      the build pipeline doesn't blow up.
- [ ] Verify the unsigned binary in `dist/` opens and the new changelog
      entry pops on first launch.

## 4. VM tests (BEFORE tagging)

- [ ] **Clean macOS VM** — install the unsigned `.dmg` you just built (or
      download a pre-tag CI build from a draft tag). Confirm:
      - Onboarding tour appears.
      - Scan target picker works.
      - Assistant message round-trips through the proxy (`hzsec://license/...`
        deep-link works after sign-in via the website).
      - Quit and relaunch — onboarding stays dismissed.
- [ ] **Clean Windows VM** — same checklist on `.exe` (NSIS installer).
- [ ] **Auto-update test** — install the *previous* released version on a
      VM, then point its updater feed at a draft of the new version (use
      `electron-builder publish --draft`). Confirm the "Update available"
      modal appears and "Restart & install" works.

## 5. Tag and push

```bash
git tag v1.2.3
git push --tags
```

CI takes ~10–15 min. macOS notarization is the slowest step (~5 min on its
own). Watch `.github/workflows/release.yml` runs.

## 6. Post-build

- [ ] Both `build (macos-latest)` and `build (windows-latest)` jobs green.
- [ ] Draft GitHub Release exists with `.dmg`, `.zip`, `.exe`, `.AppImage`,
      `.deb` plus `latest*.yml` files attached. Those YML files are what
      makes auto-update work — don't delete them.
- [ ] Edit the release notes to match the `CHANGELOG.md` entry (paste it).
- [ ] Click **Publish release**.
- [ ] Update download links on `hzsec.io` (or `app.hzsec.io/dashboard/license`
      if you've migrated to the dashboard download flow).
- [ ] Tweet / changelog email / whatever your usual announcement is.

## If something goes wrong

- Notarization failed → `xcrun notarytool log <submission-id>` (printed in
  the CI log) tells you which entitlement is missing.
- Windows signing failed → confirm `WIN_CSC_LINK` is **base64** of the
  `.pfx`, not the path. EV certs on hardware tokens need a different setup
  — see <https://www.electron.build/code-signing#using-electron-builder-to-codesign>.
- Auto-update doesn't pick up the new version → verify `latest-mac.yml` /
  `latest.yml` are attached to the release. They're how electron-updater
  finds the next version.
- `Error: Cannot find module 'electron-updater'` at runtime → did you
  install deps before building? Run `npm ci` in the failing CI step.

## Rollback

If a release is broken after publish:

1. **Don't delete the bad release** — auto-update clients have already
   downloaded it. Delete and they'll re-download.
2. Bump the patch version (e.g. `1.2.4`), revert the bad commit, push the
   new tag. Auto-update will roll forward.
3. Pin the bad release as "pre-release" in the GitHub UI so the website
   stops serving it on the download page.
