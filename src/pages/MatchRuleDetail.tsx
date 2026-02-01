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
import { ArrowLeft, Edit, Search, Play, Loader2, ChevronDown, ChevronUp, RotateCcw, X, Trash2, ArrowRight, CalendarClock, Lock, AlertCircle, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLocation } from "@/contexts/LocationContext";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { computeStrategySelections, computeMasterId, StrategyId } from "@/lib/merge-strategies";
import { ResponsiveTable, ResponsiveTableContent } from "@/components/ui/responsive-table";
import { cn } from "@/lib/utils";
import { MergeHistoryCard, RuleSummaryCard, getRecordName, getMatchFieldSubheading } from "@/components/rules";

export default function MatchRuleDetail() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { locationId, isLoading: authLoading, canUseStrategies, lastWebhookAt, plan } = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [matchesExpanded, setMatchesExpanded] = useState(true);
  const [matchSearchQuery, setMatchSearchQuery] = useState("");
  const [mergingIds, setMergingIds] = useState<Set<string>>(new Set());
  const [showMergeAllDialog, setShowMergeAllDialog] = useState(false);
  const [bulkMergeProgress, setBulkMergeProgress] = useState({ current: 0, total: 0, inProgress: false });
  const abortMergeRef = useRef(false);

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

  // Fetch pending matches for this rule
  const { data: matchesData, isLoading: matchesLoading, isError: matchesError, refetch: refetchMatches } = useQuery({
    queryKey: ["matches", id, locationId],
    queryFn: () => api.getMatches("pending", id),
    enabled: !!locationId && !!id,
    gcTime: 0, // No cache - always fresh
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
    },
    onError: (error: Error) => {
      toast({
        title: "Scan Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Auto-trigger merge all dialog from URL param
  useEffect(() => {
    const matches = matchesData?.data || [];
    if (searchParams.get('action') === 'merge-all' && matches.length > 0 && !matchesLoading) {
      setShowMergeAllDialog(true);
      // Clear the action param from URL
      searchParams.delete('action');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, matchesData, matchesLoading, setSearchParams]);

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

  // Quick merge mutation (strategy-aware)
  const quickMergeMutation = useMutation({
    mutationFn: async (match: any) => {
      const strategy = (rule?.merge_strategy || "standard") as StrategyId;
      const overwriteBlanks = rule?.merge_settings?.overwrite_blanks ?? false;
      const recordA = match.record_a_data || {};
      const recordB = match.record_b_data || {};
      const fields = ["firstName", "lastName", "email", "phone", "tags", "address1", "city", "state", "postalCode"];
      const selections = computeStrategySelections({
        strategy,
        recordA,
        recordB,
        fields,
        overwriteBlanks,
      });
      const masterId = computeMasterId(strategy, recordA, recordB, fields, match.record_a_id, match.record_b_id);
      return api.executeMerge(match.id, masterId, selections);
    },
    onMutate: (match) => {
      setMergingIds(prev => new Set(prev).add(match.id));
    },
    onSuccess: (_, match) => {
      toast({
        title: "Merge Successful",
        description: "The contacts have been merged.",
      });
      setMergingIds(prev => {
        const next = new Set(prev);
        next.delete(match.id);
        return next;
      });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({ queryKey: ["merges"] });
    },
    onError: (error: Error, match) => {
      toast({
        title: "Merge Failed",
        description: error.message,
        variant: "destructive",
      });
      setMergingIds(prev => {
        const next = new Set(prev);
        next.delete(match.id);
        return next;
      });
    },
  });

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

  // Bulk merge all pending matches
  const handleMergeAll = async (specificMatchIds?: string[]) => {
    setShowMergeAllDialog(false);
    const allMatches = matchesData?.data || [];

    // If specific IDs provided, filter to only those; otherwise use all
    const matches = specificMatchIds
      ? allMatches.filter((m: any) => specificMatchIds.includes(m.id))
      : allMatches;

    if (matches.length === 0) return;

    abortMergeRef.current = false; // Reset abort flag
    setBulkMergeProgress({ current: 0, total: matches.length, inProgress: true });

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < matches.length; i++) {
      // Check abort flag before each merge
      if (abortMergeRef.current) {
        toast({
          title: "Merge Aborted",
          description: `Stopped after ${i} of ${matches.length} merges. ${successCount} succeeded, ${failCount} failed.`,
        });
        break;
      }

      const match = matches[i];
      try {
        const strategy = (rule?.merge_strategy || "standard") as StrategyId;
        const overwriteBlanks = rule?.merge_settings?.overwrite_blanks ?? false;
        const recordA = match.record_a_data || {};
        const recordB = match.record_b_data || {};
        const fields = ["firstName", "lastName", "email", "phone", "tags", "address1", "city", "state", "postalCode"];
        const selections = computeStrategySelections({
          strategy,
          recordA,
          recordB,
          fields,
          overwriteBlanks,
        });
        const masterId = computeMasterId(strategy, recordA, recordB, fields, match.record_a_id, match.record_b_id);

        await api.executeMerge(match.id, masterId, selections);
        successCount++;
      } catch {
        failCount++;
      }
      setBulkMergeProgress({ current: i + 1, total: matches.length, inProgress: true });

      // Real-time update: invalidate queries after each merge
      queryClient.invalidateQueries({ queryKey: ["merges"] });
    }

    setBulkMergeProgress({ current: 0, total: 0, inProgress: false });
    queryClient.invalidateQueries({ queryKey: ["matches"] });

    // Only show completion toast and create notification if not aborted
    if (!abortMergeRef.current) {
      // Create notification for bulk merge result
      try {
        await api.createBulkMergeNotification(id!, rule?.name || "Unknown Rule", successCount, failCount);
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
        queryClient.invalidateQueries({ queryKey: ["unread-count"] });
      } catch (e) {
        console.error("Failed to create notification:", e);
      }

      toast({
        title: "Bulk Merge Complete",
        description: `Successfully merged ${successCount} records.${failCount > 0 ? ` ${failCount} failed.` : ''}`,
        variant: failCount > 0 ? "destructive" : "default",
      });
    }
  };

  const pendingMatches = matchesData?.data || [];
  const mergeHistory = mergesData?.data || [];

  // Filter pending matches by search query
  const filteredPendingMatches = pendingMatches.filter((match: any) => {
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
            onClick={handleMergeAllClick}
            disabled={pendingMatches.length === 0 || bulkMergeProgress.inProgress || isValidating}
          >
            {isValidating ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Validating...
              </>
            ) : bulkMergeProgress.inProgress ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                {bulkMergeProgress.current}/{bulkMergeProgress.total}
              </>
            ) : (
              <>
                <Play className="mr-1.5 h-3.5 w-3.5" />
                Merge All
              </>
            )}
          </Button>
          {bulkMergeProgress.inProgress && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => { abortMergeRef.current = true; }}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => scanMutation.mutate()}
            disabled={scanMutation.isPending}
          >
            {scanMutation.isPending ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Search className="mr-1.5 h-3.5 w-3.5" />
            )}
            {scanMutation.isPending ? "Scanning..." : "Scan Now"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={plan === 'free'}
            asChild={plan !== 'free'}
          >
            {plan === 'free' ? (
              <span className="flex items-center">
                <Lock className="mr-1.5 h-3 w-3" />
                <CalendarClock className="mr-1.5 h-3.5 w-3.5" />
                Schedule
              </span>
            ) : (
              <Link to={`/match-rules/${id}/edit`}>
                <CalendarClock className="mr-1.5 h-3.5 w-3.5" />
                Schedule
              </Link>
            )}
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/match-rules/${id}/edit`}>
              <Edit className="mr-1.5 h-3.5 w-3.5" />
              Edit
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-3.5 w-3.5" />
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
      <Card className="shadow-md border-t-4 border-t-primary">
        <CardContent className="p-6">
          <div className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Object</span>
              <p className="font-medium capitalize mt-1">{rule.source_object}</p>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Strategy</span>
              <p className="font-medium capitalize mt-1">{rule.merge_strategy || 'standard'}</p>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</span>
              <div className="flex items-center gap-2 mt-1">
                <Switch
                  checked={rule.is_active}
                  onCheckedChange={() => toggleMutation.mutate()}
                  disabled={toggleMutation.isPending}
                />
                <span className="text-sm font-medium">
                  {rule.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Fields</span>
              <p className="font-medium mt-1">
                {(rule.match_fields || []).map((f: any, i: number) => (
                  <span key={f.field}>
                    {f.match_against
                      ? `${f.field} vs ${f.match_against} (${f.algorithm})`
                      : `${f.field} (${f.algorithm})`}
                    {i < rule.match_fields.length - 1 ? ", " : ""}
                  </span>
                ))}
              </p>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Thresholds</span>
              <p className="font-medium mt-1">
                Auto: {Math.round(rule.auto_merge_threshold * 100)}% | Review: {Math.round(rule.review_threshold * 100)}%
              </p>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Schedule</span>
              <p className="font-medium capitalize mt-1">{rule.schedule_frequency || "manual"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Matches Section */}
      <Card className="shadow-md overflow-hidden">
        {/* Header with expand toggle and search */}
        <div className="flex items-center justify-between gap-4 p-4 border-b bg-muted/30">
          <button
            onClick={() => setMatchesExpanded(!matchesExpanded)}
            className="flex items-center gap-2 font-semibold hover:text-primary transition-colors"
          >
            {matchesExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            Pending Matches ({matchesLoading ? <Loader2 className="h-3 w-3 animate-spin inline" /> : pendingMatches.length})
          </button>
          {matchesExpanded && pendingMatches.length > 0 && (
            <div className="relative w-48">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
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
            {matchesLoading ? (
              <div className="flex items-center justify-center h-20">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : pendingMatches.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-muted-foreground text-sm">No pending matches. Click "Scan Now" to search.</p>
              </div>
            ) : filteredPendingMatches.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-muted-foreground text-sm">No matches found for "{matchSearchQuery}"</p>
                <Button variant="link" size="sm" onClick={() => setMatchSearchQuery("")}>
                  Clear search
                </Button>
              </div>
            ) : (
              <>
                <div className="max-h-80 overflow-y-auto">
                  <ResponsiveTable>
                    <ResponsiveTableContent minWidth="600px">
                      <thead className="bg-muted/30 sticky top-0 z-10">
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground bg-muted/30">Record A</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground bg-muted/30">Record B</th>
                          <th className="text-center py-3 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground bg-muted/30">Score</th>
                          <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground bg-muted/30">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPendingMatches.map((match: any) => {
                          const recordA = match.record_a_data || {};
                          const recordB = match.record_b_data || {};
                          const confidence = Math.round((match.confidence_score || 0) * 100);
                          const isMerging = mergingIds.has(match.id);
                          const matchFields = rule.match_fields || [];
                          const subheadingA = getMatchFieldSubheading(recordA, matchFields);
                          const subheadingB = getMatchFieldSubheading(recordB, matchFields);

                          return (
                            <tr key={match.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                              <td className="py-3 px-4">
                                <div className="font-medium truncate max-w-[200px]">
                                  {getRecordName(recordA)}
                                </div>
                                {subheadingA && (
                                  <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                    {subheadingA}
                                  </div>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <div className="font-medium truncate max-w-[200px]">
                                  {getRecordName(recordB)}
                                </div>
                                {subheadingB && (
                                  <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                    {subheadingB}
                                  </div>
                                )}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "font-semibold",
                                    confidence >= 90 ? "bg-green-100 text-green-700 border-green-200" :
                                    confidence >= 80 ? "bg-amber-100 text-amber-700 border-amber-200" :
                                    "bg-red-100 text-red-700 border-red-200"
                                  )}
                                >
                                  {confidence}%
                                </Badge>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex justify-end gap-2">
                                  <Button variant="outline" size="sm" asChild>
                                    <Link to={`/match-rules/${id}/review/${match.id}`}>Review</Link>
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => quickMergeMutation.mutate(match)}
                                    disabled={isMerging}
                                  >
                                    {isMerging ? <Loader2 className="h-3 w-3 animate-spin" /> : "Merge"}
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </ResponsiveTableContent>
                  </ResponsiveTable>
                </div>
                {/* Footer bar with View All button */}
                <div className="flex items-center justify-between p-3 border-t bg-muted/20">
                  <span className="text-sm text-muted-foreground">
                    {matchSearchQuery
                      ? `${filteredPendingMatches.length} of ${pendingMatches.length} matches`
                      : `${pendingMatches.length} pending matches`}
                  </span>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/match-rules/${id}/matches`}>
                      View All
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </>
            )}
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
              This will merge <span className="font-semibold">{pendingMatches.length}</span> pending matches
              using Record A as the master for each pair. All duplicate records will be deleted.
              <br /><br />
              Snapshots will be saved for 30-day rollback. This action cannot be easily undone in bulk.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleMergeAll()}>
              Merge All ({pendingMatches.length})
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
                  <span className="font-semibold text-green-600">{validMatchIds.length}</span> valid match(es)
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
