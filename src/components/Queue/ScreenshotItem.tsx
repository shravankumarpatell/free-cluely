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
  isDarkTheme?: boolean
}

const ScreenshotItem: React.FC<ScreenshotItemProps> = ({
  screenshot,
  onDelete,
  index,
  isLoading,
  isDarkTheme = true
}) => {
  const handleDelete = async () => {
    await onDelete(index)
  }

  return (
    <>
      <div
        className={`relative ${isLoading ? "opacity-60" : "group"} backdrop-blur-sm rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border ${
          isDarkTheme 
            ? 'border-white/15 bg-black/20'
            : 'border-gray-300 bg-white/40'
        }`}
      >
        <div className="w-full h-full relative">
          {isLoading && (
            <div className={`absolute inset-0 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg ${
              isDarkTheme 
                ? 'bg-black/70'
                : 'bg-white/70'
            }`}>
              <div className={`w-6 h-6 border-2 rounded-full animate-spin ${
                isDarkTheme 
                  ? 'border-white/40 border-t-white/80'
                  : 'border-gray-400 border-t-gray-700'
              }`} />
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
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
              isDarkTheme 
                ? 'bg-gradient-to-t from-black/30 via-transparent to-black/20'
                : 'bg-gradient-to-t from-white/30 via-transparent to-white/20'
            }`} />
          )}
        </div>
        
        {!isLoading && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDelete()
            }}
            className={`absolute top-2 left-2 p-1.5 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 border ${
              isDarkTheme 
                ? 'bg-black/70 text-white/80 hover:bg-black/90 hover:text-white/95 border-white/10'
                : 'bg-white/80 text-gray-700 hover:bg-white/95 hover:text-gray-900 border-gray-300'
            }`}
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