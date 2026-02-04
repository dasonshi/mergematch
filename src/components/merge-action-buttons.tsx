import { Link } from "react-router-dom";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MergeActionButtonsProps {
  merge: { id: string; status: string };
  onRestore: () => void;
  restorePending?: boolean;
}

export function MergeActionButtons({ merge, onRestore, restorePending }: MergeActionButtonsProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Button variant="outline" size="sm" asChild>
        <Link to={`/history/${merge.id}`}>View</Link>
      </Button>
      {merge.status === "completed" && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRestore}
          disabled={restorePending}
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Restore
        </Button>
      )}
    </div>
  );
}
