import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RefreshCw, ArrowRight, Plus, Check, ClipboardList, FolderOpen, Building2, Users, Loader2, TrendingUp, GitMerge, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, MatchRule, Merge, MatchPair, ObjectType } from "@/lib/api";
import { useLocation } from "@/contexts/LocationContext";
import { useToast } from "@/hooks/use-toast";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { MergeStatusBadge } from "@/components/ui/merge-status-badge";
import { NoRulesEmpty, NoMergesEmpty } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Skeleton } from "@/components/ui/skeleton";
import { StatsRow } from "@/components/ui/achievement-badge";
import { createPendingMatchColumns } from "@/components/rules/pendingTableColumns";
import { getGhlRecordUrl } from "@/lib/utils";
import { RuleActionButtons } from "@/components/rule-action-buttons";
import { MergeActionButtons } from "@/components/merge-action-buttons";
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

export default function Dashboard() {
  const { locationId, locationName, isAuthenticated, isLoading: authLoading, error: authError, connectionStatus, reconnect } = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  // Fetch sync status from backend
  const { data: syncStatus, refetch: refetchSyncStatus } = useQuery({
    queryKey: ['sync-status', locationId],
    queryFn: () => api.getSyncStatus(),
    enabled: isAuthenticated && !!locationId,
    refetchInterval: cooldownRemaining > 0 ? 10000 : false, // Poll every 10s during cooldown
  });

  // Update local state from sync status
  useEffect(() => {
    if (syncStatus) {
      setCooldownRemaining(syncStatus.cooldown_remaining);
      setLastSyncedAt(syncStatus.last_synced_at);
    }
  }, [syncStatus]);

  // Countdown timer for UI responsiveness
  useEffect(() => {
    if (cooldownRemaining > 0) {
      const timer = setTimeout(() => setCooldownRemaining((c) => Math.max(0, c - 1)), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownRemaining]);

  // Format cooldown as MM:SS
  const formatCooldown = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Format relative time
  const formatLastSynced = (isoString: string | null): string => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 min ago';
    if (diffMins < 60) return `${diffMins} mins ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;

    return date.toLocaleDateString();
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const result = await api.triggerSync();
      setLastSyncedAt(result.last_synced_at);
      setCooldownRemaining(300); // 5 minutes

      // Invalidate all data queries
      queryClient.invalidateQueries({ queryKey: ["contacts-stats"] });
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["rules"] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({ queryKey: ["match-counts"] });
      queryClient.invalidateQueries({ queryKey: ["merges"] });
      queryClient.invalidateQueries({ queryKey: ["merge-stats"] });

      toast({ title: "Data synced successfully!" });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage?.includes('429') || errorMessage?.includes('cooldown')) {
        toast({
          title: "Sync on cooldown",
          description: "Please wait before syncing again.",
          variant: "destructive",
        });
        refetchSyncStatus();
      } else {
        toast({
          title: "Sync failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // Fetch contacts count
  const { data: contactsData, isLoading: contactsLoading, isError: contactsError, refetch: refetchContacts } = useQuery({
    queryKey: ['contacts-stats', locationId],
    queryFn: () => api.getContactsStats(),
    enabled: isAuthenticated && !!locationId,
  });

  // Fetch companies count
  const { data: companiesData, isLoading: companiesLoading, isError: companiesError, refetch: refetchCompanies } = useQuery({
    queryKey: ['companies', locationId],
    queryFn: () => api.getCompanies(),
    enabled: isAuthenticated && !!locationId,
  });

  // Fetch match rules
  const { data: rulesData, isLoading: rulesLoading, isError: rulesError, refetch: refetchRules } = useQuery({
    queryKey: ['rules', locationId],
    queryFn: () => api.getMatchRules(),
    enabled: isAuthenticated && !!locationId,
    gcTime: 0,
    staleTime: 0,
  });

  // Fetch object schema metadata for display-field aware record titles.
  const { data: availableObjects = [] } = useQuery<ObjectType[]>({
    queryKey: ["availableObjects", locationId],
    queryFn: () => api.getAvailableObjects(),
    enabled: isAuthenticated && !!locationId,
  });

  // Fetch pending match counts (lightweight - no row data)
  const { data: matchCountsData, isLoading: matchCountsLoading, isError: matchCountsError, refetch: refetchMatchCounts } = useQuery({
    queryKey: ['match-counts', 'pending', locationId],
    queryFn: () => api.getMatchCounts('pending'),
    enabled: isAuthenticated && !!locationId,
    gcTime: 0,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  // Small preview for the pending matches table (only 5 records)
  const { data: matchesPreview, isLoading: matchesPreviewLoading } = useQuery({
    queryKey: ['matches', 'pending', 'preview', locationId],
    queryFn: () => api.getMatches('pending', undefined, 5),
    enabled: isAuthenticated && !!locationId && (matchCountsData?.total ?? 0) > 0,
    gcTime: 0,
    staleTime: 0,
  });

  // Fetch merge stats
  const { data: mergeStatsData, isLoading: mergeStatsLoading, isError: mergeStatsError, refetch: refetchMergeStats } = useQuery({
    queryKey: ['merge-stats', locationId],
    queryFn: () => api.getMergeStats(),
    enabled: isAuthenticated && !!locationId,
  });

  // Fetch recent merges (completed only for activity table)
  const { data: mergesData, isLoading: mergesLoading, isError: mergesError, refetch: refetchMerges } = useQuery({
    queryKey: ['merges', locationId],
    queryFn: () => api.getMerges(10),
    enabled: isAuthenticated && !!locationId,
  });

  // Toggle rule status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: (ruleId: string) => api.toggleRuleStatus(ruleId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["rules"] });
      toast({
        title: data.is_active ? "Rule Activated" : "Rule Deactivated",
        description: data.is_active ? "The rule will now run on schedule." : "The rule has been paused.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to toggle status",
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
        title: "Merge Rolled Back",
        description: "The merge has been undone and the duplicate record restored.",
      });
      queryClient.invalidateQueries({ queryKey: ["merges"] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({ queryKey: ["match-counts"] });
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
  const [ruleToDelete, setRuleToDelete] = useState<MatchRule | null>(null);

  const deleteRuleMutation = useMutation({
    mutationFn: (ruleId: string) => api.deleteMatchRule(ruleId),
    onSuccess: () => {
      toast({
        title: "Rule Deleted",
        description: "The match rule has been permanently deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["rules"] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({ queryKey: ["match-counts"] });
      setRuleToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Combined loading flag so all stat cards transition together
  const statsLoading = contactsLoading || companiesLoading || matchCountsLoading || mergeStatsLoading;

  // Check if any critical query has errored
  const hasQueryError = rulesError || matchCountsError;

  const retryAllQueries = () => {
    refetchContacts();
    refetchCompanies();
    refetchRules();
    refetchMatchCounts();
    refetchMergeStats();
    refetchMerges();
  };

  // Calculate stats from real data
  const contactsCount = contactsData?.total ?? 0;
  const companiesCount = companiesData?.total ?? companiesData?.companies?.length ?? 0;
  const rules = useMemo(() => {
    const data = rulesData?.data ?? [];
    return [...data].sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA; // Newest first
    });
  }, [rulesData?.data]);
  const pendingByRule = matchCountsData?.by_rule ?? {};
  const pendingTotalCount = matchCountsData?.total ?? 0;
  const duplicatesToReview = matchCountsData?.unique_contacts ?? pendingTotalCount;
  const rulesWithPending = rules.filter((r: MatchRule) => (pendingByRule[r.id] ?? 0) > 0).length;
  const pendingMatches = matchesPreview?.data ?? [];
  const recentMerges = mergesData?.data ?? [];

  // Build object counts dynamically for future custom objects
  const objectCounts: { name: string; count: number; icon: React.ReactNode }[] = [
    { name: "Contacts", count: contactsCount, icon: <Users className="h-4 w-4" /> },
    { name: "Companies", count: companiesCount, icon: <Building2 className="h-4 w-4" /> },
  ];

  const formatLastScan = (lastScanAt?: string) => {
    if (!lastScanAt) return 'Never';
    const lastScan = new Date(lastScanAt);
    return lastScan.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (authError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-destructive">{authError}</p>
        <Button asChild>
          <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/auth/install`}>
            Connect Your CRM
          </a>
        </Button>
      </div>
    );
  }

  if (hasQueryError && !rulesLoading && !matchCountsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-muted-foreground">Failed to load dashboard data</p>
        <Button variant="outline" onClick={retryAllQueries}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  // Define columns for Match Rules table
  const rulesColumns: DataTableColumn<MatchRule>[] = [
    {
      header: "Name",
      accessor: (rule) => (
        <Link to={`/match-rules/${rule.id}`} className="font-medium text-foreground hover:text-primary transition-colors">
          {rule.name}
        </Link>
      ),
    },
    {
      header: "Object",
      accessor: (rule) => <span className="capitalize text-muted-foreground">{rule.source_object}</span>,
    },
    {
      header: "Strategy",
      accessor: (rule) => <span className="text-muted-foreground">{rule.merge_strategy || 'standard'}</span>,
      hideOnMobile: true,
    },
    {
      header: "Schedule",
      accessor: (rule) => <span className="capitalize text-muted-foreground">{rule.schedule_frequency}</span>,
      hideOnMobile: true,
    },
    {
      header: "Last Merge",
      accessor: (rule) => <span className="text-muted-foreground">{formatLastScan(rule.last_merge_at)}</span>,
      hideOnMobile: true,
    },
    {
      header: "Last Scheduled Run",
      accessor: (rule) => (
        <span className="text-muted-foreground">
          {rule.schedule_frequency !== 'manual' ? formatLastScan(rule.last_scan_at) : '—'}
        </span>
      ),
      hideOnMobile: true,
    },
    {
      header: "Pending",
      align: "right",
      accessor: (rule) => (
        <Badge variant={pendingByRule[rule.id] > 0 ? 'default' : 'muted'}>
          {pendingByRule[rule.id] || 0}
        </Badge>
      ),
    },
    {
      header: "Status",
      align: "center",
      accessor: (rule) => (
        <Switch
          checked={rule.is_active}
          onCheckedChange={() => toggleStatusMutation.mutate(rule.id)}
          disabled={toggleStatusMutation.isPending}
          aria-label={`${rule.is_active ? 'Disable' : 'Enable'} ${rule.name} rule`}
        />
      ),
    },
    {
      header: "Actions",
      align: "right",
      accessor: (rule) => (
        <RuleActionButtons
          rule={rule}
          onDelete={() => setRuleToDelete(rule)}
        />
      ),
    },
  ];

  // Create maps for quick rule/object metadata lookup.
  const rulesMap = new Map(rules.map((rule) => [rule.id, rule]));
  const displayFieldByObject = new Map(
    availableObjects.map((objectType) => [objectType.id, objectType.displayField] as const)
  );

  const pendingMatchesColumns = createPendingMatchColumns({
    locationId,
    includeRuleColumn: true,
    includeFoundColumn: false,
    resolveRuleContext: (item) => {
      const rule = rulesMap.get(item.rule_id);
      if (!rule) {
        return {
          ruleId: item.rule_id,
          ruleName: "Unknown",
          sourceObject: "contacts",
          matchFields: [],
        };
      }
      return {
        ruleId: rule.id,
        ruleName: rule.name,
        sourceObject: rule.source_object || "contacts",
        matchFields: rule.match_fields || [],
        displayField: displayFieldByObject.get(rule.source_object),
      };
    },
  });

  // Define columns for Recent Activity table
  const activityColumns: DataTableColumn<Merge>[] = [
    {
      header: "Date",
      accessor: (merge) => (
        <span className="text-muted-foreground">
          {new Date(merge.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: "Record",
      accessor: (merge) => {
        const url = merge.status !== "failed" && locationId
          ? getGhlRecordUrl(locationId, merge.source_object || "contacts", merge.master_record_id)
          : null;
        return (
          url ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:text-primary hover:underline"
            >
              {merge.master_record_name || 'Unknown'}
            </a>
          ) : (
            <span className="font-medium">{merge.master_record_name || 'Unknown'}</span>
          )
        );
      },
    },
    {
      header: "Status",
      accessor: (merge) => <MergeStatusBadge status={merge.status} />,
    },
    {
      header: "Actions",
      align: "right",
      accessor: (merge) => (
        <MergeActionButtons
          merge={merge}
          onRestore={() => rollbackMutation.mutate(merge.id)}
          restorePending={rollbackMutation.isPending}
        />
      ),
    },
  ];

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          title="Welcome back!"
          description={locationName || `Location ${locationId?.slice(0, 8)}...`}
        >
          {connectionStatus === 'connected' && (
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
              <span className="text-sm text-muted-foreground">Connected</span>
            </div>
          )}
          {connectionStatus === 'token_expired' && (
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-destructive" />
              <span className="text-sm text-destructive">Token Expired</span>
              <Button variant="outline" size="sm" onClick={reconnect}>
                Reconnect
              </Button>
            </div>
          )}
          {connectionStatus === 'connecting' && (
            <div className="flex items-center gap-1.5">
              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Connecting...</span>
            </div>
          )}
          {(connectionStatus === 'disconnected' || connectionStatus === 'error') && (
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-muted-foreground" />
              <span className="text-sm text-muted-foreground">Disconnected</span>
            </div>
          )}
          {connectionStatus === 'connected' && (
            <div className="flex items-center gap-3">
              {lastSyncedAt && cooldownRemaining === 0 && (
                <span className="text-sm text-muted-foreground">
                  Synced {formatLastSynced(lastSyncedAt)}
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleSync}
                disabled={cooldownRemaining > 0 || isSyncing}
                aria-label={
                  cooldownRemaining > 0
                    ? `Sync available in ${formatCooldown(cooldownRemaining)}`
                    : "Sync data"
                }
              >
                <RefreshCw
                  className={isSyncing ? "mr-2 h-4 w-4 animate-spin" : "mr-2 h-4 w-4"}
                  aria-hidden="true"
                />
                {isSyncing
                  ? "Syncing..."
                  : cooldownRemaining > 0
                    ? formatCooldown(cooldownRemaining)
                    : "Sync"
                }
              </Button>
            </div>
          )}
        </PageHeader>

        {/* Stats Row */}
        {(mergeStatsData?.total ?? 0) > 0 && (
          <Link to="/stats" className="block">
            <Card className="shadow-sm overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-success/10 p-2.5">
                      <TrendingUp className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">Your Stats</p>
                        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-xs text-muted-foreground">Click to view detailed analytics</p>
                    </div>
                  </div>
                  <StatsRow
                    totalMerges={mergeStatsData?.total ?? 0}
                    completedMerges={mergeStatsData?.completed ?? 0}
                    activeRules={rules.filter((r: MatchRule) => r.is_active).length}
                    rollbackCount={mergeStatsData?.rolled_back ?? 0}
                  />
                </div>
              </CardContent>
            </Card>
          </Link>
        )}

        {/* Quick Stats - Enhanced */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Duplicates Matched */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-primary/10 p-2.5">
                  <ClipboardList className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground">Duplicates Matched</p>
                  {statsLoading ? (
                    <>
                      <Skeleton className="h-10 w-16 mt-1" />
                      <Skeleton className="h-4 w-32 mt-2" />
                    </>
                  ) : (
                    <>
                      <p className="text-4xl font-bold tracking-tight mt-1 text-primary">
                        <AnimatedCounter value={duplicatesToReview} />
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        unique records with duplicates across <span className="font-semibold text-foreground">{rulesWithPending}</span> {rulesWithPending === 1 ? "rule" : "rules"}
                      </p>
                    </>
                  )}
                </div>
              </div>
              {!statsLoading && rulesWithPending > 0 && (
                <Button className="mt-4 w-full" asChild>
                  <Link to="/pending-matches">
                    Review Now <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Merged Total */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-success/10 p-2.5">
                  <Check className="h-6 w-6 text-success" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground">Duplicates Merged</p>
                  {statsLoading ? (
                    <>
                      <Skeleton className="h-10 w-16 mt-1" />
                      <Skeleton className="h-4 w-24 mt-2" />
                    </>
                  ) : (
                    <>
                      <p className="text-4xl font-bold tracking-tight mt-1 text-success">
                        {mergeStatsData?.completed ?? 0}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        total successful
                      </p>
                    </>
                  )}
                </div>
              </div>
              <Button variant="outline" className="mt-4 w-full border-success/30 text-success hover:bg-success/10" asChild>
                <Link to="/history">View History <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </CardContent>
          </Card>

          {/* Total Records */}
          <Card className="shadow-sm sm:col-span-2 lg:col-span-1">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-muted p-2.5">
                  <FolderOpen className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground">Total Records</p>
                  {statsLoading ? (
                    <>
                      <Skeleton className="h-10 w-20 mt-1" />
                      <Skeleton className="h-4 w-40 mt-2" />
                    </>
                  ) : (
                    <>
                      <p className="text-4xl font-bold tracking-tight mt-1">
                        {(contactsCount + companiesCount).toLocaleString()}
                      </p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                        {objectCounts.map(obj => (
                          <span key={obj.name} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <span className="flex items-center justify-center h-5 w-5 rounded bg-muted">
                              {obj.icon}
                            </span>
                            <span className="font-semibold text-foreground">{obj.count.toLocaleString()}</span>
                            <span className="text-xs">{obj.name}</span>
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Match Rules Summary */}
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg font-semibold">Match Rules</CardTitle>
            <Button size="sm" asChild>
              <Link to="/match-rules/new">
                <Plus className="mr-1.5 h-4 w-4" />
                New Rule
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              data={rules.slice(0, 5)}
              columns={rulesColumns}
              keyField="id"
              loading={rulesLoading}
              emptyState={<NoRulesEmpty />}
              minWidth="700px"
            />
            {rules.length > 5 && (
              <div className="p-4 border-t text-center">
                <Button variant="outline" asChild>
                  <Link to="/match-rules">
                    View all {rules.length} rules
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Matches Table */}
        {pendingTotalCount > 0 && (
          <Card className="overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <GitMerge className="h-4 w-4 text-primary" />
                </div>
                <CardTitle className="text-lg font-semibold">Pending Matches</CardTitle>
                <Badge variant="secondary">{pendingTotalCount}</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable
                data={pendingMatches}
                columns={pendingMatchesColumns}
                keyField="id"
                loading={matchesPreviewLoading}
                minWidth="700px"
              />
              {pendingTotalCount > 5 && (
                <div className="p-4 border-t text-center">
                  <Button variant="outline" asChild>
                    <Link to="/pending-matches">
                      View all pending matches
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Recent Activity Table */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable
              data={recentMerges}
              columns={activityColumns}
              keyField="id"
              loading={mergesLoading}
              emptyState={<NoMergesEmpty />}
              minWidth="500px"
            />
            {recentMerges.length > 0 && (
              <div className="p-4 border-t text-center">
                <Button variant="outline" asChild>
                  <Link to="/history">
                    View all merge history
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Rule Confirmation Dialog */}
        <AlertDialog open={!!ruleToDelete} onOpenChange={(open) => !open && setRuleToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Match Rule?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the rule <span className="font-semibold">"{ruleToDelete?.name}"</span> and
                all its pending matches. This action cannot be undone.
                <br /><br />
                Merge history will be preserved.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => ruleToDelete && deleteRuleMutation.mutate(ruleToDelete.id)}
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
    </TooltipProvider>
  );
}
