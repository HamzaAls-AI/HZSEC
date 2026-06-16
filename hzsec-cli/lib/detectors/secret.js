function isPlaceholderValue(line) {
  const m = line.match(/[:=]\s*["']?([^"'\s#,;]+)/);
  const value = m ? m[1] : '';
  if (!value) return false;
  // Template / interpolation syntax — always a placeholder
  if (/\$\{[^}]+\}|\{\{[^}]+\}\}|%[A-Z_][A-Z0-9_]*%|<[A-Z][A-Z0-9_\-\s]{1,30}>/.test(value)) return true;
  // Common placeholder phrases — require a keyword suffix after "example" to avoid matching
  // legitimate hostnames like "db.prod.example.com"
  if (/replace[_\-]?(me|here|this|with)|your[_\-]?(api|key|secret|token|password|value|here)|placeholder|changeme|example[_\-](key|secret|value|token)|xxx{3,}|test[_\-]?(key|secret|token)?|fake[_\-]?(key|secret)?|\bpassword\b/i.test(value)) return true;
  // Short sentinel values — anchored to avoid false negatives on longer real values
  return /^(none|null|undefined|n\/a|tbd|todo|fixme|example)$/i.test(value);
}

function detectSecretIssue(filePath, line) {
  // Skip comment lines — prevents false positives from docs, examples, and commented-out code
  if (/^\s*(#|\/\/|\/\*|\*(?!\/)|<!--)/.test(line)) return null;
  if (/^\s*["'`]\s*(#|\/\/)/.test(line)) return null;

  const secretPatterns = [
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
      // OpenAI classic keys (sk- + 48 chars) and project-scoped keys (sk-proj-)
      test: /sk-[A-Za-z0-9]{48}|sk-proj-[A-Za-z0-9_\-]{40,}/,
      title: 'OpenAI API key exposed',
      severity: 'CRITICAL',
      why: 'An exposed OpenAI key incurs direct financial cost through API charges and may expose prompt history or fine-tuned model access.',
      fix: 'Revoke the key in the OpenAI dashboard immediately and load it at runtime from an environment variable or secrets manager.',
      fixType: 'redact-secret'
    },
    {
      // Stripe live secret and restricted keys — direct access to charges, payouts, and customer data
      test: /sk_live_[A-Za-z0-9]{24,}|rk_live_[A-Za-z0-9]{24,}/,
      title: 'Stripe live secret key exposed',
      severity: 'CRITICAL',
      why: 'A live Stripe secret key grants full access to charges, refunds, and customer data. Exposure can result in financial fraud and PCI compliance violations.',
      fix: 'Revoke the key in the Stripe dashboard immediately and rotate any related webhook secrets. Use environment variables for all Stripe credentials.',
      fixType: 'redact-secret'
    },
    {
      // Stripe test keys — lower immediate risk but often reach staging with real data
      test: /sk_test_[A-Za-z0-9]{24,}/,
      title: 'Stripe test key exposed',
      severity: 'HIGH',
      why: 'Stripe test keys expose your test environment. If test data mirrors production or the key is accidentally promoted, real customer data may be at risk.',
      fix: 'Remove the test key from source and store it in an environment variable. Treat test credentials with the same care as production keys.',
      fixType: 'redact-secret'
    },
    {
      // Fine-grained PATs (github_pat_), classic PATs (ghp_), and GitHub App tokens (ghs_, ghu_, gho_, ghr_)
      test: /github_pat_[a-zA-Z0-9_]{20,}|gh[psuor]_[A-Za-z0-9]{36}/,
      title: 'GitHub token exposed',
      severity: 'CRITICAL',
      why: 'A leaked GitHub token can grant repository, workflow, or organization access depending on its scope.',
      fix: 'Revoke the token now and replace it with a securely stored token.',
      fixType: 'redact-secret'
    },
    {
      // npm/yarn _authToken in lock files or .npmrc — grants access to private registry
      test: /"?_?authToken"?\s*[:=]\s*["']?\S{8,}/i,
      checkPlaceholder: true,
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
    },
    {
      // Database connection strings with embedded credentials (postgres, mysql, mongodb, redis, mssql)
      test: /(postgres|postgresql|mysql|mongodb(\+srv)?|redis|mssql|sqlserver):\/\/[^@\s\/]{3,}:[^@\s\/]{3,}@\S+/i,
      checkPlaceholder: true,
      title: 'Database credentials in connection string',
      severity: 'CRITICAL',
      why: 'A plaintext connection string grants direct database access to anyone with repository access, including historical clones. Data breaches frequently start with leaked connection strings.',
      fix: 'Remove the connection string, rotate the database password immediately, and load credentials at runtime via environment variables or a secrets manager.',
      fixType: 'redact-secret'
    },
    {
      // Slack bot, user, app, OAuth, and session tokens — all xox[letter]- prefixed
      test: /xox[bpeaors]-[A-Za-z0-9\-]{10,}/,
      title: 'Slack token exposed',
      severity: 'CRITICAL',
      why: 'A Slack token can read channel messages, send messages on behalf of users, access files, and export workspace data depending on its OAuth scopes.',
      fix: 'Revoke the token in your Slack app settings and store the replacement in a CI secret or secrets manager.',
      fixType: 'redact-secret'
    },
    {
      // SendGrid API keys have a fixed structure: SG. + 22 chars + . + 43 chars
      test: /SG\.[A-Za-z0-9_\-]{22}\.[A-Za-z0-9_\-]{43}/,
      title: 'SendGrid API key exposed',
      severity: 'HIGH',
      why: 'A leaked SendGrid key allows an attacker to send email as your domain, access contact lists, and modify email templates — enabling phishing and damaging sender reputation.',
      fix: 'Revoke the key in SendGrid API Key settings. Create a replacement with minimum required scopes and store it as a CI/CD secret.',
      fixType: 'redact-secret'
    },
    {
      // JWT tokens — three base64url segments; header always starts with eyJ (base64url of '{"')
      test: /eyJ[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}/,
      title: 'JWT token hardcoded in source',
      severity: 'HIGH',
      why: 'A committed JWT may carry real session data or admin claims. Tokens do not expire from source code — any future checkout exposes them indefinitely.',
      fix: 'Remove the token from the file, invalidate it if it carries real claims, and ensure signing secrets are loaded from a secure store rather than hardcoded.',
      fixType: 'redact-secret'
    },
    {
      test: /(api[_-]?key|apikey)\s*[:=]\s*["']?[a-z0-9_\-\/+==]{8,}/i,
      checkPlaceholder: true,
      title: 'API key exposed in file',
      severity: 'CRITICAL',
      why: 'An exposed API key can be used directly by an attacker to access connected services.',
      fix: 'Remove the hardcoded key, rotate it immediately, and load it from a secure secret source.',
      fixType: 'redact-secret'
    },
    {
      test: /(secret|client_secret|app_secret)\s*[:=]\s*["']?[a-z0-9_\-\/+==]{8,}/i,
      checkPlaceholder: true,
      title: 'Secret value exposed',
      severity: 'CRITICAL',
      why: 'Exposed application secrets can enable impersonation, token signing abuse, or service compromise.',
      fix: 'Remove the secret from code/config, rotate it, and fetch it securely at runtime.',
      fixType: 'redact-secret'
    },
    {
      test: /(password|passwd|pwd)\s*[:=]\s*["'][^"']{4,}["']/i,
      checkPlaceholder: true,
      title: 'Hardcoded password found',
      severity: 'HIGH',
      why: 'Hardcoded passwords are difficult to protect, rotate, and audit.',
      fix: 'Store passwords in secure secret management instead of local files.',
      fixType: 'redact-secret'
    }
  ];

  for (const pattern of secretPatterns) {
    if (pattern.test.test(line)) {
      if (pattern.checkPlaceholder && isPlaceholderValue(line)) continue;
      return pattern;
    }
  }

  if (filePath.toLowerCase().endsWith('.env') && /=.+/.test(line) && !/^\s*#/.test(line)) {
    const suspicious = /(key|secret|token|password|pwd|private)/i;
    if (suspicious.test(line) && !isPlaceholderValue(line)) {
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
