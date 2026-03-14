'use client'

import { forwardRef, useEffect } from 'react'

interface Props {
  videoURL: string
}

const VideoPlayer = forwardRef<HTMLVideoElement, Props>(function VideoPlayer({ videoURL }, ref) {
  useEffect(() => {
    const video = (ref as React.RefObject<HTMLVideoElement>)?.current
    if (!video) return

    let timeout: ReturnType<typeof setTimeout> | null = null
    let keyHeldDown = false

    function onKeyDown(e: KeyboardEvent) {
      if (!video) return
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        video.pause()
        video.currentTime -= keyHeldDown ? 0.25 : 0.03
        if (!timeout) {
          timeout = setTimeout(() => { keyHeldDown = true }, 1000)
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        video.pause()
        video.currentTime += keyHeldDown ? 0.25 : 0.03
        if (!timeout) {
          timeout = setTimeout(() => { keyHeldDown = true }, 1000)
        }
      }
    }

    function onKeyUp(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        if (timeout) clearTimeout(timeout)
        timeout = null
        keyHeldDown = false
      }
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('keyup', onKeyUp)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('keyup', onKeyUp)
      if (timeout) clearTimeout(timeout)
    }
  }, [ref])

  return (
    <div className="mt-5 mb-5">
      <video
        ref={ref}
        className="w-full rounded"
        src={videoURL}
        controls
        crossOrigin="anonymous"
      />
    </div>
  )
})

export default VideoPlayer
