import * as React from "react"
import { cn } from "@/lib/utils"

interface ResponsiveTableProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

/**
 * Responsive table wrapper that adds horizontal scroll on mobile
 * and ensures tables are accessible
 */
export function ResponsiveTable({
  children,
  className,
  ...props
}: ResponsiveTableProps) {
  return (
    <div
      className={cn(
        "w-full overflow-x-auto",
        // Add shadow hint on scroll
        "[&::-webkit-scrollbar]:h-2",
        "[&::-webkit-scrollbar-track]:bg-muted/50",
        "[&::-webkit-scrollbar-thumb]:bg-muted-foreground/20",
        "[&::-webkit-scrollbar-thumb]:rounded-full",
        className
      )}
      role="region"
      aria-label="Scrollable table"
      tabIndex={0}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * Table with minimum width to prevent cramped columns on mobile
 */
interface ResponsiveTableContentProps
  extends React.TableHTMLAttributes<HTMLTableElement> {
  minWidth?: string
}

export function ResponsiveTableContent({
  children,
  className,
  minWidth = "600px",
  ...props
}: ResponsiveTableContentProps) {
  return (
    <table
      className={cn("w-full text-sm", className)}
      style={{ minWidth }}
      {...props}
    >
      {children}
    </table>
  )
}
