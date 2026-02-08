import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DateRange } from "react-day-picker";
import { RotateCcw, Loader2, ExternalLink, Search, Filter, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MergeStatusBadge, getMergeStatusLabel } from "@/components/ui/merge-status-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { TablePagination } from "@/components/ui/table-pagination";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { useLocation } from "@/contexts/LocationContext";
import { useToast } from "@/hooks/use-toast";

import { api } from "@/lib/api";
import { MergeActionButtons } from "@/components/merge-action-buttons";
import { PageHeader } from "@/components/ui/page-header";
import { getGhlRecordUrl } from "@/lib/utils";

// Build CRM contact URL (legacy - for merge history we assume contacts since source_object isn't stored)
const getCrmContactUrl = (locationId: string, contactId: string) => {
  // Use the utility which defaults to contacts for backward compatibility
  return getGhlRecordUrl(locationId, "contacts", contactId);
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
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectAllMatching, setSelectAllMatching] = useState(false);
  const [showBulkRestoreDialog, setShowBulkRestoreDialog] = useState(false);
  const [bulkRestoreProgress, setBulkRestoreProgress] = useState({ current: 0, total: 0, inProgress: false });
  const abortRestoreRef = useRef(false);

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

  // Reset to page 1 and clear selection when filters change
  useEffect(() => {
    setPage(1);
    setSelectedIds(new Set());
    setSelectAllMatching(false);
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

  const merges = mergesData?.data || [];
  const total = mergesData?.total || 0;

  // Count restorable items (only completed status can be restored)
  const restorableOnPage = merges.filter((m: MergeItem) => m.status === "completed").length;
  const restorableTotal = statusFilter === "completed" ? total : restorableOnPage; // Approximate

  // Rollback mutation
  const rollbackMutation = useMutation({
    mutationFn: async (mergeId: string) => {
      return api.rollbackMerge(mergeId);
    },
    onSuccess: () => {
      toast({
        title: "Rollback Successful",
        description: "The duplicate record has been restored.",
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

  // Bulk restore handler
  const handleBulkRestore = async () => {
    setShowBulkRestoreDialog(false);

    let idsToRestore: string[] = [];

    if (selectAllMatching) {
      // Fetch all matching IDs from server
      try {
        const allData = await api.getMerges(
          10000,
          "completed", // Only completed can be restored
          undefined,
          0,
          debouncedSearch || undefined,
          dateFromStr,
          dateToStr,
        );
        idsToRestore = allData.data.map((m: MergeItem) => m.id);
      } catch {
        toast({
          title: "Failed to fetch records",
          description: "Could not retrieve all matching records.",
          variant: "destructive",
        });
        return;
      }
    } else {
      idsToRestore = Array.from(selectedIds);
    }

    if (idsToRestore.length === 0) return;

    abortRestoreRef.current = false;
    setBulkRestoreProgress({ current: 0, total: idsToRestore.length, inProgress: true });

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < idsToRestore.length; i++) {
      if (abortRestoreRef.current) {
        toast({
          title: "Restore Aborted",
          description: `Stopped after ${i} of ${idsToRestore.length}. ${successCount} succeeded, ${failCount} failed.`,
        });
        break;
      }

      try {
        await api.rollbackMerge(idsToRestore[i]);
        successCount++;
      } catch {
        failCount++;
      }
      setBulkRestoreProgress({ current: i + 1, total: idsToRestore.length, inProgress: true });
    }

    setBulkRestoreProgress({ current: 0, total: 0, inProgress: false });
    setSelectedIds(new Set());
    setSelectAllMatching(false);
    queryClient.invalidateQueries({ queryKey: ["merges"] });
    queryClient.invalidateQueries({ queryKey: ["merge-stats"] });
    queryClient.invalidateQueries({ queryKey: ["matches"] });

    if (!abortRestoreRef.current) {
      toast({
        title: "Bulk Restore Complete",
        description: `Successfully restored ${successCount} records.${failCount > 0 ? ` ${failCount} failed.` : ''}`,
        variant: failCount > 0 ? "destructive" : "default",
      });
    }
  };

  const hasActiveFilters = searchInput || statusFilter !== "all" || dateRange?.from || dateRange?.to;

  const clearFilters = () => {
    setSearchInput("");
    setDebouncedSearch("");
    setStatusFilter("all");
    setDateRange(undefined);
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    setSelectAllMatching(false);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
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
      header: "Master Record",
      accessor: (item) => (
        <div className="flex items-center gap-2">
          {(item.status === "completed" || item.status === "rolled_back") && locationId ? (
            <a
              href={getCrmContactUrl(locationId, item.master_record_id)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:text-primary hover:underline"
            >
              {item.master_record_name || `${item.master_record_id?.slice(0, 8)}...`}
            </a>
          ) : (
            <span className="font-medium">
              {item.master_record_name || `${item.master_record_id?.slice(0, 8)}...`}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Duplicate",
      hideOnMobile: true,
      accessor: (item) => (
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">
            {item.status === "rolled_back" && item.restored_record_id
              ? `${item.restored_record_id.slice(0, 8)}...`
              : `${item.duplicate_record_id?.slice(0, 8)}...`}
          </span>
          {item.status === "rolled_back" && item.restored_record_id && locationId && (
            <a
              href={getCrmContactUrl(locationId, item.restored_record_id)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80"
              title="View restored record"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (item) => <MergeStatusBadge status={item.status} />,
    },
    {
      header: "Rule",
      hideOnMobile: true,
      accessor: (item) =>
        item.rule_id ? (
          <Link
            to={`/match-rules/${item.rule_id}`}
            className="text-primary hover:underline"
          >
            {item.rule_name || "Unknown"}
          </Link>
        ) : (
          <span className="text-muted-foreground">-</span>
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
        <MergeActionButtons
          merge={item}
          onRestore={() => setRestoreItem(item)}
        />
      ),
    },
  ];

  // Selection display count
  const displaySelectedCount = selectAllMatching ? total : selectedIds.size;

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Merge History"
        description="View and manage all completed merges"
      >
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 w-[180px]"
          />
        </div>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">{getMergeStatusLabel("completed")}</SelectItem>
            <SelectItem value="rolled_back">{getMergeStatusLabel("rolled_back")}</SelectItem>
            <SelectItem value="failed">{getMergeStatusLabel("failed")}</SelectItem>
          </SelectContent>
        </Select>

        {/* Date Range */}
        <DateRangePicker
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          className="w-[220px]"
        />

        {/* Export */}
        <Button variant="outline" size="sm" onClick={handleExport} disabled={total === 0 || isExporting}>
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
        </Button>
      </PageHeader>

      {/* Selection Bar */}
      {(selectedIds.size > 0 || selectAllMatching) && (
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
          <span className="text-sm font-medium">
            {displaySelectedCount.toLocaleString()} selected
          </span>
          {!selectAllMatching && selectedIds.size < total && statusFilter === "completed" && (
            <Button
              variant="link"
              size="sm"
              className="text-primary p-0 h-auto"
              onClick={() => setSelectAllMatching(true)}
            >
              Select all {total.toLocaleString()} matching
            </Button>
          )}
          <div className="flex-1" />
          <Button
            size="sm"
            onClick={() => setShowBulkRestoreDialog(true)}
            disabled={bulkRestoreProgress.inProgress}
          >
            {bulkRestoreProgress.inProgress ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                {bulkRestoreProgress.current}/{bulkRestoreProgress.total}
              </>
            ) : (
              <>
                <RotateCcw className="mr-1.5 h-4 w-4" />
                Restore Selected
              </>
            )}
          </Button>
          {bulkRestoreProgress.inProgress && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => { abortRestoreRef.current = true; }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          {!bulkRestoreProgress.inProgress && (
            <Button variant="ghost" size="sm" onClick={clearSelection}>
              Clear
            </Button>
          )}
        </div>
      )}

      {/* History Table */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <DataTable
            data={merges}
            columns={columns}
            keyField="id"
            minWidth="750px"
            selectable
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            isRowSelectable={(item) => item.status === "completed"}
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
        <TablePagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </Card>

      {/* Restore Confirmation Dialog */}
      <Dialog open={!!restoreItem} onOpenChange={() => setRestoreItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore Merged Record</DialogTitle>
            <DialogDescription>
              Are you sure you want to restore the duplicate record that was merged?
              This will recreate the deleted record.
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

      {/* Bulk Restore Dialog */}
      <AlertDialog open={showBulkRestoreDialog} onOpenChange={setShowBulkRestoreDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore Selected Merges?</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore <span className="font-semibold">{displaySelectedCount.toLocaleString()}</span> merged records,
              recreating the deleted duplicate records.
              <br /><br />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkRestore}>
              Restore All ({displaySelectedCount.toLocaleString()})
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
