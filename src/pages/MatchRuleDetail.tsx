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
import { ArrowLeft, Edit, Search, Play, Loader2, ChevronDown, ChevronUp, RotateCcw, X } from "lucide-react";
import { useLocation } from "@/contexts/LocationContext";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { ResponsiveTable, ResponsiveTableContent } from "@/components/ui/responsive-table";
import { cn } from "@/lib/utils";

export default function MatchRuleDetail() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { locationId, isLoading: authLoading, canUseStrategies, lastWebhookAt } = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [matchesExpanded, setMatchesExpanded] = useState(true);
  const [mergingIds, setMergingIds] = useState<Set<string>>(new Set());
  const [showMergeAllDialog, setShowMergeAllDialog] = useState(false);
  const [bulkMergeProgress, setBulkMergeProgress] = useState({ current: 0, total: 0, inProgress: false });
  const abortMergeRef = useRef(false);

  // Stale data validation state
  const [isValidating, setIsValidating] = useState(false);
  const [showStaleModal, setShowStaleModal] = useState(false);
  const [staleMatchIds, setStaleMatchIds] = useState<string[]>([]);
  const [validMatchIds, setValidMatchIds] = useState<string[]>([]);

  // Fetch rule details
  const { data: rule, isLoading: ruleLoading, isPending: rulePending } = useQuery({
    queryKey: ["rule", id, locationId],
    queryFn: () => api.getMatchRule(id!),
    enabled: !!locationId && !!id,
  });

  // Fetch pending matches for this rule
  const { data: matchesData, isLoading: matchesLoading } = useQuery({
    queryKey: ["matches", id, locationId],
    queryFn: () => api.getMatches("pending", id),
    enabled: !!locationId && !!id,
    gcTime: 0, // No cache - always fresh
  });

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

  // Scan mutation
  const scanMutation = useMutation({
    mutationFn: () => api.scanRule(id!),
    onSuccess: (data: { matches_found: number; records_scanned: number; stale_cleaned?: number }) => {
      const staleMsg = data.stale_cleaned ? ` Cleaned ${data.stale_cleaned} stale.` : '';
      toast({
        title: "Scan Complete",
        description: `Found ${data.matches_found} matches from ${data.records_scanned} records.${staleMsg}`,
      });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Scan Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Quick merge mutation (uses record A as master with all its values)
  const quickMergeMutation = useMutation({
    mutationFn: async (match: any) => {
      // Default all fields to "a" (master)
      // Note: companyName excluded - it's read-only in GHL (derived from linked business)
        const fields = ["firstName", "lastName", "email", "phone", "tags", "address1", "city", "state", "postalCode"];
      const selections: Record<string, string> = {};
      fields.forEach(f => { selections[f] = "a"; });
      return api.executeMerge(match.id, match.record_a_id, selections);
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
        // Default all fields to "a" (master)
        // Note: companyName excluded - it's read-only in GHL (derived from linked business)
        const fields = ["firstName", "lastName", "email", "phone", "tags", "address1", "city", "state", "postalCode"];
        const selections: Record<string, string> = {};
        fields.forEach(f => { selections[f] = "a"; });

        await api.executeMerge(match.id, match.record_a_id, selections);
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

  // Show loading while waiting for auth/location or rule data
  if (authLoading || !locationId || ruleLoading || rulePending) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
    <div className="space-y-6 ">
      {/* Page Header with Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {rule.name}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => scanMutation.mutate()}
            disabled={scanMutation.isPending}
          >
            {scanMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Search className="mr-2 h-4 w-4" />
            )}
            {scanMutation.isPending ? "Scanning..." : "Scan Now"}
          </Button>
          <Button
            onClick={handleMergeAllClick}
            disabled={pendingMatches.length === 0 || bulkMergeProgress.inProgress || isValidating}
          >
            {isValidating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Validating...
              </>
            ) : bulkMergeProgress.inProgress ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Merging {bulkMergeProgress.current}/{bulkMergeProgress.total}
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
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
              <X className="h-4 w-4 mr-1" />
              Abort
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link to={`/match-rules/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Rule
            </Link>
          </Button>
          {canUseStrategies ? (
            <Button variant="outline" asChild>
              <Link to="/merge-strategies/new">
                New Strategy
              </Link>
            </Button>
          ) : (
            <Button variant="outline" disabled title="Upgrade to create custom strategies">
              New Strategy
            </Button>
          )}
        </div>
      </div>

      {/* Top-Level Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="shadow-md">
          <CardContent className="p-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total Records</span>
            <p className="text-2xl font-bold mt-1">
              {contactsStatsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                contactsStats?.total?.toLocaleString() ?? "—"
              )}
            </p>
            <p className="text-xs text-muted-foreground mt-1 capitalize">{rule.source_object}</p>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardContent className="p-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Last Scan</span>
            <p className="text-lg font-bold mt-1">
              {rule.last_scan_at
                ? new Date(rule.last_scan_at).toLocaleDateString()
                : "Never"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {rule.last_scan_at
                ? new Date(rule.last_scan_at).toLocaleTimeString()
                : "Run a scan to find duplicates"}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardContent className="p-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Last Data Update</span>
            <p className="text-lg font-bold mt-1">
              {lastWebhookAt
                ? new Date(lastWebhookAt).toLocaleDateString()
                : "—"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {lastWebhookAt
                ? new Date(lastWebhookAt).toLocaleTimeString()
                : "Via webhook from GHL"}
            </p>
          </CardContent>
        </Card>
      </div>

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
                    {f.field} ({f.algorithm}){i < rule.match_fields.length - 1 ? ", " : ""}
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
      <div className="space-y-3">
        <button
          onClick={() => setMatchesExpanded(!matchesExpanded)}
          className="flex items-center gap-2 text-xl font-bold hover:text-primary transition-colors w-full text-left"
        >
          {matchesExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          Pending Matches ({matchesLoading ? <Loader2 className="h-4 w-4 animate-spin inline" /> : pendingMatches.length})
        </button>

        {matchesExpanded && (
          <>
            {matchesLoading ? (
              <div className="flex items-center justify-center h-20">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : pendingMatches.length === 0 ? (
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-muted-foreground text-sm">No pending matches. Click "Scan Now" to search.</p>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-md overflow-hidden">
                <div className="max-h-80 overflow-y-auto">
                  <ResponsiveTable>
                    <ResponsiveTableContent minWidth="600px">
                      <thead className="bg-muted/30 sticky top-0">
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Record A</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Record B</th>
                          <th className="text-center py-3 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Score</th>
                          <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                    <tbody>
                    {pendingMatches.map((match: any) => {
                      const recordA = match.record_a_data || {};
                      const recordB = match.record_b_data || {};
                      const confidence = Math.round((match.confidence_score || 0) * 100);
                      const isMerging = mergingIds.has(match.id);

                      return (
                        <tr key={match.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-medium truncate max-w-[200px]">
                              {recordA.firstName || recordA.name || recordA.email || "—"}
                            </div>
                            <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {recordA.email || recordA.phone || ""}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium truncate max-w-[200px]">
                              {recordB.firstName || recordB.name || recordB.email || "—"}
                            </div>
                            <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {recordB.email || recordB.phone || ""}
                            </div>
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
              </Card>
            )}
          </>
        )}
      </div>

      {/* Merge History Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Merge History ({mergesLoading ? <Loader2 className="h-4 w-4 animate-spin inline" /> : mergeHistory.length})</h2>

        {mergeHistory.length === 0 ? (
          <Card className="shadow-md">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No merges performed yet.</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-md overflow-hidden">
            <CardContent className="p-0">
              <ResponsiveTable>
                <ResponsiveTableContent minWidth="550px">
                  <thead className="bg-muted/30">
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Master Record</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Date</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mergeHistory.map((item: any) => (
                      <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4 font-medium">
                          {item.master_record_name || item.master_record_id?.slice(0, 8) + "..."}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={item.status === 'completed' ? 'default' : item.status === 'failed' ? 'destructive' : 'outline'}
                              className={cn(
                                item.status === 'completed' && 'bg-green-600 hover:bg-green-700',
                                item.status === 'rolled_back' && 'border-amber-500 text-amber-600'
                              )}
                            >
                              {item.status === 'completed' ? 'Merged' :
                               item.status === 'rolled_back' ? 'Restored' :
                               item.status === 'failed' ? 'Failed' : item.status}
                            </Badge>
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
                                onClick={() => rollbackMutation.mutate(item.id)}
                                disabled={rollbackMutation.isPending}
                              >
                                <RotateCcw className="h-3.5 w-3.5 mr-1" />
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

        <Link to="/history" className="text-sm text-primary hover:underline font-medium">
          View Full History →
        </Link>
      </div>

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
    </div>
  );
}
