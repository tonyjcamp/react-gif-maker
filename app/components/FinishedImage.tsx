'use client'

interface Props {
  gifUrl: string | null
  onClose: () => void
}

export default function FinishedImage({ gifUrl, onClose }: Props) {
  if (!gifUrl) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 relative">
        <button
          className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 text-xl font-bold"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-lg font-semibold mb-4">Your GIF is ready!</h2>
        <img src={gifUrl} alt="Generated GIF" className="w-full rounded mb-4" />
        <a
          href={gifUrl}
          download="output.gif"
          className="block w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded font-medium text-center"
        >
          Download GIF
        </a>
      </div>
    </div>
  )
}
