import { NextRequest } from 'next/server'
import { execFile } from 'child_process'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)
const ytDlpPath = process.env.YTDLP_PATH || 'yt-dlp'

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

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')

  if (!url || !isValidYouTubeURL(url)) {
    return new Response('Invalid YouTube URL', { status: 400 })
  }

  // Resolve the direct CDN URL server-side — it's tied to the server's IP
  // so we must proxy it rather than redirecting the browser directly
  let directURL: string
  try {
    const { stdout } = await execFileAsync(ytDlpPath, [
      '-g',
      '-f', 'best[ext=mp4][protocol=https]/best[ext=mp4]/18',
      '--no-playlist',
      '--js-runtimes', 'node',
      '--extractor-args', 'youtube:player_client=android_vr,android,web',
      url,
    ])
    directURL = stdout.trim()
  } catch (err) {
    console.error('yt-dlp error:', err)
    return new Response('Failed to resolve video URL', { status: 500 })
  }

  // Forward range requests so the browser can seek
  const headers: HeadersInit = {}
  const rangeHeader = req.headers.get('range')
  if (rangeHeader) headers['Range'] = rangeHeader

  const upstream = await fetch(directURL, { headers })

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      'Content-Type': upstream.headers.get('Content-Type') ?? 'video/mp4',
      'Content-Length': upstream.headers.get('Content-Length') ?? '',
      'Content-Range': upstream.headers.get('Content-Range') ?? '',
      'Accept-Ranges': 'bytes',
    },
  })
}
