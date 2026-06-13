const { isWebFile } = require('../core/file-utils');

function detectWebIssue(filePath, line) {
  const lower = line.toLowerCase();
  if (!isWebFile(filePath)) return null;

  if (/innerhtml\s*=|outerhtml\s*=|document\.write\s*\(/.test(lower)) {
    return {
      title: 'Unsafe DOM injection pattern',
      severity: 'HIGH',
      why: 'Writing untrusted content into the DOM can create XSS exposure.',
      fix: 'Use textContent, sanitized rendering, or a trusted templating path instead of raw HTML injection.',
      fixType: 'manual'
    };
  }

  if (/eval\s*\(|new\s+function\s*\(/.test(lower)) {
    return {
      title: 'Dynamic execution in front-end code',
      severity: 'HIGH',
      why: 'Dynamic code execution can enable injection and unsafe runtime behavior.',
      fix: 'Replace eval-style execution with explicit safe logic or strict parsing.',
      fixType: 'manual'
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
      fixType: 'http-to-https'
    };
  }

  return null;
}

module.exports = { detectWebIssue };