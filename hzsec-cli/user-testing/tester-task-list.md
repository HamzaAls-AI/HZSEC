# HZSec — 5-Minute Tester Task List

You're testing whether a developer can use this tool without any help.
Do each step on your own machine. Note anything confusing or broken.

---

## Task 1 — Zero-install scan (2 min)

Open a terminal in any project you have locally and run:

```
npx hzsec-cli scan .
```

**Done when:** You see output that says "HZSec scan — N findings" or "No findings."

Questions:
- Did the command work without errors?
- Did the output make sense?
- Did anything surprise you?

---

## Task 2 — Scan the demo project (1 min)

Clone or download the demo project:

```bash
git clone https://github.com/HamzaAls-AI/hzsec-cli
npx hzsec-cli scan hzsec-cli/test/fixtures/demo-project
```

**Done when:** You see at least 2 CRITICAL findings.

Questions:
- Did you understand what each finding meant?
- Did you know what to do next?

---

## Task 3 — JSON output (1 min)

Run:

```
npx hzsec-cli scan hzsec-cli/test/fixtures/demo-project --format json --quiet
```

**Done when:** You see valid JSON in your terminal.

Questions:
- Does the JSON shape make sense for tooling use?
- Anything missing?

---

## Task 4 — Help text (30 sec)

Run:

```
npx hzsec-cli scan --help
```

**Done when:** You've read the options list.

Questions:
- Is anything missing from the help text?
- Are any flags confusing?

---

## Task 5 — Exit code (30 sec)

Run:

```
npx hzsec-cli scan hzsec-cli/test/fixtures/demo-project --fail-on critical; echo "Exit: $?"
```

**Done when:** You see "Exit: 1"

Questions:
- Would you use `--fail-on` in CI? What would you change about it?

---

**That's it.** Fill out the feedback form and send it back.
