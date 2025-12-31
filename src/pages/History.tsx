import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, RotateCcw, Loader2, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "@/contexts/LocationContext";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

// Build GHL contact URL
const getGhlContactUrl = (locationId: string, contactId: string) => {
  return `https://app.gohighlevel.com/v2/location/${locationId}/contacts/detail/${contactId}`;
};

interface MergeItem {
  id: string;
  master_record_id: string;
  duplicate_record_id: string;
  status: string;
  created_at: string;
  match_pair_id?: string;
}

export default function History() {
  const { toast } = useToast();
  const { locationId, isLoading: authLoading } = useLocation();
  const queryClient = useQueryClient();
  const [restoreItem, setRestoreItem] = useState<MergeItem | null>(null);

  // Fetch merges
  const { data: mergesData, isLoading } = useQuery({
    queryKey: ["merges", locationId],
    queryFn: () => api.getMerges(100),
    enabled: !!locationId,
  });

  // Rollback mutation
  const rollbackMutation = useMutation({
    mutationFn: async (mergeId: string) => {
      return api.rollbackMerge(mergeId);
    },
    onSuccess: () => {
      toast({
        title: "Rollback Successful",
        description: "The duplicate contact has been restored.",
      });
      queryClient.invalidateQueries({ queryKey: ["merges"] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      setRestoreItem(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Rollback Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const merges = mergesData?.data || [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default" className="bg-green-500">Completed</Badge>;
      case "rolled_back":
        return <Badge variant="secondary">Rolled Back</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-12 lg:pt-0">
      <PageHeader title="Merge History" />

      {/* History Table */}
      {merges.length === 0 ? (
        <div className="border rounded-lg p-8 text-center">
          <p className="text-muted-foreground mb-4">No merges have been performed yet</p>
          <Button variant="outline" asChild>
            <Link to="/match-rules">Go to Match Rules</Link>
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Master Record</TableHead>
                <TableHead>Duplicate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>When</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {merges.map((item: MergeItem) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{item.master_record_id?.slice(0, 12)}...</span>
                      {item.status === "completed" && (
                        <a
                          href={getGhlContactUrl(locationId!, item.master_record_id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80"
                          title="View in GHL"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">← {item.duplicate_record_id?.slice(0, 12)}...</span>
                      {item.status === "rolled_back" && (
                        <a
                          href={getGhlContactUrl(locationId!, item.duplicate_record_id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80"
                          title="View restored record in GHL"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(item.status)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(item.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/history/${item.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Link>
                      </Button>
                      {item.status === "completed" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setRestoreItem(item)}
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Restore
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Showing {merges.length} merges</span>
      </div>

      {/* Restore Confirmation Dialog */}
      <Dialog open={!!restoreItem} onOpenChange={() => setRestoreItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore Merged Record</DialogTitle>
            <DialogDescription>
              Are you sure you want to restore the duplicate record that was merged?
              This will recreate the deleted contact in GoHighLevel.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestoreItem(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => restoreItem && rollbackMutation.mutate(restoreItem.id)}
              disabled={rollbackMutation.isPending}
            >
              {rollbackMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Restoring...
                </>
              ) : (
                "Restore Record"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
