import * as React from "react"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ErrorStateProps {
  /** The error message to display */
  message?: string
  /** Optional title (defaults to "Something went wrong") */
  title?: string
  /** Callback when retry button is clicked */
  onRetry?: () => void
  /** Whether retry is in progress */
  isRetrying?: boolean
  /** Additional class names */
  className?: string
}

/**
 * Reusable error state component with retry functionality
 */
export function ErrorState({
  message = "An unexpected error occurred. Please try again.",
  title = "Something went wrong",
  onRetry,
  isRetrying = false,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="rounded-full bg-destructive/10 p-4 mb-4">
        <AlertCircle className="h-8 w-8 text-destructive" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-md mb-6">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          onClick={onRetry}
          disabled={isRetrying}
          aria-label={isRetrying ? "Retrying..." : "Try again"}
        >
          <RefreshCw
            className={cn("mr-2 h-4 w-4", isRetrying && "animate-spin")}
            aria-hidden="true"
          />
          {isRetrying ? "Retrying..." : "Try Again"}
        </Button>
      )}
    </div>
  )
}

/**
 * Inline error for smaller contexts (e.g., within cards)
 */
export function InlineError({
  message,
  onRetry,
  className,
}: {
  message: string
  onRetry?: () => void
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-sm text-destructive",
        className
      )}
      role="alert"
    >
      <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
      <span>{message}</span>
      {onRetry && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRetry}
          className="h-auto p-1 text-destructive hover:text-destructive"
        >
          <RefreshCw className="h-3 w-3" aria-hidden="true" />
          <span className="sr-only">Retry</span>
        </Button>
      )}
    </div>
  )
}
