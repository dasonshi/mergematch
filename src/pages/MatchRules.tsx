import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList, Plus, ArrowRight, FileText, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api, MatchRule, MatchPair } from "@/lib/api";
import { useLocation } from "@/contexts/LocationContext";

export default function MatchRules() {
  const { locationId, isAuthenticated, isLoading: authLoading, error: authError, canUseStrategies } = useLocation();

  // Fetch match rules
  const { data: rulesData, isLoading: rulesLoading } = useQuery({
    queryKey: ['rules', locationId],
    queryFn: () => api.getMatchRules(),
    enabled: isAuthenticated && !!locationId,
  });

  // Fetch pending matches to count per rule
  const { data: matchesData } = useQuery({
    queryKey: ['matches', 'pending', locationId],
    queryFn: () => api.getMatches('pending'),
    enabled: isAuthenticated && !!locationId,
  });

  const rules = rulesData?.data ?? [];
  const pendingMatches = matchesData?.data ?? [];

  // Count pending matches per rule
  const pendingByRule = pendingMatches.reduce((acc: Record<string, number>, match: MatchPair) => {
    const ruleId = (match as any).rule_id;
    if (ruleId) {
      acc[ruleId] = (acc[ruleId] || 0) + 1;
    }
    return acc;
  }, {});

  if (authLoading || rulesLoading) {
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

  if (rules.length === 0) {
    return (
      <div className="space-y-6 pt-12 lg:pt-0">
        <PageHeader title="Match Rules">
          <div className="flex gap-2">
            {canUseStrategies ? (
              <Button variant="outline" asChild>
                <Link to="/merge-strategies">View Merge Strategies</Link>
              </Button>
            ) : (
              <Button variant="outline" disabled title="Upgrade to access merge strategies">
                View Merge Strategies
              </Button>
            )}
            <Button asChild>
              <Link to="/match-rules/new">
                <Plus className="mr-2 h-4 w-4" />
                New Match Rule
              </Link>
            </Button>
          </div>
        </PageHeader>

        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <ClipboardList className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No match rules configured</h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            Create your first match rule to start detecting duplicates.
          </p>
          <Button asChild>
            <Link to="/match-rules/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Rule
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-12 lg:pt-0">
      <PageHeader title="Match Rules">
        <div className="flex gap-2">
          {canUseStrategies ? (
            <Button variant="outline" asChild>
              <Link to="/merge-strategies">View Merge Strategies</Link>
            </Button>
          ) : (
            <Button variant="outline" disabled title="Upgrade to access merge strategies">
              View Merge Strategies
            </Button>
          )}
          <Button asChild>
            <Link to="/match-rules/new">
              <Plus className="mr-2 h-4 w-4" />
              New Match Rule
            </Link>
          </Button>
        </div>
      </PageHeader>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="border-b">
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Object</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Strategy</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Last Scan</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Schedule</th>
              <th className="text-right py-3 px-4 font-medium text-muted-foreground">Pending</th>
              <th className="text-right py-3 px-4 font-medium text-muted-foreground">Thresholds</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((rule: MatchRule) => {
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
                <tr key={rule.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="py-3 px-4">
                    <Link
                      to={`/match-rules/${rule.id}`}
                      className="flex items-center gap-2 font-medium text-primary hover:underline"
                    >
                      <FileText className="h-4 w-4" />
                      {rule.name}
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </td>
                  <td className="py-3 px-4 capitalize">{rule.source_object}</td>
                  <td className="py-3 px-4">{rule.merge_strategy || 'standard'}</td>
                  <td className="py-3 px-4">
                    <span className={rule.is_active ? 'text-green-600' : 'text-muted-foreground'}>
                      {rule.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4">{formatLastScan()}</td>
                  <td className="py-3 px-4 capitalize">{rule.schedule_frequency}</td>
                  <td className="py-3 px-4 text-right font-medium">{pendingByRule[rule.id] || 0}</td>
                  <td className="py-3 px-4 text-right text-xs">
                    <span className="text-muted-foreground">Auto:</span> {Math.round(rule.auto_merge_threshold * 100)}%{' '}
                    <span className="text-muted-foreground">Review:</span> {Math.round(rule.review_threshold * 100)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
