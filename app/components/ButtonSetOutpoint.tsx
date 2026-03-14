'use client'

interface Props {
  videoRef: React.RefObject<HTMLVideoElement | null>
  inpoint: number
  onSetPoint: (time: number, point: 'outpoint') => void
  onPreview: (point: 'outpoint', video: HTMLVideoElement) => void
}

export default function ButtonSetOutpoint({ videoRef, inpoint, onSetPoint, onPreview }: Props) {
  function handleClick() {
    const video = videoRef.current
    if (!video) return

    const currTime = video.currentTime
    const duration = currTime - inpoint

    if (duration > 6) {
      alert('GIF duration is too long! Must be 6 seconds or less.')
      return
    }
    if (duration <= 0) {
      alert('Your outpoint must come after your inpoint.')
      return
    }

    video.pause()
    onSetPoint(currTime, 'outpoint')
    onPreview('outpoint', video)
  }

  return (
    <button
      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded text-sm font-medium"
      onClick={handleClick}
    >
      Set Ending Point
    </button>
  )
}
