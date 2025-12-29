import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  ArrowRight,
  TrendingUp
} from "lucide-react";

const stats = [
  {
    title: "Total Contacts",
    value: "24,589",
    change: "+12%",
    icon: Users,
    trend: "up",
  },
  {
    title: "Duplicates Found",
    value: "1,247",
    change: "5.1%",
    icon: AlertTriangle,
    trend: "neutral",
  },
  {
    title: "Merged This Month",
    value: "423",
    change: "+34%",
    icon: CheckCircle2,
    trend: "up",
  },
  {
    title: "Pending Review",
    value: "89",
    change: "-8%",
    icon: Clock,
    trend: "down",
  },
];

const recentActivity = [
  { action: "Merged 12 contacts", rule: "Email Match", time: "2 min ago" },
  { action: "Found 34 potential duplicates", rule: "Phone + Name", time: "15 min ago" },
  { action: "Auto-merged 5 contacts", rule: "Exact Email", time: "1 hour ago" },
  { action: "Rule updated", rule: "Fuzzy Name Match", time: "3 hours ago" },
];

export default function Dashboard() {
  return (
    <div className="space-y-8 pt-12 lg:pt-0">
      <PageHeader 
        title="Dashboard" 
        description="Monitor your duplicate detection and merge activity"
      >
        <Button>
          Run Detection
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </PageHeader>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card 
            key={stat.title} 
            className="animate-fade-in border-border/50 shadow-sm hover:shadow-md transition-shadow"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{stat.value}</span>
                <Badge 
                  variant={stat.trend === "up" ? "default" : stat.trend === "down" ? "secondary" : "outline"}
                  className={
                    stat.trend === "up" 
                      ? "bg-success/10 text-success hover:bg-success/20" 
                      : stat.trend === "down"
                      ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                      : ""
                  }
                >
                  {stat.trend === "up" && <TrendingUp className="mr-1 h-3 w-3" />}
                  {stat.change}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="animate-fade-in border-border/50 shadow-sm" style={{ animationDelay: "200ms" }}>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((item, index) => (
                <div 
                  key={index} 
                  className="flex items-start justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{item.action}</p>
                    <p className="text-xs text-muted-foreground">Rule: {item.rule}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{item.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in border-border/50 shadow-sm" style={{ animationDelay: "250ms" }}>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button variant="outline" className="justify-start h-auto py-3">
              <div className="flex flex-col items-start gap-0.5">
                <span className="font-medium">Review Pending Duplicates</span>
                <span className="text-xs text-muted-foreground">89 contacts awaiting review</span>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-3">
              <div className="flex flex-col items-start gap-0.5">
                <span className="font-medium">Create New Rule</span>
                <span className="text-xs text-muted-foreground">Set up custom matching criteria</span>
              </div>
            </Button>
            <Button variant="outline" className="justify-start h-auto py-3">
              <div className="flex flex-col items-start gap-0.5">
                <span className="font-medium">Export Report</span>
                <span className="text-xs text-muted-foreground">Download merge history as CSV</span>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
