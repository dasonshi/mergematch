import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";

interface BulkMergeConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matchGroupCount: number;
  duplicateCount: number;
  strategyName: string;
  onConfirm: (skipWarning: boolean) => void;
}

export function BulkMergeConfirmationModal({
  open,
  onOpenChange,
  matchGroupCount,
  duplicateCount,
  strategyName,
  onConfirm,
}: BulkMergeConfirmationModalProps) {
  const [skipWarning, setSkipWarning] = useState(false);

  const handleConfirm = () => {
    onConfirm(skipWarning);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Merge All Pending Matches</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>
                Merge {matchGroupCount} match groups using "{strategyName}" strategy?
              </p>
              <div className="space-y-1 text-sm">
                <p className="font-medium text-foreground">This will:</p>
                <ul className="space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground">•</span>
                    <span>Delete {duplicateCount} duplicate records</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground">•</span>
                    <span>Copy associated notes/tasks to master records</span>
                  </li>
                </ul>
              </div>
              <div className="flex items-start gap-2 p-3 bg-warning/10 border border-warning/30 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                <p className="text-sm text-warning">
                  This action cannot be easily undone. Rollback has limitations.
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex items-center space-x-2 py-2">
          <Checkbox
            id="skip-bulk-warning"
            checked={skipWarning}
            onCheckedChange={(checked) => setSkipWarning(checked as boolean)}
          />
          <label
            htmlFor="skip-bulk-warning"
            className="text-sm text-muted-foreground cursor-pointer"
          >
            Do not warn me again for bulk merges
          </label>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>
            Execute Merges
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
