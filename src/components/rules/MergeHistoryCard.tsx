import { Link } from "react-router-dom";
import { Loader2, RotateCcw, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResponsiveTable, ResponsiveTableContent } from "@/components/ui/responsive-table";
import { MergeStatusBadge } from "@/components/ui/merge-status-badge";

interface Merge {
  id: string;
  master_record_name?: string;
  master_record_id?: string;
  status: string;
  error_message?: string;
  created_at?: string;
}

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
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-2 p-4 border-b bg-muted/30">
        <span className="font-semibold">Merge History</span>
        <Badge variant="secondary">
          {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : mergeHistory.length}
        </Badge>
      </div>

      {mergeHistory.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-muted-foreground">No merges performed yet.</p>
        </div>
      ) : (
        <>
          <div className="max-h-64 overflow-y-auto">
            <ResponsiveTable>
              <ResponsiveTableContent minWidth="550px">
                <thead className="bg-muted/30 sticky top-0 z-10">
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground bg-muted/30">Master Record</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground bg-muted/30">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground bg-muted/30">Date</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground bg-muted/30">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mergeHistory.map((item) => (
                    <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-medium">
                        {item.master_record_name || item.master_record_id?.slice(0, 8) + "..."}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <MergeStatusBadge status={item.status} />
                          {item.status === 'failed' && item.error_message && (
                            <span className="text-xs text-destructive/80 max-w-[150px] truncate" title={item.error_message}>
                              {item.error_message}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {item.created_at ? new Date(item.created_at).toLocaleString() : "—"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/history/${item.id}`}>View</Link>
                          </Button>
                          {item.status === "completed" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onRollback(item.id)}
                              disabled={isRollbackPending}
                            >
                              <RotateCcw className="h-4 w-4 mr-1" />
                              Restore
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </ResponsiveTableContent>
            </ResponsiveTable>
          </div>
          <div className="flex items-center justify-between p-3 border-t bg-muted/20">
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
        </>
      )}
    </Card>
  );
}
