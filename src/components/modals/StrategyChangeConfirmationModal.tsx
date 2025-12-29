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

interface StrategyChangeConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usedByRules: string[];
  onConfirm: () => void;
}

export function StrategyChangeConfirmationModal({
  open,
  onOpenChange,
  usedByRules,
  onConfirm,
}: StrategyChangeConfirmationModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Changes</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>
                This strategy is used by {usedByRules.length} Match Rule{usedByRules.length !== 1 ? "s" : ""}:
              </p>
              <ul className="space-y-1 text-sm">
                {usedByRules.map((rule) => (
                  <li key={rule} className="flex items-start gap-2">
                    <span className="text-muted-foreground">•</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm">
                Changes will apply to ALL future merges using these rules.
              </p>
              <p className="text-sm text-muted-foreground">
                Alternatively, use "Save as New" to create a copy.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>
            Save Changes
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
