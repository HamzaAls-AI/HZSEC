# hzsec-precommit

[`pre-commit` framework](https://pre-commit.com/) hooks for
[hzsec-cli](https://github.com/REPLACE/hzsec-cli).

Two hooks ship in this repo:

| Hook ID          | Mode    | When it runs       | What it catches                                       |
| ---------------- | ------- | ------------------ | ----------------------------------------------------- |
| `hzsec`          | quick   | pre-commit         | Code + config + web detectors. Fast (<2s on small repos). |
| `hzsec-secrets`  | secret  | pre-commit, pre-push | Secrets-only sweep. Even faster — useful as a pre-push net. |

## Setup

Add to your repo's `.pre-commit-config.yaml`:

```yaml
repos:
  - repo: https://github.com/REPLACE/hzsec-precommit
    rev:  v1.0.0
    hooks:
      - id: hzsec
```

Then:

```bash
pip install pre-commit       # one-time
pre-commit install           # installs git hook
```

## Both hooks

Belt-and-braces — `quick` on every commit, `secret` again on push:

```yaml
repos:
  - repo: https://github.com/REPLACE/hzsec-precommit
    rev:  v1.0.0
    hooks:
      - id: hzsec
      - id: hzsec-secrets
```

## Customizing

Override `args` in your config to change the failure threshold or mode:

```yaml
repos:
  - repo: https://github.com/REPLACE/hzsec-precommit
    rev:  v1.0.0
    hooks:
      - id: hzsec
        args:
          - '--mode'
          - 'full'
          - '--fail-on'
          - 'critical'
```

## Notes

- The `additional_dependencies` field pins `hzsec-cli` to its installed
  version. Bump `rev` here when you want a newer CLI.
- `pass_filenames: false` means hzsec scans the whole repo, not just the
  staged files. This is intentional — most security findings need
  cross-file context (a hardcoded key in `config.js` is also a problem
  even if you only changed `app.js`).
- Want only-staged behaviour? Set `pass_filenames: true` and rely on the
  CLI's per-file mode (planned for v1.1).

## License

MIT.
