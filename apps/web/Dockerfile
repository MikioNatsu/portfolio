# ---- build ----------------------------------------------------------------
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
COPY packages/config/package.json packages/config/
COPY packages/types/package.json packages/types/
COPY apps/web/package.json apps/web/

RUN npm install --no-audit --no-fund

COPY packages ./packages
COPY apps/web ./apps/web

# Same-origin API: nginx proxies /api to the api service.
ENV VITE_API_URL=""
RUN npm run build -w @natsu/web

# ---- runtime --------------------------------------------------------------
FROM nginx:1.27-alpine AS runner

COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
