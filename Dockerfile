# syntax=docker/dockerfile:1.7
# Multi-stage build for Next.js + Prisma + SQLite on Northflank.
# Targets a small runtime image using Next.js `output: 'standalone'`.

ARG NODE_IMAGE=node:20-alpine

# === deps: install full deps (incl. dev) for the build stage ============
FROM ${NODE_IMAGE} AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

# === builder: prisma generate + next build =============================
FROM ${NODE_IMAGE} AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1

# NEXT_PUBLIC_* vars must be present at build time: Next.js inlines them
# into the client bundle. Runtime env vars on Northflank arrive too late.
ARG NEXT_PUBLIC_VAPID_PUBLIC_KEY=""
ENV NEXT_PUBLIC_VAPID_PUBLIC_KEY=${NEXT_PUBLIC_VAPID_PUBLIC_KEY}

RUN npx prisma generate && npm run build

# === runner: minimal runtime image ====================================
FROM ${NODE_IMAGE} AS runner
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -S -g 1001 nodejs && adduser -S -u 1001 -G nodejs nextjs

# Next.js standalone server bundle
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Prisma artefacts needed at runtime: schema, migrations, CLI, generated client
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma

# Helper scripts run from the container shell or by Northflank scheduled jobs
COPY --from=builder --chown=nextjs:nodejs /app/scripts/cron-call.js ./scripts/cron-call.js
COPY --from=builder --chown=nextjs:nodejs /app/scripts/user-create.js ./scripts/user-create.js
# bcryptjs needed by user-create.js — Next standalone bundles it elsewhere
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/bcryptjs ./node_modules/bcryptjs

# Mount a Northflank volume here. SQLite file lives at /data/prod.db.
RUN mkdir -p /data && chown nextjs:nodejs /data
VOLUME /data

USER nextjs
EXPOSE 3000

# Apply pending migrations, then start the standalone Next.js server.
# Call the Prisma CLI launcher directly — node_modules/.bin is not copied
# into the runner image, so `npx prisma` would fail to resolve.
CMD ["sh", "-c", "node node_modules/prisma/build/index.js migrate deploy && node server.js"]
