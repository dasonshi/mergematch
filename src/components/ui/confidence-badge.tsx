import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ConfidenceBadgeProps {
  /** Confidence score from 0 to 1 (e.g., 0.95 = 95%) */
  score: number;
  className?: string;
}

/**
 * Displays a confidence score as a colored badge.
 * - Green (90%+): High confidence
 * - Amber (80-89%): Medium confidence
 * - Red (<80%): Low confidence
 */
export function ConfidenceBadge({ score, className }: ConfidenceBadgeProps) {
  const confidence = Math.round(score * 100);

  const variant = confidence >= 90
    ? "success-subtle"
    : confidence >= 80
      ? "warning-subtle"
      : "destructive-subtle";

  return (
    <Badge variant={variant} className={cn("font-semibold", className)}>
      {confidence}%
    </Badge>
  );
}
