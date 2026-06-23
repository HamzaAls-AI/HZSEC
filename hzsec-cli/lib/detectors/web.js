'use strict';
const { isWebFile } = require('../core/file-utils');

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

// Classify innerHTML/outerHTML assignments into severity tiers.
// Returns 'HIGH', 'MEDIUM', or 'LOW'.
function classifyInnerHtml(line) {
  if (/dangerouslySetInnerHTML\s*[={:]/i.test(line)) return 'MEDIUM';

  const m = line.match(/(?:innerHTML|outerHTML)\s*=\s*(.+)/i);
  if (!m) return 'HIGH';

  const rhs = m[1].trim();

  // Known sanitizer patterns → LOW
  if (
    /\bDOMPurify\.sanitize\s*\(/i.test(rhs) ||
    /\besc\s*\(/.test(rhs) ||
    /\bsanitize\s*\(/.test(rhs)
  ) return 'LOW';

  // Complete static string literal (no concatenation or interpolation) → LOW
  if (/^'[^']*'[\s;,]*$/.test(rhs) || /^"[^"]*"[\s;,]*$/.test(rhs)) return 'LOW';
  if (/^`[^`$]*`[\s;,]*$/.test(rhs)) return 'LOW';

  // Variable, function call, interpolation, concatenation → HIGH
  return 'HIGH';
}

const INNER_HTML_MSGS = {
  HIGH: {
    title: 'Unsafe DOM injection — dynamic content',
    why: 'Writing dynamic or user-controlled content into the DOM can create XSS exposure.',
    fix: 'Use textContent, sanitized rendering, or a trusted template instead of raw HTML injection.',
  },
  MEDIUM: {
    title: 'DOM injection via dangerouslySetInnerHTML',
    why: "dangerouslySetInnerHTML bypasses React's XSS protection; ensure the value is trusted or sanitized.",
    fix: 'Sanitize content with DOMPurify before passing to dangerouslySetInnerHTML, or use a safe alternative.',
  },
  LOW: {
    title: 'DOM injection — static or sanitized content',
    why: 'innerHTML with static strings or sanitizer output is low risk but still a DOM write sink.',
    fix: 'Confirm the value is truly static or properly sanitized before dismissing this finding.',
  },
};

function detectWebIssue(filePath, line) {
  if (!isWebFile(filePath)) return null;
  if (isDocumentationLine(line)) return null;

  const lower = line.toLowerCase();

  // innerHTML / outerHTML / dangerouslySetInnerHTML — severity by tier
  if (/innerhtml\s*=|outerhtml\s*=|dangerouslysetinnerhtml\s*[={:]/i.test(lower)) {
    const severity = classifyInnerHtml(line);
    const msg = INNER_HTML_MSGS[severity];
    return { title: msg.title, severity, why: msg.why, fix: msg.fix, fixType: 'manual' };
  }

  if (/document\.write\s*\(/.test(lower)) {
    return {
      title: 'Unsafe DOM injection pattern',
      severity: 'HIGH',
      why: 'Writing untrusted content into the DOM can create XSS exposure.',
      fix: 'Use textContent, sanitized rendering, or a trusted templating path instead of raw HTML injection.',
      fixType: 'manual',
    };
  }

  // eval — string-literal guard: suppress when argument is a known static literal
  if (/\beval\s*\(/.test(lower)) {
    if (/\beval\s*\(\s*['"`]/.test(lower)) return null;
    return {
      title: 'Dynamic execution in front-end code',
      severity: 'HIGH',
      why: 'Dynamic code execution can enable injection and unsafe runtime behavior.',
      fix: 'Replace eval-style execution with explicit safe logic or strict parsing.',
      fixType: 'manual',
    };
  }

  if (/new\s+function\s*\(/.test(lower)) {
    return {
      title: 'Dynamic execution in front-end code',
      severity: 'HIGH',
      why: 'Dynamic code execution can enable injection and unsafe runtime behavior.',
      fix: 'Replace eval-style execution with explicit safe logic or strict parsing.',
      fixType: 'manual',
    };
  }

  if (
    (/fetch\(['"]http:\/\//.test(lower) || /axios\.[a-z]+\(['"]http:\/\//.test(lower)) &&
    !/localhost|127\.\d+\.\d+\.\d+|\[?::1\]?/.test(lower)
  ) {
    return {
      title: 'HTTP request from front-end code',
      severity: 'MEDIUM',
      why: 'Using plain HTTP in browser code can expose data in transit.',
      fix: 'Use HTTPS endpoints for front-end requests.',
      fixType: 'http-to-https',
    };
  }

  return null;
}

module.exports = { detectWebIssue };
