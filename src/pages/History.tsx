import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DateRange } from "react-day-picker";
import { Eye, RotateCcw, Loader2, ExternalLink, Search, X, Filter, ChevronDown, MoreHorizontal, Download, ChevronLeft, ChevronRight } from "lucide-react";
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
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { HistoryStats } from "@/components/ui/history-stats";
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
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Export state
  const [isExporting, setIsExporting] = useState(false);

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Derive date strings for query keys and API calls
  const dateFromStr = dateRange?.from?.toISOString()?.split("T")[0];
  const dateToStr = dateRange?.to?.toISOString()?.split("T")[0];

  // Reset to page 1 when any filter or page size changes
  useEffect(() => {
    setPage(1);
  }, [statusFilter, debouncedSearch, dateFromStr, dateToStr, pageSize]);

  const offset = (page - 1) * pageSize;

  // Server-side paginated query
  const { data: mergesData, isLoading } = useQuery({
    queryKey: ["merges", locationId, pageSize, offset, statusFilter, debouncedSearch, dateFromStr, dateToStr],
    queryFn: () => api.getMerges(
      pageSize,
      statusFilter !== "all" ? statusFilter : undefined,
      undefined,
      offset,
      debouncedSearch || undefined,
      dateFromStr,
      dateToStr,
    ),
    enabled: !!locationId,
  });

  // Dedicated stats from server (not computed from page slice)
  const { data: mergeStatsData } = useQuery({
    queryKey: ["merge-stats", locationId],
    queryFn: () => api.getMergeStats(),
    enabled: !!locationId,
  });

  const merges = mergesData?.data || [];
  const total = mergesData?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startRecord = total > 0 ? offset + 1 : 0;
  const endRecord = Math.min(offset + merges.length, total);

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
      queryClient.invalidateQueries({ queryKey: ["merge-stats"] });
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

  const hasActiveFilters = searchInput || statusFilter !== "all" || dateRange?.from || dateRange?.to;
  const activeFilterCount = [searchInput, statusFilter !== "all", dateRange?.from || dateRange?.to].filter(Boolean).length;

  const clearFilters = () => {
    setSearchInput("");
    setDebouncedSearch("");
    setStatusFilter("all");
    setDateRange(undefined);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Fetch ALL matching records with current filters (not just current page)
      const allData = await api.getMerges(
        10000,
        statusFilter !== "all" ? statusFilter : undefined,
        undefined,
        0,
        debouncedSearch || undefined,
        dateFromStr,
        dateToStr,
      );

      const headers = ["Rule", "Master Record", "Master Record ID", "Duplicate ID", "Status", "Date"];
      const rows = allData.data.map((item: MergeItem) => [
        item.rule_name || "-",
        item.master_record_name || "-",
        item.master_record_id,
        item.duplicate_record_id,
        item.status,
        new Date(item.created_at).toISOString(),
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `merge-history-${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Export complete",
        description: `Exported ${allData.data.length} records to CSV.`,
      });
    } catch {
      toast({
        title: "Export failed",
        description: "Could not export merge history.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
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
          <span className="font-mono text-sm">&larr; {item.duplicate_record_id?.slice(0, 12)}...</span>
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
      <div className="flex items-center justify-between">
        <PageHeader title="Merge History" />
        <Button variant="outline" size="sm" onClick={handleExport} disabled={total === 0 || isExporting}>
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </>
          )}
        </Button>
      </div>

      {/* Stats Dashboard — powered by dedicated stats endpoint */}
      <HistoryStats
        totalMerges={mergeStatsData?.total ?? 0}
        completedMerges={mergeStatsData?.completed ?? 0}
        rollbackCount={mergeStatsData?.rolled_back ?? 0}
      />

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
                      placeholder="Search by name..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
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

                {/* Date Range Picker */}
                <div className="w-full lg:w-auto space-y-2">
                  <Label className="text-sm font-medium">Date Range</Label>
                  <DateRangePicker
                    dateRange={dateRange}
                    onDateRangeChange={setDateRange}
                    className="w-full lg:w-[280px]"
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
            data={merges}
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

      {/* Pagination Footer */}
      {total > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-muted-foreground">
          {/* Page size selector */}
          <div className="flex items-center gap-2">
            <span>Rows per page</span>
            <Select value={pageSize.toString()} onValueChange={(v) => setPageSize(Number(v))}>
              <SelectTrigger className="w-[70px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Range indicator */}
          <span>
            Showing {startRecord}&ndash;{endRecord} of {total}
            {hasActiveFilters && " (filtered)"}
          </span>

          {/* Prev / Next buttons */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-2 min-w-[80px] text-center">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

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
