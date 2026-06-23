'use strict';
const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { detectCodeIssue } = require('../../src/detectors/code');

const JS  = '/project/app.js';   // web file — eval handled by web.js
const TS  = '/project/app.ts';   // web file
const PY  = '/project/app.py';   // code file, not a web file
const RB  = '/project/app.rb';   // code file
const TXT = '/project/notes.txt'; // not a code file

// ─── Sprint 7: child_process import guard ────────────────────────────────────

describe('child_process import guard', () => {
  test("require('child_process') → MEDIUM", () => {
    const r = detectCodeIssue(PY, "const cp = require('child_process')");
    assert.equal(r?.severity, 'MEDIUM');
    assert.match(r?.title, /imported/i);
  });

  test('require("child_process") → MEDIUM', () => {
    const r = detectCodeIssue(JS, 'const { exec } = require("child_process")');
    assert.equal(r?.severity, 'MEDIUM');
  });

  test("const { execFile } = require('child_process') → MEDIUM", () => {
    const r = detectCodeIssue(JS, "const { execFile } = require('child_process')");
    assert.equal(r?.severity, 'MEDIUM');
  });

  test("import exec from 'child_process' → MEDIUM", () => {
    const r = detectCodeIssue(TS, "import { exec } from 'child_process'");
    assert.equal(r?.severity, 'MEDIUM');
  });

  test("import from \"child_process\" → MEDIUM", () => {
    const r = detectCodeIssue(JS, 'import cp from "child_process"');
    assert.equal(r?.severity, 'MEDIUM');
  });
});

// ─── Sprint 7: pure-string-command guard ─────────────────────────────────────

describe('child_process pure-string-command guard', () => {
  test("exec('cmd') → MEDIUM", () => {
    const r = detectCodeIssue(PY, "exec('ls -la')");
    assert.equal(r?.severity, 'MEDIUM');
    assert.match(r?.title, /static/i);
  });

  test("spawn('node') → MEDIUM", () => {
    const r = detectCodeIssue(JS, "spawn('node', ['--version'])");
    assert.equal(r?.severity, 'MEDIUM');
  });

  test('exec(`template literal`) → MEDIUM', () => {
    const r = detectCodeIssue(JS, 'exec(`git status`)');
    assert.equal(r?.severity, 'MEDIUM');
  });

  test('exec(variable) → HIGH', () => {
    const r = detectCodeIssue(PY, 'exec(userCmd)');
    assert.equal(r?.severity, 'HIGH');
    assert.match(r?.title, /Child process execution path/i);
  });

  test('spawn(cmd, args) → HIGH', () => {
    const r = detectCodeIssue(JS, 'spawn(cmd, args)');
    assert.equal(r?.severity, 'HIGH');
  });

  test('child_process.exec(variable) → HIGH', () => {
    const r = detectCodeIssue(JS, 'child_process.exec(userInput)');
    assert.equal(r?.severity, 'HIGH');
  });

  test("child_process.exec('static') → MEDIUM", () => {
    const r = detectCodeIssue(JS, "child_process.exec('ls')");
    assert.equal(r?.severity, 'MEDIUM');
  });
});

// ─── Sprint 7: child_process string-reference suppression ────────────────────

describe('child_process string-reference suppression', () => {
  test("patterns: ['child_process'] → null", () => {
    assert.equal(
      detectCodeIssue(JS, "  patterns: ['eval', 'child_process'],"),
      null
    );
  });

  test('child_process in array literal → null', () => {
    assert.equal(
      detectCodeIssue(JS, "const FORBIDDEN = ['child_process', 'vm'];"),
      null
    );
  });
});

// ─── Sprint 7: eval double-fire fix ──────────────────────────────────────────

describe('eval double-fire fix — web files deferred to web.js', () => {
  test('eval(x) in .js → null (web.js handles it)', () => {
    assert.equal(detectCodeIssue(JS, 'eval(userInput)'), null);
  });

  test('eval(x) in .ts → null', () => {
    assert.equal(detectCodeIssue(TS, 'eval(code)'), null);
  });

  test('eval(x) in .py → HIGH (non-web file, code.js fires)', () => {
    const r = detectCodeIssue(PY, 'eval(user_input)');
    assert.equal(r?.severity, 'HIGH');
  });

  test('eval(x) in .rb → HIGH', () => {
    const r = detectCodeIssue(RB, 'eval(code)');
    assert.equal(r?.severity, 'HIGH');
  });
});

// ─── Sprint 7: eval string-literal guard ─────────────────────────────────────

describe('eval string-literal guard (non-web files)', () => {
  test("eval('expression') in .py → null", () => {
    assert.equal(detectCodeIssue(PY, "eval('2 + 2')"), null);
  });

  test('eval("expr") in .py → null', () => {
    assert.equal(detectCodeIssue(PY, 'eval("some_expr")'), null);
  });

  test('eval(`template`) in .py → null', () => {
    assert.equal(detectCodeIssue(PY, 'eval(`static`)'), null);
  });

  test('eval(variable) in .py → HIGH', () => {
    const r = detectCodeIssue(PY, 'eval(user_code)');
    assert.equal(r?.severity, 'HIGH');
  });
});

// ─── Sprint 7: documentation-string suppression ──────────────────────────────

describe('documentation-string suppression', () => {
  test('// comment with exec → null', () => {
    assert.equal(detectCodeIssue(JS, "// exec('rm -rf /') — never do this"), null);
  });

  test('# Python comment → null', () => {
    assert.equal(detectCodeIssue(PY, '# eval and exec are dangerous'), null);
  });

  test('/* block comment → null', () => {
    assert.equal(detectCodeIssue(JS, "/* exec('cmd') example */"), null);
  });

  test('* JSDoc line → null', () => {
    assert.equal(detectCodeIssue(JS, " * child_process.exec(cmd) is dangerous"), null);
  });

  test('object property string value → null', () => {
    assert.equal(
      detectCodeIssue(
        JS,
        "  howAttackerExploits: 'eval(), exec() with user input → RCE',"
      ),
      null
    );
  });

  test('fix property string value → null', () => {
    assert.equal(
      detectCodeIssue(JS, "  fix: 'Avoid child_process.exec with user input'"),
      null
    );
  });
});

// ─── Parity: previously firing HIGH cases still fire ─────────────────────────

describe('parity — execution paths that must still fire', () => {
  test('exec(userInput) in .py → HIGH', () => {
    const r = detectCodeIssue(PY, 'exec(userInput)');
    assert.equal(r?.severity, 'HIGH');
    assert.equal(r?.fixType, 'manual');
  });

  test('spawn(cmd) in .go → HIGH', () => {
    const r = detectCodeIssue('/project/main.go', 'spawn(cmd)');
    assert.equal(r?.severity, 'HIGH');
  });

  test('eval(code) in .sh → HIGH', () => {
    const r = detectCodeIssue('/project/setup.sh', 'eval(code)');
    assert.equal(r?.severity, 'HIGH');
  });

  test('non-code file → null', () => {
    assert.equal(detectCodeIssue(TXT, 'exec(cmd)'), null);
  });

  test('autoFixAvailable is false for all code findings', () => {
    const r = detectCodeIssue(PY, 'exec(userInput)');
    assert.equal(r?.fixType, 'manual');
  });
});

describe('parity — .hzsecignore not relevant (unit-level, no file reads)', () => {
  test('returns null for .css files', () => {
    assert.equal(detectCodeIssue('/project/style.css', 'eval(x)'), null);
  });

  test('returns null for .json files', () => {
    assert.equal(detectCodeIssue('/project/data.json', 'exec(cmd)'), null);
  });
});
