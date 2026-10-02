# ---- build ----------------------------------------------------------------
FROM node:22-alpine AS builder

WORKDIR /app

# Workspace manifests first — layer caching for installs.
COPY package.json package-lock.json* ./
COPY packages/config/package.json packages/config/
COPY packages/types/package.json packages/types/
COPY apps/api/package.json apps/api/

RUN npm ci --include=dev --workspace @natsu/api --include-workspace-root || npm install --no-audit --no-fund

# Sources
COPY packages ./packages
COPY apps/api ./apps/api

RUN npx prisma generate --schema apps/api/prisma/schema.prisma
RUN npm run build -w @natsu/api

# ---- runtime --------------------------------------------------------------
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

RUN apk add --no-cache openssl dumb-init

COPY package.json package-lock.json* ./
COPY packages/config/package.json packages/config/
COPY packages/types/package.json packages/types/
COPY apps/api/package.json apps/api/
COPY apps/api/prisma ./apps/api/prisma

RUN npm install --omit=dev --no-audit --no-fund --workspace @natsu/api --include-workspace-root \
    && npx prisma generate --schema apps/api/prisma/schema.prisma \
    && npm cache clean --force

COPY --from=builder /app/apps/api/dist ./apps/api/dist

RUN mkdir -p /app/apps/api/uploads

WORKDIR /app/apps/api
EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:4000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
