import React, { useState, useEffect, useRef } from "react"
import { IoLogOutOutline } from "react-icons/io5"
import { Sun, Moon, Type, Square } from "lucide-react"

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

  // NEW: Typing state
  const [isTyping, setIsTyping] = useState(false)
  const [typingCountdown, setTypingCountdown] = useState<number | null>(null)
  const [lastResponse, setLastResponse] = useState<string | null>(null)

  useEffect(() => {
    if (onTooltipVisibilityChange) {
      let tooltipHeight = 0
      if (tooltipRef.current && isTooltipVisible) {
        tooltipHeight = tooltipRef.current.offsetHeight + 10
      }
      onTooltipVisibilityChange(isTooltipVisible, tooltipHeight)
    }
  }, [isTooltipVisible, onTooltipVisibilityChange])

  // NEW: Setup typing event listeners
  // useEffect(() => {
  //   const cleanupFunctions = [
  //     window.electronAPI?.onTypingCountdown((seconds: number) => {
  //       setTypingCountdown(seconds)
  //     }),
  //     window.electronAPI?.onTypingStarted(() => {
  //       setTypingCountdown(null)
  //       setIsTyping(true)
  //     }),
  //     window.electronAPI?.onTypingFinished(() => {
  //       setIsTyping(false)
  //       setTypingCountdown(null)
  //     }),
  //     window.electronAPI?.onTypingCancelled(() => {
  //       setIsTyping(false)
  //       setTypingCountdown(null)
  //     }),
  //   ]

  //   // Check initial typing state
  //   window.electronAPI?.isTyping().then(({ isTyping }) => {
  //     setIsTyping(isTyping)
  //   }).catch(console.error)

  //   // Get last response for typing button state
  //   window.electronAPI?.getLastResponse().then(({ response }) => {
  //     setLastResponse(response)
  //   }).catch(console.error)

  //   return () => {
  //     cleanupFunctions.forEach((cleanup) => cleanup?.())
  //   }
  // }, [])



  useEffect(() => {
  const cleanupFunctions = [
    window.electronAPI?.onTypingCountdown((seconds: number) => {
      setTypingCountdown(seconds)
    }),
    window.electronAPI?.onTypingStarted(() => {
      setTypingCountdown(null)
      setIsTyping(true)
    }),
    window.electronAPI?.onTypingFinished(() => {
      setIsTyping(false)
      setTypingCountdown(null)
    }),
    window.electronAPI?.onTypingCancelled(() => {
      setIsTyping(false)
      setTypingCountdown(null)
    }),
  ]

  // FIXED: Properly typed async calls with explicit typing
  window.electronAPI?.isTyping()
    .then((result: { isTyping: boolean }) => {
      setIsTyping(result.isTyping)
    })
    .catch((error: any) => {
      console.error('Error checking typing state:', error)
    })

  window.electronAPI?.getLastResponse()
    .then((result: { response: string | null }) => {
      setLastResponse(result.response)
    })
    .catch((error: any) => {
      console.error('Error getting last response:', error)
    })

  return () => {
    cleanupFunctions.forEach((cleanup) => cleanup?.())
  }
}, [])

  // NEW: Typing handlers
  const handleTypeLastResponse = async () => {
    if (!lastResponse || isTyping) return
    try {
      await window.electronAPI.typeLastResponse(3) // 3 second countdown
    } catch (error) {
      console.error('Error typing last response:', error)
    }
  }

  const handleTypeCurrentSolution = async () => {
    if (isTyping) return
    try {
      await window.electronAPI.typeCurrentSolution(3) // 3 second countdown
    } catch (error) {
      console.error('Error typing current solution:', error)
    }
  }

  const handleCancelTyping = async () => {
    if (!isTyping) return
    try {
      await window.electronAPI.cancelTyping()
    } catch (error) {
      console.error('Error cancelling typing:', error)
    }
  }

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

          {/* NEW: Typing Controls */}
          <div className="flex items-center gap-2">
            {/* Typing Status/Countdown Display */}
            {(isTyping || typingCountdown !== null) && (
              <div className={`px-2 py-1 rounded-md text-[11px] leading-none ${
                isDarkTheme 
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                  : 'bg-blue-100 text-blue-700 border border-blue-300'
              }`}>
                {typingCountdown !== null 
                  ? `Typing in ${typingCountdown}s...` 
                  : 'Typing...'
                }
              </div>
            )}

            {/* Type Last Response Button */}
            {lastResponse && !isTyping && typingCountdown === null && (
              <button
                className={`transition-colors rounded-md px-2 py-1 text-[11px] leading-none flex items-center gap-1 ${
                  isDarkTheme 
                    ? 'bg-green-500/20 hover:bg-green-500/30 text-green-300 hover:text-green-200 border border-green-400/30'
                    : 'bg-green-100 hover:bg-green-200 text-green-700 hover:text-green-800 border border-green-300'
                }`}
                onClick={handleTypeLastResponse}
                type="button"
                title="Type last response (Cmd/Ctrl + ])"
              >
                <Type className="w-3 h-3" />
                <span>Type Response</span>
              </button>
            )}

            {/* Type Current Solution Button */}
            {!isTyping && typingCountdown === null && (
              <button
                className={`transition-colors rounded-md px-2 py-1 text-[11px] leading-none flex items-center gap-1 ${
                  isDarkTheme 
                    ? 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 hover:text-purple-200 border border-purple-400/30'
                    : 'bg-purple-100 hover:bg-purple-200 text-purple-700 hover:text-purple-800 border border-purple-300'
                }`}
                onClick={handleTypeCurrentSolution}
                type="button"
                title="Type current solution (Cmd/Ctrl + Shift + ])"
              >
                <Type className="w-3 h-3" />
                <span>Type Solution</span>
              </button>
            )}

            {/* Cancel Typing Button */}
            {(isTyping || typingCountdown !== null) && (
              <button
                className={`transition-colors rounded-md px-2 py-1 text-[11px] leading-none flex items-center gap-1 ${
                  isDarkTheme 
                    ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 border border-red-400/30'
                    : 'bg-red-100 hover:bg-red-200 text-red-700 hover:text-red-800 border border-red-300'
                }`}
                onClick={handleCancelTyping}
                type="button"
                title="Cancel typing"
              >
                <Square className="w-3 h-3" />
                <span>Cancel</span>
              </button>
            )}
          </div>

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
            <div className={`w-6 h-6 rounded-full backdrop-blur-sm transition-colors flex items-center justify-center cursor-help z-10 ${
              isDarkTheme 
                ? 'bg-white/10 hover:bg-white/20'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}>
              <span className={`text-xs ${
                isDarkTheme ? 'text-white/70' : 'text-gray-600'
              }`}>?</span>
            </div>

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
                  <div className="space-y-4">
                    <h3 className={`font-medium whitespace-nowrap ${
                      isDarkTheme ? 'text-white/95' : 'text-gray-900'
                    }`}>
                      Keyboard Shortcuts & Typing
                    </h3>
                    <div className="space-y-3">
                      {/* Typing Controls */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className={`whitespace-nowrap ${
                            isDarkTheme ? 'text-white/85' : 'text-gray-700'
                          }`}>
                            Type Last Response
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
                              ]
                            </span>
                          </div>
                        </div>
                        <p className={`text-[10px] leading-relaxed ${
                          isDarkTheme ? 'text-white/70' : 'text-gray-600'
                        }`}>
                          Type the last AI response into any focused application with real keystrokes.
                        </p>
                      </div>
                      
                      {/* Type Solution */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className={`whitespace-nowrap ${
                            isDarkTheme ? 'text-white/85' : 'text-gray-700'
                          }`}>
                            Type Solution Code
                          </span>
                          <div className="flex gap-1">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] leading-none ${
                              isDarkTheme 
                                ? 'bg-white/10 text-white/70'
                                : 'bg-gray-200 text-gray-600'
                            }`}>
                              ⌘⇧]
                            </span>
                          </div>
                        </div>
                        <p className={`text-[10px] leading-relaxed ${
                          isDarkTheme ? 'text-white/70' : 'text-gray-600'
                        }`}>
                          Type the current solution code directly into your code editor.
                        </p>
                      </div>

                      {/* Other shortcuts */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className={`whitespace-nowrap ${
                            isDarkTheme ? 'text-white/85' : 'text-gray-700'
                          }`}>Screenshot Code</span>
                          <div className="flex gap-1">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] leading-none ${
                              isDarkTheme 
                                ? 'bg-white/10 text-white/70'
                                : 'bg-gray-200 text-gray-600'
                            }`}>
                              ⌘H
                            </span>
                          </div>
                        </div>
                      </div>

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
                              ⌘R
                            </span>
                          </div>
                        </div>
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

      {/* NEW: Typing Status Display */}
      {(isTyping || typingCountdown !== null) && (
        <div className={`mt-2 p-2 backdrop-blur-sm border rounded text-xs max-w-md ${
          isDarkTheme 
            ? 'bg-blue-500/20 border-blue-400/30 text-blue-300'
            : 'bg-blue-100 border-blue-300 text-blue-700'
        }`}>
          <span className="font-semibold">
            {typingCountdown !== null 
              ? `Starting typing in ${typingCountdown} seconds... Focus your target window now!`
              : 'Currently typing... Press Escape or click Cancel to stop.'
            }
          </span>
        </div>
      )}
    </div>
  )
}

export default SolutionCommands