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
import { useState } from "react";

interface RestoreConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactName: string;
  onConfirm: (skipWarning: boolean) => void;
}

export function RestoreConfirmationModal({
  open,
  onOpenChange,
  contactName,
  onConfirm,
}: RestoreConfirmationModalProps) {
  const [skipWarning, setSkipWarning] = useState(false);

  const handleConfirm = () => {
    onConfirm(skipWarning);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Restore Merge</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>
                Recreate "{contactName}" as a separate contact?
              </p>
              <div className="space-y-1 text-sm">
                <p className="font-medium text-foreground">Limitations:</p>
                <ul className="space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground">•</span>
                    <span>Will have a NEW contact ID</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground">•</span>
                    <span>Notes/tasks copied during merge remain on master</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-muted-foreground">•</span>
                    <span>Original timestamps cannot be recovered</span>
                  </li>
                </ul>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex items-center space-x-2 py-2">
          <Checkbox
            id="skip-restore-warning"
            checked={skipWarning}
            onCheckedChange={(checked) => setSkipWarning(checked as boolean)}
          />
          <label
            htmlFor="skip-restore-warning"
            className="text-sm text-muted-foreground cursor-pointer"
          >
            Do not warn me again for restores
          </label>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>
            Restore
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
