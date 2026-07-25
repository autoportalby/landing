# syntax=docker/dockerfile:1

# ---- Stage 1: install dependencies ----
FROM node:22-alpine AS deps
WORKDIR /app
# libc6-compat is needed by some native deps (e.g. Prisma engines) on Alpine
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
# Prisma's postinstall runs `prisma generate`, so the schema must be present
COPY prisma ./prisma
RUN npm ci

# ---- Stage 2: build the app ----
FROM node:22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Ensure the Prisma Client is generated against the schema before building
RUN npx prisma generate
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- Stage 3: minimal production runtime (standalone) ----
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Standalone server bundle + static assets + public files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
