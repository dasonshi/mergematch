import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RuleActionButtonsProps {
  rule: { id: string };
  pendingCount: number;
  onDelete: () => void;
}

export function RuleActionButtons({ rule, pendingCount, onDelete }: RuleActionButtonsProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      {pendingCount > 0 && (
        <Button size="sm" asChild>
          <Link to={`/match-rules/${rule.id}?action=merge-all`}>Merge All</Link>
        </Button>
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
