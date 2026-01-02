import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Edit, Search, Play, Loader2, ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import { useLocation } from "@/contexts/LocationContext";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

export default function MatchRuleDetail() {
  const { id } = useParams();
  const { locationId, isLoading: authLoading, canUseStrategies } = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [matchesExpanded, setMatchesExpanded] = useState(true);
  const [mergingIds, setMergingIds] = useState<Set<string>>(new Set());

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
  });

  // Fetch merge history
  const { data: mergesData } = useQuery({
    queryKey: ["merges", locationId],
    queryFn: () => api.getMerges(10),
    enabled: !!locationId,
  });

  // Scan mutation
  const scanMutation = useMutation({
    mutationFn: () => api.scanRule(id!),
    onSuccess: (data) => {
      toast({
        title: "Scan Complete",
        description: `Found ${data.matches_found} matches from ${data.records_scanned} records.`,
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
      const fields = ["firstName", "lastName", "email", "phone", "companyName", "tags", "address1", "city", "state", "postalCode"];
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
    <div className="space-y-6 pt-12 lg:pt-0">
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
          <h1 className="text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">
            {rule.name}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
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
          <Button variant="secondary">
            <Play className="mr-2 h-4 w-4" />
            Merge All
          </Button>
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

      {/* Rule Summary Card */}
      <Card>
        <CardContent className="p-5">
          <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <span className="text-muted-foreground">Object:</span>{" "}
              <span className="font-medium capitalize">{rule.source_object}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Strategy:</span>{" "}
              <span className="font-medium capitalize">{rule.merge_strategy || 'standard'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Status:</span>
              <Switch
                checked={rule.is_active}
                onCheckedChange={() => toggleMutation.mutate()}
                disabled={toggleMutation.isPending}
              />
              <span className="text-xs text-muted-foreground">
                {rule.is_active ? "Active" : "Inactive"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Fields:</span>{" "}
              <span className="font-medium">
                {(rule.match_fields || []).map((f: any, i: number) => (
                  <span key={f.field}>
                    {f.field} ({f.algorithm}){i < rule.match_fields.length - 1 ? ", " : ""}
                  </span>
                ))}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Thresholds:</span>{" "}
              <span className="font-medium">
                Auto: {Math.round(rule.auto_merge_threshold * 100)}% | Review: {Math.round(rule.review_threshold * 100)}%
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Schedule:</span>{" "}
              <span className="font-medium capitalize">{rule.schedule_frequency || "manual"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Last Scan:</span>{" "}
              <span className="font-medium">
                {rule.last_scan_at
                  ? new Date(rule.last_scan_at).toLocaleString()
                  : "Never"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Matches Section */}
      <div className="space-y-2">
        <button
          onClick={() => setMatchesExpanded(!matchesExpanded)}
          className="flex items-center gap-2 text-lg font-semibold hover:text-primary transition-colors w-full text-left"
        >
          {matchesExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          Pending Matches ({pendingMatches.length})
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
              <div className="max-h-80 overflow-y-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr className="border-b">
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground">Record A</th>
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground">Record B</th>
                      <th className="text-center py-2 px-3 font-medium text-muted-foreground">Score</th>
                      <th className="text-right py-2 px-3 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingMatches.map((match: any) => {
                      const recordA = match.record_a_data || {};
                      const recordB = match.record_b_data || {};
                      const confidence = Math.round((match.confidence_score || 0) * 100);
                      const isMerging = mergingIds.has(match.id);

                      return (
                        <tr key={match.id} className="border-b last:border-0 hover:bg-muted/30">
                          <td className="py-2 px-3">
                            <div className="font-medium truncate max-w-[200px]">
                              {recordA.firstName || recordA.name || recordA.email || "—"}
                            </div>
                            <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {recordA.email || recordA.phone || ""}
                            </div>
                          </td>
                          <td className="py-2 px-3">
                            <div className="font-medium truncate max-w-[200px]">
                              {recordB.firstName || recordB.name || recordB.email || "—"}
                            </div>
                            <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {recordB.email || recordB.phone || ""}
                            </div>
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span className="text-primary font-medium">{confidence}%</span>
                          </td>
                          <td className="py-2 px-3 text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="sm" className="h-7 px-2" asChild>
                                <Link to={`/match-rules/${id}/review/${match.id}`}>Review</Link>
                              </Button>
                              <Button
                                size="sm"
                                className="h-7 px-2"
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
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Merge History Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Merge History ({mergeHistory.length})</h2>

        {mergeHistory.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No merges performed yet.</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Master Record</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mergeHistory.map((item: any) => (
                      <tr key={item.id} className="border-b last:border-0">
                        <td className="py-3 px-4 font-medium">
                          {item.master_record_name || item.master_record_id?.slice(0, 8) + "..."}
                        </td>
                        <td className="py-3 px-4 capitalize">{item.status}</td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {item.created_at ? new Date(item.created_at).toLocaleDateString() : "—"}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={`/history/${item.id}`}>View</Link>
                            </Button>
                            {item.status !== "rolled_back" && (
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
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        <Link to="/history" className="text-sm text-primary hover:underline font-medium">
          View Full History →
        </Link>
      </div>
    </div>
  );
}
