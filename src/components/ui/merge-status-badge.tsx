import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type MergeStatus = "completed" | "rolled_back" | "failed" | "pending" | string;

interface MergeStatusBadgeProps {
  status: MergeStatus;
  className?: string;
}

/**
 * Maps internal status codes to display labels.
 */
export function getMergeStatusLabel(status: MergeStatus): string {
  switch (status) {
    case "completed":
      return "Merged";
    case "rolled_back":
      return "Restored";
    case "failed":
      return "Failed";
    case "pending":
      return "Pending";
    default:
      return status;
  }
}

/**
 * Returns the badge variant for a given merge status.
 */
export function getMergeStatusVariant(
  status: MergeStatus
): "default" | "secondary" | "destructive" | "outline" | "success" | "warning" {
  switch (status) {
    case "completed":
      return "success";
    case "rolled_back":
      return "warning";
    case "failed":
      return "destructive";
    default:
      return "secondary";
  }
}

/**
 * Displays a merge status as a styled badge.
 * - completed → "Merged" (green/success)
 * - rolled_back → "Restored" (amber/warning)
 * - failed → "Failed" (red/destructive)
 * - pending → "Pending" (gray/secondary)
 */
export function MergeStatusBadge({ status, className }: MergeStatusBadgeProps) {
  return (
    <Badge variant={getMergeStatusVariant(status)} className={cn(className)}>
      {getMergeStatusLabel(status)}
    </Badge>
  );
}
