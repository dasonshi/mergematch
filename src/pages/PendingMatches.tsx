import { useState, useMemo, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Search, X, Filter, ChevronDown, MoreHorizontal, Play, Eye } from "lucide-react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Badge } from "@/components/ui/badge";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import { useLocation } from "@/contexts/LocationContext";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { computeStrategySelections, computeMasterId, StrategyId } from "@/lib/merge-strategies";
import { cn } from "@/lib/utils";

// Helper to get field value from record (handles nested custom fields)
const getFieldValue = (record: Record<string, any>, field: string): string => {
  if (field.startsWith("customField.")) {
    const customKey = field.replace("customField.", "");
    const customFields = record.customFields || record.customField || {};
    return customFields[customKey] || record[customKey] || "";
  }
  return record[field] || "";
};

// Get the record's display name
const getRecordName = (record: Record<string, any>): string => {
  if (record.firstName && record.lastName) {
    return `${record.firstName} ${record.lastName}`;
  }
  return record.firstName || record.name || record.email || "—";
};

// Get match field values as subheading (up to 3 fields)
const getMatchFieldSubheading = (
  record: Record<string, any>,
  matchFields: Array<{ field: string; algorithm: string }>
): string => {
  const fields = matchFields.slice(0, 3);
  const values = fields
    .map((f) => getFieldValue(record, f.field))
    .filter((v) => v);

  if (values.length === 0) {
    return record.email || record.phone || "";
  }

  return values.join(" • ");
};

interface MatchPair {
  id: string;
  rule_id: string;
  record_a_id: string;
  record_b_id: string;
  record_a_data?: Record<string, any>;
  record_b_data?: Record<string, any>;
  confidence_score: number;
  status: string;
  created_at: string;
}

export default function PendingMatches() {
  const { id: ruleId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { locationId, isLoading: authLoading } = useLocation();
  const queryClient = useQueryClient();

  // Filter panel state
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [confidenceFilter, setConfidenceFilter] = useState<string>("all");

  // Merge state
  const [mergingIds, setMergingIds] = useState<Set<string>>(new Set());
  const [showMergeAllDialog, setShowMergeAllDialog] = useState(false);
  const [bulkMergeProgress, setBulkMergeProgress] = useState({ current: 0, total: 0, inProgress: false });
  const abortMergeRef = useRef(false);
  const [isValidating, setIsValidating] = useState(false);

  // Fetch rule details
  const { data: rule, isLoading: ruleLoading } = useQuery({
    queryKey: ["rule", ruleId, locationId],
    queryFn: () => api.getMatchRule(ruleId!),
    enabled: !!locationId && !!ruleId,
  });

  // Fetch pending matches
  const { data: matchesData, isLoading: matchesLoading } = useQuery({
    queryKey: ["matches", ruleId, locationId],
    queryFn: () => api.getMatches("pending", ruleId),
    enabled: !!locationId && !!ruleId,
    gcTime: 0,
  });

  const allMatches = matchesData?.data || [];

  // Stats
  const stats = useMemo(() => {
    const total = allMatches.length;
    const highConfidence = allMatches.filter((m: MatchPair) => m.confidence_score >= 0.9).length;
    const mediumConfidence = allMatches.filter((m: MatchPair) => m.confidence_score >= 0.8 && m.confidence_score < 0.9).length;
    const lowConfidence = allMatches.filter((m: MatchPair) => m.confidence_score < 0.8).length;
    return { total, highConfidence, mediumConfidence, lowConfidence };
  }, [allMatches]);

  // Filter matches
  const filteredMatches = useMemo(() => {
    return allMatches.filter((item: MatchPair) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const recordA = item.record_a_data || {};
        const recordB = item.record_b_data || {};
        const matchesSearch =
          recordA.firstName?.toLowerCase().includes(query) ||
          recordA.lastName?.toLowerCase().includes(query) ||
          recordA.email?.toLowerCase().includes(query) ||
          recordA.phone?.toLowerCase().includes(query) ||
          recordB.firstName?.toLowerCase().includes(query) ||
          recordB.lastName?.toLowerCase().includes(query) ||
          recordB.email?.toLowerCase().includes(query) ||
          recordB.phone?.toLowerCase().includes(query);
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
  }, [allMatches, searchQuery, confidenceFilter]);

  const hasActiveFilters = searchQuery || confidenceFilter !== "all";
  const activeFilterCount = [searchQuery, confidenceFilter !== "all"].filter(Boolean).length;

  const clearFilters = () => {
    setSearchQuery("");
    setConfidenceFilter("all");
  };

  // Quick merge mutation
  const quickMergeMutation = useMutation({
    mutationFn: async (match: MatchPair) => {
      const strategy = (rule?.merge_strategy || "standard") as StrategyId;
      const overwriteBlanks = rule?.merge_settings?.overwrite_blanks ?? false;
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

  // Validate and merge all
  const handleMergeAllClick = async () => {
    if (!ruleId) return;

    setIsValidating(true);
    try {
      const result = await api.validateMatches(ruleId) as { valid: string[]; stale: string[]; stale_cleaned?: number };
      queryClient.invalidateQueries({ queryKey: ["matches"] });

      if (result.stale_cleaned && result.stale_cleaned > 0) {
        toast({
          title: "Stale Matches Cleaned",
          description: `Removed ${result.stale_cleaned} stale match(es).`,
        });
      }

      if (result.valid.length > 0) {
        setShowMergeAllDialog(true);
      } else {
        toast({
          title: "No Valid Matches",
          description: result.stale_cleaned
            ? "All matches were stale and have been cleaned up."
            : "No pending matches found to merge.",
        });
      }
    } catch (error) {
      toast({
        title: "Validation Failed",
        description: error instanceof Error ? error.message : "Could not validate matches.",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

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
        const strategy = (rule?.merge_strategy || "standard") as StrategyId;
        const overwriteBlanks = rule?.merge_settings?.overwrite_blanks ?? false;
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
      queryClient.invalidateQueries({ queryKey: ["merges"] });
    }

    setBulkMergeProgress({ current: 0, total: 0, inProgress: false });
    queryClient.invalidateQueries({ queryKey: ["matches"] });

    if (!abortMergeRef.current) {
      if (ruleId && rule) {
        try {
          await api.createBulkMergeNotification(ruleId, rule.name || "Unknown Rule", successCount, failCount);
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
          queryClient.invalidateQueries({ queryKey: ["unread-count"] });
        } catch (e) {
          console.error("Failed to create notification:", e);
        }
      }

      toast({
        title: "Bulk Merge Complete",
        description: `Successfully merged ${successCount} records.${failCount > 0 ? ` ${failCount} failed.` : ''}`,
        variant: failCount > 0 ? "destructive" : "default",
      });
    }
  };

  // Table columns - uses rule.match_fields to show relevant field values
  const matchFields = rule?.match_fields || [];
  const columns: DataTableColumn<MatchPair>[] = [
    {
      header: "Record A",
      accessor: (item) => {
        const recordA = item.record_a_data || {};
        const subheading = getMatchFieldSubheading(recordA, matchFields);
        return (
          <div>
            <div className="font-medium">
              {getRecordName(recordA)}
            </div>
            {subheading && (
              <div className="text-xs text-muted-foreground">
                {subheading}
              </div>
            )}
          </div>
        );
      },
    },
    {
      header: "Record B",
      accessor: (item) => {
        const recordB = item.record_b_data || {};
        const subheading = getMatchFieldSubheading(recordB, matchFields);
        return (
          <div>
            <div className="font-medium">
              {getRecordName(recordB)}
            </div>
            {subheading && (
              <div className="text-xs text-muted-foreground">
                {subheading}
              </div>
            )}
          </div>
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={`/match-rules/${ruleId}/review/${item.id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  Review
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => quickMergeMutation.mutate(item)}
                disabled={isMerging}
              >
                {isMerging ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Quick Merge
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (authLoading || ruleLoading || matchesLoading) {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <Button size="sm" asChild>
            <Link to={`/match-rules/${ruleId}`}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              {rule.name}
            </Link>
          </Button>
          <PageHeader title="Pending Matches" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={handleMergeAllClick}
            disabled={filteredMatches.length === 0 || bulkMergeProgress.inProgress || isValidating}
          >
            {isValidating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Validating...
              </>
            ) : bulkMergeProgress.inProgress ? (
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
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total Pending</span>
            <p className="text-2xl font-bold mt-1">{stats.total}</p>
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
                      placeholder="Search by name, email, phone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* Confidence Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Confidence</Label>
                  <div className="flex gap-2">
                    {[
                      { value: "all", label: "All" },
                      { value: "high", label: "High (90%+)" },
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
            minWidth="600px"
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
                      <Link to={`/match-rules/${ruleId}`}>Back to Rule</Link>
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
              using Record A as the master for each pair. All duplicate records will be deleted.
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
