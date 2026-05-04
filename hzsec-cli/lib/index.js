// Programmatic API surface — for users who want to call HZSec from their
// own Node code rather than the CLI.
//
//   const { runSecurityScan } = require('hzsec-cli');
//   const report = await runSecurityScan('./my-project', { mode: 'full' });

const { runSecurityScan } = require('./scanner/scan-engine');
const { scanFile }        = require('./scanner/scan-file');
const { MODE_DEFINITIONS } = require('./config/modes');
const { severityRank, severityWeight, dedupeFindings } = require('./core/findings');

const formatters = {
  text:  require('./formatters/text'),
  json:  require('./formatters/json'),
  sarif: require('./formatters/sarif')
};

module.exports = {
  runSecurityScan,
  scanFile,
  MODE_DEFINITIONS,
  severityRank,
  severityWeight,
  dedupeFindings,
  formatters
};
