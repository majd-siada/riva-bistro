#!/bin/sh
set -e

echo "Waiting for PostgreSQL..."

python <<'PY'
import os
import time
from urllib.parse import urlparse, unquote

import psycopg

database_url = os.environ.get("DATABASE_URL", "").strip()
if database_url:
    parsed = urlparse(database_url)
    host = parsed.hostname or "localhost"
    port = int(parsed.port or 5432)
    user = unquote(parsed.username) if parsed.username else "riva"
    password = unquote(parsed.password) if parsed.password else ""
    dbname = (parsed.path or "/").lstrip("/") or "riva_bistro"
else:
    host = os.environ.get("POSTGRES_HOST", "postgres")
    port = int(os.environ.get("POSTGRES_PORT", "5432"))
    user = os.environ.get("POSTGRES_USER", "riva")
    password = os.environ.get("POSTGRES_PASSWORD", "riva_dev_password")
    dbname = os.environ.get("POSTGRES_DB", "riva_bistro")

print(f"Connecting to PostgreSQL at {host}:{port}/{dbname} as {user}...")

deadline = time.time() + 60
while True:
    try:
        with psycopg.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            dbname=dbname,
            connect_timeout=3,
        ) as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1")
        print("PostgreSQL is ready.")
        break
    except Exception as exc:
        if time.time() > deadline:
            raise SystemExit(f"Timed out waiting for PostgreSQL: {exc}") from exc
        # Do not include connection credentials in the retry message.
        print(f"PostgreSQL unavailable ({exc.__class__.__name__}); retrying...")
        time.sleep(1)
PY

echo "Applying migrations..."
python manage.py migrate --noinput

# Collect static files for WhiteNoise when not in DEBUG (gunicorn / production).
debug_flag="$(printf '%s' "${DJANGO_DEBUG:-false}" | tr '[:upper:]' '[:lower:]')"
case "$debug_flag" in
  1|true|yes|on) ;;
  *)
    echo "Collecting static files..."
    python manage.py collectstatic --noinput
    ;;
esac

echo "Starting backend: $*"
exec "$@"
