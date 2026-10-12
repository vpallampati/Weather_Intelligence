#!/bin/bash
# setup-docker.sh - Recreates Docker configuration files locally
# Run with: bash setup-docker.sh

cat << 'EOF' > Dockerfile
# ====================================================================
# Dockerfile: Weather Intelligence App
# Multi-stage build for WSL Ubuntu / Linux & Container environments
# ====================================================================

# Stage 1: Build & Bundle
FROM node:22-slim AS builder
WORKDIR /app
COPY package.json ./
RUN npm install
COPY tsconfig.json vite.config.ts index.html ./
COPY public ./public
COPY src ./src
COPY server.ts ./
RUN npm run build

# Stage 2: Production Runtime
FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

COPY package.json ./
RUN npm install --omit=dev && npm cache clean --force
COPY --from=builder /app/dist ./dist

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["node", "dist/server.cjs"]
EOF

cat << 'EOF' > .dockerignore
node_modules
dist
.git
.gitignore
.env
.env.local
bun.lock
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.DS_Store
*.md
EOF

cat << 'EOF' > docker-compose.yml
services:
  weather-app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: weather-intelligence-app
    restart: unless-stopped
    ports:
      - "8080:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - GEMINI_API_KEY=${GEMINI_API_KEY:-}
    env_file:
      - path: .env
        required: false
EOF

echo "✓ Created Dockerfile, .dockerignore, and docker-compose.yml successfully!"
