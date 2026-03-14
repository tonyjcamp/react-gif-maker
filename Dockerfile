# Stage 1: Install dependencies
FROM cgr.dev/0-cve.com/node:latest-dev AS deps
USER root
RUN mkdir -p /app && chown -R node:node /app
USER node
WORKDIR /app
COPY --chown=node:node package*.json ./
RUN npm ci

# Stage 2: Build Next.js
FROM cgr.dev/0-cve.com/node:latest-dev AS builder
USER root
RUN mkdir -p /app && chown -R node:node /app
USER node
WORKDIR /app
COPY --chown=node:node --from=deps /app/node_modules ./node_modules
COPY --chown=node:node . .
RUN npm run build

# Stage 3: ffmpeg source
FROM cgr.dev/0-cve.com/ffmpeg AS ffmpeg-source

# Stage 4: Runtime
FROM cgr.dev/0-cve.com/node:latest
USER root
RUN mkdir -p /app && chown -R node:node /app
USER node
WORKDIR /app

# Copy Next.js standalone output
COPY --chown=node:node --from=builder /app/.next/standalone ./
COPY --chown=node:node --from=builder /app/.next/static ./.next/static
COPY --chown=node:node --from=builder /app/public ./public

# Copy ffmpeg binary and shared libraries from Chainguard ffmpeg image
COPY --from=ffmpeg-source /usr/bin/ffmpeg /usr/bin/ffmpeg
COPY --from=ffmpeg-source /usr/lib/ /usr/lib/

ENV FFMPEG_PATH=/usr/bin/ffmpeg
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

EXPOSE 3000
CMD ["server.js"]
