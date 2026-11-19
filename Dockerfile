# syntax=docker/dockerfile:1

FROM node:24-alpine AS deps
WORKDIR /build
ENV HUSKY=0
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS build
ARG NEXT_PUBLIC_API_URL
ARG GIT_SHA=""
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL} \
    GIT_SHA=${GIT_SHA} \
    NEXT_TELEMETRY_DISABLED=1
COPY . .
RUN mkdir -p public && npm run build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3001 \
    HOSTNAME=0.0.0.0
COPY --from=build --chown=node:node /build/.next/standalone ./
COPY --from=build --chown=node:node /build/.next/static ./.next/static
COPY --from=build --chown=node:node /build/public ./public
USER node
EXPOSE 3001
CMD ["node", "server.js"]
