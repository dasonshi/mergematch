import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RefreshCw, ArrowRight, Plus, Check, ClipboardList, FolderOpen, Building2, Users, Loader2, RotateCcw, Eye, Pencil } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, MatchRule, Merge, MatchPair } from "@/lib/api";
import { useLocation } from "@/contexts/LocationContext";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { locationId, locationName, isAuthenticated, isLoading: authLoading, error: authError } = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch contacts count
  const { data: contactsData } = useQuery({
    queryKey: ['contacts', locationId],
    queryFn: () => api.getContacts(1),
    enabled: isAuthenticated && !!locationId,
  });

  // Fetch companies count
  const { data: companiesData } = useQuery({
    queryKey: ['companies', locationId],
    queryFn: () => api.getCompanies(1),
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

  // Fetch recent merges
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
  const contactsCount = contactsData?.meta?.total ?? 0;
  const companiesCount = companiesData?.total ?? 0;
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
      <div className="space-y-8 pt-12 lg:pt-0">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Welcome back!</h1>
            <p className="text-muted-foreground text-sm">
              {locationName || `Location ${locationId?.slice(0, 8)}...`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
              <span className="text-sm text-muted-foreground">Connected</span>
            </div>
            <Button variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Sync
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Pending Review */}
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-primary/10 p-3">
                  <ClipboardList className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                  <p className="text-3xl font-bold">
                    {pendingMatches.length}
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                      matches across {rulesWithPending} rules
                    </span>
                  </p>
                </div>
              </div>
              <Button variant="link" className="mt-3 p-0 h-auto text-primary" asChild>
                <Link to="/match-rules">Review Now <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </CardContent>
          </Card>

          {/* Merged This Week */}
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-success/10 p-3">
                  <Check className="h-6 w-6 text-success" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Recent Merges</p>
                  <p className="text-3xl font-bold">
                    {recentMerges.length}
                    <span className="text-sm font-normal text-muted-foreground ml-2">duplicates merged</span>
                  </p>
                </div>
              </div>
              <Button variant="link" className="mt-3 p-0 h-auto text-primary" asChild>
                <Link to="/history">View History <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </CardContent>
          </Card>

          {/* Total Records */}
          <Card className="shadow-sm hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-muted p-3">
                  <FolderOpen className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Total Records</p>
                  <p className="text-3xl font-bold">
                    {(contactsCount + companiesCount).toLocaleString()}
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                      synced across {objectCounts.filter(o => o.count > 0).length} objects
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                    {objectCounts.map(obj => (
                      <span key={obj.name} className="flex items-center gap-1">
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
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg font-semibold">Your Match Rules</CardTitle>
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
              <div className="text-center py-8 text-muted-foreground">
                <p>No match rules yet.</p>
                <Button variant="link" className="mt-2" asChild>
                  <Link to="/match-rules/new">Create your first rule</Link>
                </Button>
              </div>
            ) : (
              <div className="border-t">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Object</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Strategy</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Schedule</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Last Scan</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Pending</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rules.map((rule: MatchRule) => (
                      <tr key={rule.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4">
                          <Link to={`/match-rules/${rule.id}`} className="font-medium hover:text-primary hover:underline">
                            {rule.name}
                          </Link>
                        </td>
                        <td className="py-3 px-4 capitalize">{rule.source_object}</td>
                        <td className="py-3 px-4">{rule.merge_strategy || 'standard'}</td>
                        <td className="py-3 px-4 capitalize">{rule.schedule_frequency}</td>
                        <td className="py-3 px-4">{formatLastScan(rule.last_scan_at)}</td>
                        <td className="py-3 px-4 text-right">
                          <Badge variant="outline">{pendingByRule[rule.id] || 0}</Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Switch
                            checked={rule.is_active}
                            onCheckedChange={() => toggleStatusMutation.mutate(rule.id)}
                            disabled={toggleStatusMutation.isPending}
                          />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/match-rules/${rule.id}`}>
                              <Pencil className="h-4 w-4 mr-1" />
                              Edit
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity Table */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
            <Button variant="link" className="p-0 h-auto text-primary" asChild>
              <Link to="/history">View All <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {recentMerges.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No merges yet</p>
            ) : (
              <div className="border-t">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Record</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Master ID</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Merged ID</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentMerges.map((merge: Merge) => (
                      <tr key={merge.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4">
                          {new Date(merge.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 font-medium">
                          {merge.master_record_name || 'Unknown'}
                        </td>
                        <td className="py-3 px-4">
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                            {merge.master_record_id.slice(0, 8)}...
                          </code>
                        </td>
                        <td className="py-3 px-4">
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                            {merge.duplicate_record_id.slice(0, 8)}...
                          </code>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={merge.status === 'completed' ? 'default' : 'secondary'}>
                            {merge.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" asChild>
                                  <Link to={`/history/${merge.id}`}>
                                    <Eye className="h-4 w-4" />
                                  </Link>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>View</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => rollbackMutation.mutate(merge.id)}
                                  disabled={rollbackMutation.isPending || merge.status === 'rolled_back'}
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Restore</TooltipContent>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
