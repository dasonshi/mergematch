import { useState, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Search, X, Filter, ChevronDown, Play } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { useLocation } from "@/contexts/LocationContext";
import { useToast } from "@/hooks/use-toast";
import { api, MatchRule, MatchPair } from "@/lib/api";
import { computeStrategySelections, computeMasterId, StrategyId } from "@/lib/merge-strategies";
import { cn } from "@/lib/utils";

// Get the record's display name
const getRecordName = (record: Record<string, any>): string => {
  if (record.firstName && record.lastName) {
    return `${record.firstName} ${record.lastName}`;
  }
  return record.firstName || record.name || record.email || "—";
};

export default function AllPendingMatches() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { locationId, isLoading: authLoading } = useLocation();
  const queryClient = useQueryClient();

  // Filter panel state
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [confidenceFilter, setConfidenceFilter] = useState<string>("all");
  const [ruleFilter, setRuleFilter] = useState<string>("all");

  // Merge state
  const [mergingIds, setMergingIds] = useState<Set<string>>(new Set());
  const [showMergeAllDialog, setShowMergeAllDialog] = useState(false);
  const [bulkMergeProgress, setBulkMergeProgress] = useState({ current: 0, total: 0, inProgress: false });
  const abortMergeRef = useRef(false);

  // Fetch all match rules
  const { data: rulesData, isLoading: rulesLoading } = useQuery({
    queryKey: ["rules", locationId],
    queryFn: () => api.getMatchRules(),
    enabled: !!locationId,
  });

  const rules = rulesData?.data || [];
  const rulesMap = new Map(rules.map((r: MatchRule) => [r.id, r]));

  // Fetch all pending matches
  const { data: matchesData, isLoading: matchesLoading } = useQuery({
    queryKey: ["matches", "pending", "all", locationId],
    queryFn: () => api.getMatches("pending", undefined, 1000),
    enabled: !!locationId,
    gcTime: 0,
  });

  const allMatches = matchesData?.data || [];

  // Stats
  const stats = useMemo(() => {
    const total = allMatches.length;
    const highConfidence = allMatches.filter((m: MatchPair) => m.confidence_score >= 0.9).length;
    const mediumConfidence = allMatches.filter((m: MatchPair) => m.confidence_score >= 0.8 && m.confidence_score < 0.9).length;
    const lowConfidence = allMatches.filter((m: MatchPair) => m.confidence_score < 0.8).length;

    // Count by rule
    const byRule = allMatches.reduce((acc: Record<string, number>, m: any) => {
      const ruleId = m.rule_id;
      if (ruleId) {
        acc[ruleId] = (acc[ruleId] || 0) + 1;
      }
      return acc;
    }, {});
    const rulesWithMatches = Object.keys(byRule).length;

    return { total, highConfidence, mediumConfidence, lowConfidence, rulesWithMatches, byRule };
  }, [allMatches]);

  // Filter matches
  const filteredMatches = useMemo(() => {
    return allMatches.filter((item: any) => {
      // Rule filter
      if (ruleFilter !== "all" && item.rule_id !== ruleFilter) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const recordA = item.record_a_data || {};
        const recordB = item.record_b_data || {};
        const rule = rulesMap.get(item.rule_id);
        const matchesSearch =
          recordA.firstName?.toLowerCase().includes(query) ||
          recordA.lastName?.toLowerCase().includes(query) ||
          recordA.email?.toLowerCase().includes(query) ||
          recordA.phone?.toLowerCase().includes(query) ||
          recordB.firstName?.toLowerCase().includes(query) ||
          recordB.lastName?.toLowerCase().includes(query) ||
          recordB.email?.toLowerCase().includes(query) ||
          recordB.phone?.toLowerCase().includes(query) ||
          rule?.name?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Confidence filter
      if (confidenceFilter !== "all") {
        const score = item.confidence_score;
        if (confidenceFilter === "high" && score < 0.9) return false;
        if (confidenceFilter === "medium" && (score < 0.8 || score >= 0.9)) return false;
        if (confidenceFilter === "low" && score >= 0.8) return false;
      }

      return true;
    });
  }, [allMatches, searchQuery, confidenceFilter, ruleFilter, rulesMap]);

  const hasActiveFilters = searchQuery || confidenceFilter !== "all" || ruleFilter !== "all";
  const activeFilterCount = [searchQuery, confidenceFilter !== "all", ruleFilter !== "all"].filter(Boolean).length;

  const clearFilters = () => {
    setSearchQuery("");
    setConfidenceFilter("all");
    setRuleFilter("all");
  };

  // Quick merge mutation
  const quickMergeMutation = useMutation({
    mutationFn: async (match: any) => {
      const rule = rulesMap.get(match.rule_id);
      if (!rule) throw new Error("Rule not found");

      const strategy = (rule.merge_strategy || "standard") as StrategyId;
      const overwriteBlanks = rule.merge_settings?.overwrite_blanks ?? false;
      const recordA = match.record_a_data || {};
      const recordB = match.record_b_data || {};
      const fields = ["firstName", "lastName", "email", "phone", "tags", "address1", "city", "state", "postalCode"];
      const selections = computeStrategySelections({
        strategy,
        recordA,
        recordB,
        fields,
        overwriteBlanks,
      });
      const masterId = computeMasterId(strategy, recordA, recordB, fields, match.record_a_id, match.record_b_id);
      return api.executeMerge(match.id, masterId, selections);
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
      queryClient.invalidateQueries({ queryKey: ["merge-stats"] });
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

  // Bulk merge
  const handleMergeAll = async () => {
    setShowMergeAllDialog(false);
    const matches = filteredMatches;

    if (matches.length === 0) return;

    abortMergeRef.current = false;
    setBulkMergeProgress({ current: 0, total: matches.length, inProgress: true });

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < matches.length; i++) {
      if (abortMergeRef.current) {
        toast({
          title: "Merge Aborted",
          description: `Stopped after ${i} of ${matches.length} merges. ${successCount} succeeded, ${failCount} failed.`,
        });
        break;
      }

      const match = matches[i];
      try {
        const rule = rulesMap.get(match.rule_id);
        if (!rule) {
          failCount++;
          continue;
        }

        const strategy = (rule.merge_strategy || "standard") as StrategyId;
        const overwriteBlanks = rule.merge_settings?.overwrite_blanks ?? false;
        const recordA = match.record_a_data || {};
        const recordB = match.record_b_data || {};
        const fields = ["firstName", "lastName", "email", "phone", "tags", "address1", "city", "state", "postalCode"];
        const selections = computeStrategySelections({
          strategy,
          recordA,
          recordB,
          fields,
          overwriteBlanks,
        });
        const masterId = computeMasterId(strategy, recordA, recordB, fields, match.record_a_id, match.record_b_id);
        await api.executeMerge(match.id, masterId, selections);
        successCount++;
      } catch {
        failCount++;
      }
      setBulkMergeProgress({ current: i + 1, total: matches.length, inProgress: true });
    }

    setBulkMergeProgress({ current: 0, total: 0, inProgress: false });
    queryClient.invalidateQueries({ queryKey: ["matches"] });
    queryClient.invalidateQueries({ queryKey: ["merges"] });
    queryClient.invalidateQueries({ queryKey: ["merge-stats"] });

    if (!abortMergeRef.current) {
      toast({
        title: "Bulk Merge Complete",
        description: `Successfully merged ${successCount} records.${failCount > 0 ? ` ${failCount} failed.` : ''}`,
        variant: failCount > 0 ? "destructive" : "default",
      });
    }
  };

  // Table columns
  const columns: DataTableColumn<any>[] = [
    {
      header: "Record A",
      accessor: (item) => {
        const recordA = item.record_a_data || {};
        return (
          <div>
            <div className="font-medium">{getRecordName(recordA)}</div>
            {recordA.email && (
              <div className="text-xs text-muted-foreground">{recordA.email}</div>
            )}
          </div>
        );
      },
    },
    {
      header: "Record B",
      accessor: (item) => {
        const recordB = item.record_b_data || {};
        return (
          <div>
            <div className="font-medium">{getRecordName(recordB)}</div>
            {recordB.email && (
              <div className="text-xs text-muted-foreground">{recordB.email}</div>
            )}
          </div>
        );
      },
    },
    {
      header: "Rule",
      hideOnMobile: true,
      accessor: (item) => {
        const rule = rulesMap.get(item.rule_id);
        return (
          <Link
            to={`/match-rules/${item.rule_id}`}
            className="text-sm text-muted-foreground hover:text-primary"
          >
            {rule?.name || "Unknown"}
          </Link>
        );
      },
    },
    {
      header: "Confidence",
      accessor: (item) => {
        const confidence = Math.round((item.confidence_score || 0) * 100);
        return (
          <Badge
            variant="outline"
            className={cn(
              "font-semibold",
              confidence >= 90 ? "bg-green-100 text-green-700 border-green-200" :
              confidence >= 80 ? "bg-amber-100 text-amber-700 border-amber-200" :
              "bg-red-100 text-red-700 border-red-200"
            )}
          >
            {confidence}%
          </Badge>
        );
      },
    },
    {
      header: "Found",
      hideOnMobile: true,
      accessor: (item) => (
        <span className="text-muted-foreground text-sm">
          {new Date(item.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: "Actions",
      align: "right" as const,
      accessor: (item) => {
        const isMerging = mergingIds.has(item.id);
        return (
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/match-rules/${item.rule_id}/review/${item.id}`}>Review</Link>
            </Button>
            <Button
              size="sm"
              onClick={() => quickMergeMutation.mutate(item)}
              disabled={isMerging}
            >
              {isMerging ? <Loader2 className="h-3 w-3 animate-spin" /> : "Merge"}
            </Button>
          </div>
        );
      },
    },
  ];

  if (authLoading || rulesLoading || matchesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Dashboard
            </Link>
          </Button>
          <PageHeader title="All Pending Matches" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => setShowMergeAllDialog(true)}
            disabled={filteredMatches.length === 0 || bulkMergeProgress.inProgress}
          >
            {bulkMergeProgress.inProgress ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Merging {bulkMergeProgress.current}/{bulkMergeProgress.total}
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Merge All ({filteredMatches.length})
              </>
            )}
          </Button>
          {bulkMergeProgress.inProgress && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => { abortMergeRef.current = true; }}
            >
              <X className="h-4 w-4 mr-1" />
              Abort
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total Pending</span>
            <p className="text-2xl font-bold mt-1">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Rules</span>
            <p className="text-2xl font-bold mt-1">{stats.rulesWithMatches}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">High (90%+)</span>
            <p className="text-2xl font-bold mt-1 text-green-600">{stats.highConfidence}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Medium (80-90%)</span>
            <p className="text-2xl font-bold mt-1 text-amber-600">{stats.mediumConfidence}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Low (&lt;80%)</span>
            <p className="text-2xl font-bold mt-1 text-red-600">{stats.lowConfidence}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
          <div className="flex items-center justify-between p-4 border-b">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-1">{activeFilterCount}</Badge>
                )}
                <ChevronDown className={`h-4 w-4 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear all
              </Button>
            )}
          </div>
          <CollapsibleContent>
            <CardContent className="pt-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
                {/* Search */}
                <div className="flex-1 space-y-2">
                  <Label htmlFor="search" className="text-sm font-medium">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by name, email, phone, rule..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* Rule Filter */}
                <div className="space-y-2 min-w-[200px]">
                  <Label className="text-sm font-medium">Rule</Label>
                  <Select value={ruleFilter} onValueChange={setRuleFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Rules" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Rules</SelectItem>
                      {rules.filter((r: MatchRule) => stats.byRule[r.id]).map((rule: MatchRule) => (
                        <SelectItem key={rule.id} value={rule.id}>
                          {rule.name} ({stats.byRule[rule.id]})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Confidence Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Confidence</Label>
                  <div className="flex gap-2">
                    {[
                      { value: "all", label: "All" },
                      { value: "high", label: "High" },
                      { value: "medium", label: "Medium" },
                      { value: "low", label: "Low" },
                    ].map((option) => (
                      <Button
                        key={option.value}
                        variant={confidenceFilter === option.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setConfidenceFilter(option.value)}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Data Table */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <DataTable
            data={filteredMatches}
            columns={columns}
            keyField="id"
            minWidth="700px"
            emptyState={
              <div className="p-12 text-center">
                {hasActiveFilters ? (
                  <>
                    <Filter className="h-8 w-8 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">No matches match your filters</p>
                    <Button variant="outline" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-muted-foreground mb-4">No pending matches found</p>
                    <Button variant="outline" asChild>
                      <Link to="/">Back to Dashboard</Link>
                    </Button>
                  </>
                )}
              </div>
            }
          />
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {filteredMatches.length} of {allMatches.length} matches
          {hasActiveFilters && " (filtered)"}
        </span>
      </div>

      {/* Merge All Dialog */}
      <AlertDialog open={showMergeAllDialog} onOpenChange={setShowMergeAllDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Merge All Pending Matches?</AlertDialogTitle>
            <AlertDialogDescription>
              This will merge <span className="font-semibold">{filteredMatches.length}</span> pending matches
              across <span className="font-semibold">{new Set(filteredMatches.map((m: any) => m.rule_id)).size}</span> rules
              using each rule's configured merge strategy.
              <br /><br />
              Snapshots will be saved for 30-day rollback.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleMergeAll}>
              Merge All ({filteredMatches.length})
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
