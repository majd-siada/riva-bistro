#!/usr/bin/env bash
# enable-live-telegram.sh — one-shot enablement for production staff Telegram alerts.
#
# Run ON the API VPS from the deploy repo root (next to docker-compose.production.yml).
# Never prints secret values. Never commits .env.
#
# Prerequisites:
#   - Host .env contains TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID
#   - You have messaged @RivaB_bot at least once (private chat)
#
# Usage:
#   ./scripts/enable-live-telegram.sh
#   ./scripts/enable-live-telegram.sh --skip-pull

set -euo pipefail

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.production.yml}"
SERVICE="${SERVICE:-backend}"
SKIP_PULL=0

for arg in "$@"; do
  case "${arg}" in
    --skip-pull) SKIP_PULL=1 ;;
    -h|--help)
      echo "Usage: $0 [--skip-pull]"
      exit 0
      ;;
    *)
      echo "Unknown argument: ${arg}" >&2
      exit 1
      ;;
  esac
done

ok() { echo "OK  $*"; }
fail() { echo "FAIL $*"; exit 1; }
info() { echo "INFO $*"; }

[[ -f "${COMPOSE_FILE}" ]] || fail "compose file not found: ${COMPOSE_FILE} (cwd=$(pwd))"
[[ -f .env ]] || fail "host .env not found next to ${COMPOSE_FILE}"

if [[ "${SKIP_PULL}" -eq 0 ]]; then
  info "Pulling latest main (notification code + this script)"
  git fetch origin main
  git checkout main
  git pull --ff-only origin main
fi

info "Checking Telegram keys exist in host .env (values hidden)"
python3 - <<'PY'
from pathlib import Path
vals = {}
for line in Path(".env").read_text(encoding="utf-8").splitlines():
    line = line.strip()
    if not line or line.startswith("#") or "=" not in line:
        continue
    k, _, v = line.partition("=")
    vals[k.strip()] = v.strip().strip('"').strip("'")
missing = [k for k in ("TELEGRAM_BOT_TOKEN", "TELEGRAM_CHAT_ID") if not vals.get(k)]
for k in ("TELEGRAM_BOT_TOKEN", "TELEGRAM_CHAT_ID"):
    print(f"{k}: {'SET' if vals.get(k) else 'EMPTY'}")
if missing:
    raise SystemExit(
        "EMPTY Telegram keys in .env: "
        + ",".join(missing)
        + "\nMessage @RivaB_bot, then: docker compose -f docker-compose.production.yml exec backend python manage.py telegram_discover_chat"
    )
print("host_env_ok")
PY

info "Rebuilding/recreating ${SERVICE} so env_file and code reload"
docker compose -f "${COMPOSE_FILE}" up -d --build --force-recreate "${SERVICE}"

info "Applying migrations (telegram_notified flags)"
docker compose -f "${COMPOSE_FILE}" exec -T "${SERVICE}" python manage.py migrate --noinput

info "Smoke-testing Telegram"
./scripts/verify-notifications.sh --send-test

ok "Telegram smoke done — check your phone"
ok "Next: place a test booking on https://rivabistro.se/boka"
ok "Create response must include notifications.telegram=true"
ok "Admin /admin/bokningar should show telegram_notified"
info "If an older booking missed alerts:"
echo "  docker compose -f ${COMPOSE_FILE} exec ${SERVICE} python manage.py resend_reservation_notifications --unsent"
