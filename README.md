# HZSec — local security platform

Desktop app: scanner + AI assistant + live monitor + breach library, all
running locally on macOS, Windows, and Linux.

## Run from source

```bash
npm install
npm run start
```

Optional env vars (only needed for development against your own backend):

| Var                    | Purpose                                                    |
| ---------------------- | ---------------------------------------------------------- |
| `HZSEC_BACKEND_URL`    | Override the proxy backend (default `https://api.hzsec.io`) |
| `HZSEC_WEBSITE_URL`    | Override the sign-in website (default `https://app.hzsec.io`) |
| `SENTRY_DSN`           | Enable crash reporting (optional)                          |
| `ELECTRON_DEV=1`       | Disable the auto-updater for local builds                  |

## Architecture (one paragraph)

Electron app. `main.js` runs in the Node process — file I/O, IPC, the Stripe
proxy fallback, deep-link handler, autoUpdater. `renderer.js` is the UI
(plain JS + the existing CSS). `src/` holds the scanner detectors, monitor,
fix engine, knowledge base, and assistant pipeline. The assistant either
proxies through the HZSec backend (license-key auth) or hits Anthropic
directly with the user's BYO key. Onboarding, the breach library, and the
account section live in `index.html` + `renderer.js`.

## How to release a new version

1. Walk the [release checklist](./RELEASE.md). Every step exists for a reason.
2. Bump version + add a `CHANGELOG.md` entry + mirror it into the
   `CHANGELOG` array at the bottom of `renderer.js`.
3. Smoke-test on clean macOS and Windows VMs (esp. the auto-updater flow).
4. Tag and push:
   ```bash
   git tag v1.2.3
   git push --tags
   ```
5. CI (`.github/workflows/release.yml`) builds + signs + notarizes + uploads
   to a draft GitHub Release. Takes ~10–15 min total (notarization is the
   slow part).
6. When all jobs are green, edit the draft release notes from `CHANGELOG.md`
   and click **Publish release**.
7. Existing users get the update automatically on next launch — see them
   in Sentry / GitHub Release downloads if you want to track adoption.

### Code-signing setup (one-time)

You need to do this *before* the first real release. None of these are
done automatically — this is real money + real paperwork.

#### macOS — Apple Developer ID

1. Enroll in the Apple Developer Program at <https://developer.apple.com>
   ($99/yr).
2. In Xcode → Settings → Accounts → add your Apple ID → Manage Certificates
   → `+` → **Developer ID Application**. Apple emails the cert in ~1 min.
3. Export it as `.p12` from Keychain Access (right-click → Export).
4. `base64 -i hzsec-mac.p12 | pbcopy`. Paste as the GitHub secret `CSC_LINK`.
5. The `.p12` password → `CSC_KEY_PASSWORD`.
6. Apple ID email → `APPLE_ID`. Generate an app-specific password at
   <https://appleid.apple.com> → Sign-In and Security → App-Specific
   Passwords. That string → `APPLE_APP_SPECIFIC_PASSWORD`.
7. Team ID (10 chars) is at <https://developer.apple.com/account> → Membership.
   That → `APPLE_TEAM_ID`. Also paste it into `package.json` →
   `build.mac.notarize.teamId`.

Notarization (Apple's "this binary isn't malware" check) happens
automatically via electron-builder during CI. Takes 2–5 min.

#### Windows — EV code-signing certificate

1. Buy an EV cert from Sectigo, DigiCert, or SSL.com (~$300–500/yr).
   They'll mail you a USB token. **EV certs are required** for SmartScreen
   trust without a long warm-up period; OV certs ship a "Microsoft can't
   verify this" warning.
2. If you got the cert as a `.pfx` file: `base64 -i hzsec-win.pfx > out.txt`,
   paste the contents as `WIN_CSC_LINK`. Password → `WIN_CSC_KEY_PASSWORD`.
3. If you got a USB hardware token: that's a more involved setup — see
   [electron-builder's HSM docs](https://www.electron.build/code-signing#using-the-windows-store-cert)
   and you'll likely need a self-hosted Windows runner instead of GitHub's.

#### Linux

No signing needed. AppImage and `.deb` ship as-is.

## Project layout

```
HZSec/
├── main.js                       Electron main process
├── preload.js                    contextBridge → window.securityAPI
├── renderer.js                   UI + state
├── index.html                    Markup + Tailwind-free CSS
├── package.json                  electron-builder config in "build"
├── src/
│   ├── scanner/                  detectors + scan engine
│   ├── monitor/                  live file watcher
│   ├── fixes/                    safe-fix builder + backup writer
│   ├── intelligence/             breach DB + CISA KEV / NVD sync
│   ├── assistant/                Claude integration + tool-runner + playbooks
│   ├── storage/                  encrypted key store + license + prefs
│   └── ...
├── build/                        icons + entitlements (read its README)
├── .github/workflows/release.yml CI pipeline
├── RELEASE.md                    pre-release checklist
└── CHANGELOG.md
```

## Backups

Every patching session in this codebase creates a `backup-before-<phase>/`
folder at the repo root. Those folders are excluded from the build via the
`!backup-before-*/**` glob in `package.json`'s `build.files`.

## Security & privacy

- Code never leaves the user's machine unless they explicitly ask the
  assistant a question (then only the relevant snippet is sent through the
  proxy or directly to Anthropic).
- API keys are AES-256-GCM encrypted with a key derived from PBKDF2-SHA512
  over 5 machine-specific factors (310,000 iterations).
- Local files are written to `~/.shieldops/`.
- Reports of bugs / vulnerabilities → `security@hzsec.io`.
