# hzsec/scan-action

GitHub Action that runs [hzsec-cli](https://github.com/REPLACE/hzsec-cli)
against your repo and uploads results to GitHub Code Scanning.

## Quick start

```yaml
# .github/workflows/security.yml
name: Security

on: [push, pull_request]

permissions:
  contents:        read
  security-events: write   # required for code-scanning upload

jobs:
  hzsec:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: hzsec/scan-action@v1
        with:
          path:    '.'
          mode:    'full'
          fail-on: 'critical,high'
```

After the first run, findings show up in the **Security** tab → **Code
scanning** with file/line context, severity buckets, and PR review hooks.

## Inputs

| Input          | Default | Description                                                                              |
| -------------- | ------- | ---------------------------------------------------------------------------------------- |
| `path`         | `.`     | Path to scan, relative to the workspace root                                             |
| `mode`         | `full`  | `quick`, `full`, `secret`, `config`, `web`, `hardening`, `custom`                        |
| `fail-on`      | `''`    | Comma-list of severities that fail the step (`critical,high`). Empty = never fail.       |
| `upload-sarif` | `true`  | Upload SARIF to Code Scanning (requires `security-events: write`)                        |
| `cli-version`  | `''`    | Pin a specific `hzsec-cli` npm version. Empty = latest.                                  |

## Outputs

| Output           | Description                                          |
| ---------------- | ---------------------------------------------------- |
| `findings-count` | Total number of findings                             |
| `critical-count` | Count of CRITICAL-severity findings                  |
| `sarif-path`     | Path to the generated SARIF file (in `RUNNER_TEMP`)  |

Use them downstream:

```yaml
- uses: hzsec/scan-action@v1
  id:  hzsec
  with: { fail-on: 'critical' }

- if: steps.hzsec.outputs.critical-count != '0'
  run: echo "::warning::found ${{ steps.hzsec.outputs.critical-count }} critical findings"
```

## Permissions

| Scope                   | Why                                              |
| ----------------------- | ------------------------------------------------ |
| `contents: read`        | `actions/checkout`                               |
| `security-events: write`| Upload SARIF (skip if `upload-sarif: false`)     |

## Pinning vs. floating

`@v1` is a moving major-version tag — gets new minor/patch releases
automatically. For maximum reproducibility, pin to a SHA:

```yaml
- uses: hzsec/scan-action@a1b2c3d   # pin to commit
```

## License

MIT — same as `hzsec-cli`.
