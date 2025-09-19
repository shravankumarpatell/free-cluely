// electron/shortcuts.ts - Updated with typing shortcuts
import { globalShortcut, app, dialog } from "electron"
import { AppState } from "./main"

export class ShortcutsHelper {
  private appState: AppState

  constructor(appState: AppState) {
    this.appState = appState
  }

  public registerGlobalShortcuts(): void {
    // Add global shortcut to show/center window
    globalShortcut.register("CommandOrControl+Shift+Space", () => {
      console.log("Show/Center window shortcut pressed...")
      this.appState.centerAndShowWindow()
    })

    // Screenshot shortcut
    globalShortcut.register("CommandOrControl+H", async () => {
      const mainWindow = this.appState.getMainWindow()
      if (mainWindow) {
        console.log("Taking screenshot...")
        try {
          const screenshotPath = await this.appState.takeScreenshot()
          const preview = await this.appState.getImagePreview(screenshotPath)
          mainWindow.webContents.send("screenshot-taken", {
            path: screenshotPath,
            preview
          })
        } catch (error) {
          console.error("Error capturing screenshot:", error)
        }
      }
    })

    // Process screenshots shortcut
    globalShortcut.register("CommandOrControl+Enter", async () => {
      await this.appState.processingHelper.processScreenshots()
    })

    // **NEW: Type last response shortcut**
    // globalShortcut.register("CommandOrControl+]", async () => {
    //   console.log("Ctrl/Cmd + ] pressed - typing last response...")
      
    //   const lastResponse = this.appState.getLastResponse()
    //   if (!lastResponse) {
    //     const mainWindow = this.appState.getMainWindow()
    //     if (mainWindow) {
    //       dialog.showMessageBoxSync(mainWindow, {
    //         type: "info",
    //         message: "No response available to type. Generate a solution first."
    //       })
    //     }
    //     return
    //   }

    //   const mainWindow = this.appState.getMainWindow()
    //   try {
    //     // Optional confirmation dialog (remove if you want instant typing)
    //     if (mainWindow) {
    //       const confirmed = dialog.showMessageBoxSync(mainWindow, {
    //         type: "question",
    //         buttons: ["Yes, type it", "Cancel"],
    //         defaultId: 0,
    //         cancelId: 1,
    //         message: "Type the last response into the currently focused window?",
    //         detail: "Make sure to focus the target application first."
    //       }) === 0

    //       if (!confirmed) {
    //         console.log("Typing cancelled by user")
    //         return
    //       }
    //     }

    //     await this.appState.typingHelper.typeStoredResponse(lastResponse)
    //   } catch (error) {
    //     console.error("Error typing response:", error)
    //     if (mainWindow) {
    //       dialog.showErrorBox("Typing Error", `Failed to type response: ${error}`)
    //     }
    //   }
    // })



    // In your electron/shortcuts.ts, make sure you have this shortcut:

globalShortcut.register("CommandOrControl+]", async () => {
  console.log("[DEBUG] Ctrl/Cmd + ] pressed - typing last response...")
  
  const lastResponse = this.appState.getLastResponse()
  console.log("[DEBUG] Current lastResponse:", lastResponse)
  
  if (!lastResponse) {
    const mainWindow = this.appState.getMainWindow()
    if (mainWindow) {
      console.log("[DEBUG] No response available, showing dialog")
      dialog.showMessageBoxSync(mainWindow, {
        type: "info",
        message: "No response available to type. Generate a solution first."
      })
    }
    return
  }

  try {
    console.log("[DEBUG] Starting to type response...")
    await this.appState.typingHelper.typeStoredResponse(lastResponse)
    console.log("[DEBUG] Typing completed successfully")
  } catch (error) {
    console.error("[DEBUG] Error typing response:", error)
    const mainWindow = this.appState.getMainWindow()
    if (mainWindow) {
      dialog.showErrorBox("Typing Error", `Failed to type response: ${error}`)
    }
  }
})

    // **NEW: Type current solution shortcut**
    globalShortcut.register("CommandOrControl+Shift+]", async () => {
      console.log("Ctrl/Cmd + Shift + ] pressed - typing current solution...")
      
      try {
        const mainWindow = this.appState.getMainWindow()
        
        // Check if we have problem info
        const problemInfo = this.appState.getProblemInfo()
        if (!problemInfo) {
          if (mainWindow) {
            dialog.showMessageBoxSync(mainWindow, {
              type: "info",
              message: "No solution available. Take screenshots and generate a solution first."
            })
          }
          return
        }

        // Optional confirmation dialog
        if (mainWindow) {
          const confirmed = dialog.showMessageBoxSync(mainWindow, {
            type: "question",
            buttons: ["Yes, type solution", "Cancel"],
            defaultId: 0,
            cancelId: 1,
            message: "Type the current solution code into the focused window?",
            detail: "Make sure to focus your code editor first."
          }) === 0

          if (!confirmed) {
            console.log("Solution typing cancelled by user")
            return
          }
        }

        await this.appState.typingHelper.typeCurrentSolution()
      } catch (error) {
        console.error("Error typing solution:", error)
        const mainWindow = this.appState.getMainWindow()
        if (mainWindow) {
          dialog.showErrorBox("Typing Error", `Failed to type solution: ${error}`)
        }
      }
    })

    // Reset shortcut
    globalShortcut.register("CommandOrControl+R", () => {
      console.log("Command + R pressed. Canceling requests and resetting queues...")

      // Cancel ongoing typing
      this.appState.typingHelper.cancelTyping()

      // Cancel ongoing API requests
      this.appState.processingHelper.cancelOngoingRequests()

      // Clear both screenshot queues
      this.appState.clearQueues()

      console.log("Cleared queues.")

      // Update the view state to 'queue'
      this.appState.setView("queue")

      // Notify renderer process to switch view to 'queue'
      const mainWindow = this.appState.getMainWindow()
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send("reset-view")
      }
    })

    // Window movement shortcuts
    globalShortcut.register("CommandOrControl+Left", () => {
      console.log("Command/Ctrl + Left pressed. Moving window left.")
      this.appState.moveWindowLeft()
    })

    globalShortcut.register("CommandOrControl+Right", () => {
      console.log("Command/Ctrl + Right pressed. Moving window right.")
      this.appState.moveWindowRight()
    })

    globalShortcut.register("CommandOrControl+Down", () => {
      console.log("Command/Ctrl + down pressed. Moving window down.")
      this.appState.moveWindowDown()
    })

    globalShortcut.register("CommandOrControl+Up", () => {
      console.log("Command/Ctrl + Up pressed. Moving window Up.")
      this.appState.moveWindowUp()
    })

    // Toggle window shortcut
    globalShortcut.register("CommandOrControl+B", () => {
      this.appState.toggleMainWindow()
      const mainWindow = this.appState.getMainWindow()
      if (mainWindow && !this.appState.isVisible()) {
        if (process.platform === "darwin") {
          mainWindow.setAlwaysOnTop(true, "normal")
          setTimeout(() => {
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.setAlwaysOnTop(true, "floating")
            }
          }, 100)
        }
      }
    })

    // Unregister shortcuts when quitting
    app.on("will-quit", () => {
      globalShortcut.unregisterAll()
    })

    console.log("All shortcuts registered successfully")
  }
}