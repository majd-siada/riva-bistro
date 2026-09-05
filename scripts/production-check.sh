#!/usr/bin/env bash
# production-check.sh — safe smoke checks for Riva Bistro production.
# Never prints secrets, .env contents, DATABASE_URL, tokens, or SSH keys.

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

tls_ok() {
  local host="$1"
  # Verify certificate presents without printing private material.
  echo | openssl s_client -servername "${host}" -connect "${host}:443" 2>/dev/null \
    | openssl x509 -noout -dates >/dev/null 2>&1
}

echo "Riva Bistro production check"
echo "Frontend: ${FRONTEND_URL}"
echo "API:      ${API_URL}"
echo

need_cmd curl || true

# --- Docker (optional; skip quietly if compose / docker unavailable) ---
if command -v docker >/dev/null 2>&1 && [[ -f "${COMPOSE_FILE}" ]]; then
  if docker compose -f "${COMPOSE_FILE}" ps >/dev/null 2>&1; then
    compose_ps="$(docker compose -f "${COMPOSE_FILE}" ps 2>/dev/null || true)"
    if echo "${compose_ps}" | grep -Eqi "backend"; then
      ok "docker compose backend service listed"
    else
      bad "docker compose backend service not listed"
    fi
    if echo "${compose_ps}" | grep -Eqi "web|frontend"; then
      ok "docker compose frontend/web service listed"
    else
      echo "SKIP docker frontend/web (not in this compose file or not running)"
    fi
  else
    echo "SKIP docker compose ps (not running or not reachable from here)"
  fi
else
  echo "SKIP local docker checks"
fi

# --- HTTPS / TLS ---
api_host="${API_URL#https://}"
api_host="${api_host#http://}"
api_host="${api_host%%/*}"
front_host="${FRONTEND_URL#https://}"
front_host="${front_host#http://}"
front_host="${front_host%%/*}"

if command -v openssl >/dev/null 2>&1; then
  if tls_ok "${api_host}"; then
    ok "HTTPS certificate readable for ${api_host}"
  else
    bad "HTTPS certificate check failed for ${api_host}"
  fi
  if tls_ok "${front_host}"; then
    ok "HTTPS certificate readable for ${front_host}"
  else
    bad "HTTPS certificate check failed for ${front_host}"
  fi
else
  echo "SKIP openssl TLS checks"
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
for path in \
  "/api/v1/menu/products/" \
  "/api/v1/menu/categories/" \
  "/api/v1/menu/featured/"
do
  menu_code="$(http_code "${API_URL}${path}")"
  if [[ "${menu_code}" == "200" ]]; then
    ok "${path} → ${menu_code}"
  else
    bad "${path} → ${menu_code}"
  fi
done

# --- Hours ---
hours_body="$(curl -sS --max-time 20 "${API_URL}/api/v1/hours/" || true)"
hours_code="$(http_code "${API_URL}/api/v1/hours/")"
if [[ "${hours_code}" == "200" ]]; then
  ok "hours → ${hours_code}"
  # Soft signal only: all-closed weeks block online slots, but may be intentional.
  if command -v python3 >/dev/null 2>&1; then
    hours_open="$(printf '%s' "${hours_body}" | python3 -c '
import json,sys
try:
    rows=json.load(sys.stdin)
except Exception:
    print("unknown"); raise SystemExit
open_days=sum(1 for r in rows if not r.get("is_closed") and r.get("opens_at") and r.get("closes_at"))
print(open_days)
' 2>/dev/null || echo "unknown")"
    if [[ "${hours_open}" == "0" ]]; then
      echo "WARN hours: no open weekdays with times — availability slots will stay empty until Admin/seed fills hours"
    elif [[ "${hours_open}" != "unknown" ]]; then
      ok "hours include ${hours_open} open weekday(s)"
    fi
  fi
else
  bad "hours → ${hours_code}"
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
