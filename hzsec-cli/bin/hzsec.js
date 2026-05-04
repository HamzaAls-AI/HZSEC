#!/usr/bin/env node

// hzsec — local-first security scanner.
//
// Usage:
//   hzsec scan [path]                          scan a directory (default: cwd)
//   hzsec scan --mode quick                    quick mode (faster, code+config+web)
//   hzsec scan --format json                   JSON output for CI scripts
//   hzsec scan --format sarif                  SARIF v2.1.0 for GitHub Code Scanning
//   hzsec scan --output report.sarif           write to file instead of stdout
//   hzsec scan --fail-on critical,high         exit 1 if any matching severity found
//   hzsec --version                            print CLI version
//
// Exit codes:
//   0  scan succeeded, no fail-on matches
//   1  scan succeeded, fail-on matched
//   2  invalid arguments / runtime error

'use strict';

const fs   = require('fs');
const path = require('path');

const { Command, Option } = require('commander');
const { runSecurityScan } = require('../lib/scanner/scan-engine');
const { MODE_DEFINITIONS } = require('../lib/config/modes');
const { formatText }  = require('../lib/formatters/text');
const { formatJson }  = require('../lib/formatters/json');
const { formatSarif } = require('../lib/formatters/sarif');

const pkg = require('../package.json');

const program = new Command();

program
  .name('hzsec')
  .description('Local-first security scanner — find secrets, misconfigs, unsafe patterns. No upload.')
  .version(pkg.version, '-v, --version', 'print version and exit');

program
  .command('scan', { isDefault: true })
  .description('scan a directory for security issues')
  .argument('[path]', 'path to scan (default: current directory)', '.')
  .addOption(new Option('-m, --mode <mode>', 'scan mode')
    .choices(Object.keys(MODE_DEFINITIONS))
    .default('full'))
  .addOption(new Option('-f, --format <format>', 'output format')
    .choices(['text', 'json', 'sarif'])
    .default('text'))
  .option('-o, --output <file>', 'write output to file instead of stdout')
  .option('--fail-on <severities>', 'exit 1 if findings match (comma-list of CRITICAL,HIGH,MEDIUM,LOW,INFO)')
  .option('--no-color', 'disable ANSI colors in text output')
  .option('--quiet',    'suppress progress spinner')
  .action(async (target, opts) => {
    try {
      await runScan(target, opts);
    } catch (err) {
      console.error('hzsec: ' + (err.message || err));
      process.exit(2);
    }
  });

program.parseAsync(process.argv).catch(err => {
  console.error('hzsec: ' + (err.message || err));
  process.exit(2);
});

// ─── core ──────────────────────────────────────────────────────────────────

async function runScan(target, opts) {
  const absTarget = path.resolve(target);
  if (!fs.existsSync(absTarget)) {
    console.error(`hzsec: target not found: ${absTarget}`);
    process.exit(2);
  }

  // Lazy-load chalk + ora (ESM-only) so users with --no-color on a tiny
  // box don't pay the import cost.
  const chalk    = (await import('chalk')).default;
  const oraMod   = opts.quiet || opts.format !== 'text' ? null : await import('ora');
  const useColor = opts.color !== false && process.stdout.isTTY && opts.format === 'text';

  const spinner = oraMod
    ? oraMod.default({ text: `Scanning ${absTarget}…`, color: 'cyan' }).start()
    : null;

  const t0 = Date.now();
  let report;
  try {
    report = await runSecurityScan(absTarget, { mode: opts.mode });
  } catch (err) {
    if (spinner) spinner.fail('Scan failed');
    throw err;
  }
  const ms = Date.now() - t0;

  // The scanner doesn't track its own target/mode in the result — the
  // desktop app passes that through context. CLI injects it so formatters
  // (especially SARIF, which needs it for relative paths) have it.
  report.target    = absTarget;
  report.mode      = opts.mode;
  report.scannedAt = report.scannedAt || new Date().toISOString();
  report.durationMs = ms;

  if (spinner) spinner.succeed(`Scanned ${report.findings.length} finding(s) in ${ms}ms`);

  // ── Render ──
  let out;
  switch (opts.format) {
    case 'json':  out = formatJson(report);  break;
    case 'sarif': out = formatSarif(report); break;
    default:      out = formatText(report, { chalk, useColor });
  }

  if (opts.output) {
    fs.writeFileSync(opts.output, out, 'utf8');
    if (opts.format === 'text' && !opts.quiet) console.log(`Wrote ${out.length} bytes to ${opts.output}`);
  } else {
    process.stdout.write(out);
    if (opts.format !== 'text') process.stdout.write('\n');
  }

  // ── --fail-on exit code ──
  if (opts['failOn']) {
    const wanted = parseFailOn(opts.failOn);
    const matched = (report.findings || []).filter(f => wanted.has(f.severity));
    if (matched.length > 0) {
      if (opts.format === 'text') {
        console.error(`\nhzsec: ${matched.length} finding(s) at fail-on threshold (${[...wanted].join(',')}).`);
      }
      process.exit(1);
    }
  }
}

function parseFailOn(spec) {
  const allowed = new Set(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO']);
  const out = new Set();
  for (const raw of String(spec).split(',')) {
    const s = raw.trim().toUpperCase();
    if (!s) continue;
    if (!allowed.has(s)) {
      console.error(`hzsec: --fail-on: unknown severity "${raw}". Allowed: CRITICAL,HIGH,MEDIUM,LOW,INFO.`);
      process.exit(2);
    }
    out.add(s);
  }
  return out;
}
