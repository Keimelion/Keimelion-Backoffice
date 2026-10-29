# syntax=docker/dockerfile:1
# Requires the `api-src` build context (Keimelion-API/src) for the @keimelion/api/* alias:
#   docker build --build-context api-src=../Keimelion-API/src .

FROM node:24-alpine AS deps
WORKDIR /build/Keimelion-Backoffice
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL} \
    NEXT_TELEMETRY_DISABLED=1
COPY --from=api-src . /build/Keimelion-API/src
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1
COPY --from=build --chown=node:node /build/Keimelion-Backoffice/package.json /build/Keimelion-Backoffice/next.config.ts ./
COPY --from=build --chown=node:node /build/Keimelion-Backoffice/node_modules ./node_modules
COPY --from=build --chown=node:node /build/Keimelion-Backoffice/.next ./.next
USER node
EXPOSE 3001
CMD ["npm", "start"]
