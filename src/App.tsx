// import { ToastProvider } from "./components/ui/toast"
// import Queue from "./_pages/Queue"
// import { ToastViewport } from "@radix-ui/react-toast"
// import { useEffect, useRef, useState } from "react"
// import Solutions from "./_pages/Solutions"
// import { QueryClient, QueryClientProvider } from "react-query"

// declare global {
//   interface Window {
//     electronAPI: {
//       //RANDOM GETTER/SETTERS
//       updateContentDimensions: (dimensions: {
//         width: number
//         height: number
//       }) => Promise<void>
//       getScreenshots: () => Promise<Array<{ path: string; preview: string }>>

//       //GLOBAL EVENTS
//       //TODO: CHECK THAT PROCESSING NO SCREENSHOTS AND TAKE SCREENSHOTS ARE BOTH CONDITIONAL
//       onUnauthorized: (callback: () => void) => () => void
//       onScreenshotTaken: (
//         callback: (data: { path: string; preview: string }) => void
//       ) => () => void
//       onProcessingNoScreenshots: (callback: () => void) => () => void
//       onResetView: (callback: () => void) => () => void
//       takeScreenshot: () => Promise<void>

//       //INITIAL SOLUTION EVENTS
//       deleteScreenshot: (
//         path: string
//       ) => Promise<{ success: boolean; error?: string }>
//       onSolutionStart: (callback: () => void) => () => void
//       onSolutionError: (callback: (error: string) => void) => () => void
//       onSolutionSuccess: (callback: (data: any) => void) => () => void
//       onProblemExtracted: (callback: (data: any) => void) => () => void

//       onDebugSuccess: (callback: (data: any) => void) => () => void

//       onDebugStart: (callback: () => void) => () => void
//       onDebugError: (callback: (error: string) => void) => () => void

//       // Audio Processing
//       analyzeAudioFromBase64: (data: string, mimeType: string) => Promise<{ text: string; timestamp: number }>
//       analyzeAudioFile: (path: string) => Promise<{ text: string; timestamp: number }>

//       moveWindowLeft: () => Promise<void>
//       moveWindowRight: () => Promise<void>
//       moveWindowUp: () => Promise<void>
//       moveWindowDown: () => Promise<void>
//       quitApp: () => Promise<void>
//       invoke: (channel: string, ...args: any[]) => Promise<any>
//     }
//   }
// }

// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       staleTime: Infinity,
//       cacheTime: Infinity
//     }
//   }
// })

// const App: React.FC = () => {
//   const [view, setView] = useState<"queue" | "solutions" | "debug">("queue")
//   const containerRef = useRef<HTMLDivElement>(null)

//   // Effect for height monitoring
//   useEffect(() => {
//     const cleanup = window.electronAPI.onResetView(() => {
//       console.log("Received 'reset-view' message from main process.")
//       queryClient.invalidateQueries(["screenshots"])
//       queryClient.invalidateQueries(["problem_statement"])
//       queryClient.invalidateQueries(["solution"])
//       queryClient.invalidateQueries(["new_solution"])
//       setView("queue")
//     })

//     return () => {
//       cleanup()
//     }
//   }, [])

//   useEffect(() => {
//     if (!containerRef.current) return

//     const updateHeight = () => {
//       if (!containerRef.current) return
//       const height = containerRef.current.scrollHeight
//       const width = containerRef.current.scrollWidth
//       window.electronAPI?.updateContentDimensions({ width, height })
//     }

//     const resizeObserver = new ResizeObserver(() => {
//       updateHeight()
//     })

//     // Initial height update
//     updateHeight()

//     // Observe for changes
//     resizeObserver.observe(containerRef.current)

//     // Also update height when view changes
//     const mutationObserver = new MutationObserver(() => {
//       updateHeight()
//     })

//     mutationObserver.observe(containerRef.current, {
//       childList: true,
//       subtree: true,
//       attributes: true,
//       characterData: true
//     })

//     return () => {
//       resizeObserver.disconnect()
//       mutationObserver.disconnect()
//     }
//   }, [view]) // Re-run when view changes

//   useEffect(() => {
//     const cleanupFunctions = [
//       window.electronAPI.onSolutionStart(() => {
//         setView("solutions")
//         console.log("starting processing")
//       }),

//       window.electronAPI.onUnauthorized(() => {
//         queryClient.removeQueries(["screenshots"])
//         queryClient.removeQueries(["solution"])
//         queryClient.removeQueries(["problem_statement"])
//         setView("queue")
//         console.log("Unauthorized")
//       }),
//       // Update this reset handler
//       window.electronAPI.onResetView(() => {
//         console.log("Received 'reset-view' message from main process")

//         queryClient.removeQueries(["screenshots"])
//         queryClient.removeQueries(["solution"])
//         queryClient.removeQueries(["problem_statement"])
//         setView("queue")
//         console.log("View reset to 'queue' via Command+R shortcut")
//       }),
//       window.electronAPI.onProblemExtracted((data: any) => {
//         if (view === "queue") {
//           console.log("Problem extracted successfully")
//           queryClient.invalidateQueries(["problem_statement"])
//           queryClient.setQueryData(["problem_statement"], data)
//         }
//       })
//     ]
//     return () => cleanupFunctions.forEach((cleanup) => cleanup())
//   }, [])

//   return (
//     <div ref={containerRef} className="min-h-0">
//       <QueryClientProvider client={queryClient}>
//         <ToastProvider>
//           {view === "queue" ? (
//             <Queue setView={setView} />
//           ) : view === "solutions" ? (
//             <Solutions setView={setView} />
//           ) : (
//             <></>
//           )}
//           <ToastViewport />
//         </ToastProvider>
//       </QueryClientProvider>
//     </div>
//   )
// }

// export default App







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