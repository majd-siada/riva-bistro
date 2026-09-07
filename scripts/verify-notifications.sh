#!/usr/bin/env bash
# verify-notifications.sh — check notification env inside the production backend
# and optionally smoke-send Telegram + staff email.
#
# Run on the API host from the deploy repo root (typically /opt/riva-bistro).
# Never prints secrets.
#
# Usage:
#   ./scripts/verify-notifications.sh
#   ./scripts/verify-notifications.sh --send-test
#   COMPOSE_FILE=docker-compose.production.yml ./scripts/verify-notifications.sh

set -euo pipefail

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.production.yml}"
SERVICE="${SERVICE:-backend}"
DOCKER_BIN="${DOCKER_BIN:-docker}"
SEND_TEST=0

for arg in "$@"; do
  case "${arg}" in
    --send-test) SEND_TEST=1 ;;
    -h|--help)
      echo "Usage: $0 [--send-test]"
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
warn() { echo "WARN $*"; }

if [[ ! -f "${COMPOSE_FILE}" ]]; then
  fail "compose file not found: ${COMPOSE_FILE} (cwd=$(pwd))"
fi

compose() {
  # shellcheck disable=SC2086
  ${DOCKER_BIN} compose -f "${COMPOSE_FILE}" "$@"
}

info "Checking ${SERVICE} is running"
if ! compose ps --status running --services 2>/dev/null | grep -qx "${SERVICE}"; then
  # Older compose may not support --status; fall back to ps output.
  if ! compose ps 2>/dev/null | grep -E "${SERVICE}" | grep -qi "up\|running"; then
    warn "${SERVICE} does not look running — continuing anyway"
  fi
fi

info "Notification + SMTP env NAMES inside ${SERVICE} (values hidden)"
compose exec -T "${SERVICE}" python - <<'PY'
import os
keys = [
    "TELEGRAM_BOT_TOKEN",
    "TELEGRAM_CHAT_ID",
    "HOSTINGER_MAIL_API_TOKEN",
    "HOSTINGER_MAIL_MAILBOX_RESOURCE_ID",
    "RESTAURANT_NOTIFICATION_EMAIL",
    "EMAIL_HOST",
    "EMAIL_HOST_USER",
    "DEFAULT_FROM_EMAIL",
    "EMAIL_BACKEND",
]
empty = []
for k in keys:
    v = (os.environ.get(k) or "").strip()
    state = "SET" if v else "EMPTY"
    print(f"{k}: {state}")
    if not v and k != "EMAIL_BACKEND":
        empty.append(k)
if empty:
    print("EMPTY_KEYS=" + ",".join(empty))
PY

info "Required host .env keys (edit the host .env next to ${COMPOSE_FILE}, never commit):"
cat <<'EOF'
  TELEGRAM_BOT_TOKEN
  TELEGRAM_CHAT_ID
  HOSTINGER_MAIL_API_TOKEN
  HOSTINGER_MAIL_MAILBOX_RESOURCE_ID
  RESTAURANT_NOTIFICATION_EMAIL
  EMAIL_HOST EMAIL_PORT EMAIL_HOST_USER EMAIL_HOST_PASSWORD EMAIL_USE_TLS
  DEFAULT_FROM_EMAIL
  EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EOF

info "After editing host .env, recreate the backend so env_file is reloaded:"
echo "  docker compose -f ${COMPOSE_FILE} up -d --force-recreate ${SERVICE}"

if [[ "${SEND_TEST}" -eq 1 ]]; then
  info "Running manage.py check_notifications --send-test"
  if ! compose exec -T "${SERVICE}" python manage.py check_notifications --send-test; then
    warn "check_notifications failed — if TELEGRAM_CHAT_ID is EMPTY:"
    echo "  1. Message @RivaB_bot in Telegram"
    echo "  2. docker compose -f ${COMPOSE_FILE} exec ${SERVICE} python manage.py telegram_discover_chat"
    echo "  3. Put the chat id into host .env as TELEGRAM_CHAT_ID and recreate ${SERVICE}"
    exit 1
  fi
  ok "Smoke sends finished — check Telegram and the staff inbox"
else
  info "Dry run only. Re-run with --send-test after env is SET:"
  echo "  ./scripts/verify-notifications.sh --send-test"
fi

ok "Next: place a TEST booking on https://rivabistro.se/boka"
ok "Expect Telegram staff alert + staff email + guest confirmation email"
ok "API create body should include notifications.telegram / notifications.staff_email"
ok "Admin reservation row should show telegram_notified + staff_email_notified true"
info "If an old booking missed alerts, retry safely:"
echo "  docker compose -f ${COMPOSE_FILE} exec ${SERVICE} python manage.py resend_reservation_notifications --unsent"
