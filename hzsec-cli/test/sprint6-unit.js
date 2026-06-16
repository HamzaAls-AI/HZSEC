// Sprint 6 unit tests — .hzsecignore rule parsing and matching.
//
// These tests exercise src/core/ignore-rules.js (via the CLI copy) directly,
// without going through the scanner. Each test creates a temp directory,
// optionally writes a .hzsecignore, then calls shouldIgnore() with synthetic
// absolute paths and asserts the expected boolean result.

const assert = require('assert');
const fs     = require('fs');
const os     = require('os');
const path   = require('path');

const { loadIgnoreRules } = require('../lib/core/ignore-rules');

let pass = 0, fail = 0;
function it(name, fn) {
  try { fn(); console.log(`ok   ${name}`); pass++; }
  catch (err) { console.log(`FAIL ${name}\n     ${err.message}`); fail++; }
}

// Create a temp root and optionally write .hzsecignore content.
// Pass null for content to simulate a missing file.
function setup(content) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'hzsec-ignore-unit-'));
  if (content !== null) fs.writeFileSync(path.join(root, '.hzsecignore'), content, 'utf8');
  return root;
}

// Shorthand: build an absolute path inside root
function abs(root, ...parts) { return path.join(root, ...parts); }

// ── Missing / empty file ──────────────────────────────────────────────────────

it('missing .hzsecignore: shouldIgnore always returns false', () => {
  const root  = setup(null);
  const rules = loadIgnoreRules(root);
  assert.strictEqual(rules.shouldIgnore(abs(root, 'src', 'foo.js'), root), false);
  assert.strictEqual(rules.shouldIgnore(abs(root, 'secrets.env'), root), false);
});

it('empty .hzsecignore: shouldIgnore always returns false', () => {
  const root  = setup('');
  const rules = loadIgnoreRules(root);
  assert.strictEqual(rules.shouldIgnore(abs(root, 'src', 'foo.js'), root), false);
});

it('only comments and blank lines: shouldIgnore always returns false', () => {
  const root  = setup('# ignore nothing\n\n# another comment\n');
  const rules = loadIgnoreRules(root);
  assert.strictEqual(rules.shouldIgnore(abs(root, 'test', 'foo.js'), root), false);
});

// ── Exact directory path ──────────────────────────────────────────────────────

it('exact dir path: the directory itself is ignored', () => {
  const root  = setup('test/\n');
  const rules = loadIgnoreRules(root);
  assert.strictEqual(rules.shouldIgnore(abs(root, 'test'), root), true);
});

it('exact dir path: files inside are ignored', () => {
  const root  = setup('test/\n');
  const rules = loadIgnoreRules(root);
  assert.strictEqual(rules.shouldIgnore(abs(root, 'test', 'foo.js'), root), true);
});

it('exact dir path: nested files inside are ignored', () => {
  const root  = setup('test/\n');
  const rules = loadIgnoreRules(root);
  assert.strictEqual(rules.shouldIgnore(abs(root, 'test', 'nested', 'bar.js'), root), true);
});

it('exact dir path: sibling directory sharing a prefix is NOT ignored', () => {
  const root  = setup('test/\n');
  const rules = loadIgnoreRules(root);
  assert.strictEqual(rules.shouldIgnore(abs(root, 'testing', 'foo.js'), root), false);
});

// ── Exact file path ───────────────────────────────────────────────────────────

it('exact file path: target file is ignored', () => {
  const root  = setup('src/config/prod.env\n');
  const rules = loadIgnoreRules(root);
  assert.strictEqual(rules.shouldIgnore(abs(root, 'src', 'config', 'prod.env'), root), true);
});

it('exact file path: sibling file is NOT ignored', () => {
  const root  = setup('src/config/prod.env\n');
  const rules = loadIgnoreRules(root);
  assert.strictEqual(rules.shouldIgnore(abs(root, 'src', 'config', 'dev.env'), root), false);
});

// ── Glob: * wildcard ─────────────────────────────────────────────────────────

it('*.fixture.js: matches fixture files at root level', () => {
  const root  = setup('*.fixture.js\n');
  const rules = loadIgnoreRules(root);
  assert.strictEqual(rules.shouldIgnore(abs(root, 'foo.fixture.js'), root), true);
});

it('*.fixture.js: matches fixture files in a subdirectory', () => {
  const root  = setup('*.fixture.js\n');
  const rules = loadIgnoreRules(root);
  assert.strictEqual(rules.shouldIgnore(abs(root, 'src', 'foo.fixture.js'), root), true);
});

it('*.fixture.js: matches fixture files in a deeply nested directory', () => {
  const root  = setup('*.fixture.js\n');
  const rules = loadIgnoreRules(root);
  assert.strictEqual(rules.shouldIgnore(abs(root, 'src', 'test', 'foo.fixture.js'), root), true);
});

it('*.fixture.js: does NOT match files with a different extension', () => {
  const root  = setup('*.fixture.js\n');
  const rules = loadIgnoreRules(root);
  assert.strictEqual(rules.shouldIgnore(abs(root, 'src', 'foo.fixture.ts'), root), false);
});

// ── Glob: ** wildcard ─────────────────────────────────────────────────────────

it('**/mocks/: matches mocks directory at root level', () => {
  const root  = setup('**/mocks/\n');
  const rules = loadIgnoreRules(root);
  assert.strictEqual(rules.shouldIgnore(abs(root, 'mocks'), root), true);
});

it('**/mocks/: matches mocks directory at any depth', () => {
  const root  = setup('**/mocks/\n');
  const rules = loadIgnoreRules(root);
  assert.strictEqual(rules.shouldIgnore(abs(root, 'src', 'mocks'), root), true);
});

it('**/mocks/: matches files inside a nested mocks directory', () => {
  const root  = setup('**/mocks/\n');
  const rules = loadIgnoreRules(root);
  assert.strictEqual(rules.shouldIgnore(abs(root, 'src', 'mocks', 'auth.js'), root), true);
});

it('**/mocks/: does NOT match a directory that merely contains "mocks" as prefix', () => {
  const root  = setup('**/mocks/\n');
  const rules = loadIgnoreRules(root);
  assert.strictEqual(rules.shouldIgnore(abs(root, 'mocking', 'foo.js'), root), false);
});

it('src/**/*.spec.js: matches spec files under src at any depth', () => {
  const root  = setup('src/**/*.spec.js\n');
  const rules = loadIgnoreRules(root);
  assert.strictEqual(rules.shouldIgnore(abs(root, 'src', 'foo.spec.js'), root), true);
  assert.strictEqual(rules.shouldIgnore(abs(root, 'src', 'a', 'foo.spec.js'), root), true);
  assert.strictEqual(rules.shouldIgnore(abs(root, 'src', 'a', 'b', 'foo.spec.js'), root), true);
});

it('src/**/*.spec.js: does NOT match spec files outside src/', () => {
  const root  = setup('src/**/*.spec.js\n');
  const rules = loadIgnoreRules(root);
  assert.strictEqual(rules.shouldIgnore(abs(root, 'test', 'foo.spec.js'), root), false);
});

// ── Negation ─────────────────────────────────────────────────────────────────

it('negation re-includes a specific file inside an ignored directory', () => {
  const root  = setup('test/\n!test/auth.test.js\n');
  const rules = loadIgnoreRules(root);
  assert.strictEqual(rules.shouldIgnore(abs(root, 'test', 'other.test.js'), root), true);
  assert.strictEqual(rules.shouldIgnore(abs(root, 'test', 'auth.test.js'), root), false);
});

it('negation of a path not covered by any exclusion is a no-op (not ignored)', () => {
  const root  = setup('!src/foo.js\n');
  const rules = loadIgnoreRules(root);
  assert.strictEqual(rules.shouldIgnore(abs(root, 'src', 'foo.js'), root), false);
});

// ── BOM and encoding ──────────────────────────────────────────────────────────

it('UTF-8 BOM at start of file is stripped silently', () => {
  const root  = setup('﻿test/\n');
  const rules = loadIgnoreRules(root);
  assert.strictEqual(rules.shouldIgnore(abs(root, 'test', 'foo.js'), root), true);
});

// ── Paths outside project root ────────────────────────────────────────────────

it('absolute path outside project root is never ignored', () => {
  const root        = setup('test/\n');
  const rules       = loadIgnoreRules(root);
  const outsidePath = path.join(path.dirname(root), 'other', 'test', 'foo.js');
  assert.strictEqual(rules.shouldIgnore(outsidePath, root), false);
});

console.log(`\n${pass} passed, ${fail} failed.`);
process.exit(fail === 0 ? 0 : 1);
