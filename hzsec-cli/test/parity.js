// Detector parity test — asserts that desktop and CLI detector files are byte-identical.
//
// Both codebases share the same detection logic. Any intentional change to a detector
// must be applied to both copies; this test fails immediately if they drift apart.
//
// To add a new detector file to the parity check, add an entry to PAIRED_DETECTORS.

const assert = require('assert');
const fs     = require('fs');
const path   = require('path');

const REPO_ROOT = path.resolve(__dirname, '..', '..');

const PAIRED_DETECTORS = [
  'secret.js',
];

let pass = 0, fail = 0;
function it(name, fn) {
  try { fn(); console.log(`ok   ${name}`); pass++; }
  catch (err) { console.log(`FAIL ${name}\n     ${err.message}`); fail++; }
}

for (const file of PAIRED_DETECTORS) {
  const desktopPath = path.join(REPO_ROOT, 'src', 'detectors', file);
  const cliPath     = path.join(REPO_ROOT, 'hzsec-cli', 'lib', 'detectors', file);

  it(`detectors/${file} — desktop and CLI are byte-identical`, () => {
    const desktop = fs.readFileSync(desktopPath, 'utf8');
    const cli     = fs.readFileSync(cliPath, 'utf8');

    if (desktop !== cli) {
      // Build a useful diff summary without requiring an external tool
      const dLines = desktop.split('\n');
      const cLines = cli.split('\n');
      const maxLen = Math.max(dLines.length, cLines.length);
      const diffs  = [];
      for (let i = 0; i < maxLen; i++) {
        if (dLines[i] !== cLines[i]) {
          diffs.push(
            `  line ${i + 1}:\n` +
            `    desktop: ${JSON.stringify(dLines[i] ?? '<missing>')}\n` +
            `    cli:     ${JSON.stringify(cLines[i] ?? '<missing>')}`
          );
          if (diffs.length >= 5) { diffs.push('  ... (truncated)'); break; }
        }
      }
      assert.fail(
        `src/detectors/${file} and hzsec-cli/lib/detectors/${file} have diverged.\n` +
        `Apply the same change to both files, then re-run this test.\n\n` +
        diffs.join('\n')
      );
    }
  });
}

console.log(`\n${pass} passed, ${fail} failed.`);
process.exit(fail === 0 ? 0 : 1);
