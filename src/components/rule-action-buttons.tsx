import { Link } from "react-router-dom";
import { Trash2, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "@/contexts/LocationContext";
import { useUpgradeModal } from "@/components/ui/upgrade-modal";

interface RuleActionButtonsProps {
  rule: { id: string };
  pendingCount: number;
  onDelete: () => void;
}

export function RuleActionButtons({ rule, pendingCount, onDelete }: RuleActionButtonsProps) {
  const { plan } = useLocation();
  const { openUpgradeModal } = useUpgradeModal();
  const canAutoMerge = plan === "pro" || plan === "agency";

  return (
    <div className="flex items-center justify-end gap-2">
      {pendingCount > 0 && (
        canAutoMerge ? (
          <Button size="sm" asChild>
            <Link to={`/match-rules/${rule.id}?action=merge-all`}>Merge All</Link>
          </Button>
        ) : (
          <Button size="sm" variant="secondary" onClick={() => openUpgradeModal("auto_merge")}>
            <Crown className="mr-1.5 h-4 w-4" />
            Merge All
          </Button>
        )
      )}
      <Button variant="outline" size="sm" asChild>
        <Link to={`/match-rules/${rule.id}`}>View</Link>
      </Button>
      <Button variant="outline" size="sm" asChild>
        <Link to={`/match-rules/${rule.id}/edit`}>Edit</Link>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={onDelete}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
