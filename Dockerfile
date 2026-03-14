# Stage 1: Install dependencies
FROM cgr.dev/chainguard/node:latest-dev AS deps
USER root
RUN mkdir -p /app && chown -R node:node /app
USER node
WORKDIR /app
COPY --chown=node:node package*.json ./
RUN npm ci

# Stage 2: Build Next.js
FROM cgr.dev/chainguard/node:latest-dev AS builder
USER root
RUN mkdir -p /app && chown -R node:node /app
USER node
WORKDIR /app
COPY --chown=node:node --from=deps /app/node_modules ./node_modules
COPY --chown=node:node . .
RUN npm run build

# Stage 3: Runtime
FROM cgr.dev/chainguard/node:latest-dev
USER root
RUN apk add ffmpeg && mkdir -p /app && chown -R node:node /app
USER node
WORKDIR /app

COPY --chown=node:node --from=builder /app/.next/standalone ./
COPY --chown=node:node --from=builder /app/.next/static ./.next/static
COPY --chown=node:node --from=builder /app/public ./public

ENV FFMPEG_PATH=/usr/bin/ffmpeg
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

EXPOSE 3000
CMD ["server.js"]
