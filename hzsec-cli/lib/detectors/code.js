'use strict';
const { isPotentialCodeFile, isWebFile } = require('../core/file-utils');

// Matches explicit child_process imports only — not string references or regex literals
const CHILD_PROCESS_IMPORT_RE = /require\s*\(\s*['"]child_process['"]\s*\)|from\s+['"]child_process['"]/;
// Matches child_process appearing anywhere (catches string references too — narrowed below)
const CHILD_PROCESS_REF_RE = /child_process/;
// Matches actual exec( / spawn( calls (not regex patterns containing exec\s*\( as text)
const EXEC_SPAWN_CALL_RE = /exec\s*\(|spawn\s*\(/;
// String-literal arg guard: exec/spawn called with a string/template-literal as first arg
const PURE_STRING_CMD_RE = /(?:exec|spawn)\s*\(\s*['"`]/;
const EVAL_RE = /\beval\s*\(/;
const EVAL_STRING_LITERAL_RE = /\beval\s*\(\s*['"`]/;

function isDocumentationLine(line) {
  const t = line.trimStart();
  return (
    t.startsWith('//') ||
    t.startsWith('/*') ||
    t.startsWith('*/') ||
    t.startsWith('* ') ||
    t === '*' ||
    t.startsWith('#') ||
    t.startsWith('<!--') ||
    /^\w+\s*:\s*['"`]/.test(t)
  );
}

function detectCodeIssue(filePath, line) {
  if (!isPotentialCodeFile(filePath)) return null;
  if (isDocumentationLine(line)) return null;

  const lower = line.toLowerCase();

  // child_process import guard — import/require without an exec/spawn call on the same line
  if (CHILD_PROCESS_IMPORT_RE.test(line)) {
    return {
      title: 'Child process module imported',
      severity: 'MEDIUM',
      why: 'Importing child_process enables shell execution — audit all exec/spawn calls in this file.',
      fix: 'Review all child_process usage in this file; use safer alternatives where possible.',
      fixType: 'manual',
    };
  }

  // child_process execution or bare exec/spawn call
  if (CHILD_PROCESS_REF_RE.test(lower) || EXEC_SPAWN_CALL_RE.test(lower)) {
    // child_process appears but with no import pattern and no actual exec/spawn call
    // (e.g., the word appears only inside a string value or a regex literal)
    if (CHILD_PROCESS_REF_RE.test(lower) && !EXEC_SPAWN_CALL_RE.test(lower)) {
      return null;
    }

    // Pure-string-command guard: static argument → MEDIUM; dynamic argument → HIGH
    const isStaticCmd = PURE_STRING_CMD_RE.test(lower);
    return {
      title: isStaticCmd
        ? 'Child process execution — static command'
        : 'Child process execution path detected',
      severity: isStaticCmd ? 'MEDIUM' : 'HIGH',
      why: isStaticCmd
        ? 'Child process call with a static command string is lower risk but worth confirming.'
        : 'Child process calls can become command injection paths when input is user-controlled.',
      fix: isStaticCmd
        ? 'Confirm the command is fully static and not influenced by runtime input.'
        : 'Avoid shell execution with untrusted input; use strict allowlists or direct APIs instead.',
      fixType: 'manual',
    };
  }

  // eval — double-fire fix: web.js already handles eval for web files
  if (EVAL_RE.test(lower)) {
    if (isWebFile(filePath)) return null;
    // String-literal guard: eval('...') is a known-static call — suppress
    if (EVAL_STRING_LITERAL_RE.test(lower)) return null;
    return {
      title: 'Dynamic execution path detected',
      severity: 'HIGH',
      why: 'Dynamic execution can allow injection or unsafe runtime behavior if input is not tightly controlled.',
      fix: 'Replace dynamic execution with explicit logic or strict validation.',
      fixType: 'manual',
    };
  }

  return null;
}

module.exports = { detectCodeIssue };
