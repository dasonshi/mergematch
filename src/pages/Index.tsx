import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, ArrowRight, Plus, Check, ClipboardList, FolderOpen, Building2, Users } from "lucide-react";
import { Link } from "react-router-dom";

// Mock data - in real app this would come from API/state
const locationName = "Acme Agency";
const locationId = "loc_abc123";

const quickStats = {
  pending: { count: 40, rules: 3 },
  mergedThisWeek: 53,
  totalRecords: 14051,
  contacts: 12847,
  companies: 1204,
};

const activeRules = [
  { id: "1", name: "Email + Phone Match", object: "Contacts", schedule: "Runs daily at 6am", lastScan: "2h ago", pending: 23 },
  { id: "2", name: "Company Domain Match", object: "Companies", schedule: "Manual only", lastScan: "1d ago", pending: 12 },
  { id: "3", name: "Phone Number Match", object: "Contacts", schedule: "Runs daily at 6am", lastScan: "2h ago", pending: 5 },
];

const recentActivity = [
  { id: "1", master: "John Smith", merged: "Jon Smith", when: "2:34 PM" },
  { id: "2", master: "jane@acme.com", merged: "jane.d@acme", when: "1:12 PM" },
  { id: "3", master: "Acme Corp", merged: "2 duplicates", when: "Yesterday" },
  { id: "4", master: "mike@test.com", merged: "mikey@test", when: "Yesterday" },
];

export default function Dashboard() {
  return (
    <div className="space-y-8 pt-12 lg:pt-0">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back! 👋</h1>
          <p className="text-muted-foreground text-sm">
            {locationName} • {locationId}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <span className="text-sm text-muted-foreground">Connected</span>
          </div>
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Pending Review */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <ClipboardList className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{quickStats.pending.count}</span>
                  <span className="text-sm text-muted-foreground">matches</span>
                </div>
                <p className="text-sm text-muted-foreground">across {quickStats.pending.rules} rules</p>
              </div>
            </div>
            <Button variant="link" className="mt-4 p-0 h-auto text-primary" asChild>
              <Link to="/match-rules">Review Now <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </CardContent>
        </Card>

        {/* Merged This Week */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-success/10 p-3">
                <Check className="h-6 w-6 text-success" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Merged This Week</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{quickStats.mergedThisWeek}</span>
                  <span className="text-sm text-muted-foreground">duplicates</span>
                </div>
                <p className="text-sm text-muted-foreground">removed</p>
              </div>
            </div>
            <Button variant="link" className="mt-4 p-0 h-auto text-primary" asChild>
              <Link to="/history">View History <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </CardContent>
        </Card>

        {/* Total Records */}
        <Card className="shadow-sm hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-muted p-3">
                <FolderOpen className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Records</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{quickStats.totalRecords.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground">synced</span>
                </div>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    Contacts: {quickStats.contacts.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5" />
                    Companies: {quickStats.companies.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Match Rules Section */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-lg font-semibold">Your Match Rules</CardTitle>
          <Button size="sm" asChild>
            <Link to="/match-rules/new">
              <Plus className="mr-2 h-4 w-4" />
              New Rule
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {activeRules.map((rule) => (
            <Link
              key={rule.id}
              to={`/match-rules/${rule.id}`}
              className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-md bg-muted p-2">
                  {rule.object === "Contacts" ? (
                    <Users className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium group-hover:text-primary transition-colors">{rule.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {rule.object} • {rule.schedule} • Last: {rule.lastScan}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="font-medium">
                  {rule.pending} pending
                </Badge>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>

      {/* Recent Activity Section */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
          <Button variant="link" className="p-0 h-auto text-primary" asChild>
            <Link to="/history">View All <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-2 border-b last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-success/10 p-1.5">
                    <Check className="h-3.5 w-3.5 text-success" />
                  </div>
                  <div>
                    <span className="font-medium">Merged {item.master}</span>
                    <span className="text-muted-foreground"> ← {item.merged}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">{item.when}</span>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/history">View</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
