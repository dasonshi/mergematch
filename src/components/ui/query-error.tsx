import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "./button";

interface QueryErrorProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function QueryError({
  message = "Failed to load data",
  onRetry,
  className = ""
}: QueryErrorProps) {
  return (
    <div className={`flex flex-col items-center justify-center h-64 gap-4 ${className}`}>
      <AlertCircle className="h-8 w-8 text-destructive" />
      <p className="text-muted-foreground text-center">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      )}
    </div>
  );
}

interface QueryErrorInlineProps {
  message?: string;
  onRetry?: () => void;
}

export function QueryErrorInline({
  message = "Failed to load",
  onRetry
}: QueryErrorInlineProps) {
  return (
    <div className="flex items-center gap-2 text-destructive text-sm">
      <AlertCircle className="h-4 w-4" />
      <span>{message}</span>
      {onRetry && (
        <Button variant="ghost" size="sm" onClick={onRetry} className="h-6 px-2">
          Retry
        </Button>
      )}
    </div>
  );
}
