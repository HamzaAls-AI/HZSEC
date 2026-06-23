'use strict';
const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { detectWebIssue } = require('../../src/detectors/web');

const JS = '/project/app.js';
const JSX = '/project/app.jsx';
const TS = '/project/app.ts';
const TSX = '/project/app.tsx';
const HTML = '/project/index.html';
const TXT = '/project/notes.txt'; // not a web file

// ─── Sprint 7: innerHTML severity tiers ──────────────────────────────────────

describe('innerHTML severity tiers', () => {
  test('variable assignment → HIGH', () => {
    const r = detectWebIssue(JS, 'element.innerHTML = userInput;');
    assert.equal(r?.severity, 'HIGH');
    assert.match(r?.title, /dynamic/i);
  });

  test('unknown function output → HIGH', () => {
    const r = detectWebIssue(JS, 'el.innerHTML = getContent();');
    assert.equal(r?.severity, 'HIGH');
  });

  test('template literal with interpolation → HIGH', () => {
    const r = detectWebIssue(JS, 'el.innerHTML = `<p>${text}</p>`;');
    assert.equal(r?.severity, 'HIGH');
  });

  test('concatenation starting with a string → HIGH', () => {
    const r = detectWebIssue(JS, "el.innerHTML = '<b>' + userVar + '</b>';");
    assert.equal(r?.severity, 'HIGH');
  });

  test('single-quoted static string → LOW', () => {
    const r = detectWebIssue(JS, "el.innerHTML = '<div>hello</div>';");
    assert.equal(r?.severity, 'LOW');
    assert.match(r?.title, /static/i);
  });

  test('double-quoted static string → LOW', () => {
    const r = detectWebIssue(JS, 'el.innerHTML = "<span>OK</span>";');
    assert.equal(r?.severity, 'LOW');
  });

  test('template literal without interpolation → LOW', () => {
    const r = detectWebIssue(JS, 'el.innerHTML = `<p>Safe static text</p>`;');
    assert.equal(r?.severity, 'LOW');
  });

  test('DOMPurify.sanitize() → LOW', () => {
    const r = detectWebIssue(JS, 'el.innerHTML = DOMPurify.sanitize(dirty);');
    assert.equal(r?.severity, 'LOW');
  });

  test('esc() → LOW', () => {
    const r = detectWebIssue(JS, 'el.innerHTML = esc(userContent);');
    assert.equal(r?.severity, 'LOW');
  });

  test('sanitize() standalone call → LOW', () => {
    const r = detectWebIssue(JS, 'el.innerHTML = sanitize(content);');
    assert.equal(r?.severity, 'LOW');
  });

  test('helpers.sanitize() → LOW', () => {
    const r = detectWebIssue(JS, 'el.innerHTML = helpers.sanitize(data);');
    assert.equal(r?.severity, 'LOW');
  });

  test('dangerouslySetInnerHTML prop → MEDIUM', () => {
    const r = detectWebIssue(JSX, '<div dangerouslySetInnerHTML={{ __html: content }} />');
    assert.equal(r?.severity, 'MEDIUM');
    assert.match(r?.title, /dangerouslySetInnerHTML/i);
  });

  test('dangerouslySetInnerHTML — case insensitive → MEDIUM', () => {
    const r = detectWebIssue(TSX, 'dangerouslysetinnerhtml={{ __html: x }}');
    assert.equal(r?.severity, 'MEDIUM');
  });

  test('outerHTML variable assignment → HIGH', () => {
    const r = detectWebIssue(JS, 'el.outerHTML = userInput;');
    assert.equal(r?.severity, 'HIGH');
  });

  test('outerHTML static string → LOW', () => {
    const r = detectWebIssue(JS, "el.outerHTML = '<div>safe</div>';");
    assert.equal(r?.severity, 'LOW');
  });
});

// ─── Sprint 7: eval string-literal guard ─────────────────────────────────────

describe('eval string-literal guard', () => {
  test("eval('literal') → suppressed", () => {
    assert.equal(detectWebIssue(JS, "eval('2 + 2')"), null);
  });

  test('eval("literal") → suppressed', () => {
    assert.equal(detectWebIssue(JS, 'eval("some expression")'), null);
  });

  test('eval(`template literal`) → suppressed', () => {
    assert.equal(detectWebIssue(JS, 'eval(`static`)'), null);
  });

  test('eval(variable) → HIGH', () => {
    const r = detectWebIssue(JS, 'eval(userInput)');
    assert.equal(r?.severity, 'HIGH');
  });

  test('eval(config.script) → HIGH', () => {
    const r = detectWebIssue(JS, 'eval(config.script)');
    assert.equal(r?.severity, 'HIGH');
  });
});

// ─── Sprint 7: documentation-string suppression ──────────────────────────────

describe('documentation-string suppression', () => {
  test('// single-line comment → null', () => {
    assert.equal(detectWebIssue(JS, '// eval(userInput) is dangerous — avoid this'), null);
  });

  test('// comment with innerHTML → null', () => {
    assert.equal(detectWebIssue(JS, '// el.innerHTML = userInput  — example of XSS'), null);
  });

  test('/* block comment → null', () => {
    assert.equal(detectWebIssue(JS, '/* eval(x) */'), null);
  });

  test('* JSDoc continuation → null', () => {
    assert.equal(detectWebIssue(JS, ' * innerHTML = userInput example'), null);
  });

  test('# Python/YAML comment → null', () => {
    assert.equal(detectWebIssue(JS, '# eval(x) bad practice'), null);
  });

  test('<!-- HTML comment → null', () => {
    assert.equal(detectWebIssue(HTML, '<!-- dangerouslySetInnerHTML example -->'), null);
  });

  test('object property string value → null', () => {
    assert.equal(
      detectWebIssue(JS, "  description: 'Avoid innerHTML = userInput for XSS reasons'"),
      null
    );
  });

  test('howToFix-style doc property → null', () => {
    assert.equal(
      detectWebIssue(JS, "  howToFix: 'Replace eval(userInput) with explicit dispatch'"),
      null
    );
  });
});

// ─── Parity: existing detections unchanged ────────────────────────────────────

describe('parity — document.write', () => {
  test('document.write() → HIGH', () => {
    const r = detectWebIssue(JS, "document.write('<b>' + text + '</b>')");
    assert.equal(r?.severity, 'HIGH');
    assert.match(r?.title, /DOM injection/i);
  });
});

describe('parity — new Function()', () => {
  test('new Function() → HIGH', () => {
    const r = detectWebIssue(JS, "const fn = new Function('return 42')");
    assert.equal(r?.severity, 'HIGH');
    assert.match(r?.title, /dynamic execution/i);
  });
});

describe('parity — plain HTTP', () => {
  test('fetch(http://) → MEDIUM', () => {
    const r = detectWebIssue(JS, "fetch('http://api.example.com/data')");
    assert.equal(r?.severity, 'MEDIUM');
    assert.equal(r?.fixType, 'http-to-https');
  });

  test('fetch(http://localhost) → null (exempt)', () => {
    assert.equal(detectWebIssue(JS, "fetch('http://localhost:3000/api')"), null);
  });

  test('fetch(https://) → null', () => {
    assert.equal(detectWebIssue(JS, "fetch('https://api.example.com/data')"), null);
  });

  test('axios http → MEDIUM', () => {
    const r = detectWebIssue(JS, "axios.get('http://api.example.com/items')");
    assert.equal(r?.severity, 'MEDIUM');
  });
});

describe('parity — non-web file', () => {
  test('eval() in .txt → null', () => {
    assert.equal(detectWebIssue(TXT, 'eval(userInput)'), null);
  });

  test('innerHTML in .py → null', () => {
    assert.equal(detectWebIssue('/project/script.py', 'el.innerHTML = x'), null);
  });
});

describe('parity — TypeScript / JSX files flagged', () => {
  test('eval in .ts → HIGH', () => {
    const r = detectWebIssue(TS, 'eval(code)');
    assert.equal(r?.severity, 'HIGH');
  });

  test('innerHTML in .tsx → HIGH', () => {
    const r = detectWebIssue(TSX, 'el.innerHTML = userVar');
    assert.equal(r?.severity, 'HIGH');
  });
});
