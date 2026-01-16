import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, RotateCcw, Loader2, ExternalLink, Search, X, Filter, ChevronDown, MoreHorizontal } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { useLocation } from "@/contexts/LocationContext";
import { useToast } from "@/hooks/use-toast";

import { api } from "@/lib/api";

// Build CRM contact URL
const getCrmContactUrl = (locationId: string, contactId: string) => {
  // TODO: Make base URL configurable for whitelabel
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

  // Filter panel state
  const [filtersOpen, setFiltersOpen] = useState(true);

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
  const activeFilterCount = [searchQuery, statusFilter !== "all", startDate, endDate].filter(Boolean).length;

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

  // Define table columns
  const columns: DataTableColumn<MergeItem>[] = [
    {
      header: "Rule",
      accessor: (item) =>
        item.rule_id ? (
          <Link
            to={`/match-rules/${item.rule_id}`}
            className="text-primary hover:underline font-medium"
          >
            {item.rule_name || "Unknown"}
          </Link>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      header: "Master Record",
      accessor: (item) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">
            {item.master_record_name || `${item.master_record_id?.slice(0, 12)}...`}
          </span>
          {item.status === "completed" && locationId && (
            <a
              href={getCrmContactUrl(locationId, item.master_record_id)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80"
              title="View contact"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      ),
    },
    {
      header: "Duplicate",
      hideOnMobile: true,
      accessor: (item) => (
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="font-mono text-sm">← {item.duplicate_record_id?.slice(0, 12)}...</span>
          {item.status === "rolled_back" && item.restored_record_id && locationId && (
            <a
              href={getCrmContactUrl(locationId, item.restored_record_id)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80"
              title="View restored contact"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (item) => (
        <Badge
          variant={
            item.status === "completed" ? "success" :
            item.status === "rolled_back" ? "warning" :
            item.status === "failed" ? "destructive" : "secondary"
          }
        >
          {item.status === "completed" ? "Merged" :
           item.status === "rolled_back" ? "Restored" :
           item.status === "failed" ? "Failed" : item.status}
        </Badge>
      ),
    },
    {
      header: "When",
      hideOnMobile: true,
      accessor: (item) => (
        <span className="text-muted-foreground">{formatDateTime(item.created_at)}</span>
      ),
    },
    {
      header: "Actions",
      align: "right" as const,
      accessor: (item) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={`/history/${item.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Link>
            </DropdownMenuItem>
            {item.status === "completed" && (
              <DropdownMenuItem onClick={() => setRestoreItem(item)}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Restore
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

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

      {/* Collapsible Filters */}
      <Card>
        <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
          <div className="flex items-center justify-between p-4 border-b">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-1">{activeFilterCount}</Badge>
                )}
                <ChevronDown className={`h-4 w-4 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear all
              </Button>
            )}
          </div>
          <CollapsibleContent>
            <CardContent className="pt-4">
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
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* History Table */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <DataTable
            data={filteredMerges}
            columns={columns}
            keyField="id"
            minWidth="750px"
            emptyState={
              <div className="p-12 text-center">
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
              </div>
            }
          />
        </CardContent>
      </Card>

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
              This will recreate the deleted contact.
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
