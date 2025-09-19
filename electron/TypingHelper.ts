// electron/TypingHelper.ts
import { AppState } from "./main"
const robot = require("robotjs")

export class TypingHelper {
  private appState: AppState
  private isTyping: boolean = false
  private typingTimeout: NodeJS.Timeout | null = null
  
  constructor(appState: AppState) {
    this.appState = appState
    
    // Configure robotjs for better performance and reliability
    try {
      robot.setKeyboardDelay(2) // Reduce default delay between keystrokes
    } catch (error) {
      console.warn("[TypingHelper] Failed to configure robotjs:", error)
    }
  }

  /**
   * Types text with human-like timing and behavior
   */
  public async typeText(text: string, minDelay = 8, maxDelay = 28, resetTypingState = true): Promise<void> {
    if (this.isTyping && resetTypingState) {
      console.log("[TypingHelper] Already typing, ignoring request")
      return
    }

    if (resetTypingState) {
      this.isTyping = true
    }
    
    try {
      console.log(`[TypingHelper] Starting to type text of length: ${text.length}`)
      
      // Small initial delay to allow user to focus target window
      await this.sleep(200)

      for (let i = 0; i < text.length; i++) {
        // Check if typing was cancelled
        if (!this.isTyping) {
          console.log("[TypingHelper] Typing cancelled during execution")
          break
        }

        const ch = text[i]

        // Handle special characters
        if (ch === "\n") {
          robot.keyTap("enter")
        } else if (ch === "\t") {
          robot.keyTap("tab")
        } else {
          try {
            // Use typeString for regular characters
            robot.typeString(String(ch))
          } catch (e) {
            console.warn(`[TypingHelper] Failed to type character: ${ch}`, e)
            // Fallback: try keyTap for common symbols
            try {
              robot.keyTap(String(ch))
            } catch (fallbackError) {
              console.warn(`[TypingHelper] Fallback failed for: ${ch}`, fallbackError)
              // Skip this character if both methods fail
              continue
            }
          }
        }

        // Add natural pauses with variety
        if (",.;:!?".includes(ch)) {
          // Longer pause after punctuation (80-200ms)
          await this.sleep(80 + Math.floor(Math.random() * 120))
        } else if (ch === " ") {
          // Medium pause after spaces (20-50ms)
          await this.sleep(20 + Math.floor(Math.random() * 30))
        } else {
          // Regular inter-character delay (8-28ms base)
          const delay = minDelay + Math.floor(Math.random() * (maxDelay - minDelay + 1))
          await this.sleep(delay)
        }

        // Add occasional longer pauses to simulate natural typing rhythm
        if (i % 20 === 0 && i > 0) {
          await this.sleep(50 + Math.floor(Math.random() * 100))
        }
      }

      console.log("[TypingHelper] Finished typing")
    } catch (error) {
      console.error("[TypingHelper] Error during typing:", error)
      throw error
    } finally {
      if (resetTypingState) {
        this.isTyping = false
        const mainWindow = this.appState.getMainWindow()
        if (mainWindow) {
          mainWindow.webContents.send("typing-finished")
        }
      }
    }
  }

  /**
   * Types text with a countdown delay to allow user to focus target window
   */
  public async typeTextWithCountdown(text: string, countdownSeconds = 3): Promise<void> {
    if (this.isTyping) {
      console.log("[TypingHelper] Already typing, ignoring request")
      return
    }

    // Set typing state to indicate we're in the process (including countdown)
    this.isTyping = true
    const mainWindow = this.appState.getMainWindow()
    
    try {
      // Show countdown in the UI
      for (let i = countdownSeconds; i > 0; i--) {
        console.log(`[TypingHelper] Starting typing in ${i} seconds...`)
        if (mainWindow) {
          mainWindow.webContents.send("typing-countdown", i)
        }
        await this.sleep(1000)
        
        // Check if cancelled during countdown
        if (!this.isTyping) {
          console.log("[TypingHelper] Typing cancelled during countdown")
          if (mainWindow) {
            mainWindow.webContents.send("typing-cancelled")
          }
          return
        }
      }

      if (mainWindow) {
        mainWindow.webContents.send("typing-started")
      }

      await this.typeText(text, 8, 28, false) // Don't reset typing state since we're managing it here
    } catch (error) {
      console.error("[TypingHelper] Error during countdown or typing:", error)
      this.isTyping = false
      if (mainWindow) {
        mainWindow.webContents.send("typing-cancelled")
      }
      throw error
    } finally {
      // Always reset typing state and send finished event
      this.isTyping = false
      if (mainWindow) {
        mainWindow.webContents.send("typing-finished")
      }
    }
  }

  /**
   * Cancels current typing operation
   */
  public cancelTyping(): void {
    console.log("[TypingHelper] Cancelling typing operation")
    
    this.isTyping = false
    
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout)
      this.typingTimeout = null
    }
    
    const mainWindow = this.appState.getMainWindow()
    if (mainWindow) {
      mainWindow.webContents.send("typing-cancelled")
    }
  }

  /**
   * Checks if currently typing
   */
  public getIsTyping(): boolean {
    return this.isTyping
  }

  /**
   * Utility sleep function
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      this.typingTimeout = setTimeout(() => {
        this.typingTimeout = null
        resolve()
      }, ms)
    })
  }

  /**
   * Types the current solution code with proper formatting
   */
  public async typeCurrentSolution(): Promise<void> {
    const problemInfo = this.appState.getProblemInfo()
    if (!problemInfo) {
      console.log("[TypingHelper] No problem info available")
      return
    }

    try {
      // Get solution from LLMHelper
      const solution = await this.appState.processingHelper.getLLMHelper().generateSolution(problemInfo)
      if (solution?.solution?.code) {
        // Clean up the code before typing (remove extra whitespace, normalize line endings)
        const cleanCode = this.cleanCodeForTyping(solution.solution.code)
        await this.typeTextWithCountdown(cleanCode, 3)
      } else {
        console.log("[TypingHelper] No code solution available")
      }
    } catch (error) {
      console.error("[TypingHelper] Error getting solution for typing:", error)
      throw error
    }
  }

  /**
   * Types any stored text response (for audio/chat responses)
   */
  public async typeStoredResponse(text: string): Promise<void> {
    if (!text) {
      console.log("[TypingHelper] No text to type")
      return
    }
    
    // Clean the response before typing
    const cleanText = this.cleanTextForTyping(text)
    await this.typeTextWithCountdown(cleanText, 3)
  }

  /**
   * Clean code text for better typing experience
   */
  private cleanCodeForTyping(code: string): string {
    return code
      .replace(/\r\n/g, "\n") // Normalize line endings
      .replace(/\r/g, "\n")
      .replace(/\t/g, "    ") // Convert tabs to 4 spaces
      .trim() // Remove leading/trailing whitespace
  }

  /**
   * Clean general text for better typing experience
   */
  private cleanTextForTyping(text: string): string {
    return text
      .replace(/\r\n/g, "\n") // Normalize line endings
      .replace(/\r/g, "\n")
      .replace(/\s+/g, " ") // Normalize multiple spaces to single space
      .replace(/\n\s*\n/g, "\n\n") // Normalize multiple newlines to double newline
      .trim()
  }

  /**
   * Set typing state for external control
   */
  public setTypingState(isTyping: boolean): void {
    this.isTyping = isTyping
  }
}