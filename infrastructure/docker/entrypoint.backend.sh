#!/bin/sh
set -e

echo "Waiting for PostgreSQL at ${POSTGRES_HOST:-postgres}:${POSTGRES_PORT:-5432}..."

python <<'PY'
import os
import time

import psycopg

host = os.environ.get("POSTGRES_HOST", "postgres")
port = int(os.environ.get("POSTGRES_PORT", "5432"))
user = os.environ.get("POSTGRES_USER", "riva")
password = os.environ.get("POSTGRES_PASSWORD", "riva_dev_password")
dbname = os.environ.get("POSTGRES_DB", "riva_bistro")

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
        print(f"PostgreSQL unavailable ({exc}); retrying...")
        time.sleep(1)
PY

echo "Applying migrations..."
python manage.py migrate --noinput

echo "Starting backend: $*"
exec "$@"
