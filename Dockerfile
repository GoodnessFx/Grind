# Use a lightweight Node.js image
FROM node:18-alpine AS builder
WORKDIR /app
# Copy package files and install dependencies
COPY package.json pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY apps/server/package.json ./apps/server/
COPY apps/web/package.json ./apps/web/
# Install pnpm
RUN npm install -g pnpm && pnpm install --frozen-lockfile
# Copy the rest of the source code
COPY . .
# Build both server and web
RUN pnpm build

# Production image
FROM node:18-alpine AS runner
WORKDIR /app
# Copy only the built artifacts and production deps
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/server/dist ./apps/server/dist
COPY --from=builder /app/apps/web/dist ./apps/web/dist
# Expose the port (platform will set PORT env)
EXPOSE $PORT
# Set environment to production
ENV NODE_ENV=production
# Start the server
CMD ["node", "server.js"]
