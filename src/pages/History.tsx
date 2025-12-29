import { useState } from "react";
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

const mockHistory: HistoryItem[] = [
  {
    id: "h1",
    masterName: "John Smith",
    mergedFrom: "Jon Smith",
    ruleId: "rule-1",
    ruleName: "Email+Phone",
    when: "1h ago",
  },
  {
    id: "h2",
    masterName: "jane@test.com",
    mergedFrom: "jane.t@test",
    ruleId: "rule-1",
    ruleName: "Email+Phone",
    when: "2h ago",
  },
  {
    id: "h3",
    masterName: "Acme Corp",
    mergedFrom: "2 duplicates",
    duplicateCount: 2,
    ruleId: "rule-2",
    ruleName: "Domain Match",
    when: "3h ago",
  },
  {
    id: "h4",
    masterName: "Mike Johnson",
    mergedFrom: "M. Johnson",
    ruleId: "rule-1",
    ruleName: "Email+Phone",
    when: "5h ago",
  },
  {
    id: "h5",
    masterName: "sarah@company.com",
    mergedFrom: "2 duplicates",
    duplicateCount: 2,
    ruleId: "rule-3",
    ruleName: "Phone Match",
    when: "Yesterday",
  },
  {
    id: "h6",
    masterName: "Bob Wilson",
    mergedFrom: "Robert Wilson",
    ruleId: "rule-1",
    ruleName: "Email+Phone",
    when: "Yesterday",
  },
  {
    id: "h7",
    masterName: "test@example.com",
    mergedFrom: "test2@example",
    ruleId: "rule-1",
    ruleName: "Email+Phone",
    when: "Dec 23",
  },
  {
    id: "h8",
    masterName: "Widget Inc",
    mergedFrom: "Widget LLC",
    ruleId: "rule-2",
    ruleName: "Domain Match",
    when: "Dec 23",
  },
];

const matchRules = [
  { id: "all", name: "All Rules" },
  { id: "rule-1", name: "Email+Phone" },
  { id: "rule-2", name: "Domain Match" },
  { id: "rule-3", name: "Phone Match" },
];

const objectTypes = [
  { id: "all", name: "All Objects" },
  { id: "contacts", name: "Contacts" },
  { id: "companies", name: "Companies" },
];

const dateRanges = [
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
  const [restoreItem, setRestoreItem] = useState<HistoryItem | null>(null);

  const totalItems = 312;

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
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {matchRules.map((rule) => (
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
            {objectTypes.map((obj) => (
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
            {dateRanges.map((range) => (
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
        </div>
      </div>

      {/* History Table */}
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
            {mockHistory.map((item) => (
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

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Showing {mockHistory.length} of {totalItems}</span>
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
