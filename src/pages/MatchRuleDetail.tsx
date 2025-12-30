import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Edit, Search, Play, Lightbulb } from "lucide-react";

// Mock data - in real app this would come from API
const ruleData = {
  id: "1",
  name: "Email + Phone Match",
  object: "Contacts",
  fields: [
    { name: "email", matchType: "exact" },
    { name: "phone", matchType: "fuzzy 85%" },
  ],
  logic: "All fields must match (AND)",
  strategy: "Standard Contact Merge",
  schedule: "Daily 6am",
  lastScan: "2h ago",
  matchesFound: 47,
  nextScheduled: "Tomorrow 6:00 AM",
  totalMerged: 312,
};

const pendingMatches = [
  {
    id: "1",
    type: "pair",
    confidence: 98,
    master: { name: "John Smith", email: "john@acme.com", phone: "+1 555-0123", company: "Acme Inc" },
    duplicate: { name: "Jon Smith", email: "jon.smith@acme.com", phone: "+1 555-0123", company: "" },
  },
  {
    id: "2",
    type: "pair",
    confidence: 95,
    master: { name: "jane@acme.com", email: "jane@acme.com", phone: "+1 555-0456", company: "Acme Inc" },
    duplicate: { name: "jane.d@acme", email: "jane.d@acme.com", phone: "+1 555-0456", company: "Acme" },
  },
  {
    id: "3",
    type: "group",
    confidence: 87,
    records: ["Acme Corp", "ACME Corporation", "Acme Inc"],
    count: 3,
  },
];

const mergeHistory = [
  { id: "1", master: "Mike Johnson", mergedFrom: "M. Johnson", when: "1h ago" },
  { id: "2", master: "sarah@company.com", mergedFrom: "2 duplicates", when: "3h ago" },
  { id: "3", master: "Bob Wilson", mergedFrom: "Robert Wilson", when: "Yesterday" },
  { id: "4", master: "test@example.com", mergedFrom: "test2@example", when: "Dec 23" },
];

export default function MatchRuleDetail() {
  const { id } = useParams();

  return (
    <div className="space-y-6 pt-12 lg:pt-0">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Link
            to="/match-rules"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Match Rules
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">
            {ruleData.name}
          </h1>
        </div>
        <Button variant="outline" asChild>
          <Link to={`/match-rules/${id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Rule
          </Link>
        </Button>
      </div>

      {/* Rule Configuration Section */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="grid gap-2 text-sm">
            <div className="flex flex-wrap gap-x-6 gap-y-1">
              <span>
                <span className="text-muted-foreground">Object:</span>{" "}
                <span className="font-medium">{ruleData.object}</span>
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Fields:</span>{" "}
              <span className="font-medium">
                {ruleData.fields.map((f, i) => (
                  <span key={f.name}>
                    {f.name} ({f.matchType}){i < ruleData.fields.length - 1 ? ", " : ""}
                  </span>
                ))}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Logic:</span>{" "}
              <span className="font-medium">{ruleData.logic}</span>
            </div>
          </div>

          <Separator />

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-muted-foreground">Merge Strategy:</span>
            <Select defaultValue="standard">
              <SelectTrigger className="w-[220px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard Contact Merge</SelectItem>
                <SelectItem value="recent">Most Recent Wins</SelectItem>
                <SelectItem value="new">+ Create New...</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              Edit Strategy
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions Section */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button>
              <Search className="mr-2 h-4 w-4" />
              Scan Now
            </Button>
            <Button variant="secondary">
              <Play className="mr-2 h-4 w-4" />
              Merge All
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Schedule:</span>
              <Select defaultValue="daily6am">
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily6am">Daily 6am</SelectItem>
                  <SelectItem value="daily12pm">Daily 12pm</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="manual">Manual only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="text-sm space-y-1">
            <p className="text-muted-foreground">
              Last scan: <span className="text-foreground">{ruleData.lastScan}</span> (found {ruleData.matchesFound} matches)
            </p>
            <p className="text-muted-foreground">
              Next scheduled: <span className="text-foreground">{ruleData.nextScheduled}</span>
            </p>
            <p className="text-muted-foreground flex items-center gap-1">
              <Lightbulb className="h-4 w-4 text-warning" />
              Scheduled scans require Starter plan or higher.{" "}
              <Link to="/settings" className="text-primary hover:underline font-medium">
                Upgrade
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Pending Matches Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">PENDING MATCHES ({ruleData.matchesFound})</h2>
        
        <div className="grid gap-4">
          {pendingMatches.map((match) => (
            <Card key={match.id}>
              <CardContent className="p-4">
                {match.type === "pair" ? (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold">
                        {match.master.name} <span className="text-muted-foreground">←</span> {match.duplicate.name}
                      </span>
                      <span className="text-sm font-medium text-primary">{match.confidence}% confidence</span>
                    </div>
                    <Separator className="mb-3" />
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div className="space-y-1">
                        <p>{match.master.email}</p>
                        <p>{match.master.phone}</p>
                        <p>{match.master.company || <span className="text-muted-foreground">(empty)</span>}</p>
                      </div>
                      <div className="space-y-1 border-l pl-4">
                        <p>{match.duplicate.email}</p>
                        <p>{match.duplicate.phone}</p>
                        <p>{match.duplicate.company || <span className="text-muted-foreground">(empty)</span>}</p>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/match-rules/${id}/review/${match.id}`}>Review</Link>
                      </Button>
                      <Button size="sm">Merge</Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold">
                        {match.records.join(" ← ")}
                      </span>
                      <span className="text-sm font-medium text-primary">{match.confidence}% confidence</span>
                    </div>
                    <Separator className="mb-3" />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{match.count} records in this match group</span>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/match-rules/${id}/review/${match.id}`}>Review</Link>
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-sm text-muted-foreground">
          Showing 3 of {ruleData.matchesFound} |{" "}
          <button className="text-primary hover:underline font-medium">Load More</button>
        </p>
      </div>

      {/* Merge History Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">MERGE HISTORY ({ruleData.totalMerged})</h2>
        
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Master</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Merged From</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">When</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mergeHistory.map((item) => (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="py-3 px-4 font-medium">{item.master}</td>
                      <td className="py-3 px-4 text-muted-foreground">← {item.mergedFrom}</td>
                      <td className="py-3 px-4">{item.when}</td>
                      <td className="py-3 px-4 text-right">
                        <Button variant="ghost" size="sm">View</Button>
                        <Button variant="ghost" size="sm">Restore</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Link to="/history" className="text-sm text-primary hover:underline font-medium">
          View Full History →
        </Link>
      </div>
    </div>
  );
}
