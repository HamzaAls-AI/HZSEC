const { isPotentialCodeFile } = require('../core/file-utils');

function detectCodeIssue(filePath, line) {
  const lower = line.toLowerCase();
  if (!isPotentialCodeFile(filePath)) return null;

  if (/child_process/.test(lower) || /exec\s*\(|spawn\s*\(/.test(lower)) {
    return {
      title: 'Child process execution path detected',
      severity: 'HIGH',
      why: 'Child process calls can become command injection paths when input is user-controlled.',
      fix: 'Avoid shell execution with untrusted input and use strict allowlists or direct APIs instead.',
      fixType: 'manual'
    };
  }

  if (/\beval\s*\(/.test(lower)) {
    return {
      title: 'Dynamic execution path detected',
      severity: 'HIGH',
      why: 'Dynamic execution can allow injection or unsafe runtime behavior if input is not tightly controlled.',
      fix: 'Replace dynamic execution with explicit logic or strict validation.',
      fixType: 'manual'
    };
  }

  return null;
}

module.exports = { detectCodeIssue };