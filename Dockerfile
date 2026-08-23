# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9

# Copy workspace manifests first (for layer caching)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/server/package.json ./apps/server/
COPY apps/web/package.json ./apps/web/

# Install ALL deps (including devDeps needed for build)
RUN pnpm install --frozen-lockfile

# Copy full source
COPY . .

# Build web (Vite) and server (tsc) — skip postinstall to avoid double build
RUN pnpm --filter web build
RUN pnpm --filter server build

# ── Stage 2: Production runner ───────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

RUN npm install -g pnpm@9

# Copy workspace manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/server/package.json ./apps/server/
# Dummy web package.json so pnpm workspace resolves correctly
COPY apps/web/package.json ./apps/web/

# Install ONLY production deps
RUN pnpm install --frozen-lockfile --prod

# Copy built artifacts
COPY --from=builder /app/apps/server/dist ./apps/server/dist
COPY --from=builder /app/apps/web/dist    ./apps/web/dist
COPY --from=builder /app/server.js        ./server.js

# Hardcode port 8080 as fallback; Railway injects $PORT at runtime
EXPOSE 8080

ENV NODE_ENV=production

# Health check so Railway knows when the container is ready
HEALTHCHECK --interval=10s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:${PORT:-8080}/health || exit 1

CMD ["node", "server.js"]
