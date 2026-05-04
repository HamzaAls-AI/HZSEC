#!/usr/bin/env bash
# End-to-end smoke test for hzsec-backend.
#
# Run on your Mac (where Stripe + Anthropic + Postgres are reachable).
# Assumes the server is already running on :8080 (`npm run dev` in another tab).
#
#     bash scripts/smoke-test.sh
#
# What it checks:
#   1. /healthz                                                  → 200
#   2. /api/me with dev shim                                     → 200, has license OR dev fallback
#   3. /api/license/validate (well-formed key)                   → 200
#   4. /api/license/validate (malformed key)                     → 400
#   5. /api/billing/checkout-session (pro/monthly)               → 200 with real Stripe URL
#   6. /api/billing/portal-session (no subscription)             → 404 no_subscription
#   7. /api/assistant/proxy (no Anthropic key set)               → 503 proxy_not_configured
#                       (or 200 with text content if key is set)
#   8. 404 unknown route                                         → 404
#
# Output is colored: green = pass, red = fail. Final line is a tally.

set -u
HOST="${HOST:-http://localhost:8080}"

GREEN=$'\033[32m'; RED=$'\033[31m'; DIM=$'\033[2m'; RESET=$'\033[0m'
PASS=0; FAIL=0

run() {
  local label="$1"; local expected="$2"; shift 2
  local body; local code
  body=$(curl -s -o /tmp/hzsec-smoke.body -w "%{http_code}" "$@")
  code="$body"
  if [ "$code" = "$expected" ]; then
    PASS=$((PASS + 1))
    printf "${GREEN}PASS${RESET}  %-50s ${DIM}HTTP %s${RESET}\n" "$label" "$code"
  else
    FAIL=$((FAIL + 1))
    printf "${RED}FAIL${RESET}  %-50s ${DIM}got %s, wanted %s${RESET}\n" "$label" "$code" "$expected"
    echo "       body: $(head -c 200 /tmp/hzsec-smoke.body)"
  fi
}

echo "Target: $HOST"
echo ""

run "healthz"                 200 "$HOST/healthz"

run "/api/me (dev shim)"      200 \
  -H "Authorization: Bearer dev:user_test" "$HOST/api/me"

run "/api/me (no auth)"       401 "$HOST/api/me"

run "license validate (good)" 200 \
  -X POST "$HOST/api/license/validate" \
  -H "Content-Type: application/json" \
  -d '{"licenseKey":"HZSEC-AAAA-BBBB-CCCC-DDDD"}'

run "license validate (bad)"  400 \
  -X POST "$HOST/api/license/validate" \
  -H "Content-Type: application/json" \
  -d '{"licenseKey":"not-a-key"}'

run "checkout pro/monthly"    200 \
  -X POST "$HOST/api/billing/checkout-session" \
  -H "Authorization: Bearer dev:user_test" \
  -H "Content-Type: application/json" \
  -d '{"tier":"pro","interval":"monthly"}'

# Show the actual checkout URL so the user can click it to test the full flow.
URL=$(python3 -c "import json,sys; print(json.load(open('/tmp/hzsec-smoke.body')).get('url',''))" 2>/dev/null)
[ -n "$URL" ] && echo "       url:  ${URL:0:80}..."

run "checkout invalid tier"   400 \
  -X POST "$HOST/api/billing/checkout-session" \
  -H "Authorization: Bearer dev:user_test" \
  -H "Content-Type: application/json" \
  -d '{"tier":"enterprise","interval":"monthly"}'

run "portal (no sub)"         404 \
  -X POST "$HOST/api/billing/portal-session" \
  -H "Authorization: Bearer dev:user_test"

# /api/assistant/proxy: 503 if no key set, 200 if key set. Either is OK; we
# only fail if it's something else.
PROXY_CODE=$(curl -s -o /tmp/hzsec-smoke.body -w "%{http_code}" \
  -X POST "$HOST/api/assistant/proxy" \
  -H "Content-Type: application/json" \
  -d '{"licenseKey":"HZSEC-AAAA-BBBB-CCCC-DDDD","messages":[{"role":"user","content":"reply with the single word: pong"}]}')
if [ "$PROXY_CODE" = "200" ] || [ "$PROXY_CODE" = "503" ]; then
  PASS=$((PASS + 1))
  printf "${GREEN}PASS${RESET}  %-50s ${DIM}HTTP %s${RESET}\n" "proxy (200 if key set, 503 otherwise)" "$PROXY_CODE"
else
  FAIL=$((FAIL + 1))
  printf "${RED}FAIL${RESET}  %-50s ${DIM}got %s${RESET}\n" "proxy" "$PROXY_CODE"
  echo "       body: $(head -c 200 /tmp/hzsec-smoke.body)"
fi

run "404 unknown"             404 "$HOST/no-such-route"

echo ""
if [ "$FAIL" = 0 ]; then
  echo "${GREEN}All ${PASS} checks passed.${RESET}"
  exit 0
else
  echo "${RED}${FAIL} failed, ${PASS} passed.${RESET}"
  exit 1
fi
