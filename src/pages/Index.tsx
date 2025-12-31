import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, ArrowRight, Plus, Check, ClipboardList, FolderOpen, Building2, Users, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api, MatchRule, Merge, MatchPair } from "@/lib/api";
import { useLocation } from "@/contexts/LocationContext";

export default function Dashboard() {
  const { locationId, isAuthenticated, isLoading: authLoading, error: authError } = useLocation();

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

  // Calculate stats from real data
  const contactsCount = contactsData?.meta?.total ?? 0;
  const companiesCount = companiesData?.total ?? 0;
  const rules = rulesData?.data ?? [];
  const pendingMatches = matchesData?.data ?? [];
  const recentMerges = mergesData?.data ?? [];

  // Count pending matches per rule
  const pendingByRule = pendingMatches.reduce((acc: Record<string, number>, match: MatchPair) => {
    const ruleId = (match as any).rule_id;
    if (ruleId) {
      acc[ruleId] = (acc[ruleId] || 0) + 1;
    }
    return acc;
  }, {});

  const rulesWithPending = rules.filter((r: MatchRule) => pendingByRule[r.id] > 0).length;

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
    <div className="space-y-8 pt-12 lg:pt-0">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back!</h1>
          <p className="text-muted-foreground text-sm">
            Location: {locationId}
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
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{pendingMatches.length}</span>
                  <span className="text-sm text-muted-foreground">matches</span>
                </div>
                <p className="text-sm text-muted-foreground">across {rulesWithPending} rules</p>
              </div>
            </div>
            <Button variant="link" className="mt-4 p-0 h-auto text-primary" asChild>
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
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Recent Merges</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{recentMerges.length}</span>
                  <span className="text-sm text-muted-foreground">duplicates</span>
                </div>
                <p className="text-sm text-muted-foreground">merged</p>
              </div>
            </div>
            <Button variant="link" className="mt-4 p-0 h-auto text-primary" asChild>
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
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Records</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{(contactsCount + companiesCount).toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground">synced</span>
                </div>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    Contacts: {contactsCount.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5" />
                    Companies: {companiesCount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Match Rules Section */}
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
        <CardContent className="space-y-3">
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
            rules.map((rule: MatchRule) => {
              const lastScan = rule.last_scan_at ? new Date(rule.last_scan_at) : null;
              const formatLastScan = () => {
                if (!lastScan) return 'Never';
                const now = new Date();
                const diffMs = now.getTime() - lastScan.getTime();
                const diffMins = Math.floor(diffMs / 60000);
                const diffHours = Math.floor(diffMs / 3600000);
                const diffDays = Math.floor(diffMs / 86400000);
                if (diffMins < 1) return 'Just now';
                if (diffMins < 60) return `${diffMins}m ago`;
                if (diffHours < 24) return `${diffHours}h ago`;
                if (diffDays < 7) return `${diffDays}d ago`;
                return lastScan.toLocaleDateString();
              };

              return (
                <Link
                  key={rule.id}
                  to={`/match-rules/${rule.id}`}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-md bg-muted p-2">
                      {rule.source_object === "contacts" ? (
                        <Users className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium group-hover:text-primary transition-colors">{rule.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {rule.source_object} • {rule.schedule_frequency} • {rule.is_active ? 'Active' : 'Inactive'}
                      </p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                        <span>Strategy: <span className="font-medium">{rule.merge_strategy || 'standard'}</span></span>
                        <span>Last scan: <span className="font-medium">{formatLastScan()}</span></span>
                        {rule.schedule_frequency !== 'manual' && (
                          <span>Next run: <span className="font-medium">Scheduled</span></span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-medium">
                      {pendingByRule[rule.id] || 0} pending
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              );
            }))
          )}
        </CardContent>
      </Card>

      {/* Recent Activity Section */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
          <Button variant="link" className="p-0 h-auto text-primary" asChild>
            <Link to="/history">View All <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentMerges.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">No merges yet</p>
            ) : (
              recentMerges.map((merge: Merge) => (
                <div
                  key={merge.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-success/10 p-1.5">
                      <Check className="h-3.5 w-3.5 text-success" />
                    </div>
                    <div>
                      <span className="font-medium">Merged record</span>
                      <span className="text-muted-foreground"> ← {merge.duplicate_record_id.slice(0, 8)}...</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {new Date(merge.created_at).toLocaleDateString()}
                    </span>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/history">View</Link>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
