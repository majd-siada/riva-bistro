#!/usr/bin/env bash
# restore-postgres.sh — restore a gzip SQL dump into Postgres.
#
# DANGEROUS: overwrites application data. Run only with explicit intent.
#
# Usage:
#   ./scripts/restore-postgres.sh ./backups/riva-bistro-YYYYMMDD.sql.gz
#
# Requires CONFIRM_RESTORE=YES in the environment.

set -euo pipefail

DUMP="${1:-}"
if [[ -z "${DUMP}" || ! -f "${DUMP}" ]]; then
  echo "FAIL usage: $0 <dump.sql.gz>" >&2
  exit 1
fi

if [[ "${CONFIRM_RESTORE:-}" != "YES" ]]; then
  echo "FAIL set CONFIRM_RESTORE=YES to proceed (destructive)." >&2
  exit 1
fi

echo "WARN restoring ${DUMP} — this replaces database contents"

if [[ -n "${DATABASE_URL:-}" ]]; then
  gunzip -c "${DUMP}" | psql "${DATABASE_URL}"
else
  : "${POSTGRES_HOST:=localhost}"
  : "${POSTGRES_PORT:=5432}"
  : "${POSTGRES_DB:?POSTGRES_DB or DATABASE_URL required}"
  : "${POSTGRES_USER:?POSTGRES_USER or DATABASE_URL required}"
  export PGPASSWORD="${POSTGRES_PASSWORD:-}"
  gunzip -c "${DUMP}" | psql -h "${POSTGRES_HOST}" -p "${POSTGRES_PORT}" \
    -U "${POSTGRES_USER}" -d "${POSTGRES_DB}"
fi

echo "OK  restore finished from ${DUMP}"
echo "INFO verify with: python manage.py check && curl -fsS https://api.rivabistro.se/api/v1/health/"
