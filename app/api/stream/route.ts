import { NextRequest } from 'next/server'
import ytdl from '@distube/ytdl-core'
import { Readable } from 'stream'

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')

  if (!url || !ytdl.validateURL(url)) {
    return new Response('Invalid YouTube URL', { status: 400 })
  }

  const nodeStream = ytdl(url, {
    quality: 'highestvideo',
    filter: (f) => f.container === 'mp4' && !!f.hasAudio,
  })

  const webStream = Readable.toWeb(nodeStream) as ReadableStream

  return new Response(webStream, {
    headers: {
      'Content-Type': 'video/mp4',
      'Transfer-Encoding': 'chunked',
    },
  })
}
