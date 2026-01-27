import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Plus, ArrowRight, Loader2, MoreHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, MatchRule, MatchPair } from "@/lib/api";
import { useLocation } from "@/contexts/LocationContext";
import { useToast } from "@/hooks/use-toast";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { NoRulesEmpty } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function MatchRules() {
  const { locationId, isAuthenticated, isLoading: authLoading } = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch match rules
  const { data: rulesData, isLoading: rulesLoading } = useQuery({
    queryKey: ['rules', locationId],
    queryFn: () => api.getMatchRules(),
    enabled: isAuthenticated && !!locationId,
    gcTime: 0,
    staleTime: 0,
  });

  // Fetch pending matches for counts
  const { data: matchesData } = useQuery({
    queryKey: ['matches', 'pending', locationId],
    queryFn: () => api.getMatches('pending', undefined, 1000),
    enabled: isAuthenticated && !!locationId,
    gcTime: 0,
    staleTime: 0,
    refetchOnMount: 'always',
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

  const formatTimestamp = (lastScanAt?: string) => {
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
      accessor: (rule) => <span className="text-muted-foreground">{formatTimestamp(rule.last_merge_at)}</span>,
      hideOnMobile: true,
    },
    {
      header: "Last Scheduled Run",
      accessor: (rule) => (
        <span className="text-muted-foreground">
          {rule.schedule_frequency !== 'manual' ? formatTimestamp(rule.last_scan_at) : '—'}
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
        <div className="flex items-center justify-end gap-1">
          {pendingByRule[rule.id] > 0 && (
            <Button size="sm" asChild>
              <Link to={`/match-rules/${rule.id}?action=merge-all`}>Merge All</Link>
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={`/match-rules/${rule.id}`}>View Details</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/match-rules/${rule.id}/edit`}>Edit Rule</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Match Rules"
        description="Create and manage your duplicate detection rules"
      >
        <Button size="lg" className="text-lg px-8 py-6 shadow-md" asChild>
          <Link to="/match-rules/new">
            <Plus className="mr-2 h-5 w-5" />
            New Rule
          </Link>
        </Button>
      </PageHeader>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <DataTable
            data={rules}
            columns={rulesColumns}
            keyField="id"
            loading={rulesLoading}
            emptyState={<NoRulesEmpty />}
            minWidth="700px"
          />
        </CardContent>
      </Card>
    </div>
  );
}
