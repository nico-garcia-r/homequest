#!/bin/sh
set -e

SEED_FLAG="/app/data/.seeded"

echo "⚙️  Applying schema..."
node_modules/.bin/prisma db push \
  --schema=apps/api/prisma/schema.prisma \
  --skip-generate \
  --accept-data-loss

if [ ! -f "$SEED_FLAG" ]; then
  echo "🌱 First run — seeding achievements..."
  node_modules/.bin/tsx apps/api/prisma/seed.ts
  touch "$SEED_FLAG"
  echo "✅ Seed complete"
fi

exec "$@"
