#!/bin/bash

if [ "$SKIP_POSTGRES" = "true" ]; then
  echo "SKIP_POSTGRES=true — skipping PostgreSQL startup (using host database)"
else
  postgres-entrypoint.sh postgres &

  POSTGRES_STATUS=1
  while [ $POSTGRES_STATUS -ne 0 ]; do
    echo "Waiting for PostgreSQL to start..."
    pg_isready -U devsim -d devsim > /dev/null 2>&1
    POSTGRES_STATUS=$?
    sleep 1
  done

  echo "✅ PostgreSQL is ready!"
fi

if [ $# -eq 0 ]; then
  exec tail -f /dev/null
else
  exec "$@"
fi
