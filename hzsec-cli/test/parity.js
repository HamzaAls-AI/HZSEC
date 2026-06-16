// Detector and core-module parity test.
//
// Both desktop (src/) and CLI (hzsec-cli/lib/) maintain identical copies of
// shared modules. Any intentional change must be applied to both files.
// This test fails immediately if any paired file drifts apart.
//
// To add a new file pair, add an entry to PAIRED.

const assert = require('assert');
const fs     = require('fs');
const path   = require('path');

const REPO_ROOT = path.resolve(__dirname, '..', '..');

// Each entry maps a desktop source path to its CLI counterpart,
// both relative to REPO_ROOT.
const PAIRED = [
  {
    desktop: 'src/detectors/secret.js',
    cli:     'hzsec-cli/lib/detectors/secret.js'
  },
  {
    desktop: 'src/core/ignore-rules.js',
    cli:     'hzsec-cli/lib/core/ignore-rules.js'
  },
];

let pass = 0, fail = 0;
function it(name, fn) {
  try { fn(); console.log(`ok   ${name}`); pass++; }
  catch (err) { console.log(`FAIL ${name}\n     ${err.message}`); fail++; }
}

for (const { desktop, cli } of PAIRED) {
  const desktopPath = path.join(REPO_ROOT, desktop);
  const cliPath     = path.join(REPO_ROOT, cli);

  it(`${desktop} — desktop and CLI are byte-identical`, () => {
    const desktopSrc = fs.readFileSync(desktopPath, 'utf8');
    const cliSrc     = fs.readFileSync(cliPath, 'utf8');

    if (desktopSrc !== cliSrc) {
      const dLines = desktopSrc.split('\n');
      const cLines = cliSrc.split('\n');
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
        `${desktop} and ${cli} have diverged.\n` +
        `Apply the same change to both files, then re-run this test.\n\n` +
        diffs.join('\n')
      );
    }
  });
}

console.log(`\n${pass} passed, ${fail} failed.`);
process.exit(fail === 0 ? 0 : 1);
