# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm@9 --quiet

# Copy workspace manifests first (layer caching)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/server/package.json ./apps/server/
COPY apps/web/package.json    ./apps/web/

# Install ALL deps including devDeps needed to build
RUN pnpm install --frozen-lockfile

# Copy full source
COPY . .

# Build web (Vite) and server (tsc)
RUN pnpm --filter web build
RUN pnpm --filter server build

# ── Stage 2: Production runner ───────────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

RUN npm install -g pnpm@9 --quiet

# Copy workspace manifests — runner only needs server
COPY package.json pnpm-workspace.yaml ./
COPY apps/server/package.json ./apps/server/

# Install ONLY server production deps (no lockfile check, no devDeps)
RUN pnpm --filter server install --prod

# Copy built artifacts from builder
COPY --from=builder /app/apps/server/dist ./apps/server/dist
COPY --from=builder /app/apps/web/dist    ./apps/web/dist
COPY                server.js             ./server.js

# The app binds to PORT env var (injected at runtime) or falls back to 3000
EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

# Health check — wget is built into alpine
HEALTHCHECK --interval=15s --timeout=5s --start-period=25s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "server.js"]
