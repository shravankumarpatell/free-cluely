import React, { useState, useEffect, useRef } from "react"
import { QueryClient, QueryClientProvider } from "react-query"
import Queue from "./_pages/Queue"
import Solutions from "./_pages/Solutions"
import { ToastProvider, ToastViewport } from "./components/ui/toast"
import "./index.css"

declare global {
  interface Window {
    electronAPI: any
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false
    }
  }
})

function App() {
  // Theme state - default to dark theme
  const [isDarkTheme, setIsDarkTheme] = useState(true)
  const [view, setView] = useState<"queue" | "solutions" | "debug">("queue")
  const appRef = useRef<HTMLDivElement>(null)

  // Theme toggle handler
  const handleThemeToggle = () => {
    setIsDarkTheme(!isDarkTheme)
  }

  // Apply theme class to document root
  useEffect(() => {
    const root = document.documentElement
    if (isDarkTheme) {
      root.classList.remove('theme-light')
    } else {
      root.classList.add('theme-light')
    }
  }, [isDarkTheme])

  // Auto-update view based on processing events
  useEffect(() => {
    const cleanupFunctions = [
      window.electronAPI?.onSolutionStart(() => {
        setView("solutions")
      }),
      window.electronAPI?.onProblemExtracted(() => {
        setView("solutions")
      }),
      window.electronAPI?.onResetView(() => {
        setView("queue")
      })
    ]

    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup?.())
    }
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <div 
          ref={appRef}
          className={`min-h-screen transition-colors duration-300 ${
            isDarkTheme ? '' : 'theme-light'
          }`}
          style={{
            background: isDarkTheme 
              ? 'transparent'
              : 'transparent'
          }}
        >
          <div className="w-full h-full">
            {view === "queue" ? (
              <Queue 
                setView={setView} 
                isDarkTheme={isDarkTheme}
                onThemeToggle={handleThemeToggle}
              />
            ) : (
              <Solutions 
                setView={setView} 
                isDarkTheme={isDarkTheme}
                onThemeToggle={handleThemeToggle}
              />
            )}
          </div>
        </div>
        <ToastViewport />
      </ToastProvider>
    </QueryClientProvider>
  )
}

export default App