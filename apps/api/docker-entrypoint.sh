#!/bin/sh
set -e

echo "⚙️  Applying schema..."

if [ "${PRISMA_DB_PUSH_ACCEPT_DATA_LOSS:-false}" = "true" ]; then
  echo "⚠️  Using prisma db push with --accept-data-loss because PRISMA_DB_PUSH_ACCEPT_DATA_LOSS=true"
  node_modules/.bin/prisma db push \
    --schema=apps/api/prisma/schema.prisma \
    --skip-generate \
    --accept-data-loss
else
  node_modules/.bin/prisma migrate deploy \
    --schema=apps/api/prisma/schema.prisma
fi

echo "🌱 Seeding..."
node_modules/.bin/tsx apps/api/prisma/seed.ts
echo "✅ Seed complete"

exec "$@"
