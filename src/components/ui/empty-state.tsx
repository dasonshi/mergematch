import * as React from "react"
import { LucideIcon, FolderOpen, FileQuestion, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Link } from "react-router-dom"

interface EmptyStateProps {
  /** Icon to display */
  icon?: LucideIcon
  /** Title text */
  title: string
  /** Description text */
  description?: string
  /** Primary action */
  action?: {
    label: string
    href?: string
    onClick?: () => void
    icon?: LucideIcon
  }
  /** Secondary action (link style) */
  secondaryAction?: {
    label: string
    href?: string
    onClick?: () => void
  }
  /** Additional class names */
  className?: string
}

/**
 * Reusable empty state component with configurable icon, text, and actions
 */
export function EmptyState({
  icon: Icon = FolderOpen,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
    >
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon
          className="h-8 w-8 text-muted-foreground"
          aria-hidden="true"
        />
      </div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      {description && (
        <p className="text-muted-foreground text-sm max-w-md mb-6">
          {description}
        </p>
      )}
      <div className="flex flex-col sm:flex-row gap-3">
        {action && (
          action.href ? (
            <Button asChild>
              <Link to={action.href}>
                {action.icon && (
                  <action.icon className="mr-2 h-4 w-4" aria-hidden="true" />
                )}
                {action.label}
              </Link>
            </Button>
          ) : (
            <Button onClick={action.onClick}>
              {action.icon && (
                <action.icon className="mr-2 h-4 w-4" aria-hidden="true" />
              )}
              {action.label}
            </Button>
          )
        )}
        {secondaryAction && (
          secondaryAction.href ? (
            <Button variant="outline" asChild>
              <Link to={secondaryAction.href}>{secondaryAction.label}</Link>
            </Button>
          ) : (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )
        )}
      </div>
    </div>
  )
}

/**
 * Preset empty states for common scenarios
 */
export function NoRulesEmpty({ className }: { className?: string }) {
  return (
    <EmptyState
      icon={FolderOpen}
      title="No match rules yet"
      description="Create a rule to automatically find duplicate records in your account."
      action={{
        label: "Create Your First Rule",
        href: "/match-rules/new",
      }}
      className={className}
    />
  )
}

export function NoMatchesEmpty({ className }: { className?: string }) {
  return (
    <EmptyState
      icon={Search}
      title="No pending matches"
      description="Run a scan on your match rules to find duplicate records."
      className={className}
    />
  )
}

export function NoMergesEmpty({ className }: { className?: string }) {
  return (
    <EmptyState
      icon={FileQuestion}
      title="No merges yet"
      description="Merges will appear here after you review and approve matches from your rules."
      action={{
        label: "View Match Rules",
        href: "/",
      }}
      className={className}
    />
  )
}

export function NoDataEmpty({
  title = "No data found",
  description,
  className,
}: {
  title?: string
  description?: string
  className?: string
}) {
  return (
    <EmptyState
      icon={FileQuestion}
      title={title}
      description={description}
      className={className}
    />
  )
}
