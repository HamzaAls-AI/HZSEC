#!/usr/bin/env bash
# Creates the three HZSec products + prices in Stripe (test mode), then
# writes the price IDs into ../.env. Idempotent in spirit only — if you
# run it twice, you'll get two of each product. List + delete duplicates
# in the dashboard if that happens.
#
# Run:
#     cd hzsec-backend
#     bash scripts/setup-stripe-products.sh
#
# Reads STRIPE_SECRET_KEY from .env. No arguments.

set -euo pipefail

cd "$(dirname "$0")/.."
ENV_FILE=".env"

[ -f "$ENV_FILE" ] || { echo "ERR: no .env file"; exit 1; }

# shellcheck disable=SC1090
set -a; source "$ENV_FILE"; set +a

[ -n "${STRIPE_SECRET_KEY:-}" ] || { echo "ERR: STRIPE_SECRET_KEY not set in .env"; exit 1; }
[[ "$STRIPE_SECRET_KEY" == sk_test_* ]] || {
  echo "ERR: STRIPE_SECRET_KEY does not start with sk_test_ — refusing to run against live mode."
  exit 1
}

# Confirm auth before doing anything destructive.
auth_status=$(curl -sS -o /dev/null -w "%{http_code}" -u "${STRIPE_SECRET_KEY}:" \
  https://api.stripe.com/v1/account)
if [ "$auth_status" != "200" ]; then
  echo "ERR: Stripe auth failed (HTTP $auth_status). Check STRIPE_SECRET_KEY."
  exit 1
fi
echo "Stripe auth OK"

# --- create / fetch IDs ---------------------------------------------------

create_product() {
  local name="$1"; local desc="$2"
  curl -sS -u "${STRIPE_SECRET_KEY}:" https://api.stripe.com/v1/products \
    --data-urlencode "name=$name" \
    --data-urlencode "description=$desc" \
    | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])"
}

create_price() {
  local product="$1"; local amount="$2"; local interval="$3"; local nickname="$4"
  curl -sS -u "${STRIPE_SECRET_KEY}:" https://api.stripe.com/v1/prices \
    -d "product=$product" \
    -d "unit_amount=$amount" \
    -d "currency=usd" \
    -d "recurring[interval]=$interval" \
    --data-urlencode "nickname=$nickname" \
    | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])"
}

echo "Creating HZSec Pro..."
PRO_PROD=$(create_product "HZSec Pro" "AI security assistant — 1000 messages / month")
echo "  product:       $PRO_PROD"

PRO_MO=$(create_price "$PRO_PROD" 1900  "month" "Pro monthly")
echo "  monthly price: $PRO_MO"

PRO_YR=$(create_price "$PRO_PROD" 19000 "year"  "Pro annual")
echo "  annual price:  $PRO_YR"

echo "Creating HZSec Team..."
TEAM_PROD=$(create_product "HZSec Team" "Multi-seat — 5000 messages per seat / month")
echo "  product:       $TEAM_PROD"

TEAM_MO=$(create_price "$TEAM_PROD" 3900 "month" "Team monthly")
echo "  monthly price: $TEAM_MO"

# --- write IDs back into .env --------------------------------------------

upsert() {
  local key="$1"; local val="$2"
  if grep -qE "^${key}=" "$ENV_FILE"; then
    # In-place edit; portable across BSD/GNU sed via tmpfile.
    awk -v k="$key" -v v="$val" 'BEGIN{FS=OFS="="} $1==k{$0=k"="v} {print}' "$ENV_FILE" > "$ENV_FILE.tmp"
    mv "$ENV_FILE.tmp" "$ENV_FILE"
  else
    echo "${key}=${val}" >> "$ENV_FILE"
  fi
}

upsert STRIPE_PRICE_PRO_MONTHLY  "$PRO_MO"
upsert STRIPE_PRICE_PRO_ANNUAL   "$PRO_YR"
upsert STRIPE_PRICE_TEAM_MONTHLY "$TEAM_MO"

echo ""
echo "Wrote IDs to $ENV_FILE:"
grep -E "^STRIPE_PRICE_" "$ENV_FILE"

echo ""
echo "Done. Restart the backend (Ctrl-C + npm run dev) so it picks up the new env."
