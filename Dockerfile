# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

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
FROM node:22-alpine AS runner

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

# Expose both common ports; the app binds PORT env or 3000 by default
EXPOSE 3000 8080

ENV NODE_ENV=production
ENV PORT=3000

# Health check so Railway knows when the container is ready
HEALTHCHECK --interval=10s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:${PORT:-3000}/health || exit 1

CMD ["node", "server.js"]
