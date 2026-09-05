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
# Official schedule (must match apps/backend/reservations/official_hours.py):
# Mon–Thu 10:30–21:00, Fri 11:30–00:00, Sat 10:30–23:00, Sun 10:30–21:00
hours_body="$(curl -sS --max-time 20 "${API_URL}/api/v1/hours/" || true)"
hours_code="$(http_code "${API_URL}/api/v1/hours/")"
if [[ "${hours_code}" == "200" ]]; then
  ok "hours → ${hours_code}"
  if command -v python3 >/dev/null 2>&1; then
    hours_check="$(
      HOURS_JSON="${hours_body}" python3 - <<'PY' 2>/dev/null || echo "unknown|parse_error"
import json, os
EXPECTED = {
    0: ("10:30:00", "21:00:00", False),
    1: ("10:30:00", "21:00:00", False),
    2: ("10:30:00", "21:00:00", False),
    3: ("10:30:00", "21:00:00", False),
    4: ("11:30:00", "00:00:00", False),
    5: ("10:30:00", "23:00:00", False),
    6: ("10:30:00", "21:00:00", False),
}
try:
    rows = json.loads(os.environ["HOURS_JSON"])
except Exception:
    print("unknown|parse_error")
    raise SystemExit
by = {int(r["weekday"]): r for r in rows}

def norm(v):
    if v is None:
        return None
    s = str(v)
    if len(s) == 5:
        return s + ":00"
    return s

open_days = 0
mismatches = []
for wd, (opens, closes, closed) in EXPECTED.items():
    row = by.get(wd)
    if not row:
        mismatches.append(f"missing weekday {wd}")
        continue
    is_closed = bool(row.get("is_closed"))
    got_opens = norm(row.get("opens_at"))
    got_closes = norm(row.get("closes_at"))
    if not is_closed and got_opens and got_closes:
        open_days += 1
        if is_closed != closed or got_opens != opens or got_closes != closes:
            mismatches.append(
                f"weekday {wd}: got {got_opens}-{got_closes} closed={is_closed}"
            )
detail = "|".join(mismatches) if mismatches else "ok"
print(f"{open_days}|{detail}")
PY
    )"
    hours_open="${hours_check%%|*}"
    hours_detail="${hours_check#*|}"
    if [[ "${hours_open}" == "0" ]]; then
      echo "WARN hours: no open weekdays with times — run seed_reservations (or Admin) to apply official schedule"
    elif [[ "${hours_open}" == "unknown" ]]; then
      echo "WARN hours: could not parse hours payload"
    elif [[ "${hours_detail}" == "ok" ]]; then
      ok "hours match official schedule (${hours_open} open weekdays)"
    else
      bad "hours do not match official schedule (${hours_detail})"
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
