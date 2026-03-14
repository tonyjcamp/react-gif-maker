import { NextRequest, NextResponse } from 'next/server'
import ffmpeg from 'fluent-ffmpeg'
import { spawn } from 'child_process'
import { promises as fs } from 'fs'
import dns from 'dns/promises'
import { isIP } from 'net'
import path from 'path'
import os from 'os'
import crypto from 'crypto'

const ffmpegPath = process.env.FFMPEG_PATH || 'ffmpeg'
const ytDlpPath = process.env.YTDLP_PATH || 'yt-dlp'
ffmpeg.setFfmpegPath(ffmpegPath)

// Rate limiting: 5 GIF requests per IP per minute
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 })
    return true
  }
  if (entry.count >= 5) return false
  entry.count++
  return true
}

function isValidYouTubeURL(url: string): boolean {
  try {
    const parsed = new URL(url)
    return (
      ['www.youtube.com', 'youtube.com', 'youtu.be', 'm.youtube.com'].includes(parsed.hostname) &&
      ['https:', 'http:'].includes(parsed.protocol)
    )
  } catch {
    return false
  }
}

// Block private/internal IP ranges to prevent SSRF
function isPrivateIP(ip: string): boolean {
  return [
    /^127\./,
    /^10\./,
    /^172\.(1[6-9]|2\d|3[01])\./,
    /^192\.168\./,
    /^169\.254\./,
    /^0\./,
    /^::1$/,
    /^fc/,
    /^fd/,
  ].some((r) => r.test(ip))
}

async function validateVideoURL(raw: string): Promise<boolean> {
  let parsed: URL
  try {
    parsed = new URL(raw)
  } catch {
    return false
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) return false

  const host = parsed.hostname
  if (isIP(host)) return !isPrivateIP(host)

  try {
    const { address } = await dns.lookup(host)
    return !isPrivateIP(address)
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests. Try again in a minute.' }, { status: 429 })
  }

  const { videoURL, inpoint, outpoint } = await req.json()

  if (!videoURL) {
    return NextResponse.json({ error: 'videoURL is required' }, { status: 400 })
  }

  if (typeof inpoint !== 'number' || typeof outpoint !== 'number' ||
      !isFinite(inpoint) || !isFinite(outpoint) || inpoint < 0 || outpoint < 0) {
    return NextResponse.json({ error: 'Invalid inpoint or outpoint' }, { status: 400 })
  }

  const duration = outpoint - inpoint
  if (duration <= 0) {
    return NextResponse.json({ error: 'Outpoint must come after inpoint' }, { status: 400 })
  }
  if (duration > 6) {
    return NextResponse.json({ error: 'GIF duration must be 6 seconds or less' }, { status: 400 })
  }

  // Extract the original YouTube URL if this came through the stream proxy
  let sourceURL = videoURL
  if (videoURL.startsWith('/api/stream')) {
    const params = new URL(videoURL, 'http://localhost').searchParams
    sourceURL = params.get('url') || videoURL
  }

  const isYouTube = isValidYouTubeURL(sourceURL)

  if (!isYouTube) {
    const safe = await validateVideoURL(sourceURL)
    if (!safe) {
      return NextResponse.json({ error: 'Invalid or disallowed video URL' }, { status: 400 })
    }
  }

  const tmpFile = path.join(os.tmpdir(), `gif-${crypto.randomUUID()}.gif`)

  try {
    await new Promise<void>((resolve, reject) => {
      const command = ffmpeg()

      if (isYouTube) {
        const ytDlp = spawn(ytDlpPath, [
          '-f', 'best[ext=mp4]/best',
          '-o', '-',
          '--no-playlist',
          '--js-runtimes', 'node',
          '--extractor-args', 'youtube:player_client=android_vr,android,web',
          sourceURL,
        ])
        command.input(ytDlp.stdout)
      } else {
        command.input(sourceURL)
      }

      command
        .setStartTime(inpoint)
        .setDuration(duration)
        .outputOptions([
          '-vf', 'fps=12,scale=480:-1:flags=lanczos',
          '-loop', '0',
        ])
        .output(tmpFile)
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .run()
    })

    const gifBuffer = await fs.readFile(tmpFile)
    await fs.unlink(tmpFile).catch(() => {})

    return new NextResponse(gifBuffer, {
      headers: {
        'Content-Type': 'image/gif',
        'Content-Disposition': 'inline; filename="output.gif"',
      },
    })
  } catch (err) {
    await fs.unlink(tmpFile).catch(() => {})
    console.error('ffmpeg error:', err)
    return NextResponse.json({ error: 'GIF generation failed' }, { status: 500 })
  }
}
