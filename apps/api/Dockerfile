# ── Stage 1: builder ─────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

RUN npm install -g pnpm

WORKDIR /app

# Workspace manifests first — maximises layer caching
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/config/package.json       ./packages/config/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY apps/api/package.json              ./apps/api/

RUN pnpm install --frozen-lockfile

# Source
COPY packages/ ./packages/
COPY apps/api/  ./apps/api/

# Generate Prisma client then compile TS (src/ only — seed.ts runs via tsx at runtime)
RUN pnpm --filter @homequest/api exec prisma generate && \
    pnpm --filter @homequest/api exec tsc -p tsconfig.json

# ── Stage 2: runtime ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runtime

RUN apk add --no-cache wget   # needed by the healthcheck

WORKDIR /app

# Copy node_modules from builder so prisma CLI is available for db push at startup
COPY --from=builder /app/node_modules          ./node_modules
COPY --from=builder /app/apps/api/dist         ./apps/api/dist
COPY apps/api/prisma/                          ./apps/api/prisma/
COPY apps/api/docker-entrypoint.sh             ./docker-entrypoint.sh

RUN chmod +x ./docker-entrypoint.sh && \
    mkdir -p /app/data

EXPOSE 3001

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "apps/api/dist/main.js"]
