'use strict';

const fs   = require('fs');
const path = require('path');

// Compile a single .hzsecignore pattern into a test function.
//
// Supported v1 syntax:
//   *        any chars except /  (one path segment)
//   **       any chars including /  (zero or more segments)
//   **/pat   unanchored: match pat at any depth
//   pat/     directory pattern: match dir and everything inside it
//   !pat     negation (handled by caller, not here)
//
// Anchoring rule (mirrors .gitignore):
//   If the pattern (after stripping a leading **/) contains a / it is
//   anchored to the project root.  Otherwise it matches at any depth.
function compilePattern(raw) {
  const isDir = raw.endsWith('/');
  let src = isDir ? raw.slice(0, -1) : raw;

  // Leading **/ means "at any depth" — strip it and treat as unanchored
  let globStar = false;
  if (src.startsWith('**/')) {
    globStar = true;
    src = src.slice(3);
  }

  const anchored = !globStar && src.includes('/');

  // Build regex body from the pattern string
  const bodyRe = src
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')  // escape regex metacharacters
    .replace(/\*\*/g, '\x00')               // protect ** before replacing *
    .replace(/\*/g, '[^/]*')               // * = one segment (no /)
    .replace(/\x00\//g, '(.*/)?')          // **/ = optional path prefix
    .replace(/\/\x00/g, '(/.*)?')          // /** = optional path suffix
    .replace(/\x00/g, '.*');              // bare ** = any depth

  let re;
  if (anchored) {
    re = isDir
      ? new RegExp(`^${bodyRe}(/.*)?$`)
      : new RegExp(`^${bodyRe}$`);
  } else {
    // Unanchored: match at any position within the relative path
    re = isDir
      ? new RegExp(`(^|/)${bodyRe}(/|$)`)
      : new RegExp(`(^|/)${bodyRe}$`);
  }

  return rel => re.test(rel);
}

const NO_OP = { shouldIgnore: () => false };

// Read and parse a .hzsecignore file from projectRoot.
// Returns a rules object with a shouldIgnore(absolutePath, projectRoot) method.
// If .hzsecignore does not exist, returns a no-op that never ignores anything.
function loadIgnoreRules(projectRoot) {
  const ignorePath = path.join(projectRoot, '.hzsecignore');
  let content;
  try {
    content = fs.readFileSync(ignorePath, 'utf8');
  } catch {
    return NO_OP;
  }

  // Strip UTF-8 BOM if present
  if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);

  const exclusions = [];
  const negations  = [];

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    if (line.startsWith('!')) {
      negations.push(compilePattern(line.slice(1)));
    } else {
      exclusions.push(compilePattern(line));
    }
  }

  if (exclusions.length === 0 && negations.length === 0) return NO_OP;

  return {
    shouldIgnore(absolutePath, projRoot) {
      // Compute path relative to project root, normalised to forward slashes
      const rel = path.relative(projRoot, absolutePath).split(path.sep).join('/');
      // Paths outside the project root (e.g. symlinks pointing elsewhere) are never ignored
      if (!rel || rel.startsWith('..')) return false;

      const excluded = exclusions.some(fn => fn(rel));
      if (!excluded) return false;
      // A negation rule overrides any matching exclusion
      return !negations.some(fn => fn(rel));
    }
  };
}

module.exports = { loadIgnoreRules };
