# --------------------------------------------------------------
# 1️⃣ Builder – compile TypeScript, Next.js and the CLI
# --------------------------------------------------------------
FROM node:20-alpine AS builder

# Install build‑time tools required for native modules (e.g. better‑sqlite3)
RUN apk add --no-cache python3 make g++ gcc

WORKDIR /app

# Install dependencies (skip scripts to avoid native‑module compile on the host)
COPY package*.json ./
RUN npm ci --ignore-scripts

# Copy source files
COPY . .

# Build Next.js, TypeScript and the CLI
RUN npm run build

# --------------------------------------------------------------
# 2️⃣ Runtime – minimal image with only production deps
# --------------------------------------------------------------
FROM node:20-alpine AS runtime

ENV NODE_ENV=production
WORKDIR /app

# Copy only production dependencies (they were already installed in builder)
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev --ignore-scripts && \
    npm rebuild better-sqlite3 --build-from-source

# Copy compiled artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/bin ./bin

# Ensure the data directory exists (SQLite will create the DB file at runtime)
RUN mkdir -p data

EXPOSE 3000

CMD ["node", "dist/server.js"]
