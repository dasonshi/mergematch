import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface BulkMergeProgressProps {
  open: boolean;
  total: number;
  completed: number;
  onCancel?: () => void;
}

export function BulkMergeProgress({ open, total, completed, onCancel }: BulkMergeProgressProps) {
  const percentage = total > 0 ? (completed / total) * 100 : 0;

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" hideCloseButton>
        <DialogHeader>
          <DialogTitle>Merging {total} match groups...</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Progress value={percentage} className="h-3" />
          <p className="text-center text-sm text-muted-foreground">
            {completed} of {total} complete
          </p>
        </div>
        {onCancel && (
          <div className="flex justify-end">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
