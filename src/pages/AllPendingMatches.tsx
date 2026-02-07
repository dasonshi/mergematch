import { useState, useMemo, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Search, X, Play, Filter, AlertCircle, RefreshCw, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { ConfidenceBadge } from "@/components/ui/confidence-badge";
import { TablePagination } from "@/components/ui/table-pagination";
import { useLocation } from "@/contexts/LocationContext";
import { useUpgradeModal } from "@/components/ui/upgrade-modal";
import { useToast } from "@/hooks/use-toast";
import { api, MatchRule, MatchPair } from "@/lib/api";
import { getRecordName, getFirstMatchFieldValue } from "@/components/rules/helpers";

export default function AllPendingMatches() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { locationId, isLoading: authLoading, plan } = useLocation();
  const { openUpgradeModal } = useUpgradeModal();
  const queryClient = useQueryClient();
  const canAutoMerge = plan === "pro" || plan === "agency";

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [ruleFilter, setRuleFilter] = useState<string>("all");

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectAllMatching, setSelectAllMatching] = useState(false);
  const [showMergeSelectedDialog, setShowMergeSelectedDialog] = useState(false);

  // Merge state - check localStorage on init to show correct button state immediately
  const BULK_JOB_KEY_INIT = 'bulkJob_allMatches';
  const [showMergeAllDialog, setShowMergeAllDialog] = useState(false);
  const [bulkMergeProgress, setBulkMergeProgress] = useState(() => {
    const savedJobId = localStorage.getItem(BULK_JOB_KEY_INIT);
    return { current: 0, total: 0, inProgress: !!savedJobId };
  });
  const [bulkJobId, setBulkJobId] = useState<string | null>(() => {
    return localStorage.getItem(BULK_JOB_KEY_INIT);
  });
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch all match rules
  const { data: rulesData, isLoading: rulesLoading, isError: rulesError, refetch: refetchRules } = useQuery({
    queryKey: ["rules", locationId],
    queryFn: () => api.getMatchRules(),
    enabled: !!locationId,
  });

  const rules = rulesData?.data || [];
  const rulesMap = new Map(rules.map((r: MatchRule) => [r.id, r]));

  // Fetch all pending matches (paginated, with optional rule filter)
  const { data: matchesData, isLoading: matchesLoading, isError: matchesError, refetch: refetchMatches } = useQuery({
    queryKey: ["matches", "pending", "all", locationId, ruleFilter, page, pageSize],
    queryFn: () => api.getMatches("pending", ruleFilter !== "all" ? ruleFilter : undefined, pageSize, (page - 1) * pageSize),
    enabled: !!locationId,
    gcTime: 0,
  });

  // Error state
  const hasError = rulesError || matchesError;
  const handleRetry = () => {
    refetchRules();
    refetchMatches();
  };

  const allMatches = matchesData?.data || [];
  const totalCount = matchesData?.total ?? allMatches.length;

  // Fetch counts for per-rule badge numbers in the filter dropdown
  const { data: matchCountsData } = useQuery({
    queryKey: ["match-counts", "pending", locationId],
    queryFn: () => api.getMatchCounts("pending"),
    enabled: !!locationId,
    gcTime: 0,
  });
  const countsByRule = matchCountsData?.by_rule ?? {};

  // Clear selection when filters change; reset to page 1
  useEffect(() => {
    setSelectedIds(new Set());
    setSelectAllMatching(false);
    setPage(1);
  }, [searchQuery, ruleFilter]);

  // Filter matches (rule filter is now server-side; search is client-side on current page)
  const filteredMatches = useMemo(() => {
    if (!searchQuery) return allMatches;
    const query = searchQuery.toLowerCase();
    return allMatches.filter((item: MatchPair) => {
      const recordA = item.record_a_data || {};
      const recordB = item.record_b_data || {};
      const rule = rulesMap.get(item.rule_id);
      return (
        recordA.firstName?.toLowerCase().includes(query) ||
        recordA.lastName?.toLowerCase().includes(query) ||
        recordA.email?.toLowerCase().includes(query) ||
        recordA.phone?.toLowerCase().includes(query) ||
        recordB.firstName?.toLowerCase().includes(query) ||
        recordB.lastName?.toLowerCase().includes(query) ||
        recordB.email?.toLowerCase().includes(query) ||
        recordB.phone?.toLowerCase().includes(query) ||
        rule?.name?.toLowerCase().includes(query)
      );
    });
  }, [allMatches, searchQuery, rulesMap]);

  const hasActiveFilters = !!searchQuery || ruleFilter !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setRuleFilter("all");
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    setSelectAllMatching(false);
  };

  // localStorage key for persisting active bulk job
  const BULK_JOB_KEY = 'bulkJob_allMatches';

  // Resume polling if there's an active job (e.g., after page refresh)
  useEffect(() => {
    const savedJobId = localStorage.getItem(BULK_JOB_KEY);
    if (savedJobId && !bulkJobId) {
      console.log('[BulkMerge] Resuming job from localStorage:', savedJobId);
      setBulkJobId(savedJobId);
      setBulkMergeProgress({ current: 0, total: 0, inProgress: true });

      // Start polling immediately
      pollJobStatus(savedJobId);
      pollIntervalRef.current = setInterval(() => {
        pollJobStatus(savedJobId);
      }, 2000);
    }
  }, [locationId]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  // Poll bulk job status
  const pollJobStatus = async (jobId: string) => {
    try {
      const status = await api.getBulkJobStatus(jobId);
      setBulkMergeProgress({
        current: status.processed_count,
        total: status.total_count,
        inProgress: status.status === 'pending' || status.status === 'running',
      });

      // Job completed or stopped
      if (status.status === 'completed' || status.status === 'failed' || status.status === 'cancelled') {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        setBulkJobId(null);
        setBulkMergeProgress({ current: 0, total: 0, inProgress: false });
        setSelectedIds(new Set());
        setSelectAllMatching(false);

        // Clear localStorage
        localStorage.removeItem(BULK_JOB_KEY);

        // Refresh data
        queryClient.invalidateQueries({ queryKey: ["matches"] });
        queryClient.invalidateQueries({ queryKey: ["match-counts"] });
        queryClient.invalidateQueries({ queryKey: ["merges"] });
        queryClient.invalidateQueries({ queryKey: ["merge-stats"] });

        // Show completion toast
        if (status.status === 'completed') {
          toast({
            title: "Bulk Merge Complete",
            description: `Successfully merged ${status.success_count} records.${status.failed_count > 0 ? ` ${status.failed_count} failed.` : ''}`,
            variant: status.failed_count > 0 ? "destructive" : "default",
          });
        } else if (status.status === 'cancelled') {
          toast({
            title: "Merge Cancelled",
            description: `Stopped after ${status.processed_count} of ${status.total_count} merges. ${status.success_count} succeeded, ${status.failed_count} failed.`,
          });
        } else if (status.status === 'failed') {
          toast({
            title: "Bulk Merge Failed",
            description: `Job failed after ${status.processed_count} merges. ${status.success_count} succeeded.`,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Failed to poll job status:", error);
    }
  };

  // Server-side bulk merge with polling
  const startBulkMerge = async (matchIds: string[], ruleId?: string) => {
    if (matchIds.length === 0) return;

    setBulkMergeProgress({ current: 0, total: matchIds.length, inProgress: true });

    try {
      // Start server-side bulk merge
      const response = await api.startBulkMerge(matchIds, ruleId);
      setBulkJobId(response.job_id);

      // Save to localStorage for resume on refresh
      localStorage.setItem(BULK_JOB_KEY, response.job_id);

      // Poll immediately, then every 2 seconds
      pollJobStatus(response.job_id);
      pollIntervalRef.current = setInterval(() => {
        pollJobStatus(response.job_id);
      }, 2000);

    } catch (error) {
      setBulkMergeProgress({ current: 0, total: 0, inProgress: false });
      toast({
        title: "Bulk Merge Failed",
        description: error instanceof Error ? error.message : "Failed to start bulk merge",
        variant: "destructive",
      });
    }
  };

  // Cancel bulk job
  const handleCancelBulkMerge = async () => {
    if (!bulkJobId) return;

    try {
      await api.cancelBulkJob(bulkJobId);
      toast({
        title: "Cancellation Requested",
        description: "The merge will stop after the current batch completes.",
      });
    } catch (error) {
      toast({
        title: "Cancel Failed",
        description: error instanceof Error ? error.message : "Failed to cancel merge",
        variant: "destructive",
      });
    }
  };

  const handleMergeAll = async () => {
    setShowMergeAllDialog(false);
    // Fetch all pending match IDs for the merge (not just the current page)
    const allResult = await api.getMatches(
      "pending",
      ruleFilter !== "all" ? ruleFilter : undefined,
      10000
    );
    const matchIds = (allResult.data || []).map((m: MatchPair) => m.id);
    startBulkMerge(matchIds, ruleFilter !== "all" ? ruleFilter : undefined);
  };

  const handleMergeSelected = () => {
    setShowMergeSelectedDialog(false);
    const matchesToMerge = selectAllMatching
      ? filteredMatches
      : filteredMatches.filter((m: MatchPair) => selectedIds.has(m.id));
    const matchIds = matchesToMerge.map((m: MatchPair) => m.id);
    // For selected merges across multiple rules, don't pass a rule_id
    startBulkMerge(matchIds);
  };

  // Table columns
  const columns: DataTableColumn<MatchPair>[] = [
    {
      header: "Record A",
      accessor: (item) => {
        const recordA = item.record_a_data || {};
        const rule = rulesMap.get(item.rule_id);
        const matchFields = rule?.match_fields || [];
        const name = getRecordName(recordA, matchFields);
        const fieldValue = getFirstMatchFieldValue(recordA, matchFields);
        const ghlUrl = `https://app.gohighlevel.com/v2/location/${locationId}/contacts/detail/${item.record_a_id}`;
        // Don't show subheading if it matches the name (used as title)
        const showFieldValue = fieldValue && fieldValue !== name;
        return (
          <div>
            <Link
              to={`/match-rules/${item.rule_id}/review/${item.id}`}
              className="font-medium hover:text-primary hover:underline"
            >
              {name}
            </Link>
            {showFieldValue && (
              <a
                href={ghlUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs text-muted-foreground hover:text-primary hover:underline"
              >
                {fieldValue}
              </a>
            )}
          </div>
        );
      },
    },
    {
      header: "Record B",
      accessor: (item) => {
        const recordB = item.record_b_data || {};
        const rule = rulesMap.get(item.rule_id);
        const matchFields = rule?.match_fields || [];
        const name = getRecordName(recordB, matchFields);
        const fieldValue = getFirstMatchFieldValue(recordB, matchFields);
        const ghlUrl = `https://app.gohighlevel.com/v2/location/${locationId}/contacts/detail/${item.record_b_id}`;
        // Don't show subheading if it matches the name (used as title)
        const showFieldValue = fieldValue && fieldValue !== name;
        return (
          <div>
            <Link
              to={`/match-rules/${item.rule_id}/review/${item.id}`}
              className="font-medium hover:text-primary hover:underline"
            >
              {name}
            </Link>
            {showFieldValue && (
              <a
                href={ghlUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs text-muted-foreground hover:text-primary hover:underline"
              >
                {fieldValue}
              </a>
            )}
          </div>
        );
      },
    },
    {
      header: "Rule",
      hideOnMobile: true,
      accessor: (item) => {
        const rule = rulesMap.get(item.rule_id);
        return (
          <Link
            to={`/match-rules/${item.rule_id}`}
            className="text-sm text-muted-foreground hover:text-primary"
          >
            {rule?.name || "Unknown"}
          </Link>
        );
      },
    },
    {
      header: "Confidence",
      accessor: (item) => <ConfidenceBadge score={item.confidence_score || 0} />,
    },
    {
      header: "Found",
      hideOnMobile: true,
      accessor: (item) => (
        <span className="text-muted-foreground text-sm">
          {new Date(item.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: "Actions",
      align: "right" as const,
      accessor: (item) => (
        <Button size="sm" asChild>
          <Link to={`/match-rules/${item.rule_id}/review/${item.id}`}>Merge</Link>
        </Button>
      ),
    },
  ];

  // Selection display count
  const displaySelectedCount = selectAllMatching ? filteredMatches.length : selectedIds.size;

  if (authLoading || rulesLoading || matchesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-muted-foreground">Failed to load matches</p>
        <Button variant="outline" onClick={handleRetry}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Left side: Back + Title */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Pending Matches
          </h1>
        </div>

        {/* Right side: Search + Rule Filter + Merge All */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-[200px]"
            />
          </div>

          {/* Rule Filter */}
          <Select value={ruleFilter} onValueChange={setRuleFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Rules" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Rules</SelectItem>
              {rules.filter((r: MatchRule) => countsByRule[r.id]).map((rule: MatchRule) => (
                <SelectItem key={rule.id} value={rule.id}>
                  {rule.name} ({countsByRule[rule.id]})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Merge All Button (only show when nothing selected) */}
          {selectedIds.size === 0 && !selectAllMatching && (
            <>
              <Button
                size="sm"
                variant={canAutoMerge ? "default" : "secondary"}
                onClick={canAutoMerge ? () => setShowMergeAllDialog(true) : () => openUpgradeModal("auto_merge")}
                disabled={canAutoMerge && (filteredMatches.length === 0 || bulkMergeProgress.inProgress)}
              >
                {bulkMergeProgress.inProgress ? (
                  <>
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    {bulkMergeProgress.current}/{bulkMergeProgress.total}
                  </>
                ) : !canAutoMerge ? (
                  <>
                    <Crown className="mr-1.5 h-4 w-4" />
                    Merge All
                  </>
                ) : (
                  <>
                    <Play className="mr-1.5 h-4 w-4" />
                    Merge All
                  </>
                )}
              </Button>
              {bulkMergeProgress.inProgress && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleCancelBulkMerge}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Selection Bar */}
      {(selectedIds.size > 0 || selectAllMatching) && (
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
          <span className="text-sm font-medium">
            {displaySelectedCount.toLocaleString()} selected
          </span>
          {!selectAllMatching && selectedIds.size < filteredMatches.length && (
            <Button
              variant="link"
              size="sm"
              className="text-primary p-0 h-auto"
              onClick={() => setSelectAllMatching(true)}
            >
              Select all {filteredMatches.length.toLocaleString()} matching
            </Button>
          )}
          <div className="flex-1" />
          <Button
            size="sm"
            variant={canAutoMerge ? "default" : "secondary"}
            onClick={canAutoMerge ? () => setShowMergeSelectedDialog(true) : () => openUpgradeModal("auto_merge")}
            disabled={canAutoMerge && bulkMergeProgress.inProgress}
          >
            {bulkMergeProgress.inProgress ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                {bulkMergeProgress.current}/{bulkMergeProgress.total}
              </>
            ) : !canAutoMerge ? (
              <>
                <Crown className="mr-1.5 h-4 w-4" />
                Merge Selected
              </>
            ) : (
              <>
                <Play className="mr-1.5 h-4 w-4" />
                Merge Selected
              </>
            )}
          </Button>
          {bulkMergeProgress.inProgress && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleCancelBulkMerge}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          {!bulkMergeProgress.inProgress && (
            <Button variant="ghost" size="sm" onClick={clearSelection}>
              Clear
            </Button>
          )}
        </div>
      )}

      {/* Data Table */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <DataTable
            data={filteredMatches}
            columns={columns}
            keyField="id"
            minWidth="700px"
            selectable
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            emptyState={
              <div className="p-12 text-center">
                {hasActiveFilters ? (
                  <>
                    <Filter className="h-8 w-8 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">No matches match your filters</p>
                    <Button variant="outline" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-muted-foreground mb-4">No pending matches found</p>
                    <Button variant="outline" asChild>
                      <Link to="/">Back to Dashboard</Link>
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
          total={totalCount}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </Card>

      {/* Merge All Dialog */}
      <AlertDialog open={showMergeAllDialog} onOpenChange={setShowMergeAllDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Merge All Pending Matches?</AlertDialogTitle>
            <AlertDialogDescription>
              This will merge <span className="font-semibold">{totalCount.toLocaleString()}</span> pending matches
              using each rule's configured merge strategy.
              <br /><br />
              Snapshots will be saved for 30-day rollback.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleMergeAll}>
              Merge All ({totalCount.toLocaleString()})
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Merge Selected Dialog */}
      <AlertDialog open={showMergeSelectedDialog} onOpenChange={setShowMergeSelectedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Merge Selected Matches?</AlertDialogTitle>
            <AlertDialogDescription>
              This will merge <span className="font-semibold">{displaySelectedCount.toLocaleString()}</span> selected matches
              using each rule's configured merge strategy.
              <br /><br />
              Snapshots will be saved for 30-day rollback.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleMergeSelected}>
              Merge Selected ({displaySelectedCount.toLocaleString()})
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
