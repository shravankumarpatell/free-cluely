// src/components/ScreenshotItem.tsx
import React from "react"
import { X } from "lucide-react"

interface Screenshot {
  path: string
  preview: string
}

interface ScreenshotItemProps {
  screenshot: Screenshot
  onDelete: (index: number) => void
  index: number
  isLoading: boolean
}

const ScreenshotItem: React.FC<ScreenshotItemProps> = ({
  screenshot,
  onDelete,
  index,
  isLoading
}) => {
  const handleDelete = async () => {
    await onDelete(index)
  }

  return (
    <>
      <div
        className={`border border-white/15 relative ${isLoading ? "opacity-60" : "group"} backdrop-blur-sm bg-black/20 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300`}
      >
        <div className="w-full h-full relative">
          {isLoading && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
              <div className="w-6 h-6 border-2 border-white/40 border-t-white/80 rounded-full animate-spin" />
            </div>
          )}
          <img
            src={screenshot.preview}
            alt="Screenshot"
            className={`w-full h-full object-cover transition-all duration-300 ${
              isLoading
                ? "opacity-40 blur-sm"
                : "cursor-pointer group-hover:scale-105 group-hover:brightness-90 group-hover:contrast-110"
            }`}
          />
          
          {/* Overlay gradient for better contrast */}
          {!isLoading && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          )}
        </div>
        
        {!isLoading && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDelete()
            }}
            className="absolute top-2 left-2 p-1.5 rounded-full bg-black/70 backdrop-blur-sm text-white/80 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/90 hover:text-white/95 hover:scale-110 border border-white/10"
            aria-label="Delete screenshot"
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        )}
      </div>
    </>
  )
}

export default ScreenshotItem