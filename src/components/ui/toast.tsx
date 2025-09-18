// import * as React from "react"
// import * as ToastPrimitive from "@radix-ui/react-toast"
// import { cn } from "../../lib/utils"
// import { X } from "lucide-react"

// const ToastProvider = ToastPrimitive.Provider

// export type ToastMessage = {
//   title: string
//   description: string
//   variant: ToastVariant
// }

// const ToastViewport = React.forwardRef<
//   React.ElementRef<typeof ToastPrimitive.Viewport>,
//   React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
// >(({ className, ...props }, ref) => (
//   <ToastPrimitive.Viewport
//     ref={ref}
//     className={cn(
//       "bg-transparent fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
//       className
//     )}
//     {...props}
//   />
// ))
// ToastViewport.displayName = ToastPrimitive.Viewport.displayName

// type ToastVariant = "neutral" | "success" | "error"

// interface ToastProps
//   extends React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root> {
//   variant?: ToastVariant
// }

// const toastVariants: Record<ToastVariant, string> = {
//   neutral: "bg-black/60 backdrop-blur-md border-white/20 text-white/90",
//   success: "bg-black/70 backdrop-blur-md border-green-400/30 text-green-100",
//   error: "bg-black/70 backdrop-blur-md border-red-400/30 text-red-100"
// }

// const Toast = React.forwardRef<
//   React.ElementRef<typeof ToastPrimitive.Root>,
//   ToastProps
// >(({ className, variant = "neutral", ...props }, ref) => (
//   <ToastPrimitive.Root
//     ref={ref}
//     className={cn(
//       "group fixed top-4 left-4 z-50 w-auto max-w-sm px-4 py-3 rounded-lg shadow-lg animate-in fade-in slide-in-from-bottom border",
//       toastVariants[variant],
//       className
//     )}
//     {...props}
//   />
// ))
// Toast.displayName = ToastPrimitive.Root.displayName

// const ToastAction = React.forwardRef<
//   React.ElementRef<typeof ToastPrimitive.Action>,
//   React.ComponentPropsWithoutRef<typeof ToastPrimitive.Action>
// >(({ className, ...props }, ref) => (
//   <ToastPrimitive.Action
//     ref={ref}
//     className={cn("text-xs font-medium text-white/90 hover:text-white/70 transition-colors", className)}
//     {...props}
//   />
// ))
// ToastAction.displayName = ToastPrimitive.Action.displayName

// const ToastClose = React.forwardRef<
//   React.ElementRef<typeof ToastPrimitive.Close>,
//   React.ComponentPropsWithoutRef<typeof ToastPrimitive.Close>
// >(({ className, ...props }, ref) => (
//   <ToastPrimitive.Close
//     ref={ref}
//     className={cn(
//       "absolute top-2 right-2 text-white/60 hover:text-white/90 transition-colors bg-white/10 hover:bg-white/20 rounded p-1",
//       className
//     )}
//     {...props}
//   >
//     <X className="h-3 w-3" />
//   </ToastPrimitive.Close>
// ))
// ToastClose.displayName = ToastPrimitive.Close.displayName

// const ToastTitle = React.forwardRef<
//   React.ElementRef<typeof ToastPrimitive.Title>,
//   React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title>
// >(({ className, ...props }, ref) => (
//   <ToastPrimitive.Title
//     ref={ref}
//     className={cn("font-semibold text-sm text-white/95", className)}
//     {...props}
//   />
// ))
// ToastTitle.displayName = ToastPrimitive.Title.displayName

// const ToastDescription = React.forwardRef<
//   React.ElementRef<typeof ToastPrimitive.Description>,
//   React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description>
// >(({ className, ...props }, ref) => (
//   <ToastPrimitive.Description
//     ref={ref}
//     className={cn("text-xs text-white/80 mt-1", className)}
//     {...props}
//   />
// ))
// ToastDescription.displayName = ToastPrimitive.Description.displayName

// export type { ToastProps, ToastVariant }
// export {
//   ToastProvider,
//   ToastViewport,
//   Toast,
//   ToastAction,
//   ToastClose,
//   ToastTitle,
//   ToastDescription
// }






import * as React from "react"
import * as ToastPrimitive from "@radix-ui/react-toast"
import { cn } from "../../lib/utils"
import { X } from "lucide-react"

const ToastProvider = ToastPrimitive.Provider

export type ToastMessage = {
  title: string
  description: string
  variant: ToastVariant
}

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn(
      "bg-transparent fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitive.Viewport.displayName

type ToastVariant = "neutral" | "success" | "error"

interface ToastProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root> {
  variant?: ToastVariant
  isDarkTheme?: boolean
}

// Theme-aware toast variants
const getToastVariants = (isDarkTheme: boolean): Record<ToastVariant, string> => {
  if (isDarkTheme) {
    return {
      neutral: "bg-black/60 backdrop-blur-md border-white/20 text-white/90",
      success: "bg-black/70 backdrop-blur-md border-green-400/30 text-green-100",
      error: "bg-black/70 backdrop-blur-md border-red-400/30 text-red-100"
    }
  } else {
    return {
      neutral: "bg-white/80 backdrop-blur-md border-gray-300 text-gray-800",
      success: "bg-white/90 backdrop-blur-md border-green-500/30 text-green-800",
      error: "bg-white/90 backdrop-blur-md border-red-500/30 text-red-800"
    }
  }
}

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Root>,
  ToastProps
>(({ className, variant = "neutral", isDarkTheme = true, ...props }, ref) => {
  const toastVariants = getToastVariants(isDarkTheme)
  
  return (
    <ToastPrimitive.Root
      ref={ref}
      className={cn(
        "group fixed top-4 left-4 z-50 w-auto max-w-sm px-4 py-3 rounded-lg shadow-lg animate-in fade-in slide-in-from-bottom border transition-all duration-300",
        toastVariants[variant],
        className
      )}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitive.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Action> & { isDarkTheme?: boolean }
>(({ className, isDarkTheme = true, ...props }, ref) => (
  <ToastPrimitive.Action
    ref={ref}
    className={cn(
      "text-xs font-medium transition-colors",
      isDarkTheme 
        ? "text-white/90 hover:text-white/70"
        : "text-gray-700 hover:text-gray-900",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitive.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Close> & { isDarkTheme?: boolean }
>(({ className, isDarkTheme = true, ...props }, ref) => (
  <ToastPrimitive.Close
    ref={ref}
    className={cn(
      "absolute top-2 right-2 rounded p-1 transition-colors",
      isDarkTheme 
        ? "text-white/60 hover:text-white/90 bg-white/10 hover:bg-white/20"
        : "text-gray-600 hover:text-gray-900 bg-gray-200 hover:bg-gray-300",
      className
    )}
    {...props}
  >
    <X className="h-3 w-3" />
  </ToastPrimitive.Close>
))
ToastClose.displayName = ToastPrimitive.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title> & { isDarkTheme?: boolean }
>(({ className, isDarkTheme = true, ...props }, ref) => (
  <ToastPrimitive.Title
    ref={ref}
    className={cn(
      "font-semibold text-sm",
      isDarkTheme ? "text-white/95" : "text-gray-900",
      className
    )}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitive.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description> & { isDarkTheme?: boolean }
>(({ className, isDarkTheme = true, ...props }, ref) => (
  <ToastPrimitive.Description
    ref={ref}
    className={cn(
      "text-xs mt-1",
      isDarkTheme ? "text-white/80" : "text-gray-700",
      className
    )}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitive.Description.displayName

export type { ToastProps, ToastVariant }
export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastAction,
  ToastClose,
  ToastTitle,
  ToastDescription
}