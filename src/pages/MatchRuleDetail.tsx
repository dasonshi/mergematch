import { useState, useEffect, useRef } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import { ArrowLeft, Edit, Search, Play, Loader2, ChevronDown, ChevronUp, X, Trash2, ArrowRight, AlertCircle, RefreshCw, Crown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLocation } from "@/contexts/LocationContext";
import { useUpgradeModal } from "@/components/ui/upgrade-modal";
import { useToast } from "@/hooks/use-toast";
import { api, MatchPair } from "@/lib/api";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { ConfidenceBadge } from "@/components/ui/confidence-badge";
import { TablePagination } from "@/components/ui/table-pagination";
import { MergeHistoryCard, RuleSummaryCard, getRecordName, getMatchFieldSubheading } from "@/components/rules";

export default function MatchRuleDetail() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { locationId, isLoading: authLoading, lastWebhookAt, plan } = useLocation();
  const { openUpgradeModal } = useUpgradeModal();
  const { toast } = useToast();
  const canAutoMerge = plan === "pro" || plan === "agency";
  const queryClient = useQueryClient();
  const [matchesExpanded, setMatchesExpanded] = useState(true);
  const [matchSearchQuery, setMatchSearchQuery] = useState("");
  const [showMergeAllDialog, setShowMergeAllDialog] = useState(false);
  const [bulkMergeProgress, setBulkMergeProgress] = useState({ current: 0, total: 0, inProgress: false });
  const [bulkJobId, setBulkJobId] = useState<string | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [matchPage, setMatchPage] = useState(1);
  const [matchPageSize, setMatchPageSize] = useState(50);
  const [mergeAllValidIds, setMergeAllValidIds] = useState<string[]>([]);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Stale data validation state
  const [isValidating, setIsValidating] = useState(false);
  const [showStaleModal, setShowStaleModal] = useState(false);
  const [staleMatchIds, setStaleMatchIds] = useState<string[]>([]);
  const [validMatchIds, setValidMatchIds] = useState<string[]>([]);

  // Fetch rule details
  const { data: rule, isLoading: ruleLoading, isPending: rulePending, isError: ruleError, refetch: refetchRule } = useQuery({
    queryKey: ["rule", id, locationId],
    queryFn: () => api.getMatchRule(id!),
    enabled: !!locationId && !!id,
  });

  // Fetch pending matches for this rule (paginated)
  const { data: matchesData, isLoading: matchesLoading, isError: matchesError, refetch: refetchMatches } = useQuery({
    queryKey: ["matches", id, locationId, matchPage, matchPageSize],
    queryFn: () => api.getMatches("pending", id, matchPageSize, (matchPage - 1) * matchPageSize),
    enabled: !!locationId && !!id,
    gcTime: 0,
  });

  // Error state
  const hasError = ruleError || matchesError;
  const handleRetry = () => {
    refetchRule();
    refetchMatches();
  };

  // Fetch merge history for this rule only
  const { data: mergesData, isLoading: mergesLoading } = useQuery({
    queryKey: ["merges", id, locationId],
    queryFn: () => api.getMerges(10, undefined, id),
    enabled: !!locationId && !!id,
    gcTime: 0, // No cache - always fresh
  });

  // Fetch total contacts count
  const { data: contactsStats, isLoading: contactsStatsLoading } = useQuery({
    queryKey: ["contacts-stats", locationId],
    queryFn: () => api.getContactsStats(),
    enabled: !!locationId,
    gcTime: 0, // No cache - always fresh
  });

  // Scan mutation (defined before useEffect that uses it)
  const scanMutation = useMutation({
    mutationFn: () => api.scanRule(id!),
    onSuccess: (data: { matches_found: number; records_scanned: number; stale_cleaned?: number }) => {
      const staleMsg = data.stale_cleaned ? ` Cleaned ${data.stale_cleaned} stale.` : '';
      toast({
        title: "Scan Complete",
        description: `Found ${data.matches_found} matches from ${data.records_scanned} records.${staleMsg}`,
      });
      // Invalidate all match-related queries to ensure dashboard updates
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({ queryKey: ["matches", "pending"] });
      queryClient.invalidateQueries({ queryKey: ["matches", id] });
      queryClient.invalidateQueries({ queryKey: ["match-counts"] });
      queryClient.invalidateQueries({ queryKey: ["rule", id] }); // Update last_scan_at
    },
    onError: (error: Error) => {
      toast({
        title: "Scan Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Auto-trigger merge all dialog from URL param (Pro+ only)
  useEffect(() => {
    const matchTotal = matchesData?.total ?? 0;
    if (searchParams.get('action') === 'merge-all' && matchTotal > 0 && !matchesLoading) {
      // Clear the action param from URL
      searchParams.delete('action');
      setSearchParams(searchParams, { replace: true });
      if (canAutoMerge) {
        setShowMergeAllDialog(true);
      } else {
        openUpgradeModal("auto_merge");
      }
    }
  }, [searchParams, matchesData, matchesLoading, setSearchParams, canAutoMerge, openUpgradeModal]);

  // Auto-trigger initial scan when coming from rule creation
  useEffect(() => {
    if (searchParams.get('scan') === 'pending' && rule && !scanMutation.isPending) {
      // Clear the scan param from URL
      searchParams.delete('scan');
      setSearchParams(searchParams, { replace: true });
      // Trigger the scan
      scanMutation.mutate();
    }
  }, [searchParams, rule, scanMutation.isPending, setSearchParams]);

  // Toggle rule status mutation
  const toggleMutation = useMutation({
    mutationFn: () => api.toggleRuleStatus(id!),
    onSuccess: (data) => {
      toast({
        title: data.is_active ? "Rule Activated" : "Rule Deactivated",
        description: `Rule is now ${data.is_active ? "active" : "inactive"}.`,
      });
      queryClient.invalidateQueries({ queryKey: ["rule", id] });
      queryClient.invalidateQueries({ queryKey: ["rules"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Toggle Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Rollback mutation
  const rollbackMutation = useMutation({
    mutationFn: (mergeId: string) => api.rollbackMerge(mergeId),
    onSuccess: () => {
      toast({
        title: "Rollback Successful",
        description: "The merge has been rolled back.",
      });
      queryClient.invalidateQueries({ queryKey: ["merges"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Rollback Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete rule state and mutation
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const deleteRuleMutation = useMutation({
    mutationFn: () => api.deleteMatchRule(id!),
    onSuccess: () => {
      toast({
        title: "Rule Deleted",
        description: "The match rule has been permanently deleted.",
      });
      // Navigate back to dashboard after deletion
      window.location.href = "/";
    },
    onError: (error: Error) => {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Validate matches before merge - checks if contacts still exist in GHL
  // Validation now auto-cleans stale matches in the backend
  const handleMergeAllClick = async () => {
    if (!id) return;

    setIsValidating(true);
    try {
      console.log("Starting validation for rule:", id);
      const result = await api.validateMatches(id) as { valid: string[]; stale: string[]; stale_cleaned?: number };
      console.log("Validation result:", result);

      // Refresh matches list (stale ones were auto-cleaned by backend)
      queryClient.invalidateQueries({ queryKey: ["matches"] });

      if (result.stale_cleaned && result.stale_cleaned > 0) {
        toast({
          title: "Stale Matches Cleaned",
          description: `Removed ${result.stale_cleaned} stale match(es) - contacts no longer exist.`,
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
      console.error("Validation error:", error);
      toast({
        title: "Validation Failed",
        description: error instanceof Error ? error.message : "Could not validate matches. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  // Handle cleanup and continue with valid matches
  const handleContinueWithValid = async () => {
    setShowStaleModal(false);

    // Clean up stale matches
    if (staleMatchIds.length > 0) {
      try {
        await api.cleanupStaleMatches(staleMatchIds);
        queryClient.invalidateQueries({ queryKey: ["matches"] });
      } catch (e) {
        console.error("Failed to cleanup stale matches:", e);
      }
    }

    // Proceed with merge of valid ones
    if (validMatchIds.length > 0) {
      handleMergeAll(validMatchIds);
    }
  };

  // Handle review updated list
  const handleReviewUpdated = async () => {
    setShowStaleModal(false);

    // Clean up stale matches
    if (staleMatchIds.length > 0) {
      try {
        await api.cleanupStaleMatches(staleMatchIds);
      } catch (e) {
        console.error("Failed to cleanup stale matches:", e);
      }
    }

    // Refresh the matches list
    queryClient.invalidateQueries({ queryKey: ["matches"] });

    toast({
      title: "List Updated",
      description: `Removed ${staleMatchIds.length} stale match(es). Review the updated list.`,
    });
  };

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

        // Refresh data
        queryClient.invalidateQueries({ queryKey: ["matches"] });
        queryClient.invalidateQueries({ queryKey: ["match-counts"] });
        queryClient.invalidateQueries({ queryKey: ["merges"] });

        // Create notification
        if (id && rule) {
          try {
            await api.createBulkMergeNotification(id, rule.name || "Unknown Rule", status.success_count, status.failed_count);
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
      const response = await api.startBulkMerge(matchIds, id);
      setBulkJobId(response.job_id);

      // Start polling for progress
      pollIntervalRef.current = setInterval(() => {
        pollJobStatus(response.job_id);
      }, 1000);

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

  const pendingMatches = matchesData?.data || [];
  const pendingTotal = matchesData?.total ?? 0;
  const mergeHistory = mergesData?.data || [];

  // Filter pending matches by search query (applies to current page)
  const filteredPendingMatches = pendingMatches.filter((match: MatchPair) => {
    if (!matchSearchQuery) return true;
    const query = matchSearchQuery.toLowerCase();
    const recordA = match.record_a_data || {};
    const recordB = match.record_b_data || {};
    return (
      recordA.firstName?.toLowerCase().includes(query) ||
      recordA.lastName?.toLowerCase().includes(query) ||
      recordA.email?.toLowerCase().includes(query) ||
      recordA.phone?.toLowerCase().includes(query) ||
      recordB.firstName?.toLowerCase().includes(query) ||
      recordB.lastName?.toLowerCase().includes(query) ||
      recordB.email?.toLowerCase().includes(query) ||
      recordB.phone?.toLowerCase().includes(query)
    );
  });

  // Define columns for the pending matches table
  const matchColumns: DataTableColumn<MatchPair>[] = [
    {
      header: "Record A",
      accessor: (match) => {
        const recordA = match.record_a_data || {};
        const matchFields = rule?.match_fields || [];
        const subheading = getMatchFieldSubheading(recordA, matchFields);
        return (
          <div>
            <a
              href={`https://app.gohighlevel.com/v2/location/${locationId}/contacts/detail/${match.record_a_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:text-primary hover:underline"
            >
              {getRecordName(recordA)}
            </a>
            {subheading && (
              <div className="text-xs text-muted-foreground">
                {subheading}
              </div>
            )}
          </div>
        );
      },
    },
    {
      header: "Record B",
      accessor: (match) => {
        const recordB = match.record_b_data || {};
        const matchFields = rule?.match_fields || [];
        const subheading = getMatchFieldSubheading(recordB, matchFields);
        return (
          <div>
            <a
              href={`https://app.gohighlevel.com/v2/location/${locationId}/contacts/detail/${match.record_b_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:text-primary hover:underline"
            >
              {getRecordName(recordB)}
            </a>
            {subheading && (
              <div className="text-xs text-muted-foreground">
                {subheading}
              </div>
            )}
          </div>
        );
      },
    },
    {
      header: "Confidence",
      accessor: (match) => <ConfidenceBadge score={match.confidence_score || 0} />,
    },
    {
      header: "Actions",
      align: "right" as const,
      accessor: (match) => (
        <Button size="sm" asChild>
          <Link to={`/match-rules/${id}/review/${match.id}`}>Merge</Link>
        </Button>
      ),
    },
  ];

  // Format date for inline display
  const formatInlineDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) +
           ' ' + date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  };

  // Show loading while waiting for auth/location or rule data
  if (authLoading || !locationId || ruleLoading || rulePending) {
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
        <p className="text-muted-foreground">Failed to load rule details</p>
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
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {rule.name}
          </h1>
          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground border-l pl-3">
            <span className="font-medium text-foreground">
              {contactsStatsLoading ? "..." : contactsStats?.total?.toLocaleString() ?? "—"}
            </span>
            <span className="capitalize">{rule.source_object.endsWith('s') ? rule.source_object : `${rule.source_object}s`}</span>
            <span className="text-muted-foreground/50">•</span>
            <span>Last Scanned: {formatInlineDate(rule.last_scan_at) || "Never"}</span>
            {lastWebhookAt && (
              <>
                <span className="text-muted-foreground/50">•</span>
                <span>Updated: {formatInlineDate(lastWebhookAt)}</span>
              </>
            )}
          </div>
        </div>

        {/* Right side: Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant={canAutoMerge ? "default" : "secondary"}
            onClick={canAutoMerge ? handleMergeAllClick : () => openUpgradeModal("auto_merge")}
            disabled={canAutoMerge && (pendingTotal === 0 || bulkMergeProgress.inProgress || isValidating)}
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
          <Button
            variant="secondary"
            size="sm"
            onClick={() => scanMutation.mutate()}
            disabled={scanMutation.isPending}
          >
            {scanMutation.isPending ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Search className="mr-1.5 h-4 w-4" />
            )}
            {scanMutation.isPending ? "Scanning..." : "Scan Now"}
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/match-rules/${id}/edit`}>
              <Edit className="mr-1.5 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Mobile Stats Row (visible only on small screens) */}
      <div className="flex sm:hidden flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="secondary">
          {contactsStatsLoading ? "..." : contactsStats?.total?.toLocaleString() ?? "—"} {rule.source_object.endsWith('s') ? rule.source_object : `${rule.source_object}s`}
        </Badge>
        <Badge variant="outline">
          Last Scanned: {formatInlineDate(rule.last_scan_at) || "Never"}
        </Badge>
      </div>

      {/* Scan Progress Banner */}
      {scanMutation.isPending && (
        <Card className="border-primary/30 bg-primary/5 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">Scanning for duplicates...</p>
                <p className="text-xs text-muted-foreground">
                  Analyzing {rule.source_object} records
                </p>
              </div>
            </div>
            <div className="mt-3 h-1 w-full rounded-full bg-primary/10 overflow-hidden">
              <div className="h-full w-1/3 rounded-full bg-primary/40 animate-pulse" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rule Summary Card */}
      <RuleSummaryCard
        rule={rule}
        onToggleStatus={() => toggleMutation.mutate()}
        isTogglePending={toggleMutation.isPending}
      />

      {/* Pending Matches Section */}
      <Card className="overflow-hidden">
        {/* Header with expand toggle and search */}
        <div className="flex items-center justify-between gap-4 p-4 border-b bg-muted/40">
          <button
            onClick={() => setMatchesExpanded(!matchesExpanded)}
            className="flex items-center gap-2 font-semibold hover:text-primary transition-colors"
          >
            {matchesExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            Pending Matches ({matchesLoading ? <Loader2 className="h-3 w-3 animate-spin inline" /> : pendingTotal})
          </button>
          {matchesExpanded && pendingTotal > 0 && (
            <div className="relative w-48">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={matchSearchQuery}
                onChange={(e) => setMatchSearchQuery(e.target.value)}
                className="h-8 pl-8 text-sm"
              />
            </div>
          )}
        </div>

        {matchesExpanded && (
          <>
            <CardContent className="p-0">
              <DataTable
                data={filteredPendingMatches}
                columns={matchColumns}
                keyField="id"
                loading={matchesLoading}
                minWidth="600px"
                emptyState={
                  pendingTotal === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-muted-foreground text-sm">No pending matches. Click "Scan Now" to search.</p>
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <p className="text-muted-foreground text-sm">No matches found for "{matchSearchQuery}"</p>
                      <Button variant="link" size="sm" onClick={() => setMatchSearchQuery("")}>
                        Clear search
                      </Button>
                    </div>
                  )
                }
              />
            </CardContent>
            <TablePagination
              page={matchPage}
              pageSize={matchPageSize}
              total={pendingTotal}
              onPageChange={setMatchPage}
              onPageSizeChange={setMatchPageSize}
            />
          </>
        )}
      </Card>

      {/* Merge History Section */}
      <MergeHistoryCard
        mergeHistory={mergeHistory}
        isLoading={mergesLoading}
        onRollback={(id) => rollbackMutation.mutate(id)}
        isRollbackPending={rollbackMutation.isPending}
      />

      {/* Merge All Confirmation Dialog */}
      <AlertDialog open={showMergeAllDialog} onOpenChange={setShowMergeAllDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Merge All Pending Matches?</AlertDialogTitle>
            <AlertDialogDescription>
              This will merge <span className="font-semibold">{mergeAllValidIds.length}</span> pending matches
              using Record A as the master for each pair. All duplicate records will be deleted.
              <br /><br />
              Snapshots will be saved for 30-day rollback. This action cannot be easily undone in bulk.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleMergeAll(mergeAllValidIds)}>
              Merge All ({mergeAllValidIds.length})
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Stale Data Modal */}
      <AlertDialog open={showStaleModal} onOpenChange={setShowStaleModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Stale Data Detected</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                <span className="font-semibold text-destructive">{staleMatchIds.length}</span> match pair(s)
                reference contacts that no longer exist (already merged or deleted).
              </p>
              {validMatchIds.length > 0 ? (
                <p>
                  <span className="font-semibold text-success">{validMatchIds.length}</span> valid match(es)
                  can still be merged.
                </p>
              ) : (
                <p className="text-muted-foreground">No valid matches remaining.</p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel onClick={handleReviewUpdated}>
              Review Updated List
            </AlertDialogCancel>
            {validMatchIds.length > 0 && (
              <AlertDialogAction onClick={handleContinueWithValid}>
                Continue with {validMatchIds.length} Valid
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Rule Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Match Rule?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the rule <span className="font-semibold">"{rule?.name}"</span> and
              all its pending matches. This action cannot be undone.
              <br /><br />
              Merge history will be preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteRuleMutation.mutate()}
              disabled={deleteRuleMutation.isPending}
            >
              {deleteRuleMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Rule"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
