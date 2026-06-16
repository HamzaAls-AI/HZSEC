const fs = require('fs');
const path = require('path');
const os = require('os');

function isFilePath(targetPath) {
  try {
    return fs.existsSync(targetPath) && fs.statSync(targetPath).isFile();
  } catch {
    return false;
  }
}

function isDirectoryPath(targetPath) {
  try {
    return fs.existsSync(targetPath) && fs.statSync(targetPath).isDirectory();
  } catch {
    return false;
  }
}

function safeReadFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return '';
  }
}

const IGNORED_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', '.next', '.cache',
  'vendor', 'coverage', 'out', 'target', '__pycache__', '.backup'
]);

const IGNORED_DIR_PREFIXES = ['backup-'];

const IGNORED_FILE_EXTS = new Set(['.bak', '.backup']);

function getAllFilesRecursive(startPath, collector = [], ignoreRules = null, projectRoot = null) {
  if (!fs.existsSync(startPath)) return collector;

  // projectRoot is fixed at the initial call site and passed unchanged on recursion
  const root = projectRoot || startPath;

  const stat = fs.statSync(startPath);
  if (stat.isFile()) {
    const ext = path.extname(startPath).toLowerCase();
    if (!IGNORED_FILE_EXTS.has(ext)) {
      if (!ignoreRules || !ignoreRules.shouldIgnore(startPath, root)) {
        collector.push(startPath);
      }
    }
    return collector;
  }

  const entries = fs.readdirSync(startPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(startPath, entry.name);

    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) continue;
      if (IGNORED_DIR_PREFIXES.some(prefix => entry.name.startsWith(prefix))) continue;
      getAllFilesRecursive(fullPath, collector, ignoreRules, root);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (IGNORED_FILE_EXTS.has(ext)) continue;
      if (ignoreRules && ignoreRules.shouldIgnore(fullPath, root)) continue;
      collector.push(fullPath);
    }
  }

  return collector;
}

function isConfigFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const name = path.basename(filePath).toLowerCase();

  return [
    '.env', '.json', '.yaml', '.yml', '.toml', '.ini', '.conf', '.cfg',
    '.xml', '.tf', '.tfvars', '.properties', '.cnf'
  ].includes(ext) || ['dockerfile', '.htaccess', 'nginx.conf', 'apache.conf'].includes(name);
}

function isWebFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return ['.html', '.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte'].includes(ext);
}

function isPotentialCodeFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.go', '.php', '.rb', '.sh', '.ps1', '.c', '.cpp', '.cs'].includes(ext);
}

function detectProjectType(files) {
  const names = files.map((file) => path.basename(file).toLowerCase());

  if (names.includes('package.json')) return 'JavaScript / Node.js';
  if (names.includes('requirements.txt') || names.includes('pyproject.toml')) return 'Python';
  if (names.includes('pom.xml') || names.includes('build.gradle')) return 'Java';
  if (names.includes('dockerfile')) return 'Containerized App';
  if (names.some((n) => n.endsWith('.tf'))) return 'Infrastructure as Code';

  return 'General Project';
}

function detectPlatform(files) {
  const extensions = files.map((file) => path.extname(file).toLowerCase());

  if (extensions.includes('.ps1') || extensions.includes('.bat')) return 'Windows / Cross-platform';
  if (extensions.includes('.sh')) return 'Linux / macOS';
  if (extensions.includes('.tf') || extensions.includes('.yaml') || extensions.includes('.yml')) {
    return 'Cloud / Infra / Cross-platform';
  }

  return os.platform();
}

module.exports = {
  IGNORED_DIRS,
  IGNORED_DIR_PREFIXES,
  IGNORED_FILE_EXTS,
  isFilePath,
  isDirectoryPath,
  safeReadFile,
  getAllFilesRecursive,
  isConfigFile,
  isWebFile,
  isPotentialCodeFile,
  detectProjectType,
  detectPlatform
};