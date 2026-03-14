'use client'

import { useState } from 'react'

interface Props {
  videoURL: string
  onVideoChange: (url: string) => void
}

export default function VideoInput({ videoURL, onVideoChange }: Props) {
  const [inputValue, setInputValue] = useState(videoURL)
  const [loading, setLoading] = useState(false)

  async function fetchVideo() {
    if (!inputValue) return

    // Direct video URL — just update immediately
    if (!inputValue.includes('youtube.com') && !inputValue.includes('youtu.be')) {
      onVideoChange(inputValue)
      return
    }

    // YouTube URL — resolve via API
    setLoading(true)
    try {
      const res = await fetch('/api/ytvideo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: inputValue }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onVideoChange(data.videoURL)
    } catch (err) {
      alert('Failed to fetch video: ' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex mt-10 gap-2">
      <input
        className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        type="url"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Paste a video URL or YouTube link..."
      />
      <button
        className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded text-sm font-medium"
        onClick={fetchVideo}
        disabled={loading}
      >
        {loading ? 'Fetching...' : 'Fetch'}
      </button>
    </div>
  )
}
