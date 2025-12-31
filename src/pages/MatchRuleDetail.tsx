import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Edit, Search, Play, Lightbulb, Loader2 } from "lucide-react";
import { useLocation } from "@/contexts/LocationContext";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

export default function MatchRuleDetail() {
  const { id } = useParams();
  const { locationId, isLoading: authLoading } = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
        <Link to="/match-rules" className="text-primary hover:underline mt-4 block">
          Back to Match Rules
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-12 lg:pt-0">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Link
            to="/match-rules"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Match Rules
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">
            {rule.name}
          </h1>
        </div>
        <Button variant="outline" asChild>
          <Link to={`/match-rules/${id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Rule
          </Link>
        </Button>
      </div>

      {/* Rule Configuration Section */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="grid gap-2 text-sm">
            <div className="flex flex-wrap gap-x-6 gap-y-1">
              <span>
                <span className="text-muted-foreground">Object:</span>{" "}
                <span className="font-medium capitalize">{rule.source_object}</span>
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
                Auto-merge: {Math.round(rule.auto_merge_threshold * 100)}% | Review: {Math.round(rule.review_threshold * 100)}%
              </span>
            </div>
          </div>

          <Separator />

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-muted-foreground">Merge Strategy:</span>
            <Select defaultValue="standard">
              <SelectTrigger className="w-[220px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard Contact Merge</SelectItem>
                <SelectItem value="recent">Most Recent Wins</SelectItem>
                <SelectItem value="new">+ Create New...</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              Edit Strategy
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions Section */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
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
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Schedule:</span>
              <Select defaultValue="daily6am">
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily6am">Daily 6am</SelectItem>
                  <SelectItem value="daily12pm">Daily 12pm</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="manual">Manual only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="text-sm space-y-1">
            <p className="text-muted-foreground">
              Pending matches: <span className="text-foreground font-medium">{pendingMatches.length}</span>
            </p>
            <p className="text-muted-foreground">
              Schedule: <span className="text-foreground capitalize">{rule.schedule_frequency || "manual"}</span>
            </p>
            <p className="text-muted-foreground flex items-center gap-1">
              <Lightbulb className="h-4 w-4 text-warning" />
              Scheduled scans require Starter plan or higher.{" "}
              <Link to="/settings" className="text-primary hover:underline font-medium">
                Upgrade
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Pending Matches Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">PENDING MATCHES ({pendingMatches.length})</h2>

        {matchesLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : pendingMatches.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No pending matches found.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Click "Scan Now" to search for duplicates.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {pendingMatches.map((match: any) => {
              const recordA = match.record_a_data || {};
              const recordB = match.record_b_data || {};
              const confidence = Math.round((match.confidence_score || 0) * 100);

              return (
                <Card key={match.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold">
                        {recordA.name || recordA.email || recordA.firstName || "Record A"}{" "}
                        <span className="text-muted-foreground">←</span>{" "}
                        {recordB.name || recordB.email || recordB.firstName || "Record B"}
                      </span>
                      <span className="text-sm font-medium text-primary">{confidence}% confidence</span>
                    </div>
                    <Separator className="mb-3" />
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div className="space-y-1">
                        <p>{recordA.email || <span className="text-muted-foreground">(no email)</span>}</p>
                        <p>{recordA.phone || recordA.phoneNumber || <span className="text-muted-foreground">(no phone)</span>}</p>
                        <p>{recordA.companyName || <span className="text-muted-foreground">(no company)</span>}</p>
                      </div>
                      <div className="space-y-1 border-l pl-4">
                        <p>{recordB.email || <span className="text-muted-foreground">(no email)</span>}</p>
                        <p>{recordB.phone || recordB.phoneNumber || <span className="text-muted-foreground">(no phone)</span>}</p>
                        <p>{recordB.companyName || <span className="text-muted-foreground">(no company)</span>}</p>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/match-rules/${id}/review/${match.id}`}>Review</Link>
                      </Button>
                      <Button size="sm">Merge</Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {pendingMatches.length > 0 && (
          <p className="text-sm text-muted-foreground">
            Showing {pendingMatches.length} matches
          </p>
        )}
      </div>

      {/* Merge History Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">MERGE HISTORY ({mergeHistory.length})</h2>

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
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Master</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Duplicate</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mergeHistory.map((item: any) => (
                      <tr key={item.id} className="border-b last:border-0">
                        <td className="py-3 px-4 font-medium">{item.master_record_id?.slice(0, 8)}...</td>
                        <td className="py-3 px-4 text-muted-foreground">← {item.duplicate_record_id?.slice(0, 8)}...</td>
                        <td className="py-3 px-4 capitalize">{item.status}</td>
                        <td className="py-3 px-4 text-right">
                          <Button variant="ghost" size="sm">View</Button>
                          {item.status !== "rolled_back" && (
                            <Button variant="ghost" size="sm">Restore</Button>
                          )}
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
