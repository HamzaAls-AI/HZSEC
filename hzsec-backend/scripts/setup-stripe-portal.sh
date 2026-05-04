#!/usr/bin/env bash
# Configures the Stripe Customer Portal (test mode):
#   - Customers can update payment method
#   - Customers can cancel subscriptions (immediate)
#   - Customers can view invoice history
#
# Idempotent — re-running just creates a new "active" configuration; the old
# ones become inactive but stay in your dashboard. Stripe uses the latest
# active configuration for new portal sessions.
#
# Run:
#     cd hzsec-backend
#     bash scripts/setup-stripe-portal.sh

set -euo pipefail
cd "$(dirname "$0")/.."

[ -f .env ] || { echo "ERR: no .env file"; exit 1; }
# shellcheck disable=SC1091
set -a; source .env; set +a

[ -n "${STRIPE_SECRET_KEY:-}" ] || { echo "ERR: STRIPE_SECRET_KEY not set"; exit 1; }
[[ "$STRIPE_SECRET_KEY" == sk_test_* ]] || {
  echo "ERR: STRIPE_SECRET_KEY does not start with sk_test_ — refusing live mode."
  exit 1
}

if [ "${WEB_ORIGIN:-}" = "" ]; then WEB_ORIGIN="http://localhost:3000"; fi

echo "Creating Customer Portal configuration..."
RES=$(curl -sS -u "${STRIPE_SECRET_KEY}:" \
  https://api.stripe.com/v1/billing_portal/configurations \
  --data-urlencode "business_profile[headline]=Manage your HZSec subscription" \
  --data-urlencode "default_return_url=${WEB_ORIGIN}/dashboard" \
  -d "features[customer_update][enabled]=true" \
  -d "features[customer_update][allowed_updates][]=email" \
  -d "features[customer_update][allowed_updates][]=name" \
  -d "features[payment_method_update][enabled]=true" \
  -d "features[invoice_history][enabled]=true" \
  -d "features[subscription_cancel][enabled]=true" \
  -d "features[subscription_cancel][mode]=at_period_end" \
  -d "features[subscription_cancel][cancellation_reason][enabled]=true" \
  -d "features[subscription_cancel][cancellation_reason][options][]=too_expensive" \
  -d "features[subscription_cancel][cancellation_reason][options][]=missing_features" \
  -d "features[subscription_cancel][cancellation_reason][options][]=switched_service" \
  -d "features[subscription_cancel][cancellation_reason][options][]=unused" \
  -d "features[subscription_cancel][cancellation_reason][options][]=other")

ID=$(echo "$RES" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))")
ERR=$(echo "$RES" | python3 -c "import sys,json; e=json.load(sys.stdin).get('error'); print(e.get('message','') if e else '')")

if [ -n "$ERR" ]; then
  echo "ERR: $ERR"
  exit 1
fi

echo "Created configuration: $ID"
echo "Customers can: update email/name + payment method, cancel at period end, view invoices."
