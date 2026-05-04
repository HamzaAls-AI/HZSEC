// ════════════════════════════════════════════════════════════════════════
// TOOL RUNNER — Phase 1B
// File-system tools the assistant can call. ALL paths constrained to the
// user's currently-selected scan target. Anything outside → rejected.
//
// Tools exposed:
//   - read_file(path, start_line?, end_line?)
//   - grep(pattern, path?, max_results?, regex?)
//   - list_directory(path)
//   - git_blame(path, line)
// ════════════════════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

const MAX_FILE_LINES        = 500;
const MAX_GREP_RESULTS      = 60;
const MAX_DIR_ENTRIES       = 200;
const MAX_FILE_BYTES_READ   = 1_500_000;
const SKIP_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', 'out', '.next', '.nuxt',
  '__pycache__', '.venv', 'venv', 'target', '.cache', 'coverage'
]);
const TEXT_EXTENSIONS = new Set([
  '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs',
  '.py', '.rb', '.go', '.rs', '.java', '.kt', '.swift',
  '.c', '.cc', '.cpp', '.h', '.hpp', '.cs', '.php',
  '.html', '.css', '.scss', '.sass', '.less',
  '.json', '.yaml', '.yml', '.toml', '.ini', '.env', '.conf', '.config',
  '.md', '.txt', '.sh', '.bash', '.zsh', '.fish',
  '.xml', '.svg', '.gradle', '.lock', '.tf'
]);

function withinRoot(rawPath, scanRoot) {
  if (!scanRoot) return { ok: false, error: 'No scan target set — open a project first.' };
  const resolved = path.resolve(scanRoot, rawPath);
  try {
    const real = fs.existsSync(resolved) ? fs.realpathSync(resolved) : resolved;
    const rootReal = fs.realpathSync(scanRoot);
    const rel = path.relative(rootReal, real);
    if (rel.startsWith('..') || path.isAbsolute(rel)) {
      return { ok: false, error: `Path escapes scan target: ${rawPath}` };
    }
    return { ok: true, absolute: real, relative: rel || '.' };
  } catch (err) {
    return { ok: false, error: `Cannot resolve path: ${err.message}` };
  }
}

async function read_file({ path: filePath, start_line, end_line }, scanRoot) {
  const guard = withinRoot(filePath, scanRoot);
  if (!guard.ok) return { error: guard.error };
  try {
    const stat = fs.statSync(guard.absolute);
    if (stat.isDirectory()) return { error: `Path is a directory: ${filePath}` };
    if (stat.size > MAX_FILE_BYTES_READ) return { error: `File too large (${Math.round(stat.size / 1024)}KB).` };
    const content = fs.readFileSync(guard.absolute, 'utf8');
    const allLines = content.split(/\r?\n/);
    const total = allLines.length;
    let from = Number.isInteger(start_line) ? Math.max(1, start_line) : 1;
    let to   = Number.isInteger(end_line)   ? Math.min(total, end_line) : total;
    if (to < from) [from, to] = [to, from];
    if (to - from + 1 > MAX_FILE_LINES) to = from + MAX_FILE_LINES - 1;
    const slice = allLines.slice(from - 1, to);
    const numbered = slice.map((line, i) => `${from + i}\t${line}`).join('\n');
    return {
      path: guard.relative,
      total_lines: total,
      shown_lines: `${from}-${to}`,
      truncated: to < total,
      content: numbered
    };
  } catch (err) {
    return { error: `Could not read file: ${err.message}` };
  }
}

async function grep({ pattern, path: searchPath, max_results, regex }, scanRoot) {
  const guard = withinRoot(searchPath || '.', scanRoot);
  if (!guard.ok) return { error: guard.error };
  if (!pattern || typeof pattern !== 'string') return { error: 'pattern is required' };
  const cap = Math.min(Math.max(parseInt(max_results, 10) || 30, 1), MAX_GREP_RESULTS);
  let matcher;
  try { matcher = regex ? new RegExp(pattern) : null; }
  catch (err) { return { error: `Invalid regex: ${err.message}` }; }

  const matches = [];
  let filesScanned = 0;
  let truncated = false;

  function walk(dir) {
    if (matches.length >= cap) { truncated = true; return; }
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const entry of entries) {
      if (matches.length >= cap) { truncated = true; return; }
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name)) continue;
        if (entry.name.startsWith('.') && entry.name !== '.env') continue;
        walk(full);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (!TEXT_EXTENSIONS.has(ext) && entry.name !== '.env') continue;
        try {
          const stat = fs.statSync(full);
          if (stat.size > MAX_FILE_BYTES_READ) continue;
          const content = fs.readFileSync(full, 'utf8');
          const lines = content.split(/\r?\n/);
          filesScanned++;
          for (let i = 0; i < lines.length; i++) {
            const hit = matcher ? matcher.test(lines[i]) : lines[i].includes(pattern);
            if (hit) {
              matches.push({
                file: path.relative(scanRoot, full),
                line: i + 1,
                content: lines[i].length > 200 ? lines[i].slice(0, 200) + '…' : lines[i]
              });
              if (matches.length >= cap) { truncated = true; return; }
            }
          }
        } catch { /* skip */ }
      }
    }
  }

  try {
    const stat = fs.statSync(guard.absolute);
    if (stat.isFile()) {
      const content = fs.readFileSync(guard.absolute, 'utf8');
      const lines = content.split(/\r?\n/);
      filesScanned = 1;
      for (let i = 0; i < lines.length && matches.length < cap; i++) {
        const hit = matcher ? matcher.test(lines[i]) : lines[i].includes(pattern);
        if (hit) {
          matches.push({
            file: path.relative(scanRoot, guard.absolute),
            line: i + 1,
            content: lines[i].length > 200 ? lines[i].slice(0, 200) + '…' : lines[i]
          });
        }
      }
      if (matches.length >= cap) truncated = true;
    } else {
      walk(guard.absolute);
    }
  } catch (err) {
    return { error: `Search failed: ${err.message}` };
  }

  return { pattern, regex: !!regex, files_scanned: filesScanned, match_count: matches.length, truncated, matches };
}

async function list_directory({ path: dirPath }, scanRoot) {
  const guard = withinRoot(dirPath || '.', scanRoot);
  if (!guard.ok) return { error: guard.error };
  try {
    const stat = fs.statSync(guard.absolute);
    if (!stat.isDirectory()) return { error: `Not a directory: ${dirPath}` };
    const entries = fs.readdirSync(guard.absolute, { withFileTypes: true })
      .filter(e => !e.name.startsWith('.') || e.name === '.env')
      .filter(e => !(e.isDirectory() && SKIP_DIRS.has(e.name)))
      .slice(0, MAX_DIR_ENTRIES)
      .map(e => {
        const full = path.join(guard.absolute, e.name);
        let size = null;
        try { if (e.isFile()) size = fs.statSync(full).size; } catch {}
        return { name: e.name, type: e.isDirectory() ? 'dir' : 'file', size_bytes: size };
      });
    return { path: guard.relative, entry_count: entries.length, entries };
  } catch (err) {
    return { error: `Could not list directory: ${err.message}` };
  }
}

function git_blame({ path: filePath, line }, scanRoot) {
  return new Promise((resolve) => {
    const guard = withinRoot(filePath, scanRoot);
    if (!guard.ok) return resolve({ error: guard.error });
    if (!Number.isInteger(line) || line < 1) return resolve({ error: 'line must be a positive integer' });
    execFile('git',
      ['blame', '-L', `${line},${line}`, '--porcelain', '--', guard.absolute],
      { cwd: scanRoot, timeout: 5000, maxBuffer: 200_000 },
      (err, stdout, stderr) => {
        if (err) {
          if (stderr && /not a git repository/i.test(stderr)) return resolve({ error: 'Not a git repository.' });
          if (err.code === 'ENOENT') return resolve({ error: 'git binary not available on this system.' });
          return resolve({ error: `git blame failed: ${stderr || err.message}` });
        }
        const lines = String(stdout).split('\n');
        const meta = {};
        let codeLine = '';
        for (const ln of lines) {
          if (ln.startsWith('\t')) { codeLine = ln.slice(1); continue; }
          const m = ln.match(/^(\S+)\s+(.*)$/);
          if (!m) continue;
          const [, k, v] = m;
          if (k === 'author') meta.author = v;
          else if (k === 'author-mail') meta.author_email = v;
          else if (k === 'author-time') meta.author_time = new Date(parseInt(v, 10) * 1000).toISOString();
          else if (k === 'summary') meta.commit_message = v;
          else if (/^[0-9a-f]{40}/.test(k)) meta.commit_hash = k.slice(0, 12);
        }
        resolve({
          path: guard.relative, line, line_content: codeLine,
          author: meta.author || 'unknown',
          author_email: meta.author_email || '',
          authored_at: meta.author_time || '',
          commit_hash: meta.commit_hash || '',
          commit_message: meta.commit_message || ''
        });
      }
    );
  });
}

const TOOL_DEFINITIONS = [
  {
    name: 'read_file',
    description: 'Read a file from the user\'s project. Use this to inspect code mentioned in a finding, or to look at related files (imports, configs, callers).',
    input_schema: {
      type: 'object',
      properties: {
        path:       { type: 'string', description: 'Path relative to project root.' },
        start_line: { type: 'integer', description: 'First line to read (1-indexed). Optional.' },
        end_line:   { type: 'integer', description: 'Last line to read (inclusive). Max 500 lines per call.' }
      },
      required: ['path']
    }
  },
  {
    name: 'grep',
    description: 'Search for a pattern across files in the project. Skips node_modules, .git, build dirs.',
    input_schema: {
      type: 'object',
      properties: {
        pattern:     { type: 'string', description: 'Plain text or regex to search for.' },
        path:        { type: 'string', description: 'Subdirectory or file to search within.' },
        regex:       { type: 'boolean', description: 'If true, treat pattern as a regex.' },
        max_results: { type: 'integer', description: 'Cap on matches. Default 30, max 60.' }
      },
      required: ['pattern']
    }
  },
  {
    name: 'list_directory',
    description: 'List files and folders inside a directory in the project.',
    input_schema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Directory path relative to project root.' }
      }
    }
  },
  {
    name: 'git_blame',
    description: 'Show who last modified a specific line of a file, when, and the commit message. Returns an error if the project is not a git repository.',
    input_schema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'File path relative to project root.' },
        line: { type: 'integer', description: 'Line number to blame (1-indexed).' }
      },
      required: ['path', 'line']
    }
  }
];

async function executeTool(name, input, scanRoot) {
  switch (name) {
    case 'read_file':      return read_file(input, scanRoot);
    case 'grep':           return grep(input, scanRoot);
    case 'list_directory': return list_directory(input, scanRoot);
    case 'git_blame':      return git_blame(input, scanRoot);
    default:               return { error: `Unknown tool: ${name}` };
  }
}

module.exports = { TOOL_DEFINITIONS, executeTool, withinRoot };
