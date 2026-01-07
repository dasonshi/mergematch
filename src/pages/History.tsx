import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, RotateCcw, Loader2, ExternalLink, Search, X, Filter } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ResponsiveTable, ResponsiveTableContent } from "@/components/ui/responsive-table";
import { cn } from "@/lib/utils";
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
  master_record_name?: string;
  duplicate_record_id: string;
  restored_record_id?: string;
  status: string;
  created_at: string;
  match_pair_id?: string;
  rule_id?: string;
  rule_name?: string;
  error_message?: string;
}

export default function History() {
  const { toast } = useToast();
  const { locationId, isLoading: authLoading } = useLocation();
  const queryClient = useQueryClient();
  const [restoreItem, setRestoreItem] = useState<MergeItem | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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

  const allMerges = mergesData?.data || [];

  // Filter merges
  const filteredMerges = useMemo(() => {
    return allMerges.filter((item: MergeItem) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          item.master_record_name?.toLowerCase().includes(query) ||
          item.rule_name?.toLowerCase().includes(query) ||
          item.master_record_id?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== "all" && item.status !== statusFilter) {
        return false;
      }

      // Date range filter
      if (startDate || endDate) {
        const itemDate = new Date(item.created_at);
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          if (itemDate < start) return false;
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (itemDate > end) return false;
        }
      }

      return true;
    });
  }, [allMerges, searchQuery, statusFilter, startDate, endDate]);

  const hasActiveFilters = searchQuery || statusFilter !== "all" || startDate || endDate;

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setStartDate("");
    setEndDate("");
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return `Yesterday at ${timeStr}`;
    if (diffDays < 7) return `${diffDays} days ago at ${timeStr}`;
    return `${date.toLocaleDateString()} at ${timeStr}`;
  };

  const getStatusBadge = (status: string, errorMessage?: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-600 hover:bg-green-700">Merged</Badge>;
      case "rolled_back":
        return <Badge variant="outline" className="border-amber-500 text-amber-600">Restored</Badge>;
      case "failed":
        return (
          <div className="flex flex-col gap-1">
            <Badge variant="destructive">Failed</Badge>
            {errorMessage && (
              <span className="text-xs text-destructive/80 max-w-[200px] truncate" title={errorMessage}>
                {errorMessage}
              </span>
            )}
          </div>
        );
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
    <div className="space-y-6">
      <PageHeader title="Merge History" />

      {/* Filters */}
      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            {/* Search */}
            <div className="flex-1 space-y-2">
              <Label htmlFor="search" className="text-sm font-medium">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name or rule..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="w-full lg:w-40 space-y-2">
              <Label className="text-sm font-medium">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="completed">Merged</SelectItem>
                  <SelectItem value="rolled_back">Restored</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="w-full lg:w-40 space-y-2">
              <Label htmlFor="start-date" className="text-sm font-medium">From</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="w-full lg:w-40 space-y-2">
              <Label htmlFor="end-date" className="text-sm font-medium">To</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-10 px-3"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* History Table */}
      {filteredMerges.length === 0 ? (
        <Card className="shadow-md">
          <CardContent className="p-12 text-center">
            {hasActiveFilters ? (
              <>
                <Filter className="h-8 w-8 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No merges match your filters</p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </>
            ) : (
              <>
                <p className="text-muted-foreground mb-4">No merges have been performed yet</p>
                <Button variant="outline" asChild>
                  <Link to="/">Go to Dashboard</Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-md overflow-hidden">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="text-xl font-bold">Merge History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ResponsiveTable>
              <ResponsiveTableContent minWidth="750px">
                <thead className="bg-muted/30">
                  <tr className="border-b">
                    <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Rule</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Master Record</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Duplicate</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">When</th>
                    <th className="py-3 px-4 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actions</th>
                  </tr>
                </thead>
              <tbody>
              {filteredMerges.map((item: MergeItem) => (
                <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4">
                    {item.rule_id ? (
                      <Link
                        to={`/match-rules/${item.rule_id}`}
                        className="text-primary hover:underline font-medium"
                      >
                        {item.rule_name || "Unknown"}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-medium">
                    <div className="flex items-center gap-2">
                      <span>
                        {item.master_record_name || `${item.master_record_id?.slice(0, 12)}...`}
                      </span>
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
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">← {item.duplicate_record_id?.slice(0, 12)}...</span>
                      {item.status === "rolled_back" && item.restored_record_id && (
                        <a
                          href={getGhlContactUrl(locationId!, item.restored_record_id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80"
                          title="View restored record in GHL"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {getStatusBadge(item.status, item.error_message)}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {formatDateTime(item.created_at)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" asChild>
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
                  </td>
                </tr>
              ))}
            </tbody>
          </ResponsiveTableContent>
        </ResponsiveTable>
          </CardContent>
        </Card>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {filteredMerges.length} of {allMerges.length} merges
          {hasActiveFilters && " (filtered)"}
        </span>
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
