'use client'

import { useRef, useState } from 'react'
import VideoInput from './components/VideoInput'
import VideoPlayer from './components/VideoPlayer'
import ButtonSetInpoint from './components/ButtonSetInpoint'
import ButtonSetOutpoint from './components/ButtonSetOutpoint'
import PreviewPoint from './components/PreviewPoint'
import FinishedImage from './components/FinishedImage'

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoURL, setVideoURL] = useState('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4')
  const [inpoint, setInpoint] = useState(0)
  const [outpoint, setOutpoint] = useState(0)
  const [inpointPreview, setInpointPreview] = useState<string | null>(null)
  const [outpointPreview, setOutpointPreview] = useState<string | null>(null)
  const [gifUrl, setGifUrl] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  function handleSetPoint(time: number, point: 'inpoint' | 'outpoint') {
    if (point === 'inpoint') setInpoint(time)
    else setOutpoint(time)
  }

  function capturePreview(point: 'inpoint' | 'outpoint', video: HTMLVideoElement) {
    const canvas = document.createElement('canvas')
    const ratio = video.videoWidth / video.videoHeight
    const w = Math.min(video.videoWidth, 480)
    const h = Math.round(w / ratio)
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(video, 0, 0, w, h)
    try {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
      if (point === 'inpoint') setInpointPreview(dataUrl)
      else setOutpointPreview(dataUrl)
    } catch {
      console.warn('Canvas tainted by cross-origin video — preview unavailable')
    }
  }

  async function createGIF() {
    if (outpoint - inpoint <= 0) {
      alert('Your outpoint must come after your inpoint.')
      return
    }

    setCreating(true)
    if (gifUrl) URL.revokeObjectURL(gifUrl)
    setGifUrl(null)

    try {
      const res = await fetch('/api/gifs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoURL, inpoint, outpoint }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }

      const blob = await res.blob()
      setGifUrl(URL.createObjectURL(blob))
    } catch (err) {
      alert('Failed to create GIF: ' + (err as Error).message)
    } finally {
      setCreating(false)
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-1">React GIF Maker</h1>
      <p className="text-sm text-gray-500 mb-6">
        Paste a video URL or YouTube link, set your in and out points, and create an animated GIF.
      </p>

      <VideoInput videoURL={videoURL} onVideoChange={setVideoURL} />
      <VideoPlayer ref={videoRef} videoURL={videoURL} />

      <div className="flex gap-3 mb-4">
        <ButtonSetInpoint
          videoRef={videoRef}
          onSetPoint={handleSetPoint}
          onPreview={capturePreview}
        />
        <ButtonSetOutpoint
          videoRef={videoRef}
          inpoint={inpoint}
          onSetPoint={handleSetPoint}
          onPreview={capturePreview}
        />
      </div>

      <div className="flex gap-3 mb-6">
        <PreviewPoint label="Starting point" imageData={inpointPreview} />
        <PreviewPoint label="Ending point" imageData={outpointPreview} />
      </div>

      <button
        className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white py-3 rounded font-semibold"
        onClick={createGIF}
        disabled={creating || outpoint <= inpoint}
      >
        {creating ? 'Creating GIF...' : 'Create Animated GIF'}
      </button>

      <FinishedImage gifUrl={gifUrl} onClose={() => setGifUrl(null)} />
    </main>
  )
}
