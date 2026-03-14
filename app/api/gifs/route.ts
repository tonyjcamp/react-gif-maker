import { NextRequest, NextResponse } from 'next/server'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegStatic from 'ffmpeg-static'
import ytdl from '@distube/ytdl-core'
import { promises as fs } from 'fs'
import path from 'path'
import os from 'os'

ffmpeg.setFfmpegPath(ffmpegStatic as string)

export async function POST(req: NextRequest) {
  const { videoURL, inpoint, outpoint } = await req.json()

  if (!videoURL) {
    return NextResponse.json({ error: 'videoURL is required' }, { status: 400 })
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

  const isYouTube = ytdl.validateURL(sourceURL)
  const tmpFile = path.join(os.tmpdir(), `gif-${Date.now()}.gif`)

  try {
    await new Promise<void>((resolve, reject) => {
      const command = ffmpeg()

      if (isYouTube) {
        const ytStream = ytdl(sourceURL, {
          quality: 'highestvideo',
          filter: (f) => f.container === 'mp4' && !!f.hasAudio,
        })
        command.input(ytStream)
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
