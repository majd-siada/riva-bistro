#!/usr/bin/env bash
# backup-postgres.sh — create a gzip-compressed pg_dump of the API database.
#
# Usage (on the API host, from the deploy repo root):
#   ./scripts/backup-postgres.sh
#   BACKUP_DIR=/var/backups/riva ./scripts/backup-postgres.sh
#
# Prefer DATABASE_URL when set; otherwise POSTGRES_* vars.
# Never prints passwords.

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-./backups}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUT="${BACKUP_DIR}/riva-bistro-${STAMP}.sql.gz"
KEEP="${BACKUP_KEEP:-14}"

mkdir -p "${BACKUP_DIR}"

if [[ -n "${DATABASE_URL:-}" ]]; then
  echo "INFO dumping via DATABASE_URL → ${OUT}"
  pg_dump --no-owner --format=plain "${DATABASE_URL}" | gzip -c > "${OUT}"
else
  : "${POSTGRES_HOST:=localhost}"
  : "${POSTGRES_PORT:=5432}"
  : "${POSTGRES_DB:?POSTGRES_DB or DATABASE_URL required}"
  : "${POSTGRES_USER:?POSTGRES_USER or DATABASE_URL required}"
  export PGPASSWORD="${POSTGRES_PASSWORD:-}"
  echo "INFO dumping ${POSTGRES_DB}@${POSTGRES_HOST} → ${OUT}"
  pg_dump -h "${POSTGRES_HOST}" -p "${POSTGRES_PORT}" -U "${POSTGRES_USER}" \
    --no-owner --format=plain "${POSTGRES_DB}" | gzip -c > "${OUT}"
fi

echo "OK  wrote ${OUT} ($(wc -c < "${OUT}") bytes)"

# Retention: keep newest KEEP dumps
if [[ "${KEEP}" =~ ^[0-9]+$ ]] && [[ "${KEEP}" -gt 0 ]]; then
  mapfile -t old < <(ls -1t "${BACKUP_DIR}"/riva-bistro-*.sql.gz 2>/dev/null | tail -n +$((KEEP + 1)) || true)
  for f in "${old[@]:-}"; do
    [[ -n "${f}" ]] || continue
    rm -f "${f}"
    echo "INFO pruned ${f}"
  done
fi

echo "OK  backup complete (keep=${KEEP})"
