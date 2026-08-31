#!/usr/bin/env bash
#
# End-to-end smoke test for the order intake and admin CRM.
#
# Boots `wrangler pages dev` against a local D1 and R2 (no Cloudflare account
# and no network needed), exercises every endpoint, and asserts the security
# boundaries actually hold. Run it after touching anything in functions/.
#
#   ./scripts/smoke-test.sh
#
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

PORT="${PORT:-8788}"
BASE="http://127.0.0.1:$PORT"
PASSWORD='smoke-test-password'
TMP="$(mktemp -d)"
PASS=0
FAIL=0

cleanup() {
  [ -n "${DEV_PID:-}" ] && kill "$DEV_PID" 2>/dev/null
  rm -rf "$TMP" .dev.vars.smoke
}
trap cleanup EXIT

ok()   { PASS=$((PASS + 1)); printf '  \033[32m✓\033[0m %s\n' "$1"; }
bad()  { FAIL=$((FAIL + 1)); printf '  \033[31m✗\033[0m %s\n' "$1"; printf '      %s\n' "$2"; }

# expect <description> <expected> <actual>
expect() {
  if [ "$2" = "$3" ]; then ok "$1"; else bad "$1" "expected '$2', got '$3'"; fi
}

# contains <description> <needle> <haystack>
contains() {
  case "$3" in
    *"$2"*) ok "$1" ;;
    *) bad "$1" "expected to contain '$2', got '$3'" ;;
  esac
}

echo "==> Building"
npm run build >/dev/null 2>&1 || { echo "build failed"; exit 1; }

echo "==> Local secrets"
HASH="$(printf '%s' "$PASSWORD" | sha256sum | cut -d' ' -f1)"
# Preserve any real .dev.vars the developer already has.
[ -f .dev.vars ] && cp .dev.vars .dev.vars.smoke
{
  echo "ADMIN_PASSWORD_HASH=$HASH"
  echo "SESSION_SECRET=$(head -c 32 /dev/urandom | od -An -tx1 | tr -d ' \n')"
} > .dev.vars

echo "==> Fresh local database"
rm -rf .wrangler/state
npx wrangler d1 execute DB --local --file=db/schema.sql >/dev/null 2>&1 \
  || { echo "schema apply failed"; exit 1; }

echo "==> Starting wrangler"
npx wrangler pages dev --port "$PORT" --ip 127.0.0.1 > "$TMP/wrangler.log" 2>&1 &
DEV_PID=$!
for _ in $(seq 1 45); do
  curl -sf -o /dev/null --max-time 2 "$BASE/" && break
  sleep 1
done
curl -sf -o /dev/null --max-time 2 "$BASE/" || {
  echo "server never came up:"; tail -20 "$TMP/wrangler.log"; exit 1;
}

# 1x1 PNG used to exercise the R2 upload path
printf '\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n\x2d\xb4\x00\x00\x00\x00IEND\xaeB\x60\x82' > "$TMP/photo.png"
FUTURE="$(date -u -d '+30 days' +%Y-%m-%d 2>/dev/null || date -u -v+30d +%Y-%m-%d)"

echo
echo "Order intake"

R=$(curl -s -X POST "$BASE/api/order" \
  -F "name=Smoke Test" -F "contactMethod=text" -F "phone=904-555-0142" \
  -F "eventDate=$FUTURE" -F "itemType=Custom cakes" -F "flavor=Strawberry" \
  -F "theme=Hot Wheels" -F "photos=@$TMP/photo.png;type=image/png")
contains "valid order is accepted" '"ok":true' "$R"

R=$(curl -s -X POST "$BASE/api/order" -F "name=X" -F "contactMethod=text" \
  -F "phone=9045550142" -F "eventDate=2020-01-01" -F "itemType=Cupcakes")
contains "past event date is refused" 'must be in the future' "$R"

R=$(curl -s -X POST "$BASE/api/order" -F "name=X" -F "contactMethod=email" \
  -F "email=nope" -F "eventDate=$FUTURE" -F "itemType=Cupcakes")
contains "malformed email is refused" 'valid email is required' "$R"

R=$(curl -s -X POST "$BASE/api/order" -F "name=X" -F "contactMethod=text" \
  -F "phone=123" -F "eventDate=$FUTURE" -F "itemType=Cupcakes")
contains "short phone number is refused" 'valid phone number' "$R"

R=$(curl -s -X POST "$BASE/api/order" -F "name=Bot" -F "company=SpamCo" \
  -F "contactMethod=text" -F "phone=9045550142" -F "eventDate=$FUTURE" \
  -F "itemType=Cupcakes")
contains "honeypot returns ok (not an error)" '"ok":true' "$R"

echo
echo "Admin authentication"

C=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/api/admin/leads")
expect "leads require a session" "401" "$C"

C=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/api/admin/login" \
  -H 'Content-Type: application/json' -d '{"password":"wrong"}')
expect "wrong password is rejected" "401" "$C"

C=$(curl -s -o /dev/null -w '%{http_code}' \
  -H 'Cookie: kc_admin=admin.99999999999.deadbeef' "$BASE/api/admin/leads")
expect "forged session cookie is rejected" "401" "$C"

C=$(curl -s -c "$TMP/cookies" -o /dev/null -w '%{http_code}' \
  -X POST "$BASE/api/admin/login" -H 'Content-Type: application/json' \
  -d "{\"password\":\"$PASSWORD\"}")
expect "correct password signs in" "200" "$C"

COOKIE_LINE=$(grep kc_admin "$TMP/cookies" || true)
case "$COOKIE_LINE" in
  \#HttpOnly_*) ok "session cookie is HttpOnly" ;;
  *) bad "session cookie is HttpOnly" "flag missing: $COOKIE_LINE" ;;
esac

echo
echo "Lead data"

LEADS=$(curl -s -b "$TMP/cookies" "$BASE/api/admin/leads")
N=$(printf '%s' "$LEADS" | python3 -c 'import json,sys;print(len(json.load(sys.stdin)["leads"]))')
expect "honeypot submission created no lead" "1" "$N"

ID=$(printf '%s' "$LEADS" | python3 -c 'import json,sys;print(json.load(sys.stdin)["leads"][0]["id"])')
KEY=$(printf '%s' "$LEADS" | python3 -c 'import json,sys;print(json.load(sys.stdin)["leads"][0]["photo_keys"][0])')
contains "photo was stored in R2" "leads/$ID/" "$KEY"

curl -s -b "$TMP/cookies" -X PATCH "$BASE/api/admin/leads/$ID" \
  -H 'Content-Type: application/json' \
  -d '{"status":"booked","admin_notes":"Quoted $180"}' >/dev/null
S=$(curl -s -b "$TMP/cookies" "$BASE/api/admin/leads" \
  | python3 -c 'import json,sys;l=json.load(sys.stdin)["leads"][0];print(l["status"],l["admin_notes"])')
expect "status and notes persist" 'booked Quoted $180' "$S"

R=$(curl -s -b "$TMP/cookies" -X PATCH "$BASE/api/admin/leads/$ID" \
  -H 'Content-Type: application/json' -d '{"status":"not-a-status"}')
contains "unknown status is refused" 'Unknown status' "$R"

echo
echo "Photo access"

C=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/api/admin/photo/$KEY")
expect "photo requires a session" "401" "$C"

C=$(curl -s -b "$TMP/cookies" -o /dev/null -w '%{http_code}' "$BASE/api/admin/photo/$KEY")
expect "photo served with a session" "200" "$C"

C=$(curl -s -b "$TMP/cookies" -o /dev/null -w '%{http_code}' \
  "$BASE/api/admin/photo/secrets/private.png")
expect "key outside leads/ is refused" "404" "$C"

echo
echo "Export"

CSV=$(curl -s -b "$TMP/cookies" "$BASE/api/admin/export")
contains "CSV has a header row" "created_at,name,status" "$CSV"
contains "CSV contains the lead" "Smoke Test" "$CSV"

echo
echo "Rate limiting"

# One order already used; the limit is 5 per IP per hour.
for i in 2 3 4 5; do
  curl -s -o /dev/null -X POST "$BASE/api/order" -F "name=Rate $i" \
    -F "contactMethod=text" -F "phone=9045550142" \
    -F "eventDate=$FUTURE" -F "itemType=Cupcakes"
done
C=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/api/order" \
  -F "name=Rate 6" -F "contactMethod=text" -F "phone=9045550142" \
  -F "eventDate=$FUTURE" -F "itemType=Cupcakes")
expect "sixth order in an hour is rate limited" "429" "$C"

echo
echo "─────────────────────────────"
printf '%d passed, %d failed\n' "$PASS" "$FAIL"

# Restore any pre-existing .dev.vars
[ -f .dev.vars.smoke ] && mv .dev.vars.smoke .dev.vars

[ "$FAIL" -eq 0 ] || exit 1
