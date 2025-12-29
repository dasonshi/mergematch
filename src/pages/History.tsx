import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Eye, RotateCcw, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface HistoryItem {
  id: string;
  masterName: string;
  mergedFrom: string;
  duplicateCount?: number;
  ruleId: string;
  ruleName: string;
  when: string;
}

interface HistoryItemData extends HistoryItem {
  objectType: "contacts" | "companies";
  date: Date;
}

const mockHistory: HistoryItemData[] = [
  {
    id: "h1",
    masterName: "John Smith",
    mergedFrom: "Jon Smith",
    ruleId: "rule-1",
    ruleName: "Email + Phone Match",
    when: "1h ago",
    objectType: "contacts",
    date: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
  {
    id: "h2",
    masterName: "jane@test.com",
    mergedFrom: "jane.t@test",
    ruleId: "rule-1",
    ruleName: "Email + Phone Match",
    when: "2h ago",
    objectType: "contacts",
    date: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: "h3",
    masterName: "Acme Corp",
    mergedFrom: "2 duplicates",
    duplicateCount: 2,
    ruleId: "rule-2",
    ruleName: "Company Domain Match",
    when: "3h ago",
    objectType: "companies",
    date: new Date(Date.now() - 3 * 60 * 60 * 1000),
  },
  {
    id: "h4",
    masterName: "Mike Johnson",
    mergedFrom: "M. Johnson",
    ruleId: "rule-1",
    ruleName: "Email + Phone Match",
    when: "5h ago",
    objectType: "contacts",
    date: new Date(Date.now() - 5 * 60 * 60 * 1000),
  },
  {
    id: "h5",
    masterName: "sarah@company.com",
    mergedFrom: "2 duplicates",
    duplicateCount: 2,
    ruleId: "rule-3",
    ruleName: "Phone Number Match",
    when: "Yesterday",
    objectType: "contacts",
    date: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: "h6",
    masterName: "Bob Wilson",
    mergedFrom: "Robert Wilson",
    ruleId: "rule-1",
    ruleName: "Email + Phone Match",
    when: "Yesterday",
    objectType: "contacts",
    date: new Date(Date.now() - 26 * 60 * 60 * 1000),
  },
  {
    id: "h7",
    masterName: "test@example.com",
    mergedFrom: "test2@example",
    ruleId: "rule-1",
    ruleName: "Email + Phone Match",
    when: "Dec 23",
    objectType: "contacts",
    date: new Date("2024-12-23"),
  },
  {
    id: "h8",
    masterName: "Widget Inc",
    mergedFrom: "Widget LLC",
    ruleId: "rule-2",
    ruleName: "Company Domain Match",
    when: "Dec 23",
    objectType: "companies",
    date: new Date("2024-12-23"),
  },
];

const matchRulesOptions = [
  { id: "all", name: "All Rules" },
  { id: "rule-1", name: "Email + Phone Match" },
  { id: "rule-2", name: "Company Domain Match" },
  { id: "rule-3", name: "Phone Number Match" },
];

const objectTypesOptions = [
  { id: "all", name: "All Objects" },
  { id: "contacts", name: "Contacts" },
  { id: "companies", name: "Companies" },
];

const dateRangesOptions = [
  { id: "7", name: "Last 7 days" },
  { id: "30", name: "Last 30 days" },
  { id: "90", name: "Last 90 days" },
  { id: "all", name: "All time" },
];

export default function History() {
  const { toast } = useToast();
  const [ruleFilter, setRuleFilter] = useState("all");
  const [objectFilter, setObjectFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("30");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [restoreItem, setRestoreItem] = useState<HistoryItem | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter logic
  const filteredHistory = mockHistory.filter((item) => {
    // Rule filter
    if (ruleFilter !== "all" && item.ruleId !== ruleFilter) {
      return false;
    }

    // Object filter
    if (objectFilter !== "all" && item.objectType !== objectFilter) {
      return false;
    }

    // Date filter
    if (dateFilter !== "all") {
      const days = parseInt(dateFilter);
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      if (item.date < cutoffDate) {
        return false;
      }
    }

    // Search filter
    if (debouncedSearch) {
      const search = debouncedSearch.toLowerCase();
      const matchesSearch = 
        item.masterName.toLowerCase().includes(search) ||
        item.mergedFrom.toLowerCase().includes(search);
      if (!matchesSearch) {
        return false;
      }
    }

    return true;
  });

  const clearFilters = () => {
    setRuleFilter("all");
    setObjectFilter("all");
    setDateFilter("30");
    setSearchQuery("");
  };

  const handleRestore = () => {
    if (!restoreItem) return;
    toast({
      title: "Merge restored",
      description: `"${restoreItem.masterName}" has been unmerged and records restored.`,
    });
    setRestoreItem(null);
  };

  return (
    <div className="space-y-6 pt-12 lg:pt-0">
      <PageHeader title="Merge History" />

      {/* Filters Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <span className="text-sm text-muted-foreground">Filter:</span>
        <Select value={ruleFilter} onValueChange={setRuleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {matchRulesOptions.map((rule) => (
              <SelectItem key={rule.id} value={rule.id}>
                {rule.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={objectFilter} onValueChange={setObjectFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {objectTypesOptions.map((obj) => (
              <SelectItem key={obj.id} value={obj.id}>
                {obj.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {dateRangesOptions.map((range) => (
              <SelectItem key={range.id} value={range.id}>
                {range.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* History Table */}
      {filteredHistory.length === 0 ? (
        <div className="border rounded-lg p-8 text-center">
          <p className="text-muted-foreground mb-4">No merges found matching your filters</p>
          <Button variant="outline" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Master</TableHead>
                <TableHead>Merged From</TableHead>
                <TableHead>Rule</TableHead>
                <TableHead>When</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.masterName}</TableCell>
                  <TableCell className="text-muted-foreground">
                    ← {item.duplicateCount ? `${item.duplicateCount} duplicates` : item.mergedFrom}
                  </TableCell>
                  <TableCell>
                    <Link
                      to={`/match-rules/${item.ruleId}`}
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      {item.ruleName}
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{item.when}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/match-rules/${item.ruleId}/review/${item.id}?readonly=true`}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setRestoreItem(item)}
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Restore
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Showing {filteredHistory.length} of {mockHistory.length}</span>
        <Button variant="outline" size="sm">
          Load More
        </Button>
      </div>

      {/* Restore Confirmation Dialog */}
      <Dialog open={!!restoreItem} onOpenChange={() => setRestoreItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore Merged Records</DialogTitle>
            <DialogDescription>
              Are you sure you want to restore the records that were merged into "{restoreItem?.masterName}"?
              This will undo the merge and recreate the original duplicate records.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestoreItem(null)}>
              Cancel
            </Button>
            <Button onClick={handleRestore}>Restore Records</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
