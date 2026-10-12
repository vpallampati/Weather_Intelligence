# ====================================================================
# Dockerfile: Weather Intelligence App
# Multi-stage build for WSL Ubuntu / Linux & Container environments
# ====================================================================

# --------------------------------------------------------------------
# Stage 1: Build & Bundle
# --------------------------------------------------------------------
FROM node:22-slim AS builder

WORKDIR /app

# Copy dependency specifications
COPY package.json ./

# Install all dependencies (including build tools like Vite, esbuild, TypeScript)
RUN npm install

# Copy source code and build configs
COPY tsconfig.json vite.config.ts index.html ./
COPY public ./public
COPY src ./src
COPY server.ts ./

# Build client-side assets and compile Express server to dist/server.cjs
RUN npm run build

# --------------------------------------------------------------------
# Stage 2: Production Runtime
# --------------------------------------------------------------------
FROM node:22-slim AS runner

WORKDIR /app

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Install curl for container health check
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# Copy package.json and install production-only dependencies
COPY package.json ./
RUN npm install --omit=dev && npm cache clean --force

# Copy pre-compiled production build from the builder stage
COPY --from=builder /app/dist ./dist

# Switch to standard non-root user for security
USER node

# Expose server port (mapped to http://localhost:3000 on host)
EXPOSE 3000

# Container health monitoring
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start the application
CMD ["node", "dist/server.cjs"]
