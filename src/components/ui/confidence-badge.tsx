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

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-semibold",
        confidence >= 90
          ? "bg-green-100 text-green-700 border-green-200"
          : confidence >= 80
            ? "bg-amber-100 text-amber-700 border-amber-200"
            : "bg-red-100 text-red-700 border-red-200",
        className
      )}
    >
      {confidence}%
    </Badge>
  );
}
