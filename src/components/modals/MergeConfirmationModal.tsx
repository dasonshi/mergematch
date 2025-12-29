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

interface MergeConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  masterName: string;
  duplicateName: string;
  notesCount: number;
  tasksCount: number;
  onConfirm: (skipWarning: boolean) => void;
}

export function MergeConfirmationModal({
  open,
  onOpenChange,
  masterName,
  duplicateName,
  notesCount,
  tasksCount,
  onConfirm,
}: MergeConfirmationModalProps) {
  const [skipWarning, setSkipWarning] = useState(false);

  const handleConfirm = () => {
    onConfirm(skipWarning);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Merge</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>
                Merge "{duplicateName}" into "{masterName}"?
              </p>
              <ul className="space-y-1 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span>
                    {notesCount} note{notesCount !== 1 ? "s" : ""}, {tasksCount} task{tasksCount !== 1 ? "s" : ""} will be copied to master
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span>"{duplicateName}" will be permanently deleted</span>
                </li>
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex items-center space-x-2 py-2">
          <Checkbox
            id="skip-individual-warning"
            checked={skipWarning}
            onCheckedChange={(checked) => setSkipWarning(checked as boolean)}
          />
          <label
            htmlFor="skip-individual-warning"
            className="text-sm text-muted-foreground cursor-pointer"
          >
            Do not warn me again for individual merges
          </label>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>
            Confirm Merge
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
