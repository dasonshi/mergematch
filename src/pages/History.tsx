import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Download, 
  CheckCircle2, 
  XCircle,
  RotateCcw,
  Filter
} from "lucide-react";

const historyItems = [
  {
    id: 1,
    type: "merge",
    status: "success",
    description: "Merged John Doe (3 contacts)",
    rule: "Exact Email Match",
    timestamp: "2024-01-15 14:32",
    contactCount: 3,
  },
  {
    id: 2,
    type: "merge",
    status: "success",
    description: "Merged Jane Smith (2 contacts)",
    rule: "Phone Number Match",
    timestamp: "2024-01-15 14:28",
    contactCount: 2,
  },
  {
    id: 3,
    type: "skip",
    status: "skipped",
    description: "Skipped potential duplicate",
    rule: "Fuzzy Name Match",
    timestamp: "2024-01-15 14:15",
    contactCount: 2,
  },
  {
    id: 4,
    type: "merge",
    status: "success",
    description: "Auto-merged exact duplicates",
    rule: "Exact Email Match",
    timestamp: "2024-01-15 13:45",
    contactCount: 5,
  },
  {
    id: 5,
    type: "undo",
    status: "undone",
    description: "Undone merge operation",
    rule: "Phone Number Match",
    timestamp: "2024-01-15 12:30",
    contactCount: 2,
  },
];

export default function History() {
  return (
    <div className="space-y-8 pt-12 lg:pt-0">
      <PageHeader 
        title="History" 
        description="View all merge operations and their status"
      >
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </PageHeader>

      {/* Search and Filter */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search history..." className="pl-9" />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* History List */}
      <div className="space-y-3">
        {historyItems.map((item, index) => (
          <Card 
            key={item.id} 
            className="animate-fade-in border-border/50 shadow-sm hover:shadow-md transition-all"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full ${
                    item.status === "success" 
                      ? "bg-success/10" 
                      : item.status === "undone"
                      ? "bg-warning/10"
                      : "bg-muted"
                  }`}>
                    {item.status === "success" && <CheckCircle2 className="h-4 w-4 text-success" />}
                    {item.status === "skipped" && <XCircle className="h-4 w-4 text-muted-foreground" />}
                    {item.status === "undone" && <RotateCcw className="h-4 w-4 text-warning" />}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.description}</span>
                      <Badge variant="outline" className="text-xs">
                        {item.contactCount} contacts
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>Rule: {item.rule}</span>
                      <span>•</span>
                      <span>{item.timestamp}</span>
                    </div>
                  </div>
                </div>
                {item.status === "success" && (
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    <RotateCcw className="mr-1 h-3 w-3" />
                    Undo
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="flex justify-center pt-4">
        <Button variant="outline">Load More</Button>
      </div>
    </div>
  );
}
