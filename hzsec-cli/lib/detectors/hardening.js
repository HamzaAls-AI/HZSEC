function detectHardeningIssue(filePath, line) {
  const lower = line.toLowerCase();

  if (/permitrootlogin\s+yes/.test(lower)) {
    return {
      title: 'SSH root login enabled',
      severity: 'HIGH',
      why: 'Allowing root login over SSH increases risk and weakens hardening posture.',
      fix: 'Set PermitRootLogin no and use controlled administrative workflows.',
      fixType: 'toggle-root-login'
    };
  }

  if (/passwordauthentication\s+yes/.test(lower)) {
    return {
      title: 'SSH password authentication enabled',
      severity: 'MEDIUM',
      why: 'Password authentication can weaken SSH security compared with key-based access.',
      fix: 'Disable PasswordAuthentication where key-based authentication is available.',
      fixType: 'toggle-password-auth'
    };
  }

  if (/chmod\s+777/.test(lower) || /mode\s*[:=]\s*777/.test(lower)) {
    return {
      title: 'Overly permissive file permissions',
      severity: 'HIGH',
      why: 'World-writable permissions make tampering and exposure more likely.',
      fix: 'Reduce permissions to the minimum required, such as 640 or 755 depending on purpose.',
      fixType: 'manual'
    };
  }

  if (/nopasswd:\s*all/.test(lower)) {
    return {
      title: 'Passwordless sudo for all commands',
      severity: 'HIGH',
      why: 'Broad NOPASSWD rules can allow privilege escalation with weak controls.',
      fix: 'Restrict sudo rules to the minimum required commands and require authentication where possible.',
      fixType: 'manual'
    };
  }

  return null;
}

module.exports = { detectHardeningIssue };
