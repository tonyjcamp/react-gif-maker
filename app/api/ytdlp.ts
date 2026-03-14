import { writeFile, unlink } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import crypto from 'crypto'

export const ytDlpPath = process.env.YTDLP_PATH || 'yt-dlp'

// Base args used for all yt-dlp calls
export const baseArgs = [
  '--no-playlist',
  '--js-runtimes', 'node',
  '--extractor-args', 'youtube:player_client=tv_embedded,android_vr,web',
]

// Write YOUTUBE_COOKIES env var to a temp file and return its path.
// Caller is responsible for deleting it after use.
export async function writeCookieFile(): Promise<string | null> {
  const cookies = process.env.YOUTUBE_COOKIES
  if (!cookies) return null
  const cookiePath = join(tmpdir(), `yt-cookies-${crypto.randomUUID()}.txt`)
  await writeFile(cookiePath, cookies, 'utf8')
  return cookiePath
}

export async function deleteCookieFile(path: string | null) {
  if (path) await unlink(path).catch(() => {})
}
