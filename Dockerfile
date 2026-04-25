# syntax=docker/dockerfile:1

FROM node:20-alpine AS vendor
WORKDIR /app

COPY package.json package-lock.json ./
COPY scripts ./scripts
RUN npm ci --omit=dev

FROM nginx:1.27-alpine

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/10-env-js.sh /docker-entrypoint.d/10-env-js.sh

WORKDIR /usr/share/nginx/html

COPY index.html styles.css env.js env.local.js.example ./
COPY src ./src
COPY --from=vendor /app/vendor ./vendor

RUN cp env.local.js.example env.local.js \
  && chmod +x /docker-entrypoint.d/10-env-js.sh

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1

EXPOSE 80
