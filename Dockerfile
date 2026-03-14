# Stage 1: Install dependencies
FROM cgr.dev/chainguard/node:latest-dev AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2: Build Next.js
FROM cgr.dev/chainguard/node:latest-dev AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: ffmpeg source
FROM cgr.dev/chainguard/ffmpeg AS ffmpeg-source

# Stage 4: Runtime
FROM cgr.dev/chainguard/node:latest
WORKDIR /app

# Copy Next.js standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy ffmpeg binary and shared libraries from Chainguard ffmpeg image
COPY --from=ffmpeg-source /usr/bin/ffmpeg /usr/bin/ffmpeg
COPY --from=ffmpeg-source /usr/lib/ /usr/lib/

ENV FFMPEG_PATH=/usr/bin/ffmpeg
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

EXPOSE 3000
CMD ["node", "server.js"]
