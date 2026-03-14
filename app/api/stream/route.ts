import { NextRequest } from 'next/server'
import { execFile } from 'child_process'
import { promisify } from 'util'
import { ytDlpPath, baseArgs, writeCookieFile, deleteCookieFile } from '../ytdlp'

const execFileAsync = promisify(execFile)

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

  const cookiePath = await writeCookieFile()
  let directURL: string
  try {
    const args = [
      '-g',
      '-f', 'best[ext=mp4][protocol=https]/best[ext=mp4]/18',
      ...baseArgs,
      ...(cookiePath ? ['--cookies', cookiePath] : []),
      url,
    ]
    const { stdout } = await execFileAsync(ytDlpPath, args)
    directURL = stdout.trim()
  } catch (err) {
    console.error('yt-dlp error:', err)
    return new Response('Failed to resolve video URL', { status: 500 })
  } finally {
    await deleteCookieFile(cookiePath)
  }

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
