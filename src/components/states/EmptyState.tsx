import { CheckCircle, ClipboardList, Search, FileX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type EmptyStateVariant = "no-duplicates" | "no-rules" | "no-results" | "no-data";

interface EmptyStateProps {
  variant: EmptyStateVariant;
  onAction?: () => void;
  actionLabel?: string;
}

const variants = {
  "no-duplicates": {
    icon: CheckCircle,
    iconColor: "text-success",
    title: "No duplicates found",
    description: "Great news! We haven't detected any duplicate records in your data.",
    defaultAction: "Run Manual Scan",
  },
  "no-rules": {
    icon: ClipboardList,
    iconColor: "text-muted-foreground",
    title: "No match rules configured",
    description: "Create your first match rule to start detecting duplicates.",
    defaultAction: "Create Rule",
  },
  "no-results": {
    icon: Search,
    iconColor: "text-muted-foreground",
    title: "No results found",
    description: "Try adjusting your search or filter criteria.",
    defaultAction: undefined,
  },
  "no-data": {
    icon: FileX,
    iconColor: "text-muted-foreground",
    title: "No data available",
    description: "There's nothing to display here yet.",
    defaultAction: undefined,
  },
};

export function EmptyState({ variant, onAction, actionLabel }: EmptyStateProps) {
  const config = variants[variant];
  const Icon = config.icon;
  const buttonLabel = actionLabel || config.defaultAction;

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className={`mb-4 rounded-full bg-muted p-4 ${config.iconColor}`}>
          <Icon className="h-8 w-8" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">{config.title}</h3>
        <p className="mb-6 max-w-sm text-sm text-muted-foreground">
          {config.description}
        </p>
        {buttonLabel && onAction && (
          <Button onClick={onAction}>{buttonLabel}</Button>
        )}
      </CardContent>
    </Card>
  );
}
