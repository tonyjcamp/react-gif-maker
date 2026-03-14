import { NextRequest, NextResponse } from 'next/server'

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

  // Skip the --skip-download validation round trip — let /api/stream handle errors
  const streamURL = `/api/stream?url=${encodeURIComponent(url)}`
  return NextResponse.json({ videoURL: streamURL })
}
