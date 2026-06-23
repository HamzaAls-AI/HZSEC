function detectConfigIssue(filePath, line) {
  if (/^\s*(#|\/\/|\/\*|\*(?!\/)|<!--)/.test(line)) return null;
  const lower = line.toLowerCase();
  const file = filePath.toLowerCase();

  // Debug mode enabled
  if (/debug\s*[:=]\s*true/.test(lower)) {
    return {
      title: 'Debug mode enabled',
      severity: 'MEDIUM',
      why: 'Debug mode can expose internal behavior or sensitive information in non-production environments.',
      fix: 'Set debug to false in production-facing configuration.',
      fixType: 'toggle-false'
    };
  }

  // Wildcard CORS
  if (
    /allow[_-]?origins?\s*[:=]\s*\*/.test(lower) ||
    /access-control-allow-origin\s*[:=]\s*\*/.test(lower) ||
    /cors.*\*/.test(lower)
  ) {
    return {
      title: 'Wildcard CORS policy',
      severity: 'HIGH',
      why: 'A wildcard origin can allow unexpected websites to interact with your application.',
      fix: 'Replace * with a tightly controlled allowlist of trusted origins.',
      fixType: 'cors-allowlist'
    };
  }

  // Binding to all interfaces
  if (/0\.0\.0\.0/.test(lower) && /(host|bind|listen)/.test(lower)) {
    return {
      title: 'Wide network binding detected',
      severity: 'HIGH',
      why: 'Binding to all interfaces can expose services more broadly than intended.',
      fix: 'Restrict bind/host address to the intended interface or protect exposure behind controlled access.',
      fixType: 'bind-local'
    };
  }

  // SSL disabled
  if (/ssl\s*[:=]\s*false/.test(lower) || /tls\s*[:=]\s*false/.test(lower)) {
    return {
      title: 'Transport encryption disabled',
      severity: 'HIGH',
      why: 'Disabling SSL/TLS can expose traffic and credentials to interception.',
      fix: 'Enable TLS/SSL and use valid certificates for secured transport.',
      fixType: 'toggle-true'
    };
  }

  // Certificate verification disabled
  if (/verify\s*ssl\s*[:=]\s*false/.test(lower) || /insecure\s*[:=]\s*true/.test(lower)) {
    return {
      title: 'Certificate verification disabled',
      severity: 'HIGH',
      why: 'Skipping certificate validation weakens trust checks and enables man-in-the-middle risk.',
      fix: 'Turn verification back on and trust only valid certificates.',
      fixType: 'toggle-safe-verification'
    };
  }

  // Password in config
  if (
    (file.endsWith('.env') || file.includes('config')) &&
    /password\s*=/.test(lower) &&
    !/changeme|example|sample/.test(lower)
  ) {
    return {
      title: 'Password stored in configuration',
      severity: 'HIGH',
      why: 'Hardcoded credentials in config files are easy to leak and difficult to rotate safely.',
      fix: 'Move the password to a secure secret store or protected environment variable.',
      fixType: 'redact-secret'
    };
  }

  // Admin enabled by default
  if (
    (file.endsWith('.json') || file.endsWith('.yaml') || file.endsWith('.yml')) &&
    /"admin"\s*:\s*true|admin\s*:\s*true/.test(lower)
  ) {
    return {
      title: 'Admin privilege default enabled',
      severity: 'MEDIUM',
      why: 'Default elevated privilege in configuration can create unintended access.',
      fix: 'Set admin-style defaults to false and apply elevation through controlled workflows.',
      fixType: 'toggle-false'
    };
  }

  // HTTP — exclude local addresses and W3C/XML namespace URIs (not network endpoints)
  if (/http:\/\//.test(lower) && !/localhost|127\.\d+\.\d+\.\d+|\[?::1\]?|0\.0\.0\.0|www\.w3\.org/.test(lower)) {
    return {
      title: 'Unencrypted endpoint reference',
      severity: 'MEDIUM',
      why: 'Using plain HTTP for remote endpoints can expose data in transit.',
      fix: 'Switch external endpoints to HTTPS.',
      fixType: 'http-to-https'
    };
  }

  // Security TODO
  if (/TODO\s*security|FIXME\s*security/i.test(line)) {
    return {
      title: 'Unresolved security TODO',
      severity: 'LOW',
      why: 'Security TODOs often indicate incomplete hardening or known risk left in place.',
      fix: 'Resolve the TODO with a concrete secure implementation or remove insecure placeholder logic.',
      fixType: 'manual'
    };
  }

  return null;
}

module.exports = { detectConfigIssue };