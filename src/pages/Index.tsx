import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { RefreshCw, Lock, ArrowRight, Plus } from "lucide-react";
import { Link } from "react-router-dom";

// Mock data - in real app this would come from API/state
const isFreeTier = true;
const mergesRemaining = 2;
const maxFreeMerges = 3;

const summaryMetrics = [
  { object: "Contacts", records: "12,847", merged7d: "47", mergedAll: "312", active: true },
  { object: "Companies", records: "1,204", merged7d: "3", mergedAll: "18", active: true },
  { object: "Opportunities", records: "(Pro plan)", merged7d: "-", mergedAll: "-", active: false },
];

const activeRules = [
  { id: "1", name: "Email + Name Match", nextRun: "Tomorrow 6am", pending: 23 },
  { id: "2", name: "Phone Number Match", nextRun: "Tomorrow 6am", pending: 12 },
  { id: "3", name: "Company Domain Match", nextRun: "- (manual)", pending: 5 },
];

const recentMerges = [
  { id: "1", master: "John Smith", mergedFrom: "Jon Smith", when: "2:34 PM" },
  { id: "2", master: "jane@acme.com", mergedFrom: "jane.d@acme", when: "1:12 PM" },
  { id: "3", master: "Acme Corporation", mergedFrom: "2 duplicates", when: "Yesterday" },
  { id: "4", master: "mike@test.com", mergedFrom: "mikey@test", when: "Yesterday" },
];

export default function Dashboard() {
  return (
    <div className="space-y-6 pt-12 lg:pt-0">
      {/* Header Section */}
      <div className="space-y-3">
        {/* Line 1: Location info and status */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-sm text-muted-foreground">
            Location: loc_abc123 • Acme Agency
          </span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
              <span className="text-sm text-muted-foreground">Connected</span>
            </div>
            <Button variant="outline" size="sm">
              Feedback
            </Button>
          </div>
        </div>

        {/* Line 2: Plan badge and upgrade */}
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="font-medium">
            Starter
          </Badge>
          <Button variant="outline" size="sm">
            Upgrade
          </Button>
        </div>

        {/* Line 3: Refresh button */}
        <div className="flex justify-end">
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
        </div>
      </div>

      <Separator />

      {/* Data Sync Section */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-success" />
            <span className="text-sm">Contacts: 12,847 synced</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-success" />
            <span className="text-sm">Companies: 1,204 synced</span>
          </div>
          <Button variant="outline" size="sm">
            Sync Now
          </Button>
        </div>
        <span className="text-sm text-muted-foreground">Last sync: 2 min ago</span>
      </div>

      <Separator />

      {/* Free Tier Banner */}
      {isFreeTier && (
        <Card className="border-warning bg-warning/10">
          <CardContent className="py-3 px-4 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-warning" />
              <span className="text-sm font-medium">
                FREE TIER: {mergesRemaining} of {maxFreeMerges} merges remaining.
              </span>
            </div>
            <Button variant="link" className="text-warning hover:text-warning/80 p-0 h-auto">
              Upgrade for unlimited →
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Summary Metrics Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>OBJECTS</TableHead>
              <TableHead>RECORDS</TableHead>
              <TableHead>MERGED (7d)</TableHead>
              <TableHead>MERGED (all)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {summaryMetrics.map((row) => (
              <TableRow key={row.object}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full border-2 ${
                        row.active
                          ? "bg-foreground border-foreground"
                          : "bg-transparent border-muted-foreground"
                      }`}
                    />
                    <span className={row.active ? "" : "text-muted-foreground"}>
                      {row.object}
                    </span>
                  </div>
                </TableCell>
                <TableCell className={row.active ? "" : "text-muted-foreground"}>
                  {row.records}
                </TableCell>
                <TableCell className={row.active ? "" : "text-muted-foreground"}>
                  {row.merged7d}
                </TableCell>
                <TableCell className={row.active ? "" : "text-muted-foreground"}>
                  {row.mergedAll}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Separator />

      {/* Active Match Rules Section */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Active Match Rules
        </h2>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rule Name</TableHead>
                <TableHead>Next Run</TableHead>
                <TableHead>Pending</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeRules.map((rule) => (
                <TableRow key={rule.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <Link
                      to={`/match-rules/${rule.id}`}
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      {rule.name}
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{rule.nextRun}</TableCell>
                  <TableCell>{rule.pending}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="p-4 border-t">
            <Button variant="outline" size="sm" asChild>
              <Link to="/match-rules">
                <Plus className="mr-2 h-4 w-4" />
                Create Match Rule
              </Link>
            </Button>
          </div>
        </Card>
      </div>

      <Separator />

      {/* Recent Merges Section */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Recent Merges
        </h2>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Master Record</TableHead>
                <TableHead>Merged From</TableHead>
                <TableHead>When</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentMerges.map((merge) => (
                <TableRow key={merge.id}>
                  <TableCell className="font-medium">{merge.master}</TableCell>
                  <TableCell className="text-muted-foreground">
                    ← {merge.mergedFrom}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{merge.when}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="h-7 px-2">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="p-4 border-t">
            <Button variant="link" className="p-0 h-auto" asChild>
              <Link to="/history">
                View All History →
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
