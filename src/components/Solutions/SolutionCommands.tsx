import React, { useState, useEffect, useRef } from "react"
import { IoLogOutOutline } from "react-icons/io5"
import { Sun, Moon } from "lucide-react"

interface SolutionCommandsProps {
  extraScreenshots: any[]
  onTooltipVisibilityChange?: (visible: boolean, height: number) => void
  isDarkTheme: boolean
  onThemeToggle: () => void
}

const SolutionCommands: React.FC<SolutionCommandsProps> = ({
  extraScreenshots,
  onTooltipVisibilityChange,
  isDarkTheme,
  onThemeToggle
}) => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (onTooltipVisibilityChange) {
      let tooltipHeight = 0
      if (tooltipRef.current && isTooltipVisible) {
        tooltipHeight = tooltipRef.current.offsetHeight + 10 // Adjust if necessary
      }
      onTooltipVisibilityChange(isTooltipVisible, tooltipHeight)
    }
  }, [isTooltipVisible, onTooltipVisibilityChange])

  const handleMouseEnter = () => {
    setIsTooltipVisible(true)
  }

  const handleMouseLeave = () => {
    setIsTooltipVisible(false)
  }

  return (
    <div>
      <div className="pt-2 w-fit">
        <div className={`text-xs py-1 px-4 flex items-center justify-center gap-4 draggable-area rounded-2xl ${
          isDarkTheme 
            ? 'liquid-glass-bar text-white/90' 
            : 'bg-white/60 backdrop-blur-md border-2 border-gray-300 text-gray-800'
        }`}>
          {/* Show/Hide */}
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className={`text-[11px] leading-none ${
              isDarkTheme ? 'text-white/80' : 'text-gray-700'
            }`}>Show/Hide</span>
            <div className="flex gap-1">
              <button className={`transition-colors rounded-md px-1.5 py-1 text-[11px] leading-none ${
                isDarkTheme 
                  ? 'bg-white/10 hover:bg-white/20 text-white/70'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
              }`}>
                ⌘
              </button>
              <button className={`transition-colors rounded-md px-1.5 py-1 text-[11px] leading-none ${
                isDarkTheme 
                  ? 'bg-white/10 hover:bg-white/20 text-white/70'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
              }`}>
                B
              </button>
            </div>
          </div>

          {/* Screenshot */}
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className={`text-[11px] leading-none truncate ${
              isDarkTheme ? 'text-white/80' : 'text-gray-700'
            }`}>
              {extraScreenshots.length === 0
                ? "Screenshot your code"
                : "Screenshot"}
            </span>
            <div className="flex gap-1">
              <button className={`transition-colors rounded-md px-1.5 py-1 text-[11px] leading-none ${
                isDarkTheme 
                  ? 'bg-white/10 hover:bg-white/20 text-white/70'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
              }`}>
                ⌘
              </button>
              <button className={`transition-colors rounded-md px-1.5 py-1 text-[11px] leading-none ${
                isDarkTheme 
                  ? 'bg-white/10 hover:bg-white/20 text-white/70'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
              }`}>
                H
              </button>
            </div>
          </div>
          {extraScreenshots.length > 0 && (
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className={`text-[11px] leading-none ${
                isDarkTheme ? 'text-white/80' : 'text-gray-700'
              }`}>Debug</span>
              <div className="flex gap-1">
                <button className={`transition-colors rounded-md px-1.5 py-1 text-[11px] leading-none ${
                  isDarkTheme 
                    ? 'bg-white/10 hover:bg-white/20 text-white/70'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
                }`}>
                  ⌘
                </button>
                <button className={`transition-colors rounded-md px-1.5 py-1 text-[11px] leading-none ${
                  isDarkTheme 
                    ? 'bg-white/10 hover:bg-white/20 text-white/70'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
                }`}>
                  ↵
                </button>
              </div>
            </div>
          )}

          {/* Start Over */}
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className={`text-[11px] leading-none ${
              isDarkTheme ? 'text-white/80' : 'text-gray-700'
            }`}>Start over</span>
            <div className="flex gap-1">
              <button className={`transition-colors rounded-md px-1.5 py-1 text-[11px] leading-none ${
                isDarkTheme 
                  ? 'bg-white/10 hover:bg-white/20 text-white/70'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
              }`}>
                ⌘
              </button>
              <button className={`transition-colors rounded-md px-1.5 py-1 text-[11px] leading-none ${
                isDarkTheme 
                  ? 'bg-white/10 hover:bg-white/20 text-white/70'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
              }`}>
                R
              </button>
            </div>
          </div>

          {/* Theme Toggle Button */}
          <div className="flex items-center gap-2">
            <button
              className={`transition-colors rounded-md px-2 py-1 text-[11px] leading-none flex items-center gap-1 ${
                isDarkTheme 
                  ? 'bg-white/10 hover:bg-white/20 text-white/70 hover:text-white/90'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-600 hover:text-gray-800'
              }`}
              onClick={onThemeToggle}
              type="button"
              title={`Switch to ${isDarkTheme ? 'light' : 'dark'} theme`}
            >
              {isDarkTheme ? (
                <>
                  <Sun className="w-3 h-3" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3 h-3" />
                  <span>Dark</span>
                </>
              )}
            </button>
          </div>

          {/* Question Mark with Tooltip */}
          <div
            className="relative inline-block"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* Question mark circle */}
            <div className={`w-6 h-6 rounded-full backdrop-blur-sm transition-colors flex items-center justify-center cursor-help z-10 ${
              isDarkTheme 
                ? 'bg-white/10 hover:bg-white/20'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}>
              <span className={`text-xs ${
                isDarkTheme ? 'text-white/70' : 'text-gray-600'
              }`}>?</span>
            </div>

            {/* Tooltip Content */}
            {isTooltipVisible && (
              <div
                ref={tooltipRef}
                className="absolute top-full right-0 mt-2 w-80"
                style={{ zIndex: 100 }}
              >
                <div className={`p-3 text-xs backdrop-blur-md rounded-lg border shadow-lg ${
                  isDarkTheme 
                    ? 'bg-black/80 border-white/10 text-white/90'
                    : 'bg-white/90 border-gray-300 text-gray-800'
                }`}>
                  {/* Tooltip content */}
                  <div className="space-y-4">
                    <h3 className={`font-medium whitespace-nowrap ${
                      isDarkTheme ? 'text-white/95' : 'text-gray-900'
                    }`}>
                      Keyboard Shortcuts
                    </h3>
                    <div className="space-y-3">
                      {/* Toggle Command */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className={`whitespace-nowrap ${
                            isDarkTheme ? 'text-white/85' : 'text-gray-700'
                          }`}>
                            Toggle Window
                          </span>
                          <div className="flex gap-1">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] leading-none ${
                              isDarkTheme 
                                ? 'bg-white/10 text-white/70'
                                : 'bg-gray-200 text-gray-600'
                            }`}>
                              ⌘
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] leading-none ${
                              isDarkTheme 
                                ? 'bg-white/10 text-white/70'
                                : 'bg-gray-200 text-gray-600'
                            }`}>
                              B
                            </span>
                          </div>
                        </div>
                        <p className={`text-[10px] leading-relaxed whitespace-nowrap truncate ${
                          isDarkTheme ? 'text-white/70' : 'text-gray-600'
                        }`}>
                          Generate new solutions based on all previous and newly
                          added screenshots.
                        </p>
                      </div>
                      {/* Start Over Command */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className={`whitespace-nowrap ${
                            isDarkTheme ? 'text-white/85' : 'text-gray-700'
                          }`}>Start Over</span>
                          <div className="flex gap-1">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] leading-none ${
                              isDarkTheme 
                                ? 'bg-white/10 text-white/70'
                                : 'bg-gray-200 text-gray-600'
                            }`}>
                              ⌘
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] leading-none ${
                              isDarkTheme 
                                ? 'bg-white/10 text-white/70'
                                : 'bg-gray-200 text-gray-600'
                            }`}>
                              R
                            </span>
                          </div>
                        </div>
                        <p className={`text-[10px] leading-relaxed whitespace-nowrap truncate ${
                          isDarkTheme ? 'text-white/70' : 'text-gray-600'
                        }`}>
                          Start fresh with a new question.
                        </p>
                      </div>

                      {/* Theme Toggle */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className={`whitespace-nowrap ${
                            isDarkTheme ? 'text-white/85' : 'text-gray-700'
                          }`}>Theme Toggle</span>
                          <div className="flex gap-1 flex-shrink-0">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] leading-none ${
                              isDarkTheme 
                                ? 'bg-white/10 text-white/70'
                                : 'bg-gray-200 text-gray-600'
                            }`}>
                              Click button
                            </span>
                          </div>
                        </div>
                        <p className={`text-[10px] leading-relaxed whitespace-nowrap truncate ${
                          isDarkTheme ? 'text-white/70' : 'text-gray-600'
                        }`}>
                          Switch between dark and light themes for better visibility.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sign Out Button */}
          <button
            className={`transition-colors hover:cursor-pointer ${
              isDarkTheme 
                ? 'text-red-400/70 hover:text-red-400/90'
                : 'text-red-600/70 hover:text-red-600/90'
            }`}
            title="Sign Out"
            onClick={() => window.electronAPI.quitApp()}
          >
            <IoLogOutOutline className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default SolutionCommands