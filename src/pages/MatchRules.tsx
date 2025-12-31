import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList, Plus, ArrowRight, FileText, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api, MatchRule, MatchPair } from "@/lib/api";
import { useLocation } from "@/contexts/LocationContext";

export default function MatchRules() {
  const { locationId, isAuthenticated, isLoading: authLoading, error: authError } = useLocation();

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
            <Button variant="outline" asChild>
              <Link to="/merge-strategies">View Merge Strategies</Link>
            </Button>
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
          <Button variant="outline" asChild>
            <Link to="/merge-strategies">View Merge Strategies</Link>
          </Button>
          <Button asChild>
            <Link to="/match-rules/new">
              <Plus className="mr-2 h-4 w-4" />
              New Match Rule
            </Link>
          </Button>
        </div>
      </PageHeader>

      <div className="grid gap-4">
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
            <Card key={rule.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <Link
                  to={`/match-rules/${rule.id}`}
                  className="flex items-center gap-2 text-lg font-semibold text-primary hover:underline mb-3"
                >
                  <FileText className="h-5 w-5" />
                  {rule.name}
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <div className="grid gap-2 text-sm">
                  <div className="flex flex-wrap gap-x-6 gap-y-1">
                    <span>
                      <span className="text-muted-foreground">Object:</span>{" "}
                      <span className="font-medium capitalize">{rule.source_object}</span>
                    </span>
                    <span>
                      <span className="text-muted-foreground">Strategy:</span>{" "}
                      <span className="font-medium">{rule.merge_strategy || 'standard'}</span>
                    </span>
                    <span>
                      <span className="text-muted-foreground">Status:</span>{" "}
                      <span className="font-medium">{rule.is_active ? 'Active' : 'Inactive'}</span>
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-x-6 gap-y-1">
                    <span>
                      <span className="text-muted-foreground">Last scan:</span>{" "}
                      <span className="font-medium">{formatLastScan()}</span>
                    </span>
                    <span>
                      <span className="text-muted-foreground">Schedule:</span>{" "}
                      <span className="font-medium">{rule.schedule_frequency}</span>
                    </span>
                    {rule.schedule_frequency !== 'manual' && (
                      <span>
                        <span className="text-muted-foreground">Next run:</span>{" "}
                        <span className="font-medium">Scheduled</span>
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-x-6 gap-y-1">
                    <span>
                      <span className="text-muted-foreground">Pending:</span>{" "}
                      <span className="font-medium">{pendingByRule[rule.id] || 0} matches</span>
                    </span>
                    <span>
                      <span className="text-muted-foreground">Thresholds:</span>{" "}
                      <span className="font-medium">Auto: {Math.round(rule.auto_merge_threshold * 100)}% / Review: {Math.round(rule.review_threshold * 100)}%</span>
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
