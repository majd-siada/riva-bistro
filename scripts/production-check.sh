#!/usr/bin/env bash
# production-check.sh — safe smoke checks for Riva Bistro production.
# Never prints secrets, .env contents, or DATABASE_URL.

set -euo pipefail

FRONTEND_URL="${FRONTEND_URL:-https://rivabistro.se}"
API_URL="${API_URL:-https://api.rivabistro.se}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.production.yml}"

pass=0
fail=0

ok() { echo "OK  $*"; pass=$((pass + 1)); }
bad() { echo "FAIL $*"; fail=$((fail + 1)); }

need_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    bad "missing command: $1"
    return 1
  fi
  return 0
}

http_code() {
  local url="$1"
  curl -sS -o /dev/null -w "%{http_code}" --max-time 20 "$url" || echo "000"
}

echo "Riva Bistro production check"
echo "Frontend: ${FRONTEND_URL}"
echo "API:      ${API_URL}"
echo

need_cmd curl || true

# --- Docker (optional; skip quietly if compose / docker unavailable) ---
if command -v docker >/dev/null 2>&1 && [[ -f "${COMPOSE_FILE}" ]]; then
  if docker compose -f "${COMPOSE_FILE}" ps >/dev/null 2>&1; then
    if docker compose -f "${COMPOSE_FILE}" ps | grep -q "backend"; then
      ok "docker compose backend service listed"
    else
      bad "docker compose backend service not listed"
    fi
  else
    echo "SKIP docker compose ps (not running or not reachable from here)"
  fi
else
  echo "SKIP local docker checks"
fi

# --- Frontend ---
code="$(http_code "${FRONTEND_URL}/")"
if [[ "${code}" == "200" ]]; then
  ok "frontend ${FRONTEND_URL}/ → ${code}"
else
  bad "frontend ${FRONTEND_URL}/ → ${code}"
fi

# --- API health ---
health_body="$(curl -sS --max-time 20 "${API_URL}/api/v1/health/" || true)"
health_code="$(http_code "${API_URL}/api/v1/health/")"
if [[ "${health_code}" == "200" ]] && echo "${health_body}" | grep -q '"status"[[:space:]]*:[[:space:]]*"ok"'; then
  ok "API health → 200 ok"
else
  bad "API health → ${health_code} body=${health_body:0:120}"
fi

if echo "${health_body}" | grep -Eq '"database"[[:space:]]*:[[:space:]]*"ok"'; then
  ok "database reported ok"
else
  bad "database not ok in health payload"
fi

# --- Menu ---
menu_code="$(http_code "${API_URL}/api/v1/menu/products/")"
if [[ "${menu_code}" == "200" ]]; then
  ok "menu products → ${menu_code}"
else
  bad "menu products → ${menu_code}"
fi

# --- Reservation availability (must respond; bookings may remain disabled) ---
avail_date="$(date -I -d '+2 days' 2>/dev/null || date -v+2d +%F 2>/dev/null || echo "")"
if [[ -n "${avail_date}" ]]; then
  avail_code="$(http_code "${API_URL}/api/v1/reservations/availability/?date=${avail_date}")"
  if [[ "${avail_code}" == "200" ]]; then
    ok "reservation availability → ${avail_code}"
  else
    bad "reservation availability → ${avail_code}"
  fi
else
  echo "SKIP availability date generation"
fi

echo
echo "Passed: ${pass}  Failed: ${fail}"
if [[ "${fail}" -gt 0 ]]; then
  exit 1
fi
exit 0
