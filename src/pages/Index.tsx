import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RefreshCw, ArrowRight, Plus, Check, ClipboardList, FolderOpen, Building2, Users, Loader2, RotateCcw, Eye, Pencil, GitMerge } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, MatchRule, Merge, MatchPair } from "@/lib/api";
import { useLocation } from "@/contexts/LocationContext";
import { useToast } from "@/hooks/use-toast";
import { ResponsiveTable, ResponsiveTableContent } from "@/components/ui/responsive-table";
import { NoRulesEmpty, NoMergesEmpty } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

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
      queryClient.invalidateQueries({ queryKey: ["merges"] });
      queryClient.invalidateQueries({ queryKey: ["merge-stats"] });

      toast({ title: "Data synced successfully!" });
    } catch (error: any) {
      if (error.message?.includes('429') || error.message?.includes('cooldown')) {
        toast({
          title: "Sync on cooldown",
          description: "Please wait before syncing again.",
          variant: "destructive",
        });
        refetchSyncStatus();
      } else {
        toast({
          title: "Sync failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // Fetch contacts count
  const { data: contactsData } = useQuery({
    queryKey: ['contacts-stats', locationId],
    queryFn: () => api.getContactsStats(),
    enabled: isAuthenticated && !!locationId,
  });

  // Fetch companies count
  const { data: companiesData } = useQuery({
    queryKey: ['companies', locationId],
    queryFn: () => api.getCompanies(),
    enabled: isAuthenticated && !!locationId,
  });

  // Fetch match rules
  const { data: rulesData, isLoading: rulesLoading } = useQuery({
    queryKey: ['rules', locationId],
    queryFn: () => api.getMatchRules(),
    enabled: isAuthenticated && !!locationId,
  });

  // Fetch pending matches
  const { data: matchesData } = useQuery({
    queryKey: ['matches', 'pending', locationId],
    queryFn: () => api.getMatches('pending'),
    enabled: isAuthenticated && !!locationId,
  });

  // Fetch merge stats
  const { data: mergeStatsData } = useQuery({
    queryKey: ['merge-stats', locationId],
    queryFn: () => api.getMergeStats(),
    enabled: isAuthenticated && !!locationId,
  });

  // Fetch recent merges (completed only for activity table)
  const { data: mergesData } = useQuery({
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
    onSuccess: (data) => {
      const restoredId = data.restored_record_id;
      toast({
        title: "Merge Rolled Back",
        description: restoredId ? (
          <span>
            Record restored.{" "}
            <a
              href={`https://app.gohighlevel.com/v2/location/${locationId}/contacts/detail/${restoredId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-medium"
            >
              View in GHL
            </a>
          </span>
        ) : "The merge has been undone.",
      });
      queryClient.invalidateQueries({ queryKey: ["merges"] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Rollback Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Calculate stats from real data
  const contactsCount = contactsData?.total ?? 0;
  const companiesCount = companiesData?.total ?? companiesData?.count ?? companiesData?.companies?.length ?? 0;
  const rules = rulesData?.data ?? [];
  const pendingMatches = matchesData?.data ?? [];
  const recentMerges = mergesData?.data ?? [];

  // Build object counts dynamically for future custom objects
  const objectCounts: { name: string; count: number; icon: React.ReactNode }[] = [
    { name: "Contacts", count: contactsCount, icon: <Users className="h-3.5 w-3.5" /> },
    { name: "Companies", count: companiesCount, icon: <Building2 className="h-3.5 w-3.5" /> },
  ];

  // Count pending matches per rule
  const pendingByRule = pendingMatches.reduce((acc: Record<string, number>, match: MatchPair) => {
    const ruleId = (match as any).rule_id;
    if (ruleId) {
      acc[ruleId] = (acc[ruleId] || 0) + 1;
    }
    return acc;
  }, {});

  const rulesWithPending = rules.filter((r: MatchRule) => pendingByRule[r.id] > 0).length;

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
            Connect to GoHighLevel
          </a>
        </Button>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-8 ">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
            <p className="text-muted-foreground mt-1">
              {locationName || `Location ${locationId?.slice(0, 8)}...`}
            </p>
          </div>
          <div className="flex items-center gap-3">
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
                  className={cn(cooldownRemaining > 0 && "opacity-50")}
                  aria-label={
                    cooldownRemaining > 0
                      ? `Sync available in ${formatCooldown(cooldownRemaining)}`
                      : "Sync data"
                  }
                >
                  <RefreshCw
                    className={cn("mr-2 h-4 w-4", isSyncing && "animate-spin")}
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
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Pending Review */}
          <Card className="shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 border-l-4 border-l-primary">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-primary/10 p-3.5">
                  <ClipboardList className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Pending Review</p>
                  <p className="text-4xl font-bold mt-1">
                    {pendingMatches.length}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    matches across {rulesWithPending} rules
                  </p>
                </div>
              </div>
              <Button variant="link" className="mt-4 p-0 h-auto font-semibold" asChild>
                <Link to="/match-rules">Review Now <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
              </Button>
            </CardContent>
          </Card>

          {/* Merged Total */}
          <Card className="shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-green-500/10 p-3.5">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Duplicates Merged</p>
                  <p className="text-4xl font-bold mt-1">
                    {mergeStatsData?.completed ?? 0}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    total successful merges
                  </p>
                </div>
              </div>
              <Button variant="link" className="mt-4 p-0 h-auto font-semibold" asChild>
                <Link to="/history">View History <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
              </Button>
            </CardContent>
          </Card>

          {/* Total Records */}
          <Card className="shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 border-l-4 border-l-slate-400 sm:col-span-2 lg:col-span-1">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-3.5">
                  <FolderOpen className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Total Records</p>
                  <p className="text-4xl font-bold mt-1">
                    {(contactsCount + companiesCount).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    synced across {objectCounts.filter(o => o.count > 0).length} objects
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                    {objectCounts.map(obj => (
                      <span key={obj.name} className="flex items-center gap-1.5">
                        {obj.icon}
                        {obj.name}: {obj.count.toLocaleString()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Match Rules Table */}
        <Card className="shadow-md overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between bg-muted/30 border-b">
            <CardTitle className="text-xl font-bold">Your Match Rules</CardTitle>
            <Button size="sm" asChild>
              <Link to="/match-rules/new">
                <Plus className="mr-2 h-4 w-4" />
                New Rule
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {rulesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : rules.length === 0 ? (
              <NoRulesEmpty />
            ) : (
              <ResponsiveTable>
                  <ResponsiveTableContent minWidth="700px">
                    <thead className="bg-muted/50">
                      <tr className="border-b">
                        <th scope="col" className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                        <th scope="col" className="text-left py-3 px-4 font-medium text-muted-foreground">Object</th>
                        <th scope="col" className="text-left py-3 px-4 font-medium text-muted-foreground">Strategy</th>
                        <th scope="col" className="text-left py-3 px-4 font-medium text-muted-foreground">Schedule</th>
                        <th scope="col" className="text-left py-3 px-4 font-medium text-muted-foreground">Last Scan</th>
                        <th scope="col" className="text-right py-3 px-4 font-medium text-muted-foreground">Pending</th>
                        <th scope="col" className="text-center py-3 px-4 font-medium text-muted-foreground">Status</th>
                        <th scope="col" className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rules.map((rule: MatchRule) => (
                        <tr key={rule.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-4">
                            <Link to={`/match-rules/${rule.id}`} className="font-medium text-primary hover:underline">
                              {rule.name}
                            </Link>
                          </td>
                          <td className="py-3 px-4 capitalize">{rule.source_object}</td>
                          <td className="py-3 px-4">{rule.merge_strategy || 'standard'}</td>
                          <td className="py-3 px-4 capitalize">{rule.schedule_frequency}</td>
                          <td className="py-3 px-4">{formatLastScan(rule.last_scan_at)}</td>
                          <td className="py-3 px-4 text-right">
                            <Badge
                              variant={pendingByRule[rule.id] > 0 ? 'default' : 'outline'}
                              className={pendingByRule[rule.id] > 0 ? 'bg-primary' : 'text-muted-foreground'}
                            >
                              {pendingByRule[rule.id] || 0}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Switch
                              checked={rule.is_active}
                              onCheckedChange={() => toggleStatusMutation.mutate(rule.id)}
                              disabled={toggleStatusMutation.isPending}
                              aria-label={`${rule.is_active ? 'Disable' : 'Enable'} ${rule.name} rule`}
                            />
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {pendingByRule[rule.id] > 0 && (
                                <Button size="sm" asChild>
                                  <Link to={`/match-rules/${rule.id}?action=merge-all`} aria-label={`Merge all for ${rule.name}`}>
                                    <GitMerge className="h-4 w-4 mr-1" aria-hidden="true" />
                                    Merge All
                                  </Link>
                                </Button>
                              )}
                              <Button variant="outline" size="sm" asChild>
                                <Link to={`/match-rules/${rule.id}`} aria-label={`Edit ${rule.name}`}>
                                  <Pencil className="h-4 w-4 mr-1" aria-hidden="true" />
                                  Edit
                                </Link>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </ResponsiveTableContent>
              </ResponsiveTable>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity Table */}
        <Card className="shadow-md overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between bg-muted/30 border-b">
            <CardTitle className="text-xl font-bold">Recent Activity</CardTitle>
            <Button variant="link" className="p-0 h-auto text-primary" asChild>
              <Link to="/history">View All <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {recentMerges.length === 0 ? (
              <NoMergesEmpty />
            ) : (
              <ResponsiveTable>
                  <ResponsiveTableContent minWidth="650px">
                    <thead className="bg-muted/50">
                      <tr className="border-b">
                        <th scope="col" className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                        <th scope="col" className="text-left py-3 px-4 font-medium text-muted-foreground">Record</th>
                        <th scope="col" className="text-left py-3 px-4 font-medium text-muted-foreground">Master ID</th>
                        <th scope="col" className="text-left py-3 px-4 font-medium text-muted-foreground">Merged ID</th>
                        <th scope="col" className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                        <th scope="col" className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentMerges.map((merge: Merge) => (
                        <tr key={merge.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-4">
                            {new Date(merge.created_at).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 font-medium">
                            {merge.master_record_name || 'Unknown'}
                          </td>
                          <td className="py-3 px-4">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <code className="text-xs bg-muted px-1.5 py-0.5 rounded cursor-help">
                                  {merge.master_record_id.slice(0, 8)}...
                                </code>
                              </TooltipTrigger>
                              <TooltipContent>
                                <code>{merge.master_record_id}</code>
                              </TooltipContent>
                            </Tooltip>
                          </td>
                          <td className="py-3 px-4">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <code className="text-xs bg-muted px-1.5 py-0.5 rounded cursor-help">
                                  {merge.duplicate_record_id.slice(0, 8)}...
                                </code>
                              </TooltipTrigger>
                              <TooltipContent>
                                <code>{merge.duplicate_record_id}</code>
                              </TooltipContent>
                            </Tooltip>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={merge.status === 'completed' ? 'default' : merge.status === 'failed' ? 'destructive' : merge.status === 'rolled_back' ? 'outline' : 'secondary'}
                                className={cn(
                                  merge.status === 'completed' && 'bg-green-600 hover:bg-green-700',
                                  merge.status === 'rolled_back' && 'border-amber-500 text-amber-600'
                                )}
                              >
                                {merge.status === 'completed' ? 'Merged' : merge.status === 'rolled_back' ? 'Restored' : merge.status === 'failed' ? 'Failed' : merge.status}
                              </Badge>
                              {merge.status === 'failed' && merge.error_message && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="text-xs text-destructive/80 max-w-[120px] truncate cursor-help">
                                      {merge.error_message.slice(0, 30)}...
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    <p className="text-xs whitespace-pre-wrap">{merge.error_message}</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-9 w-9 p-0" asChild>
                                    <Link to={`/history/${merge.id}`} aria-label={`View merge details for ${merge.master_record_name || 'record'}`}>
                                      <Eye className="h-4 w-4" aria-hidden="true" />
                                    </Link>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>View Details</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-9 w-9 p-0"
                                    onClick={() => rollbackMutation.mutate(merge.id)}
                                    disabled={rollbackMutation.isPending || merge.status === 'rolled_back'}
                                    aria-label={`Restore duplicate record from merge with ${merge.master_record_name || 'record'}`}
                                  >
                                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Restore Duplicate</TooltipContent>
                              </Tooltip>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </ResponsiveTableContent>
              </ResponsiveTable>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
