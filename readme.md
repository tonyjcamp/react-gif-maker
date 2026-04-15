# React GIF Maker

Paste a video URL or YouTube link, trim a clip (up to 6 seconds), and generate an animated GIF.

## Requirements

- Node.js 18+
- ffmpeg
- yt-dlp (for YouTube URL support)

```bash
# macOS
brew install ffmpeg yt-dlp

# Ubuntu/Debian
sudo apt install ffmpeg
pip install yt-dlp
```

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Configuration

If ffmpeg or yt-dlp are installed at non-standard paths, set these in a `.env.local` file:

```
FFMPEG_PATH=/path/to/ffmpeg
YTDLP_PATH=/path/to/yt-dlp
```

By default both are expected on your system `PATH`, which is the case after a standard install via Homebrew or apt.

## How It Works

1. Paste a direct video URL (MP4) or a YouTube link and click Fetch
2. Play the video and use the arrow keys for frame-by-frame scrubbing
3. Click "Set Starting Point" and "Set Ending Point" to define your clip (max 6 seconds)
4. Click "Create Animated GIF" — the server uses ffmpeg to generate the GIF and returns it for download

YouTube URLs are proxied through the server to work around browser CORS restrictions.

## Deployment

This app requires a server environment with ffmpeg installed. It is not compatible with Vercel's serverless functions due to binary size and timeout constraints. Suitable options include:

- A VPS (DigitalOcean, Linode, etc.)
- A container platform (Fly.io, Render, Railway) with ffmpeg in the Dockerfile
- Any self-hosted Node.js server
- More soon...
