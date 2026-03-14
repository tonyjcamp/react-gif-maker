'use client'

interface Props {
  gifUrl: string | null
  onClose: () => void
}

export default function FinishedImage({ gifUrl, onClose }: Props) {
  if (!gifUrl) return null

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(gifUrl!)
      alert('URL copied to clipboard!')
    } catch {
      // fallback for older browsers
      const input = document.createElement('input')
      input.value = gifUrl!
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
    }
  }

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
        <button
          className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded font-medium"
          onClick={copyToClipboard}
        >
          Copy URL to Clipboard
        </button>
      </div>
    </div>
  )
}
