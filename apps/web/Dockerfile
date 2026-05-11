# ── Stage 1: builder ─────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

RUN npm install -g pnpm

WORKDIR /app

# Workspace manifests first — maximises layer caching
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/config/package.json       ./packages/config/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY apps/web/package.json              ./apps/web/

RUN pnpm install --frozen-lockfile

# Source
COPY packages/ ./packages/
COPY apps/web/  ./apps/web/

# Baked into the JS bundle at build time
ARG NEXT_PUBLIC_API_URL=http://192.168.0.105:3001
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN pnpm --filter @homequest/web exec next build

# ── Stage 2: runtime ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runtime

WORKDIR /app

# Standalone output is self-contained — no pnpm/node_modules needed
COPY --from=builder /app/apps/web/.next/standalone/ ./
COPY --from=builder /app/apps/web/.next/static       ./apps/web/.next/static
COPY --from=builder /app/apps/web/public             ./apps/web/public

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Next.js standalone puts server.js at the root of the output
CMD ["node", "apps/web/server.js"]
