import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { useLocation } from "@/contexts/LocationContext";
import { createMergeHistoryColumns, MergeHistoryRow } from "./mergeHistoryColumns";

type Merge = MergeHistoryRow;

interface MergeHistoryCardProps {
  mergeHistory: Merge[];
  isLoading: boolean;
  onRollback: (mergeId: string) => void;
  isRollbackPending: boolean;
}

export function MergeHistoryCard({
  mergeHistory,
  isLoading,
  onRollback,
  isRollbackPending,
}: MergeHistoryCardProps) {
  const { locationId } = useLocation();
  const columns = createMergeHistoryColumns({
    locationId,
    includeDuplicateColumn: true,
    includeDateColumn: true,
    dateHeader: "Date",
    onRestore: onRollback,
    restorePending: isRollbackPending,
  });

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-2 p-4 border-b bg-muted/40">
        <span className="font-semibold">Merge History</span>
        <Badge variant="secondary">{mergeHistory.length}</Badge>
      </div>

      <CardContent className="p-0">
        <DataTable
          data={mergeHistory}
          columns={columns}
          keyField="id"
          loading={isLoading}
          maxHeight="256px"
          stickyHeader
          minWidth="650px"
          emptyState={
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No merges performed yet.</p>
            </div>
          }
        />
      </CardContent>

      {mergeHistory.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
          <span className="text-sm text-muted-foreground">
            Showing {mergeHistory.length} recent merges
          </span>
          <Button variant="outline" size="sm" asChild>
            <Link to="/history">
              View Full History
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
    </Card>
  );
}
