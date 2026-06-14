function detectSecretIssue(filePath, line) {
  const secretPatterns = [
    {
      test: /(api[_-]?key|apikey)\s*[:=]\s*["']?[a-z0-9_\-\/+==]{8,}/i,
      title: 'API key exposed in file',
      severity: 'CRITICAL',
      why: 'An exposed API key can be used directly by an attacker to access connected services.',
      fix: 'Remove the hardcoded key, rotate it immediately, and load it from a secure secret source.',
      fixType: 'redact-secret'
    },
    {
      test: /(secret|client_secret|app_secret)\s*[:=]\s*["']?[a-z0-9_\-\/+==]{8,}/i,
      title: 'Secret value exposed',
      severity: 'CRITICAL',
      why: 'Exposed application secrets can enable impersonation, token signing abuse, or service compromise.',
      fix: 'Remove the secret from code/config, rotate it, and fetch it securely at runtime.',
      fixType: 'redact-secret'
    },
    {
      test: /(password|passwd|pwd)\s*[:=]\s*["'][^"']{4,}["']/i,
      title: 'Hardcoded password found',
      severity: 'HIGH',
      why: 'Hardcoded passwords are difficult to protect, rotate, and audit.',
      fix: 'Store passwords in secure secret management instead of local files.',
      fixType: 'redact-secret'
    },
    {
      test: /AKIA[0-9A-Z]{16}/,
      title: 'AWS access key detected',
      severity: 'CRITICAL',
      why: 'Leaked cloud access keys can enable unauthorized cloud access and expensive compromise.',
      fix: 'Revoke and rotate the key immediately and remove it from the file.',
      fixType: 'redact-secret'
    },
    {
      test: /BEGIN [A-Z ]*PRIVATE KEY/,
      title: 'Private key material exposed',
      severity: 'CRITICAL',
      why: 'Private keys provide direct sensitive access and must never remain in project files.',
      fix: 'Remove the key, rotate any related certificates or credentials, and use protected key storage.',
      fixType: 'redact-secret'
    },
    {
      // Fine-grained PATs (github_pat_) and classic PATs (ghp_)
      test: /github_pat_[a-zA-Z0-9_]{20,}|ghp_[A-Za-z0-9]{36}/,
      title: 'GitHub token exposed',
      severity: 'CRITICAL',
      why: 'A leaked GitHub token can grant repository or workflow access.',
      fix: 'Revoke the token now and replace it with a securely stored token.',
      fixType: 'redact-secret'
    },
    {
      // npm/yarn _authToken in lock files or .npmrc — grants access to private registry
      test: /"?_?authToken"?\s*[:=]\s*["']?\S{8,}/i,
      title: 'Registry auth token exposed',
      severity: 'CRITICAL',
      why: 'A registry auth token grants full access to private packages and must never appear in committed files.',
      fix: 'Remove the token, rotate it in your registry, and store credentials via a credential helper or CI secret.',
      fixType: 'redact-secret'
    },
    {
      // Credentials embedded in a URL: https://user:password@host or https://token@host
      test: /https?:\/\/[^@\s\/]+:[^@\s\/]+@\S/,
      title: 'Credentials embedded in URL',
      severity: 'CRITICAL',
      why: 'Passwords or tokens embedded in URLs leak through logs, lock files, and git history.',
      fix: 'Remove the credentials from the URL, rotate them, and use a credential helper or environment variable.',
      fixType: 'redact-secret'
    }
  ];

  for (const pattern of secretPatterns) {
    if (pattern.test.test(line)) return pattern;
  }

  if (filePath.toLowerCase().endsWith('.env') && /=.+/.test(line) && !/^\s*#/.test(line)) {
    const suspicious = /(key|secret|token|password|pwd|private)/i;
    if (suspicious.test(line)) {
      return {
        title: 'Sensitive value in .env file',
        severity: 'HIGH',
        why: 'Secrets in local environment files can be leaked through backups, commits, or sharing.',
        fix: 'Ensure .env is ignored from version control and move production secrets to a secure store.',
        fixType: 'redact-secret'
      };
    }
  }

  return null;
}

module.exports = { detectSecretIssue };