import React, { useState, useEffect, useRef } from "react"
import { useQuery } from "react-query"
import ScreenshotQueue from "../components/Queue/ScreenshotQueue"
import {
  Toast,
  ToastTitle,
  ToastDescription,
  ToastVariant,
  ToastMessage
} from "../components/ui/toast"
import QueueCommands from "../components/Queue/QueueCommands"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"

interface QueueProps {
  setView: React.Dispatch<React.SetStateAction<"queue" | "solutions" | "debug">>
}

// Enhanced markdown parser with better code block handling and copy functionality
const parseMarkdown = (text: string): JSX.Element => {
  const lines = text.split('\n');
  const elements: JSX.Element[] = [];
  let currentCodeBlock: string[] = [];
  let inCodeBlock = false;
  let codeLanguage = '';
  
  // Function to copy code to clipboard
  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      // You could add a toast notification here if needed
    }).catch(err => {
      console.error('Failed to copy code:', err);
    });
  };
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for code block start/end
    if (line.trim().startsWith('```')) {
      if (!inCodeBlock) {
        // Starting a code block
        inCodeBlock = true;
        codeLanguage = line.trim().substring(3) || 'text';
        currentCodeBlock = [];
      } else {
        // Ending a code block
        inCodeBlock = false;
        const codeContent = currentCodeBlock.join('\n');
        elements.push(
          <div key={`code-${i}`} className="my-3 relative group chat-code-block rounded-lg overflow-hidden">
            <div className="flex justify-between items-center chat-code-header px-3 py-2">
              <span className="text-xs text-white/70 font-mono">{codeLanguage}</span>
              <button
                onClick={() => copyToClipboard(codeContent)}
                className="text-xs text-white/60 hover:text-white/90 transition-colors bg-white/10 hover:bg-white/20 px-2 py-1 rounded"
                title="Copy code"
              >
                📋 Copy
              </button>
            </div>
            <div className="overflow-x-auto">
              <SyntaxHighlighter
                language={codeLanguage}
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  padding: '12px',
                  background: 'rgba(0, 0, 0, 0.6)',
                  fontSize: '11px',
                  lineHeight: '1.4'
                }}
                wrapLongLines={true}
                showLineNumbers={false}
              >
                {codeContent}
              </SyntaxHighlighter>
            </div>
          </div>
        );
        currentCodeBlock = [];
        codeLanguage = '';
      }
      continue;
    }
    
    // If we're in a code block, collect the lines
    if (inCodeBlock) {
      currentCodeBlock.push(line);
      continue;
    }
    
    // Handle inline code with better detection
    const processInlineElements = (text: string): (string | JSX.Element)[] => {
      const parts: (string | JSX.Element)[] = [];
      let remaining = text;
      let keyCounter = 0;
      
      // Handle inline code (backticks) with copy functionality
      remaining = remaining.replace(/`([^`]+)`/g, (match, code) => {
        const placeholder = `__INLINE_CODE_${keyCounter}__`;
        parts.push(
          <span key={`inline-code-${keyCounter++}`} className="relative group inline-block">
            <code className="bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded text-xs font-mono text-white/90 border border-white/10">
              {code}
            </code>
            <button
              onClick={() => copyToClipboard(code)}
              className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 hover:bg-black/90 text-white/80 p-0.5 rounded text-xs leading-none"
              title="Copy code"
              style={{ fontSize: '8px' }}
            >
              📋
            </button>
          </span>
        );
        return placeholder;
      });
      
      // Handle bold text
      remaining = remaining.replace(/\*\*(.*?)\*\*/g, (match, content) => {
        const placeholder = `__BOLD_${keyCounter}__`;
        parts.push(<strong key={`bold-${keyCounter++}`} className="text-white/95">{content}</strong>);
        return placeholder;
      });
      
      // Handle italic text
      remaining = remaining.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, (match, content) => {
        const placeholder = `__ITALIC_${keyCounter}__`;
        parts.push(<em key={`italic-${keyCounter++}`} className="text-white/90">{content}</em>);
        return placeholder;
      });
      
      // Split by placeholders and reconstruct
      const segments = remaining.split(/(__(?:INLINE_CODE|BOLD|ITALIC)_\d+__)/);
      const result: (string | JSX.Element)[] = [];
      
      let partIndex = 0;
      for (const segment of segments) {
        if (segment.startsWith('__') && segment.endsWith('__')) {
          result.push(parts[partIndex++]);
        } else if (segment) {
          result.push(segment);
        }
      }
      
      return result.length > 0 ? result : [text];
    };
    
    // Handle empty lines
    if (line.trim() === '') {
      elements.push(<br key={`br-${i}`} />);
      continue;
    }
    
    // Handle bullet points
    if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
      const bulletContent = line.trim().substring(2);
      elements.push(
        <div key={`bullet-${i}`} className="flex items-start gap-2 my-1">
          <span className="text-white/60 mt-0.5">•</span>
          <span className="text-white/85">{processInlineElements(bulletContent)}</span>
        </div>
      );
      continue;
    }
    
    // Handle numbered lists
    const numberedMatch = line.match(/^(\d+)\.\s(.+)$/);
    if (numberedMatch) {
      elements.push(
        <div key={`numbered-${i}`} className="flex items-start gap-2 my-1">
          <span className="text-white/60 mt-0.5">{numberedMatch[1]}.</span>
          <span className="text-white/85">{processInlineElements(numberedMatch[2])}</span>
        </div>
      );
      continue;
    }
    
    // Handle headers
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={`h1-${i}`} className="text-base font-bold my-2 text-white/95">
          {processInlineElements(line.substring(2))}
        </h1>
      );
      continue;
    }
    
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={`h2-${i}`} className="text-sm font-semibold my-2 text-white/90">
          {processInlineElements(line.substring(3))}
        </h2>
      );
      continue;
    }
    
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={`h3-${i}`} className="text-sm font-medium my-1 text-white/85">
          {processInlineElements(line.substring(4))}
        </h3>
      );
      continue;
    }
    
    // Regular paragraph
    elements.push(
      <p key={`p-${i}`} className="my-1 text-white/80">
        {processInlineElements(line)}
      </p>
    );
  }
  
  // Handle unclosed code block
  if (inCodeBlock && currentCodeBlock.length > 0) {
    const codeContent = currentCodeBlock.join('\n');
    elements.push(
      <div key="unclosed-code" className="my-3 relative group chat-code-block rounded-lg overflow-hidden">
        <div className="flex justify-between items-center chat-code-header px-3 py-2">
          <span className="text-xs text-white/70 font-mono">{codeLanguage}</span>
          <button
            onClick={() => copyToClipboard(codeContent)}
            className="text-xs text-white/60 hover:text-white/90 transition-colors bg-white/10 hover:bg-white/20 px-2 py-1 rounded"
            title="Copy code"
          >
            📋 Copy
          </button>
        </div>
        <div className="overflow-x-auto">
          <SyntaxHighlighter
            language={codeLanguage}
            style={vscDarkPlus}
            customStyle={{
              margin: 0,
              padding: '12px',
              background: 'rgba(0, 0, 0, 0.6)',
              fontSize: '11px',
              lineHeight: '1.4'
            }}
            wrapLongLines={true}
            showLineNumbers={false}
          >
            {codeContent}
          </SyntaxHighlighter>
        </div>
      </div>
    );
  }
  
  return <div>{elements}</div>;
};

const Queue: React.FC<QueueProps> = ({ setView }) => {
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<ToastMessage>({
    title: "",
    description: "",
    variant: "neutral"
  })

  const [isTooltipVisible, setIsTooltipVisible] = useState(false)
  const [tooltipHeight, setTooltipHeight] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)

  const [chatInput, setChatInput] = useState("")
  // Enhanced chat state to maintain conversation history
  const [chatMessages, setChatMessages] = useState<{role: "user"|"gemini", text: string, timestamp: number}[]>([])
  const [chatLoading, setChatLoading] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const chatInputRef = useRef<HTMLInputElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const barRef = useRef<HTMLDivElement>(null)

  const { data: screenshots = [], refetch } = useQuery<Array<{ path: string; preview: string }>, Error>(
    ["screenshots"],
    async () => {
      try {
        const existing = await window.electronAPI.getScreenshots()
        return existing
      } catch (error) {
        console.error("Error loading screenshots:", error)
        showToast("Error", "Failed to load existing screenshots", "error")
        return []
      }
    },
    {
      staleTime: Infinity,
      cacheTime: Infinity,
      refetchOnWindowFocus: true,
      refetchOnMount: true
    }
  )

  const showToast = (
    title: string,
    description: string,
    variant: ToastVariant
  ) => {
    setToastMessage({ title, description, variant })
    setToastOpen(true)
  }

  const handleDeleteScreenshot = async (index: number) => {
    const screenshotToDelete = screenshots[index]

    try {
      const response = await window.electronAPI.deleteScreenshot(
        screenshotToDelete.path
      )

      if (response.success) {
        refetch()
      } else {
        console.error("Failed to delete screenshot:", response.error)
        showToast("Error", "Failed to delete the screenshot file", "error")
      }
    } catch (error) {
      console.error("Error deleting screenshot:", error)
    }
  }

  // Enhanced chat handler with conversation context
  const handleChatSend = async () => {
    if (!chatInput.trim()) return
    
    const userMessage = { role: "user" as const, text: chatInput.trim(), timestamp: Date.now() }
    setChatMessages((msgs) => [...msgs, userMessage])
    setChatLoading(true)
    setChatInput("")
    
    try {
      // Build conversation context for the LLM
      const conversationHistory = [...chatMessages, userMessage]
        .slice(-10) // Keep last 10 messages to avoid token limits
        .map(msg => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.text}`)
        .join("\n\n")
      
      // Enhanced prompt with conversation context
      const contextualPrompt = conversationHistory.length > 1 
        ? `Previous conversation:\n${conversationHistory.slice(0, -1)}\n\nCurrent question: ${userMessage.text}\n\nPlease respond considering the previous conversation context. If this is a follow-up question, refer to previous responses appropriately. Format code blocks with proper markdown using \`\`\` for multi-line code and \` for inline code.`
        : `${userMessage.text}\n\nPlease format code blocks properly using \`\`\` for multi-line code and \` for inline code.`
      
      const response = await window.electronAPI.invoke("gemini-chat", contextualPrompt)
      setChatMessages((msgs) => [...msgs, { role: "gemini", text: response, timestamp: Date.now() }])
      
      // Auto-scroll to bottom
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
        }
      }, 100)
      
    } catch (err) {
      setChatMessages((msgs) => [...msgs, { role: "gemini", text: "Error: " + String(err), timestamp: Date.now() }])
    } finally {
      setChatLoading(false)
      chatInputRef.current?.focus()
    }
  }

  useEffect(() => {
    const updateDimensions = () => {
      if (contentRef.current) {
        let contentHeight = contentRef.current.scrollHeight
        const contentWidth = contentRef.current.scrollWidth
        if (isTooltipVisible) {
          contentHeight += tooltipHeight
        }
        window.electronAPI.updateContentDimensions({
          width: contentWidth,
          height: contentHeight
        })
      }
    }

    const resizeObserver = new ResizeObserver(updateDimensions)
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current)
    }
    updateDimensions()

    const cleanupFunctions = [
      window.electronAPI.onScreenshotTaken(() => refetch()),
      window.electronAPI.onResetView(() => {
        refetch()
        // Clear chat when resetting
        setChatMessages([])
      }),
      window.electronAPI.onSolutionError((error: string) => {
        showToast(
          "Processing Failed",
          "There was an error processing your screenshots.",
          "error"
        )
        setView("queue")
        console.error("Processing error:", error)
      }),
      window.electronAPI.onProcessingNoScreenshots(() => {
        showToast(
          "No Screenshots",
          "There are no screenshots to process.",
          "neutral"
        )
      })
    ]

    return () => {
      resizeObserver.disconnect()
      cleanupFunctions.forEach((cleanup) => cleanup())
    }
  }, [isTooltipVisible, tooltipHeight])

  // Enhanced screenshot handler with conversation context
  useEffect(() => {
    const unsubscribe = window.electronAPI.onScreenshotTaken(async (data) => {
      await refetch();
      setChatLoading(true);
      
      try {
        const latest = data?.path || (Array.isArray(data) && data.length > 0 && data[data.length - 1]?.path);
        if (latest) {
          // Enhanced prompt for screenshot analysis
          const conversationContext = chatMessages.length > 0 
            ? `\n\nPrevious conversation context:\n${chatMessages.slice(-5).map(msg => `${msg.role}: ${msg.text}`).join('\n')}\n\n`
            : '';
          
          const enhancedPrompt = `Analyze this screenshot of a coding problem or question.${conversationContext}If this is a coding problem, provide a clear solution with proper code formatting using \`\`\` blocks. If it's related to our previous conversation, reference that context appropriately.`;
          
          const response = await window.electronAPI.invoke("analyze-image-file", latest);
          const screenshotMessage = { 
            role: "gemini" as const, 
            text: response.text, 
            timestamp: Date.now() 
          };
          setChatMessages((msgs) => [...msgs, screenshotMessage]);
          
          // Auto-scroll to bottom
          setTimeout(() => {
            if (chatContainerRef.current) {
              chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
            }
          }, 100)
        }
      } catch (err) {
        setChatMessages((msgs) => [...msgs, { 
          role: "gemini", 
          text: "Error analyzing screenshot: " + String(err), 
          timestamp: Date.now() 
        }]);
      } finally {
        setChatLoading(false);
      }
    });
    return () => {
      unsubscribe && unsubscribe();
    };
  }, [refetch, chatMessages]);

  const handleTooltipVisibilityChange = (visible: boolean, height: number) => {
    setIsTooltipVisible(visible)
    setTooltipHeight(height)
  }

  const handleChatToggle = () => {
    setIsChatOpen(!isChatOpen)
  }

  // Copy functionality for chat messages
  const copyMessageText = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast("Copied", "Message copied to clipboard", "success")
    }).catch(() => {
      showToast("Error", "Failed to copy message", "error")
    })
  }

  return (
    <div
      ref={barRef}
      style={{
        position: "relative",
        width: "100%",
        pointerEvents: "auto"
      }}
      className="select-none"
    >
      <div className="bg-transparent w-full">
        <div className="px-2 py-1">
          <Toast
            open={toastOpen}
            onOpenChange={setToastOpen}
            variant={toastMessage.variant}
            duration={3000}
          >
            <ToastTitle>{toastMessage.title}</ToastTitle>
            <ToastDescription>{toastMessage.description}</ToastDescription>
          </Toast>
          <div className="w-fit">
            <QueueCommands
              screenshots={screenshots}
              onTooltipVisibilityChange={handleTooltipVisibilityChange}
              onChatToggle={handleChatToggle}
            />
          </div>
          {/* Enhanced Chat Interface with Transparent Theme */}
          {isChatOpen && (
            <div className="mt-4 w-full mx-auto liquid-glass chat-container p-4 flex flex-col">
              <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto mb-3 p-3 rounded-lg chat-background max-h-64 min-h-[120px] glass-content shadow-lg"
              >
                {chatMessages.length === 0 ? (
                  <div className="text-sm text-white/60 text-center mt-8">
                    💬 Chat with Gemini 2.5 Flash
                    <br />
                    <span className="text-xs text-white/40">
                      Take a screenshot (Cmd+H) for automatic analysis
                      <br />
                      Conversation history is maintained for follow-up questions
                    </span>
                  </div>
                ) : (
                  chatMessages.map((msg, idx) => (
                    <div
                      key={`${msg.timestamp}-${idx}`}
                      className={`w-full flex ${msg.role === "user" ? "justify-end" : "justify-start"} mb-3 group`}
                    >
                      <div
                        className={`max-w-[80%] px-3 py-1.5 rounded-xl text-xs shadow-md backdrop-blur-sm border relative ${
                          msg.role === "user" 
                            ? "chat-message-user ml-12" 
                            : "chat-message-assistant mr-12"
                        }`}
                        style={{ wordBreak: "break-word", lineHeight: "1.4" }}
                      >
                        {/* Copy button for each message */}
                        <button
                          onClick={() => copyMessageText(msg.text)}
                          className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 hover:bg-black/90 text-white/80 p-1 rounded-full text-xs"
                          title="Copy message"
                        >
                          📋
                        </button>
                        
                        {msg.role === "gemini" ? (
                          <div className="select-text">{parseMarkdown(msg.text)}</div>
                        ) : (
                          <div className="select-text text-white/90">{msg.text}</div>
                        )}
                      </div>
                    </div>
                  ))
                )}
                {chatLoading && (
                  <div className="flex justify-start mb-3">
                    <div className="chat-message-assistant px-3 py-1.5 rounded-xl text-xs backdrop-blur-sm border shadow-md mr-12">
                      <span className="inline-flex items-center">
                        <span className="animate-pulse text-white/40">●</span>
                        <span className="animate-pulse animation-delay-200 text-white/40">●</span>
                        <span className="animate-pulse animation-delay-400 text-white/40">●</span>
                        <span className="ml-2 text-white/70">Gemini is thinking...</span>
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <form
                className="flex gap-2 items-center glass-content"
                onSubmit={e => {
                  e.preventDefault();
                  handleChatSend();
                }}
              >
                <input
                  ref={chatInputRef}
                  className="flex-1 rounded-lg px-3 py-2 chat-input text-xs focus:outline-none focus:ring-1 focus:ring-white/30 shadow-lg transition-all duration-200 select-text"
                  placeholder="Type your message... (conversation history is maintained)"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  disabled={chatLoading}
                />
                <button
                  type="submit"
                  className="p-2 rounded-lg bg-black/60 hover:bg-black/80 border border-white/20 flex items-center justify-center transition-all duration-200 backdrop-blur-sm shadow-lg disabled:opacity-50"
                  disabled={chatLoading || !chatInput.trim()}
                  tabIndex={-1}
                  aria-label="Send"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-7.5-15-7.5v6l10 1.5-10 1.5v6z" />
                  </svg>
                </button>
              </form>
              
              {/* Chat Controls */}
              <div className="mt-2 flex justify-between items-center text-xs text-white/50">
                <span>{chatMessages.length} messages</span>
                <button
                  onClick={() => {
                    setChatMessages([])
                    showToast("Chat Cleared", "Conversation history cleared", "neutral")
                  }}
                  className="text-white/40 hover:text-white/70 transition-colors"
                >
                  Clear Chat
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Queue