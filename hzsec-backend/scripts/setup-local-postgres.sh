#!/usr/bin/env bash
# Spin up a local Postgres for development via Docker, then run Prisma's
# initial migration. Idempotent — running twice just confirms the container
# is up and re-applies pending migrations.
#
# Run:
#     cd hzsec-backend
#     bash scripts/setup-local-postgres.sh
#
# Requires Docker. If you don't have it: brew install --cask docker, then
# open Docker Desktop once.

set -euo pipefail

cd "$(dirname "$0")/.."

CONTAINER_NAME="hzsec-pg"
PG_PORT=5432
PG_PASSWORD=dev
PG_USER=postgres
PG_DB=hzsec_dev

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker not found. Install with: brew install --cask docker"
  echo "Then open Docker Desktop once before running this script."
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "Docker daemon not running. Open Docker Desktop and wait for it to start."
  exit 1
fi

# ─── Container ─────────────────────────────────────────────────────────────────
if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "Postgres container already running ✓"
elif docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "Starting existing Postgres container..."
  docker start "$CONTAINER_NAME" >/dev/null
else
  echo "Creating Postgres container..."
  docker run -d \
    --name "$CONTAINER_NAME" \
    -e "POSTGRES_PASSWORD=$PG_PASSWORD" \
    -e "POSTGRES_USER=$PG_USER" \
    -e "POSTGRES_DB=$PG_DB" \
    -p "$PG_PORT:5432" \
    --restart unless-stopped \
    postgres:16-alpine >/dev/null
  echo "Waiting 3s for Postgres to accept connections..."
  sleep 3
fi

# ─── .env ──────────────────────────────────────────────────────────────────────
DB_URL="postgresql://${PG_USER}:${PG_PASSWORD}@localhost:${PG_PORT}/${PG_DB}"
ENV_FILE=".env"
if grep -qE "^DATABASE_URL=" "$ENV_FILE"; then
  awk -v v="$DB_URL" 'BEGIN{FS=OFS="="} $1=="DATABASE_URL"{print "DATABASE_URL="v; next} {print}' "$ENV_FILE" > "$ENV_FILE.tmp"
  mv "$ENV_FILE.tmp" "$ENV_FILE"
else
  echo "DATABASE_URL=$DB_URL" >> "$ENV_FILE"
fi
echo "DATABASE_URL set to local Postgres."

# ─── Prisma ────────────────────────────────────────────────────────────────────
echo "Running prisma generate + migrate..."
export PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
npx --yes prisma generate
npx --yes prisma migrate dev --name init --skip-seed

echo ""
echo "Done. Local Postgres on :5432, schema applied."
echo "  container: $CONTAINER_NAME (docker stop $CONTAINER_NAME to halt)"
echo "  shell:     docker exec -it $CONTAINER_NAME psql -U $PG_USER $PG_DB"
