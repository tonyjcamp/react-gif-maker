import { NextRequest } from 'next/server'
import { spawn } from 'child_process'
import { Readable } from 'stream'

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

  const ytDlp = spawn(ytDlpPath, [
    '-f', 'best[ext=mp4]/best',
    '-o', '-',
    '--no-playlist',
    url,
  ])

  const webStream = Readable.toWeb(ytDlp.stdout) as ReadableStream

  return new Response(webStream, {
    headers: {
      'Content-Type': 'video/mp4',
      'Transfer-Encoding': 'chunked',
    },
  })
}
