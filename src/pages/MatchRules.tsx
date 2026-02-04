import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { Plus, Loader2, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, MatchRule, MatchPair } from "@/lib/api";
import { useLocation } from "@/contexts/LocationContext";
import { useToast } from "@/hooks/use-toast";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { NoRulesEmpty } from "@/components/ui/empty-state";
import { RuleActionButtons } from "@/components/rule-action-buttons";
import { PageHeader } from "@/components/ui/page-header";
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

export default function MatchRules() {
  const { locationId, isAuthenticated, isLoading: authLoading } = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

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

  const pendingMatches = matchesData?.data ?? [];

  // Sort rules by creation date (newest first) and filter by search
  const filteredRules = useMemo(() => {
    const data = rulesData?.data ?? [];
    const sorted = [...data].sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA; // Newest first
    });
    if (!searchQuery) return sorted;
    const query = searchQuery.toLowerCase();
    return sorted.filter((rule: MatchRule) =>
      rule.name.toLowerCase().includes(query) ||
      rule.source_object?.toLowerCase().includes(query) ||
      rule.merge_strategy?.toLowerCase().includes(query)
    );
  }, [rulesData?.data, searchQuery]);

  // Count pending matches per rule
  const pendingByRule = pendingMatches.reduce((acc: Record<string, number>, match: MatchPair) => {
    const ruleId = match.rule_id;
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
        <RuleActionButtons
          rule={rule}
          pendingCount={pendingByRule[rule.id] || 0}
          onDelete={() => setRuleToDelete(rule)}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Match Rules"
        description="Create and manage duplicate detection rules"
      >
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search rules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-[200px]"
          />
        </div>

        {/* New Rule Button */}
        <Button asChild>
          <Link to="/match-rules/new">
            <Plus className="mr-1.5 h-4 w-4" />
            New Rule
          </Link>
        </Button>
      </PageHeader>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <DataTable
            data={filteredRules}
            columns={rulesColumns}
            keyField="id"
            loading={rulesLoading}
            emptyState={<NoRulesEmpty />}
            minWidth="700px"
          />
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
  );
}
