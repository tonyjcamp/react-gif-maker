import { NextRequest, NextResponse } from 'next/server'
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

export async function POST(req: NextRequest) {
  const { url } = await req.json()

  if (!url || !isValidYouTubeURL(url)) {
    return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 })
  }

  try {
    // Validate the URL is accessible by checking video metadata
    await execFileAsync(ytDlpPath, ['--skip-download', '--quiet', url])
    const streamURL = `/api/stream?url=${encodeURIComponent(url)}`
    return NextResponse.json({ videoURL: streamURL })
  } catch (err) {
    console.error('yt-dlp error:', err)
    return NextResponse.json({ error: 'Failed to fetch video info' }, { status: 500 })
  }
}
