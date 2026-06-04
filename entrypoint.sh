#!/bin/bash

# First run the official Postgres entrypoint to initialize and start the database
postgres-entrypoint.sh postgres &

# Wait for Postgres to be ready
POSTGRES_STATUS=1
while [ $POSTGRES_STATUS -ne 0 ]; do
  echo "Waiting for PostgreSQL to start..."
  pg_isready -U devsim -d devsim > /dev/null 2>&1
  POSTGRES_STATUS=$?
  sleep 1
done

echo "✅ PostgreSQL is ready!"

if [ $# -eq 0 ]; then
  exec tail -f /dev/null
else
  exec "$@"
fi
