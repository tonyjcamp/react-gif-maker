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
RUN apk add ffmpeg curl \
  && curl -L "https://github.com/yt-dlp/yt-dlp/releases/download/2026.03.13/yt-dlp_linux" -o /usr/bin/yt-dlp \
  && echo "b15210c7791b8d473f8373f150a014194dbd7702ec4dd507e565411096a3284c  /usr/bin/yt-dlp" | sha256sum -c - \
  && chmod +x /usr/bin/yt-dlp \
  && mkdir -p /app && chown -R node:node /app
USER node
WORKDIR /app

COPY --chown=node:node --from=builder /app/.next/standalone ./
COPY --chown=node:node --from=builder /app/.next/static ./.next/static
COPY --chown=node:node --from=builder /app/public ./public

ENV FFMPEG_PATH=/usr/bin/ffmpeg
ENV YTDLP_PATH=/usr/bin/yt-dlp
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

EXPOSE 3000
CMD ["server.js"]
