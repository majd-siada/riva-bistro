#!/usr/bin/env bash
# purge-personal-data.sh — run the 30-day privacy retention cleanup on the API host.
#
# Usage (from /opt/riva-bistro on the VPS):
#   ./scripts/purge-personal-data.sh
#   ./scripts/purge-personal-data.sh --dry-run
#
# Suggested cron (daily 03:15 UTC):
#   15 3 * * * cd /opt/riva-bistro && ./scripts/purge-personal-data.sh >>/var/log/riva-privacy-purge.log 2>&1
#
# Never prints guest names, emails, phones, or message bodies.

set -euo pipefail

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.production.yml}"
EXTRA_ARGS=()
if [[ "${1:-}" == "--dry-run" ]]; then
  EXTRA_ARGS+=(--dry-run)
fi

echo "INFO privacy purge via ${COMPOSE_FILE}"
docker compose -f "${COMPOSE_FILE}" exec -T backend \
  python manage.py purge_personal_data "${EXTRA_ARGS[@]+"${EXTRA_ARGS[@]}"}"
echo "OK privacy purge finished"
