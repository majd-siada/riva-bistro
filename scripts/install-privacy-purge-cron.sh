#!/usr/bin/env bash
# install-privacy-purge-cron.sh — idempotently install the daily privacy purge cron on the VPS.
#
# Run ONCE on the API host as the deploy user that can docker-compose exec into riva-backend:
#   cd /opt/riva-bistro && ./scripts/install-privacy-purge-cron.sh
#
# Does not print secrets. Does not start Compose postgres. Does not restart services.
# Safe to re-run (replaces only the marked Riva privacy-purge line).

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MARKER="# riva-bistro-privacy-purge"
CRON_LINE="15 3 * * * cd ${ROOT} && ./scripts/purge-personal-data.sh >>/var/log/riva-privacy-purge.log 2>&1 ${MARKER}"
LOG_FILE="/var/log/riva-privacy-purge.log"

if [[ ! -f "${ROOT}/scripts/purge-personal-data.sh" ]]; then
  echo "ERROR missing ${ROOT}/scripts/purge-personal-data.sh" >&2
  exit 1
fi

if [[ ! -f "${ROOT}/docker-compose.production.yml" ]]; then
  echo "ERROR expected production compose at ${ROOT}/docker-compose.production.yml" >&2
  exit 1
fi

chmod +x "${ROOT}/scripts/purge-personal-data.sh"

# Ensure log file exists and is writable by this user (best-effort).
if [[ ! -f "${LOG_FILE}" ]]; then
  if touch "${LOG_FILE}" 2>/dev/null; then
    echo "INFO created ${LOG_FILE}"
  else
    echo "WARN could not create ${LOG_FILE} — cron may fail to append logs (fix permissions)" >&2
  fi
fi

EXISTING="$(crontab -l 2>/dev/null || true)"
FILTERED="$(printf '%s\n' "${EXISTING}" | grep -vF "${MARKER}" || true)"
NEW_CRON="$(printf '%s\n%s\n' "${FILTERED}" "${CRON_LINE}" | sed '/^$/d')"

printf '%s\n' "${NEW_CRON}" | crontab -
echo "OK privacy purge cron installed:"
crontab -l | grep -F "${MARKER}" || {
  echo "ERROR cron line missing after install" >&2
  exit 1
}

echo "INFO dry-run (counts only, no PII):"
"${ROOT}/scripts/purge-personal-data.sh" --dry-run

echo "OK install complete — schedule: daily 03:15 (server local time)"
