// electron/ipcHandlers.ts - Updated with typing functionality
import { ipcMain, app } from "electron"
import { AppState } from "./main"

export function initializeIpcHandlers(appState: AppState): void {
  ipcMain.handle(
    "update-content-dimensions",
    async (event, { width, height }: { width: number; height: number }) => {
      if (width && height) {
        appState.setWindowDimensions(width, height)
      }
    }
  )

  ipcMain.handle("delete-screenshot", async (event, path: string) => {
    return appState.deleteScreenshot(path)
  })

  ipcMain.handle("take-screenshot", async () => {
    try {
      const screenshotPath = await appState.takeScreenshot()
      const preview = await appState.getImagePreview(screenshotPath)
      return { path: screenshotPath, preview }
    } catch (error) {
      console.error("Error taking screenshot:", error)
      throw error
    }
  })

  ipcMain.handle("get-screenshots", async () => {
    console.log({ view: appState.getView() })
    try {
      let previews = []
      if (appState.getView() === "queue") {
        previews = await Promise.all(
          appState.getScreenshotQueue().map(async (path) => ({
            path,
            preview: await appState.getImagePreview(path)
          }))
        )
      } else {
        previews = await Promise.all(
          appState.getExtraScreenshotQueue().map(async (path) => ({
            path,
            preview: await appState.getImagePreview(path)
          }))
        )
      }
      previews.forEach((preview: any) => console.log(preview.path))
      return previews
    } catch (error) {
      console.error("Error getting screenshots:", error)
      throw error
    }
  })

  ipcMain.handle("toggle-window", async () => {
    appState.toggleMainWindow()
  })

  ipcMain.handle("reset-queues", async () => {
    try {
      appState.clearQueues()
      console.log("Screenshot queues have been cleared.")
      return { success: true }
    } catch (error: any) {
      console.error("Error resetting queues:", error)
      return { success: false, error: error.message }
    }
  })

  // Audio analysis handlers
// In your audio analysis handler:
ipcMain.handle("analyze-audio-base64", async (event, data: string, mimeType: string) => {
  try {
    const result = await appState.processingHelper.processAudioBase64(data, mimeType)
    // DEBUG: Log what we're storing
    console.log("[DEBUG] Storing audio result as lastResponse:", result.text)
    appState.setLastResponse(result.text)
    return result
  } catch (error: any) {
    console.error("Error in analyze-audio-base64 handler:", error)
    throw error
  }
})

  ipcMain.handle("analyze-audio-file", async (event, path: string) => {
    try {
      const result = await appState.processingHelper.processAudioFile(path)
      // Store the result as the last response for typing
      appState.setLastResponse(result.text)
      return result
    } catch (error: any) {
      console.error("Error in analyze-audio-file handler:", error)
      throw error
    }
  })

  ipcMain.handle("analyze-image-file", async (event, path: string) => {
    try {
      const result = await appState.processingHelper.getLLMHelper().analyzeImageFile(path)
      // Store the result as the last response for typing
      appState.setLastResponse(result.text)
      return result
    } catch (error: any) {
      console.error("Error in analyze-image-file handler:", error)
      throw error
    }
  })

ipcMain.handle("gemini-chat", async (event, message: string) => {
  try {
    const result = await appState.processingHelper.getLLMHelper().chatWithGemini(message);
    // DEBUG: Log what we're storing
    console.log("[DEBUG] Storing chat result as lastResponse:", result)
    appState.setLastResponse(result)
    return result;
  } catch (error: any) {
    console.error("Error in gemini-chat handler:", error);
    throw error;
  }
});

  // **NEW: Typing functionality handlers**
  ipcMain.handle("type-text", async (event, text: string, countdownSeconds?: number) => {
    try {
      if (countdownSeconds && countdownSeconds > 0) {
        await appState.typingHelper.typeTextWithCountdown(text, countdownSeconds)
      } else {
        await appState.typingHelper.typeText(text)
      }
      return { success: true }
    } catch (error: any) {
      console.error("Error in type-text handler:", error)
      return { success: false, error: error.message }
    }
  })

ipcMain.handle("type-last-response", async (event, countdownSeconds?: number) => {
  try {
    const lastResponse = appState.getLastResponse()
    // DEBUG: Log what we're retrieving
    console.log("[DEBUG] Retrieved lastResponse for typing:", lastResponse)
    
    if (!lastResponse) {
      console.log("[DEBUG] No lastResponse available")
      return { success: false, error: "No response available to type" }
    }
    
    if (countdownSeconds && countdownSeconds > 0) {
      await appState.typingHelper.typeTextWithCountdown(lastResponse, countdownSeconds)
    } else {
      await appState.typingHelper.typeStoredResponse(lastResponse)
    }
    return { success: true }
  } catch (error: any) {
    console.error("Error in type-last-response handler:", error)
    return { success: false, error: error.message }
  }
})

  ipcMain.handle("type-current-solution", async (event, countdownSeconds?: number) => {
    try {
      const problemInfo = appState.getProblemInfo()
      if (!problemInfo) {
        return { success: false, error: "No solution available to type" }
      }

      await appState.typingHelper.typeCurrentSolution()
      return { success: true }
    } catch (error: any) {
      console.error("Error in type-current-solution handler:", error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("debug-last-response", async () => {
  const lastResponse = appState.getLastResponse()
  console.log("[DEBUG] Current lastResponse:", lastResponse)
  return { lastResponse }
})

  ipcMain.handle("cancel-typing", async () => {
    try {
      appState.typingHelper.cancelTyping()
      return { success: true }
    } catch (error: any) {
      console.error("Error in cancel-typing handler:", error)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("is-typing", async () => {
    return { isTyping: appState.typingHelper.getIsTyping() }
  })

  ipcMain.handle("get-last-response", async () => {
    return { response: appState.getLastResponse() }
  })

  ipcMain.handle("quit-app", () => {
    app.quit()
  })

  // Window movement handlers
  ipcMain.handle("move-window-left", async () => {
    appState.moveWindowLeft()
  })

  ipcMain.handle("move-window-right", async () => {
    appState.moveWindowRight()
  })

  ipcMain.handle("move-window-up", async () => {
    appState.moveWindowUp()
  })

  ipcMain.handle("move-window-down", async () => {
    appState.moveWindowDown()
  })

  ipcMain.handle("center-and-show-window", async () => {
    appState.centerAndShowWindow()
  })
}