import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ConnectionErrorBannerProps {
  onReconnect?: () => void;
}

export function ConnectionErrorBanner({ onReconnect }: ConnectionErrorBannerProps) {
  return (
    <Alert className="mb-4 border-warning/50 bg-warning/10">
      <AlertTriangle className="h-4 w-4 text-warning" />
      <AlertDescription className="flex items-center justify-between">
        <span className="text-warning-foreground">
          Connection issue - some features may be unavailable
        </span>
        {onReconnect && (
          <Button variant="outline" size="sm" onClick={onReconnect} className="ml-4">
            Reconnect
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
