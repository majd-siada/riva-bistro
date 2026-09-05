#!/usr/bin/env bash
# vps-parity-check.sh — verify VPS checkout + telegram_discover_chat in the
# production backend container. Rebuilds the backend image if the command is
# missing. Never prints secrets. Never flips production_ready.
#
# Run on the VPS from the repo root (typically /opt/riva-bistro):
#   ./scripts/vps-parity-check.sh
#
# Optional:
#   EXPECTED_SHA=<full-sha> ./scripts/vps-parity-check.sh
#   VPS_PARITY_REBUILD=0 ./scripts/vps-parity-check.sh   # check only, no rebuild

set -euo pipefail

EXPECTED_SHA="${EXPECTED_SHA:-db23b7586e1756a3ffa0c7158ee5c4859efab7c8}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.production.yml}"
SERVICE="${SERVICE:-backend}"
ALLOW_REBUILD="${VPS_PARITY_REBUILD:-1}"
# Override when the docker CLI needs elevation, e.g. DOCKER_BIN="sudo docker"
DOCKER_BIN="${DOCKER_BIN:-docker}"

ok() { echo "OK  $*"; }
fail() { echo "FAIL $*"; exit 1; }
info() { echo "INFO $*"; }

compose() {
  # shellcheck disable=SC2086
  ${DOCKER_BIN} compose -f "${COMPOSE_FILE}" "$@"
}

if [[ ! -f "${COMPOSE_FILE}" ]]; then
  fail "compose file not found: ${COMPOSE_FILE} (cwd=$(pwd))"
fi

if ! command -v git >/dev/null 2>&1; then
  fail "git is required"
fi
if ! ${DOCKER_BIN} version >/dev/null 2>&1; then
  fail "docker is not usable via DOCKER_BIN='${DOCKER_BIN}'"
fi

HEAD="$(git rev-parse HEAD)"
info "cwd=$(pwd)"
info "HEAD=${HEAD}"
info "expected=${EXPECTED_SHA}"

if [[ "${HEAD}" != "${EXPECTED_SHA}" ]]; then
  info "HEAD does not match expected SHA — attempting git fetch + ff-only to origin/main"
  git fetch origin main
  git merge --ff-only "origin/main"
  HEAD="$(git rev-parse HEAD)"
  info "HEAD after sync=${HEAD}"
  if [[ "${HEAD}" == "${EXPECTED_SHA}" ]]; then
    ok "HEAD matches expected audit SHA"
  else
    info "origin/main is ${HEAD} (audit expected ${EXPECTED_SHA}). Continuing with current origin/main."
  fi
else
  ok "HEAD matches expected audit SHA"
fi

command_present() {
  compose exec -T "${SERVICE}" \
    python manage.py help telegram_discover_chat >/dev/null 2>&1
}

if command_present; then
  ok "telegram_discover_chat is available in ${SERVICE} container"
  compose exec -T "${SERVICE}" \
    python manage.py help telegram_discover_chat | head -n 8
  ok "parity check complete (production_ready was not modified)"
  exit 0
fi

info "telegram_discover_chat missing from running container"

if [[ "${ALLOW_REBUILD}" != "1" ]]; then
  fail "command missing and VPS_PARITY_REBUILD=${ALLOW_REBUILD} — rebuild skipped"
fi

info "rebuilding and restarting production backend from current checkout"
compose build "${SERVICE}"
compose up -d "${SERVICE}"

# Give entrypoint time to migrate / boot
sleep 5

if ! command_present; then
  fail "telegram_discover_chat still missing after rebuild — inspect container image and INSTALLED_APPS"
fi

ok "telegram_discover_chat available after rebuild"
compose exec -T "${SERVICE}" \
  python manage.py help telegram_discover_chat | head -n 8
ok "parity check complete after rebuild (production_ready was not modified)"
