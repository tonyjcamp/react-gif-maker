'use client'

interface Props {
  label: string
  imageData: string | null
}

export default function PreviewPoint({ label, imageData }: Props) {
  return (
    <div className="flex-1">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      {imageData ? (
        <img src={imageData} alt={label} className="w-full rounded border border-gray-200" />
      ) : (
        <div className="w-full h-24 rounded border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-xs text-gray-400">
          Not set
        </div>
      )}
    </div>
  )
}
