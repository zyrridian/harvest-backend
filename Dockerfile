# Dockerfile for Harvest Backend (Next.js + Socket.io)

# 1. BASE
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 2. DEPENDENCIES
FROM base AS deps
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm ci

# 3. BUILDER
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
RUN npm run build

# 4. RUNNER
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy everything for maximum compatibility with server.ts imports
COPY --from=builder /app ./

# Expose port and start via custom server
EXPOSE 3000
CMD ["npx", "tsx", "server.ts"]
