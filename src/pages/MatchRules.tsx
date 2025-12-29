import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList, Plus, ArrowRight, FileText } from "lucide-react";
import { Link } from "react-router-dom";

// Mock data - in real app this would come from API/state
const matchRules = [
  {
    id: "1",
    name: "Email + Phone Match",
    object: "Contacts",
    strategy: "Standard Contact Merge",
    schedule: "Daily 6am",
    lastScan: "2h ago",
    pending: 47,
    totalMerged: 312,
  },
  {
    id: "2",
    name: "Company Domain Match",
    object: "Companies",
    strategy: "Most Recent Wins",
    schedule: "Manual only",
    lastScan: "1d ago",
    pending: 12,
    totalMerged: 45,
  },
  {
    id: "3",
    name: "Phone Number Match",
    object: "Contacts",
    strategy: "Standard Contact Merge",
    schedule: "Daily 6am",
    lastScan: "2h ago",
    pending: 5,
    totalMerged: 89,
  },
];

// Set to empty array to test empty state
const rules = matchRules;

export default function MatchRules() {
  if (rules.length === 0) {
    return (
      <div className="space-y-6 pt-12 lg:pt-0">
        <PageHeader title="Match Rules">
          <div className="flex gap-2">
            <Button variant="outline">View Merge Strategies</Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Match Rule
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
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Rule
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-12 lg:pt-0">
      <PageHeader title="Match Rules">
        <div className="flex gap-2">
          <Button variant="outline">View Merge Strategies</Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Match Rule
          </Button>
        </div>
      </PageHeader>

      <div className="grid gap-4">
        {rules.map((rule) => (
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
                    <span className="font-medium">{rule.object}</span>
                  </span>
                  <span>
                    <span className="text-muted-foreground">Strategy:</span>{" "}
                    <span className="font-medium">{rule.strategy}</span>
                  </span>
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-1">
                  <span>
                    <span className="text-muted-foreground">Schedule:</span>{" "}
                    <span className="font-medium">{rule.schedule}</span>
                  </span>
                  <span>
                    <span className="text-muted-foreground">Last scan:</span>{" "}
                    <span className="font-medium">{rule.lastScan}</span>
                  </span>
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-1">
                  <span>
                    <span className="text-muted-foreground">Pending:</span>{" "}
                    <span className="font-medium">{rule.pending} matches</span>
                  </span>
                  <span>
                    <span className="text-muted-foreground">Total merged:</span>{" "}
                    <span className="font-medium">{rule.totalMerged}</span>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
