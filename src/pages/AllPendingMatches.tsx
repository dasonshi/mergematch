import { useState, useMemo, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Search, X, Play, Filter, AlertCircle, RefreshCw, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { ConfidenceBadge } from "@/components/ui/confidence-badge";
import { useLocation } from "@/contexts/LocationContext";
import { useUpgradeModal } from "@/components/ui/upgrade-modal";
import { useToast } from "@/hooks/use-toast";
import { api, MatchRule, MatchPair } from "@/lib/api";
import { computeStrategySelections, computeMasterId, StrategyId } from "@/lib/merge-strategies";
import { getRecordName } from "@/components/rules/helpers";

export default function AllPendingMatches() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { locationId, isLoading: authLoading, plan } = useLocation();
  const { openUpgradeModal } = useUpgradeModal();
  const queryClient = useQueryClient();
  const canAutoMerge = plan === "pro" || plan === "agency";

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [ruleFilter, setRuleFilter] = useState<string>("all");

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectAllMatching, setSelectAllMatching] = useState(false);
  const [showMergeSelectedDialog, setShowMergeSelectedDialog] = useState(false);

  // Merge state
  const [showMergeAllDialog, setShowMergeAllDialog] = useState(false);
  const [bulkMergeProgress, setBulkMergeProgress] = useState({ current: 0, total: 0, inProgress: false });
  const abortMergeRef = useRef(false);

  // Fetch all match rules
  const { data: rulesData, isLoading: rulesLoading, isError: rulesError, refetch: refetchRules } = useQuery({
    queryKey: ["rules", locationId],
    queryFn: () => api.getMatchRules(),
    enabled: !!locationId,
  });

  const rules = rulesData?.data || [];
  const rulesMap = new Map(rules.map((r: MatchRule) => [r.id, r]));

  // Fetch all pending matches
  const { data: matchesData, isLoading: matchesLoading, isError: matchesError, refetch: refetchMatches } = useQuery({
    queryKey: ["matches", "pending", "all", locationId],
    queryFn: () => api.getMatches("pending", undefined, 1000),
    enabled: !!locationId,
    gcTime: 0,
  });

  // Error state
  const hasError = rulesError || matchesError;
  const handleRetry = () => {
    refetchRules();
    refetchMatches();
  };

  const allMatches = matchesData?.data || [];
  const totalCount = matchesData?.total ?? allMatches.length;
  const isTruncated = allMatches.length < totalCount;

  // Clear selection when filters change
  useEffect(() => {
    setSelectedIds(new Set());
    setSelectAllMatching(false);
  }, [searchQuery, ruleFilter]);

  // Stats
  const stats = useMemo(() => {
    const total = totalCount;
    const highConfidence = allMatches.filter((m: MatchPair) => m.confidence_score >= 0.9).length;
    const mediumConfidence = allMatches.filter((m: MatchPair) => m.confidence_score >= 0.8 && m.confidence_score < 0.9).length;
    const lowConfidence = allMatches.filter((m: MatchPair) => m.confidence_score < 0.8).length;

    // Count by rule
    const byRule = allMatches.reduce((acc: Record<string, number>, m: MatchPair) => {
      const ruleId = m.rule_id;
      if (ruleId) {
        acc[ruleId] = (acc[ruleId] || 0) + 1;
      }
      return acc;
    }, {});
    const rulesWithMatches = Object.keys(byRule).length;

    return { total, highConfidence, mediumConfidence, lowConfidence, rulesWithMatches, byRule };
  }, [allMatches, totalCount]);

  // Filter matches
  const filteredMatches = useMemo(() => {
    return allMatches.filter((item: MatchPair) => {
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

      return true;
    });
  }, [allMatches, searchQuery, ruleFilter, rulesMap]);

  const hasActiveFilters = searchQuery || ruleFilter !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setRuleFilter("all");
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    setSelectAllMatching(false);
  };

  // Bulk merge handler (for both "Merge All" and "Merge Selected")
  const handleBulkMerge = async (matchesToMerge: MatchPair[]) => {
    if (matchesToMerge.length === 0) return;

    abortMergeRef.current = false;
    setBulkMergeProgress({ current: 0, total: matchesToMerge.length, inProgress: true });

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < matchesToMerge.length; i++) {
      if (abortMergeRef.current) {
        toast({
          title: "Merge Aborted",
          description: `Stopped after ${i} of ${matchesToMerge.length} merges. ${successCount} succeeded, ${failCount} failed.`,
        });
        break;
      }

      const match = matchesToMerge[i];
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
      setBulkMergeProgress({ current: i + 1, total: matchesToMerge.length, inProgress: true });
    }

    setBulkMergeProgress({ current: 0, total: 0, inProgress: false });
    setSelectedIds(new Set());
    setSelectAllMatching(false);
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

  const handleMergeAll = () => {
    setShowMergeAllDialog(false);
    handleBulkMerge(filteredMatches);
  };

  const handleMergeSelected = () => {
    setShowMergeSelectedDialog(false);
    const matchesToMerge = selectAllMatching
      ? filteredMatches
      : filteredMatches.filter((m: MatchPair) => selectedIds.has(m.id));
    handleBulkMerge(matchesToMerge);
  };

  // Table columns
  const columns: DataTableColumn<MatchPair>[] = [
    {
      header: "Record A",
      accessor: (item) => {
        const recordA = item.record_a_data || {};
        return (
          <div>
            <a
              href={`https://app.gohighlevel.com/v2/location/${locationId}/contacts/detail/${item.record_a_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:text-primary hover:underline"
            >
              {getRecordName(recordA)}
            </a>
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
            <a
              href={`https://app.gohighlevel.com/v2/location/${locationId}/contacts/detail/${item.record_b_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:text-primary hover:underline"
            >
              {getRecordName(recordB)}
            </a>
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
      accessor: (item) => <ConfidenceBadge score={item.confidence_score || 0} />,
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
      accessor: (item) => (
        <Button size="sm" asChild>
          <Link to={`/match-rules/${item.rule_id}/review/${item.id}`}>Merge</Link>
        </Button>
      ),
    },
  ];

  // Selection display count
  const displaySelectedCount = selectAllMatching ? filteredMatches.length : selectedIds.size;

  if (authLoading || rulesLoading || matchesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-muted-foreground">Failed to load matches</p>
        <Button variant="outline" onClick={handleRetry}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Left side: Back + Title */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Pending Matches
          </h1>
        </div>

        {/* Right side: Search + Rule Filter + Merge All */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-[200px]"
            />
          </div>

          {/* Rule Filter */}
          <Select value={ruleFilter} onValueChange={setRuleFilter}>
            <SelectTrigger className="w-[180px]">
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

          {/* Merge All Button (only show when nothing selected) */}
          {selectedIds.size === 0 && !selectAllMatching && (
            <>
              <Button
                size="sm"
                variant={canAutoMerge ? "default" : "secondary"}
                onClick={canAutoMerge ? () => setShowMergeAllDialog(true) : () => openUpgradeModal("auto_merge")}
                disabled={canAutoMerge && (filteredMatches.length === 0 || bulkMergeProgress.inProgress)}
              >
                {bulkMergeProgress.inProgress ? (
                  <>
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    {bulkMergeProgress.current}/{bulkMergeProgress.total}
                  </>
                ) : !canAutoMerge ? (
                  <>
                    <Crown className="mr-1.5 h-4 w-4" />
                    Merge All
                  </>
                ) : (
                  <>
                    <Play className="mr-1.5 h-4 w-4" />
                    Merge All
                  </>
                )}
              </Button>
              {bulkMergeProgress.inProgress && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => { abortMergeRef.current = true; }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Selection Bar */}
      {(selectedIds.size > 0 || selectAllMatching) && (
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
          <span className="text-sm font-medium">
            {displaySelectedCount.toLocaleString()} selected
          </span>
          {!selectAllMatching && selectedIds.size < filteredMatches.length && (
            <Button
              variant="link"
              size="sm"
              className="text-primary p-0 h-auto"
              onClick={() => setSelectAllMatching(true)}
            >
              Select all {filteredMatches.length.toLocaleString()} matching
            </Button>
          )}
          <div className="flex-1" />
          <Button
            size="sm"
            variant={canAutoMerge ? "default" : "secondary"}
            onClick={canAutoMerge ? () => setShowMergeSelectedDialog(true) : () => openUpgradeModal("auto_merge")}
            disabled={canAutoMerge && bulkMergeProgress.inProgress}
          >
            {bulkMergeProgress.inProgress ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                {bulkMergeProgress.current}/{bulkMergeProgress.total}
              </>
            ) : !canAutoMerge ? (
              <>
                <Crown className="mr-1.5 h-4 w-4" />
                Merge Selected
              </>
            ) : (
              <>
                <Play className="mr-1.5 h-4 w-4" />
                Merge Selected
              </>
            )}
          </Button>
          {bulkMergeProgress.inProgress && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => { abortMergeRef.current = true; }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          {!bulkMergeProgress.inProgress && (
            <Button variant="ghost" size="sm" onClick={clearSelection}>
              Clear
            </Button>
          )}
        </div>
      )}

      {/* Data Table */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <DataTable
            data={filteredMatches}
            columns={columns}
            keyField="id"
            minWidth="700px"
            selectable
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
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
          Showing {filteredMatches.length} of {totalCount.toLocaleString()} matches
          {hasActiveFilters && " (filtered)"}
          {isTruncated && " (viewing first 1,000)"}
        </span>
      </div>

      {/* Merge All Dialog */}
      <AlertDialog open={showMergeAllDialog} onOpenChange={setShowMergeAllDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Merge All Pending Matches?</AlertDialogTitle>
            <AlertDialogDescription>
              This will merge <span className="font-semibold">{filteredMatches.length.toLocaleString()}</span> pending matches
              {isTruncated && (
                <> (first batch of <span className="font-semibold">{totalCount.toLocaleString()}</span> total)</>
              )}
              {" "}across <span className="font-semibold">{new Set(filteredMatches.map((m: MatchPair) => m.rule_id)).size}</span> rules
              using each rule's configured merge strategy.
              {isTruncated && (
                <>
                  <br /><br />
                  <span className="text-amber-600">Run again after completion to process remaining matches.</span>
                </>
              )}
              <br /><br />
              Snapshots will be saved for 30-day rollback.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleMergeAll}>
              Merge All ({filteredMatches.length.toLocaleString()})
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Merge Selected Dialog */}
      <AlertDialog open={showMergeSelectedDialog} onOpenChange={setShowMergeSelectedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Merge Selected Matches?</AlertDialogTitle>
            <AlertDialogDescription>
              This will merge <span className="font-semibold">{displaySelectedCount.toLocaleString()}</span> selected matches
              using each rule's configured merge strategy.
              <br /><br />
              Snapshots will be saved for 30-day rollback.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleMergeSelected}>
              Merge Selected ({displaySelectedCount.toLocaleString()})
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
