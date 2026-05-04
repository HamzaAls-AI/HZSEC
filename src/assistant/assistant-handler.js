// ════════════════════════════════════════════════════════════════════════
// ASSISTANT HANDLER — Phase 1B
// Agentic tool-use loop, wider context, breach cases removed from default.
// ════════════════════════════════════════════════════════════════════════

const https = require('https');
const fs = require('fs');
const path = require('path');

const {
  searchCves,
  getBreachCasesForFindings,
  getComplianceGaps,
  getFixMemorySummary,
  recordFindings
} = require('../intelligence/knowledge-base');

const { TOOL_DEFINITIONS, executeTool } = require('./tool-runner');
const { getPlaybooksForFindings } = require('./playbooks');

const MODEL = 'claude-opus-4-5';
const MAX_TOKENS = 4096;
const MAX_TOOL_ITERATIONS = 6;
const FULL_FILE_LINE_LIMIT = 500;
const SNIPPET_CONTEXT_LINES = 100;
const FINDINGS_IN_PROMPT_CAP = 12;
const TRIGGER_BREACH_KEYWORDS = /\b(breach|breach(es)?|incident(s)?|exploit(ed)?|hack(ed|ing)?|cve|attack(er)?|prior\s+case|happened\s+to|real[- ]?world|precedent)\b/i;

function buildSystemPrompt(kbContext, hasTools) {
  return `You are HZSec Assistant — an expert security engineer embedded inside HZSec, a local security platform. You see the user's actual scan findings and have read their code.

${hasTools ? `## Tools available
You have file-system tools: read_file, grep, list_directory, git_blame. USE THEM proactively. Don't guess at file contents — read the file. Don't theorize about callers — grep for them. If a finding is suspicious, look at git_blame to see when and why the line was added.

Tool-use guidance:
- Before answering "why does this matter in MY codebase", read the file or grep for usage
- Before proposing a fix, verify it won't break callers — grep for them
- For confusing code, run git_blame to see context
- Be efficient: 1-4 tool calls is typically plenty
` : ''}
${kbContext ? `## Live Security Intelligence\n${kbContext}\n` : ''}

When answering:
- Lead with what's specifically wrong in THIS code, not general security education
- If you used tools, briefly note what you found
- Be direct and senior-engineer-honest. No hedging. No filler.
- For complex issues, walk the actual attack chain in this codebase

When asked to fix issues, respond with a JSON plan in this EXACT format:
{
  "message": "Plain English explanation",
  "fixes": [
    {
      "filePath": "/absolute/path/to/file",
      "lineNumber": 5,
      "originalLine": "exact current line",
      "newLine": "replacement line",
      "reason": "why this change fixes it"
    }
  ]
}

When just answering questions, respond in clean markdown — no JSON.

Fix rules:
- Only propose changes you are fully confident are safe
- Preserve surrounding code style and indentation exactly
- One fix per line entry
- Set "fixes": [] if no automated fix is safe, explain why in "message"
- Never invent file paths

Tone: Direct, expert, zero fluff.`;
}

async function buildKbContext(findings = [], userMessage = '', includeBreaches = false) {
  const parts = [];
  try {
    const userTriggeredBreach = TRIGGER_BREACH_KEYWORDS.test(userMessage || '');
    if ((includeBreaches || userTriggeredBreach) && findings.length > 0) {
      const breaches = getBreachCasesForFindings(findings).slice(0, 3);
      if (breaches.length > 0) {
        parts.push('### Real Breach Cases (matching current findings)');
        for (const b of breaches) {
          parts.push(`**${b.title}**\n- What happened: ${b.summary}\n- Consequence: ${b.consequence}\n- Lesson: ${b.lesson}`);
        }
      }
    }

    const playbooks = getPlaybooksForFindings(findings);
    if (playbooks.length > 0) {
      parts.push('### Finding Playbooks (specific guidance for issues in this scan)');
      for (const pb of playbooks) {
        parts.push(`**${pb.title}**
- How attacker exploits: ${pb.howAttackerExploits}
- How to fix: ${pb.howToFix}
- Common mistakes: ${pb.commonMistakes}`);
      }
    }

    if (/\bcve\b|\bvulnerab/i.test(userMessage || '')) {
      const searchTerms = [userMessage.slice(0, 80), ...(findings.slice(0, 2).map(f => f.title))].filter(Boolean).join(' ');
      if (searchTerms.trim()) {
        const cves = searchCves(searchTerms, 3);
        if (cves.length > 0) {
          parts.push('### Relevant CVEs');
          for (const cve of cves) {
            parts.push(`**${cve.id}** (${cve.severity}, CVSS: ${cve.cvss || 'N/A'})\n${(cve.description || '').slice(0, 180)}…`);
          }
        }
      }
    }

    if (/\b(soc[\s-]?2|owasp|cis|pci|hipaa|compliance|audit)\b/i.test(userMessage || '') && findings.length > 0) {
      const gaps = getComplianceGaps(findings).slice(0, 5);
      if (gaps.length > 0) {
        parts.push('### Compliance Gaps');
        for (const gap of gaps) {
          parts.push(`- **${gap.framework} ${gap.control}** (${gap.name}): ${gap.failingFindings} failing finding(s)`);
        }
      }
    }

    const memory = getFixMemorySummary(findings);
    if (memory) {
      if (memory.longOpen.length > 0) {
        parts.push('### Issues Open Longest');
        for (const issue of memory.longOpen.slice(0, 3)) {
          const days = Math.round((Date.now() - new Date(issue.first_seen).getTime()) / 86400000);
          parts.push(`- **${issue.title}** — open ${days} days in ${(issue.file_path || '').split('/').pop()}`);
        }
      }
      if (memory.recurring.length > 0) {
        parts.push('### Recurring Issues');
        for (const issue of memory.recurring.slice(0, 3)) {
          parts.push(`- **${issue.title}** — recurred ${issue.recurrence_count} time(s)`);
        }
      }
    }
  } catch (err) {
    console.error('[Assistant] KB context failed:', err.message);
  }
  return parts.length > 0 ? parts.join('\n\n') : null;
}

function buildFileContext(findings = [], snippet = null, scanRoot = null) {
  const parts = [];
  const seen = new Set();
  const fileTargets = [];
  for (const f of findings) {
    const fp = f.filePath || f.file;
    if (!fp || seen.has(fp)) continue;
    seen.add(fp);
    fileTargets.push({ path: fp, lineNumber: f.lineNumber });
    if (fileTargets.length >= 3) break;
  }

  for (const { path: fp, lineNumber } of fileTargets) {
    try {
      const abs = path.isAbsolute(fp) ? fp : (scanRoot ? path.resolve(scanRoot, fp) : null);
      if (!abs || !fs.existsSync(abs)) continue;
      const stat = fs.statSync(abs);
      if (stat.size > 1_500_000) continue;
      const content = fs.readFileSync(abs, 'utf8');
      const lines = content.split(/\r?\n/);
      let from, to, label;
      if (lines.length <= FULL_FILE_LINE_LIMIT) {
        from = 1; to = lines.length;
        label = `Full file (${lines.length} lines)`;
      } else if (Number.isInteger(lineNumber) && lineNumber > 0) {
        from = Math.max(1, lineNumber - SNIPPET_CONTEXT_LINES);
        to   = Math.min(lines.length, lineNumber + SNIPPET_CONTEXT_LINES);
        label = `Lines ${from}-${to} of ${lines.length} (around finding)`;
      } else {
        from = 1; to = Math.min(lines.length, FULL_FILE_LINE_LIMIT);
        label = `Lines 1-${to} of ${lines.length} (truncated)`;
      }
      const slice = lines.slice(from - 1, to).map((line, i) => `${from + i}\t${line}`).join('\n');
      const relPath = scanRoot ? path.relative(scanRoot, abs) : path.basename(abs);
      parts.push(`### File: ${relPath}\n_${label}_\n\`\`\`\n${slice}\n\`\`\``);
    } catch { /* skip */ }
  }
  if (snippet && typeof snippet === 'string' && snippet.trim()) {
    parts.push(`### Selected snippet\n\`\`\`\n${snippet}\n\`\`\``);
  }
  return parts.length > 0 ? parts.join('\n\n') : null;
}

function buildUserContent(userMessage, findings, snippet, scanRoot) {
  const parts = [];
  if (findings && findings.length > 0) {
    parts.push(`## Current Scan Findings (${findings.length} total)
${scanRoot ? `_Scan root: ${scanRoot}_` : ''}
\`\`\`json
${JSON.stringify(findings.slice(0, FINDINGS_IN_PROMPT_CAP), null, 2)}
\`\`\``);
  }
  const fileCtx = buildFileContext(findings, snippet, scanRoot);
  if (fileCtx) parts.push(`## File Context\n${fileCtx}`);
  parts.push(`## User Question\n${userMessage}`);
  return parts.join('\n\n');
}

// Two transport modes:
//   creds = { apiKey }                       — direct to api.anthropic.com (BYO)
//   creds = { licenseKey, backendUrl }       — through hzsec-backend proxy
//
// The proxy expects an Anthropic-compatible body plus `licenseKey` in the
// JSON envelope, and returns the unmodified Anthropic response. So the only
// difference between modes is which host + which auth header we use.

function callClaude(creds, { system, messages, tools }) {
  if (creds && creds.licenseKey) return callViaProxy(creds, { system, messages, tools });
  return callViaDirect(creds, { system, messages, tools });
}

function callViaDirect(creds, { system, messages, tools }) {
  if (!creds || !creds.apiKey) {
    return Promise.reject(new Error('No API key set. Open Settings and add your Anthropic API key, or sign in to HZSec for managed access.'));
  }
  return new Promise((resolve, reject) => {
    const payload = { model: MODEL, max_tokens: MAX_TOKENS, system, messages };
    if (tools && tools.length > 0) payload.tools = tools;
    const body = JSON.stringify(payload);
    const options = {
      hostname: 'api.anthropic.com', port: 443, path: '/v1/messages', method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': creds.apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(body)
      }
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) return reject(new Error(parsed.error.message || 'API error'));
          resolve(parsed);
        } catch (e) { reject(new Error('Failed to parse API response: ' + e.message)); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function callViaProxy(creds, { system, messages, tools }) {
  return new Promise((resolve, reject) => {
    const payload = {
      licenseKey: creds.licenseKey,
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system,
      messages
    };
    if (tools && tools.length > 0) payload.tools = tools;
    const body = JSON.stringify(payload);

    let url;
    try { url = new URL((creds.backendUrl || 'https://api.hzsec.io') + '/api/assistant/proxy'); }
    catch (e) { return reject(new Error('Invalid backend URL: ' + e.message)); }

    const lib = url.protocol === 'http:' ? require('http') : require('https');
    const options = {
      hostname: url.hostname,
      port:     url.port || (url.protocol === 'http:' ? 80 : 443),
      path:     url.pathname + url.search,
      method:   'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };
    const req = lib.request(options, res => {
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode === 402 && parsed.error === 'usage_cap_exceeded') {
            const e = new Error('You have hit this month\'s message cap on your HZSec plan. Upgrade or wait until ' + (parsed.reset_date || 'next month') + '.');
            e.code = 'usage_cap_exceeded';
            return reject(e);
          }
          if (parsed.error && typeof parsed.error === 'string') {
            return reject(new Error(`Backend error (${res.statusCode}): ${parsed.error}${parsed.hint ? ' — ' + parsed.hint : ''}`));
          }
          if (parsed.error?.message) return reject(new Error(parsed.error.message));
          if (res.statusCode >= 400) return reject(new Error('Backend HTTP ' + res.statusCode));
          resolve(parsed);
        } catch (e) { reject(new Error('Failed to parse proxy response: ' + e.message)); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function extractText(response) {
  if (!response?.content) return '';
  return response.content.filter(b => b.type === 'text').map(b => b.text).join('\n');
}

function extractToolUses(response) {
  if (!response?.content) return [];
  return response.content.filter(b => b.type === 'tool_use');
}

function parseFixPlan(text) {
  try {
    const match = text.match(/\{[\s\S]*"fixes"\s*:\s*\[[\s\S]*\][\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    return JSON.parse(text);
  } catch { return null; }
}

async function handleAssistantMessage({ apiKey, creds, messages, findings, snippet, scanRoot, includeBreaches }) {
  // Backward-compat: callers that pass plain `apiKey` still work; new
  // callers pass `creds` ({apiKey} for BYO, {licenseKey, backendUrl} for proxy).
  const auth = creds || (apiKey ? { apiKey } : null);
  if (!auth || (!auth.apiKey && !auth.licenseKey)) {
    throw new Error('No assistant credentials configured. Sign in to HZSec or add your Anthropic API key in Settings.');
  }

  if (findings && findings.length > 0) {
    try { recordFindings(findings); } catch { /* non-fatal */ }
  }

  const lastUserMsg = messages.filter(m => m.role === 'user').slice(-1)[0]?.content || '';
  const kbContext = await buildKbContext(findings || [], lastUserMsg, includeBreaches);
  const hasTools = !!scanRoot;
  const system = buildSystemPrompt(kbContext, hasTools);

  const apiMessages = messages.map(m => ({ role: m.role, content: m.content }));
  if (apiMessages.length > 0) {
    const last = apiMessages[apiMessages.length - 1];
    if (last.role === 'user') {
      last.content = buildUserContent(last.content, findings, snippet, scanRoot);
    }
  }

  const tools = hasTools ? TOOL_DEFINITIONS : null;
  const toolCallTrace = [];

  for (let iter = 0; iter < MAX_TOOL_ITERATIONS; iter++) {
    const response = await callClaude(auth, { system, messages: apiMessages, tools });
    apiMessages.push({ role: 'assistant', content: response.content });

    const toolUses = extractToolUses(response);
    if (response.stop_reason !== 'tool_use' || toolUses.length === 0) {
      const text = extractText(response);
      const fixPlan = parseFixPlan(text);
      if (fixPlan && Array.isArray(fixPlan.fixes)) {
        return { type: 'fix-plan', message: fixPlan.message || 'Here is my proposed fix plan.', fixes: fixPlan.fixes, toolCalls: toolCallTrace, rawReply: text };
      }
      return { type: 'message', message: text, toolCalls: toolCallTrace };
    }

    const toolResults = [];
    for (const toolUse of toolUses) {
      let result;
      try { result = await executeTool(toolUse.name, toolUse.input || {}, scanRoot); }
      catch (err) { result = { error: `Tool failed: ${err.message}` }; }
      toolCallTrace.push({ name: toolUse.name, input: toolUse.input, hadError: !!result?.error });
      toolResults.push({
        type: 'tool_result',
        tool_use_id: toolUse.id,
        content: typeof result === 'string' ? result : JSON.stringify(result, null, 2)
      });
    }
    apiMessages.push({ role: 'user', content: toolResults });
  }

  // Force final answer if iteration cap hit
  const finalResp = await callClaude(auth, {
    system: system + '\n\nIMPORTANT: Tool budget exhausted. Provide your best final answer now without further tool calls.',
    messages: apiMessages,
    tools: null
  });
  const finalText = extractText(finalResp);
  const fp = parseFixPlan(finalText);
  if (fp && Array.isArray(fp.fixes)) {
    return { type: 'fix-plan', message: fp.message || 'Here is my proposed fix plan.', fixes: fp.fixes, toolCalls: toolCallTrace, rawReply: finalText };
  }
  return { type: 'message', message: finalText, toolCalls: toolCallTrace };
}

async function generateMonitorAlert(creds, changedFile, addedFindings) {
  // Backward-compat: if a string is passed, treat as raw apiKey.
  const auth = typeof creds === 'string' ? { apiKey: creds } : creds;
  if (!auth || (!auth.apiKey && !auth.licenseKey) || !addedFindings.length) return null;
  try {
    const summary = addedFindings.slice(0, 3)
      .map(f => `- [${f.severity}] ${f.title} in ${f.file} (line ${f.lineNumber})`)
      .join('\n');
    const response = await callClaude(auth, {
      system: 'You are a real-time security monitor. Short, direct, actionable. Stay under 2 sentences.',
      messages: [{
        role: 'user',
        content: `File changed: ${changedFile}\n\nNew issues:\n${summary}\n\nWrite a 1-2 sentence alert.`
      }]
    });
    return extractText(response);
  } catch { return null; }
}

async function generateFixSuggestion(creds, finding) {
  const auth = typeof creds === 'string' ? { apiKey: creds } : creds;
  if (!auth || (!auth.apiKey && !auth.licenseKey)) return finding.recommendedFix;
  try {
    const response = await callClaude(auth, {
      system: 'You are a security engineer. Precise, actionable fixes with code.',
      messages: [{
        role: 'user',
        content: `Issue: ${finding.title}\nSeverity: ${finding.severity}\nFile: ${finding.file}, line ${finding.lineNumber}\nRaw line: ${finding.rawLine}\nWhy: ${finding.whyItMatters}\n\nGive the exact fix in 2-3 sentences with a concrete code example.`
      }]
    });
    return extractText(response);
  } catch { return finding.recommendedFix; }
}

module.exports = { handleAssistantMessage, generateMonitorAlert, generateFixSuggestion };
