import { NextRequest, NextResponse } from 'next/server'
import ytdl from '@distube/ytdl-core'

export async function POST(req: NextRequest) {
  const { url } = await req.json()

  if (!url || !ytdl.validateURL(url)) {
    return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 })
  }

  try {
    // Validate the URL is accessible before returning the stream proxy URL
    await ytdl.getBasicInfo(url)
    const streamURL = `/api/stream?url=${encodeURIComponent(url)}`
    return NextResponse.json({ videoURL: streamURL })
  } catch (err) {
    console.error('ytdl error:', err)
    return NextResponse.json({ error: 'Failed to fetch video info' }, { status: 500 })
  }
}
