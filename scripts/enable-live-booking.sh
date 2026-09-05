#!/usr/bin/env bash
# enable-live-booking.sh — flip ReservationSettings.production_ready=true on the VPS.
# Run on the API host from the deploy repo root (typically /opt/riva-bistro).
# Never prints secrets. Does not invent hours or reset the database.
#
# Usage:
#   ./scripts/enable-live-booking.sh
#   COMPOSE_FILE=docker-compose.production.yml ./scripts/enable-live-booking.sh

set -euo pipefail

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.production.yml}"
SERVICE="${SERVICE:-backend}"
DOCKER_BIN="${DOCKER_BIN:-docker}"
API_URL="${API_URL:-https://api.rivabistro.se}"

ok() { echo "OK  $*"; }
fail() { echo "FAIL $*"; exit 1; }
info() { echo "INFO $*"; }

if [[ ! -f "${COMPOSE_FILE}" ]]; then
  fail "compose file not found: ${COMPOSE_FILE} (cwd=$(pwd))"
fi

compose() {
  # shellcheck disable=SC2086
  ${DOCKER_BIN} compose -f "${COMPOSE_FILE}" "$@"
}

info "Checking notification-related env var NAMES inside ${SERVICE} (values hidden)"
compose exec -T "${SERVICE}" python - <<'PY'
import os
keys = [
    "TELEGRAM_BOT_TOKEN",
    "TELEGRAM_CHAT_ID",
    "HOSTINGER_MAIL_API_TOKEN",
    "HOSTINGER_MAIL_MAILBOX_RESOURCE_ID",
    "RESTAURANT_NOTIFICATION_EMAIL",
]
for k in keys:
    v = (os.environ.get(k) or "").strip()
    print(f"{k}: {'SET' if v else 'EMPTY'}")
PY

info "Setting production_ready=True"
compose exec -T "${SERVICE}" python manage.py shell -c "
from reservations.models import ReservationSettings
s = ReservationSettings.load()
s.production_ready = True
s.save(update_fields=['production_ready'])
print('production_ready=', ReservationSettings.load().production_ready)
"

ok "production_ready enabled in database"

info "Probing public availability (expect enabled=true)"
python3 - <<PY
from datetime import date, timedelta
import json, urllib.request
d = (date.today() + timedelta(days=2)).isoformat()
url = "${API_URL}/api/v1/reservations/availability/?date=" + d
with urllib.request.urlopen(url, timeout=20) as resp:
    data = json.load(resp)
print("date", data.get("date"), "enabled", data.get("enabled"), "closed", data.get("closed"), "slots", len(data.get("slots") or []))
if not data.get("enabled"):
    raise SystemExit("availability still enabled=false — check DJANGO_DEBUG/cache/proxy and container env")
PY

ok "Live booking gate is open (enabled=true)"
ok "Open https://rivabistro.se/boka and place a real or TEST reservation"
