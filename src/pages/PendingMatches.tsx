import { useState, useMemo, useRef, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Search, X, Filter, ChevronDown, Play, AlertCircle, RefreshCw, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
import { DataTable } from "@/components/ui/data-table";
import { TablePagination } from "@/components/ui/table-pagination";
import { useLocation } from "@/contexts/LocationContext";
import { useUpgradeModal } from "@/components/ui/upgrade-modal";
import { useToast } from "@/hooks/use-toast";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { api, ObjectType } from "@/lib/api";
import { createPendingMatchColumns } from "@/components/rules/pendingTableColumns";

interface MatchPair {
  id: string;
  rule_id: string;
  record_a_id: string;
  record_b_id: string;
  record_a_data?: Record<string, unknown>;
  record_b_data?: Record<string, unknown>;
  confidence_score: number;
  status: string;
  created_at: string;
}

export default function PendingMatches() {
  const { id: ruleId } = useParams();
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

  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchQuery]);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Filter panel state
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300);
  const [confidenceFilter, setConfidenceFilter] = useState<string>("all");

  // Merge state - check localStorage on init to show correct button state immediately
  const [showMergeAllDialog, setShowMergeAllDialog] = useState(false);
  const [bulkMergeProgress, setBulkMergeProgress] = useState(() => {
    // Check if there's an active job for this rule
    const savedJobId = ruleId ? localStorage.getItem(`bulkJob_${ruleId}`) : null;
    return { current: 0, total: 0, inProgress: !!savedJobId };
  });
  const [bulkJobId, setBulkJobId] = useState<string | null>(() => {
    return ruleId ? localStorage.getItem(`bulkJob_${ruleId}`) : null;
  });
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [mergeAllValidIds, setMergeAllValidIds] = useState<string[]>([]);

  // Fetch rule details
  const { data: rule, isLoading: ruleLoading, isError: ruleError, refetch: refetchRule } = useQuery({
    queryKey: ["rule", ruleId, locationId],
    queryFn: () => api.getMatchRule(ruleId!),
    enabled: !!locationId && !!ruleId,
  });

  // Fetch object schema metadata so custom-object title fields resolve consistently.
  const { data: availableObjects = [] } = useQuery<ObjectType[]>({
    queryKey: ["availableObjects", locationId],
    queryFn: () => api.getAvailableObjects(),
    enabled: !!locationId,
  });

  // Fetch pending matches (paginated, with server-side search)
  const { data: matchesData, isLoading: matchesLoading, isError: matchesError, refetch: refetchMatches } = useQuery({
    queryKey: ["matches", ruleId, locationId, page, pageSize, debouncedSearchQuery],
    queryFn: () => api.getMatches("pending", ruleId, pageSize, (page - 1) * pageSize, debouncedSearchQuery || undefined),
    enabled: !!locationId && !!ruleId,
    gcTime: 0,
  });

  // Error state
  const hasError = ruleError || matchesError;
  const handleRetry = () => {
    refetchRule();
    refetchMatches();
  };

  const allMatches = matchesData?.data || [];
  const totalCount = matchesData?.total ?? allMatches.length;
  const matchFields = rule?.match_fields || [];
  const sourceObject = rule?.source_object || "contacts";
  const displayField = useMemo(() => {
    if (!rule?.source_object) return undefined;
    return availableObjects.find((objectType) => objectType.id === rule.source_object)?.displayField;
  }, [availableObjects, rule?.source_object]);

  // Filter matches - search is now server-side, only apply confidence filter client-side
  const filteredMatches = useMemo(() => {
    if (confidenceFilter === "all") return allMatches;
    return allMatches.filter((item: MatchPair) => {
      const score = item.confidence_score;
      if (confidenceFilter === "high" && score < 0.9) return false;
      if (confidenceFilter === "medium" && (score < 0.8 || score >= 0.9)) return false;
      if (confidenceFilter === "low" && score >= 0.8) return false;
      return true;
    });
  }, [allMatches, confidenceFilter]);

  const hasActiveFilters = searchQuery || confidenceFilter !== "all";
  const activeFilterCount = [searchQuery, confidenceFilter !== "all"].filter(Boolean).length;

  const clearFilters = () => {
    setSearchQuery("");
    setConfidenceFilter("all");
  };

  // Validate and merge all
  const handleMergeAllClick = async () => {
    if (!ruleId) return;

    setIsValidating(true);
    try {
      const result = await api.validateMatches(ruleId) as { valid: string[]; stale: string[]; stale_cleaned?: number };
      queryClient.invalidateQueries({ queryKey: ["matches"] });

      if (result.stale_cleaned && result.stale_cleaned > 0) {
        toast({
          title: "Stale Matches Cleaned",
          description: `Removed ${result.stale_cleaned} stale match(es).`,
        });
      }

      if (result.valid.length > 0) {
        setMergeAllValidIds(result.valid);
        setShowMergeAllDialog(true);
      } else {
        toast({
          title: "No Valid Matches",
          description: result.stale_cleaned
            ? "All matches were stale and have been cleaned up."
            : "No pending matches found to merge.",
        });
      }
    } catch (error) {
      toast({
        title: "Validation Failed",
        description: error instanceof Error ? error.message : "Could not validate matches.",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  // localStorage key for persisting active bulk job
  const BULK_JOB_KEY = `bulkJob_${ruleId}`;

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
  }, [ruleId]);

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
      console.log('[BulkMerge] Poll status:', status.processed_count, '/', status.total_count, status.status);
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

        // Clear localStorage
        localStorage.removeItem(BULK_JOB_KEY);

        // Refresh data
        queryClient.invalidateQueries({ queryKey: ["matches"] });
        queryClient.invalidateQueries({ queryKey: ["match-counts"] });
        queryClient.invalidateQueries({ queryKey: ["merges"] });

        // Create notification
        if (ruleId && rule) {
          try {
            await api.createBulkMergeNotification(ruleId, rule.name || "Unknown Rule", status.success_count, status.failed_count);
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({ queryKey: ["unread-count"] });
          } catch (e) {
            console.error("Failed to create notification:", e);
          }
        }

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
  const handleMergeAll = async (matchIds: string[]) => {
    setShowMergeAllDialog(false);
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

  const columns = useMemo(
    () =>
      createPendingMatchColumns({
        locationId,
        includeFoundColumn: true,
        resolveRuleContext: () => ({
          ruleId: ruleId || "",
          ruleName: rule?.name,
          sourceObject,
          matchFields,
          displayField,
        }),
      }),
    [displayField, locationId, matchFields, rule?.name, ruleId, sourceObject]
  );

  if (authLoading || ruleLoading || matchesLoading) {
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

  if (!rule) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Rule not found</p>
        <Link to="/" className="text-primary hover:underline mt-4 block">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Compact Header Row */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Left side: Back + Title + Inline Stats */}
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/match-rules/${ruleId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Pending Matches
          </h1>
          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground border-l pl-3">
            <span className="font-medium text-foreground">{totalCount.toLocaleString()}</span>
            <span>total pending</span>
          </div>
        </div>

        {/* Right side: Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant={canAutoMerge ? "default" : "secondary"}
            onClick={canAutoMerge ? handleMergeAllClick : () => openUpgradeModal("auto_merge")}
            disabled={canAutoMerge && (filteredMatches.length === 0 || bulkMergeProgress.inProgress || isValidating)}
          >
            {isValidating ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                Validating...
              </>
            ) : bulkMergeProgress.inProgress ? (
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
        </div>
      </div>

      {/* Mobile Stats Row */}
      <div className="flex sm:hidden flex-wrap items-center gap-2 text-xs">
        <Badge variant="secondary">{totalCount.toLocaleString()} total pending</Badge>
      </div>

      {/* Filters */}
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
                      placeholder="Search records..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* Confidence Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Confidence</Label>
                  <div className="flex gap-2">
                    {[
                      { value: "all", label: "All" },
                      { value: "high", label: "High (90%+)" },
                      { value: "medium", label: "Medium" },
                      { value: "low", label: "Low" },
                    ].map((option) => (
                      <Button
                        key={option.value}
                        variant={confidenceFilter === option.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setConfidenceFilter(option.value)}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Data Table */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <DataTable
            data={filteredMatches}
            columns={columns}
            keyField="id"
            minWidth="600px"
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
                      <Link to={`/match-rules/${ruleId}`}>Back to Rule</Link>
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
              This will merge <span className="font-semibold">{mergeAllValidIds.length.toLocaleString()}</span> pending matches
              using the rule's configured merge strategy.
              <br /><br />
              Snapshots will be saved for 30-day rollback.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleMergeAll(mergeAllValidIds)}>
              Merge All ({mergeAllValidIds.length.toLocaleString()})
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
