import React, { useState, useEffect, useRef } from "react"
import { IoLogOutOutline } from "react-icons/io5"
import { Sun, Moon, Type, Square } from "lucide-react"

interface QueueCommandsProps {
  onTooltipVisibilityChange: (visible: boolean, height: number) => void
  screenshots: Array<{ path: string; preview: string }>
  onChatToggle: () => void
  isDarkTheme: boolean
  onThemeToggle: () => void
}

const QueueCommands: React.FC<QueueCommandsProps> = ({
  onTooltipVisibilityChange,
  screenshots,
  onChatToggle,
  isDarkTheme,
  onThemeToggle
}) => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [audioResult, setAudioResult] = useState<string | null>(null)
  const chunks = useRef<Blob[]>([])

  // NEW: Typing state
  const [isTyping, setIsTyping] = useState(false)
  const [typingCountdown, setTypingCountdown] = useState<number | null>(null)
  const [lastResponse, setLastResponse] = useState<string | null>(null)

  useEffect(() => {
    let tooltipHeight = 0
    if (tooltipRef.current && isTooltipVisible) {
      tooltipHeight = tooltipRef.current.offsetHeight + 10
    }
    onTooltipVisibilityChange(isTooltipVisible, tooltipHeight)
  }, [isTooltipVisible])

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
  //   window.electronAPI?.isTyping().then(({ isTyping  }) => {
  //     setIsTyping(isTyping)
  //   })

  //   // Get last response for typing button state
  //   window.electronAPI?.getLastResponse().then(({ response }) => {
  //     setLastResponse(response)
  //   })

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

  // NEW: Update last response when audio result changes
  useEffect(() => {
    if (audioResult) {
      setLastResponse(audioResult)
    }
  }, [audioResult])

  const handleMouseEnter = () => {
    setIsTooltipVisible(true)
  }

  const handleMouseLeave = () => {
    setIsTooltipVisible(false)
  }

  const handleRecordClick = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const recorder = new MediaRecorder(stream)
        recorder.ondataavailable = (e) => chunks.current.push(e.data)
        recorder.onstop = async () => {
          const blob = new Blob(chunks.current, { type: chunks.current[0]?.type || 'audio/webm' })
          chunks.current = []
          const reader = new FileReader()
          reader.onloadend = async () => {
            const base64Data = (reader.result as string).split(',')[1]
            try {
              const result = await window.electronAPI.analyzeAudioFromBase64(base64Data, blob.type)
              setAudioResult(result.text)
              setLastResponse(result.text) // Update last response for typing
            } catch (err) {
              setAudioResult('Audio analysis failed.')
            }
          }
          reader.readAsDataURL(blob)
        }
        setMediaRecorder(recorder)
        recorder.start()
        setIsRecording(true)
      } catch (err) {
        setAudioResult('Could not start recording.')
      }
    } else {
      mediaRecorder?.stop()
      setIsRecording(false)
      setMediaRecorder(null)
    }
  }

  // NEW: Typing handlers
  const handleTypeLastResponse = async () => {
    if (!lastResponse || isTyping) return
    try {
      await window.electronAPI.typeLastResponse(3) // 3 second countdown
    } catch (error) {
      console.error('Error typing last response:', error)
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

  return (
    <div className="w-fit">
      <div className={`text-xs py-1 px-4 flex items-center justify-center gap-4 draggable-area rounded-2xl ${
        isDarkTheme 
          ? 'liquid-glass-bar text-white/90' 
          : 'bg-white/60 backdrop-blur-md border-2 border-gray-300 text-gray-800'
      }`}>
        {/* Solve Command */}
        {screenshots.length > 0 && (
          <div className="flex items-center gap-2">
            <span className={`text-[11px] leading-none ${
              isDarkTheme ? 'text-white/80' : 'text-gray-700'
            }`}>Solve</span>
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

        {/* Voice Recording Button */}
        <div className="flex items-center gap-2">
          <button
            className={`transition-colors rounded-md px-2 py-1 text-[11px] leading-none flex items-center gap-1 ${
              isRecording 
                ? 'bg-red-500/70 hover:bg-red-500/90 text-white/90'
                : isDarkTheme
                  ? 'bg-white/10 hover:bg-white/20 text-white/70 hover:text-white/90'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-600 hover:text-gray-800'
            }`}
            onClick={handleRecordClick}
            type="button"
          >
            {isRecording ? (
              <span className="animate-pulse">● Stop Recording</span>
            ) : (
              <span>🎤 Record Voice</span>
            )}
          </button>
        </div>

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

        {/* Chat Button */}
        <div className="flex items-center gap-2">
          <button
            className={`transition-colors rounded-md px-2 py-1 text-[11px] leading-none flex items-center gap-1 ${
              isDarkTheme 
                ? 'bg-white/10 hover:bg-white/20 text-white/70 hover:text-white/90'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-600 hover:text-gray-800'
            }`}
            onClick={onChatToggle}
            type="button"
          >
            💬 Chat
          </button>
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

        {/* Separator */}
        <div className={`mx-2 h-4 w-px ${
          isDarkTheme ? 'bg-white/20' : 'bg-gray-400'
        }`} />

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
      
      {/* Audio Result Display */}
      {audioResult && (
        <div className={`mt-2 p-2 backdrop-blur-sm border rounded text-xs max-w-md ${
          isDarkTheme 
            ? 'bg-black/40 border-white/10 text-white/90'
            : 'bg-white/60 border-gray-300 text-gray-800'
        }`}>
          <span className={`font-semibold ${
            isDarkTheme ? 'text-white/95' : 'text-gray-900'
          }`}>Audio Result:</span> 
          <span className={isDarkTheme ? 'text-white/80' : 'text-gray-700'}> {audioResult}</span>
        </div>
      )}

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

export default QueueCommands