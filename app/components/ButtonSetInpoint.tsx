'use client'

interface Props {
  videoRef: React.RefObject<HTMLVideoElement | null>
  onSetPoint: (time: number, point: 'inpoint') => void
  onPreview: (point: 'inpoint', video: HTMLVideoElement) => void
}

export default function ButtonSetInpoint({ videoRef, onSetPoint, onPreview }: Props) {
  function handleClick() {
    const video = videoRef.current
    if (!video) return
    video.pause()
    onSetPoint(video.currentTime, 'inpoint')
    onPreview('inpoint', video)
  }

  return (
    <button
      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded text-sm font-medium"
      onClick={handleClick}
    >
      Set Starting Point
    </button>
  )
}
