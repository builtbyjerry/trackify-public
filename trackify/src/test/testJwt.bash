#!/usr/bin/env bash

set -u

: "${SUPABASE_URL:?Set SUPABASE_URL first}"
: "${SUPABASE_ANON_KEY:?Set SUPABASE_ANON_KEY first}"

FUNCTION_NAME="${1:?Usage: bash src/test/testJwt.bash <function-name>}"

URL="${SUPABASE_URL}/functions/v1/${FUNCTION_NAME}"

echo "Testing missing JWT..."
curl -sS -i \
  -X POST "$URL" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{}'

echo
echo
echo "Testing invalid JWT..."
curl -sS -i \
  -X POST "$URL" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer definitely-not-a-valid-jwt" \
  -H "Content-Type: application/json" \
  -d '{}'

echo

# This didn't reach the edge functions, got rejected by Supabase's gateway