import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Plus, 
  Settings2, 
  Mail, 
  Phone, 
  User,
  MoreVertical
} from "lucide-react";

const rules = [
  {
    id: 1,
    name: "Exact Email Match",
    description: "Match contacts with identical email addresses",
    field: "Email",
    icon: Mail,
    matchCount: 234,
    enabled: true,
    autoMerge: true,
  },
  {
    id: 2,
    name: "Phone Number Match",
    description: "Match contacts with same phone number (normalized)",
    field: "Phone",
    icon: Phone,
    matchCount: 156,
    enabled: true,
    autoMerge: false,
  },
  {
    id: 3,
    name: "Fuzzy Name Match",
    description: "Match contacts with similar names using fuzzy logic",
    field: "Name",
    icon: User,
    matchCount: 89,
    enabled: true,
    autoMerge: false,
  },
  {
    id: 4,
    name: "Email + Phone Combo",
    description: "Match when both email and phone match",
    field: "Multiple",
    icon: Settings2,
    matchCount: 45,
    enabled: false,
    autoMerge: true,
  },
];

export default function MatchRules() {
  return (
    <div className="space-y-8 pt-12 lg:pt-0">
      <PageHeader 
        title="Match Rules" 
        description="Configure rules to detect duplicate contacts"
      >
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Rule
        </Button>
      </PageHeader>

      <div className="grid gap-4">
        {rules.map((rule, index) => (
          <Card 
            key={rule.id} 
            className="animate-fade-in border-border/50 shadow-sm hover:shadow-md transition-all"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <rule.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{rule.name}</h3>
                      {rule.autoMerge && (
                        <Badge variant="secondary" className="text-xs">
                          Auto-merge
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{rule.description}</p>
                    <div className="flex items-center gap-4 pt-2">
                      <span className="text-xs text-muted-foreground">
                        Field: <span className="text-foreground">{rule.field}</span>
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Matches: <span className="text-foreground font-medium">{rule.matchCount}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {rule.enabled ? "Active" : "Inactive"}
                    </span>
                    <Switch checked={rule.enabled} />
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info Card */}
      <Card className="animate-fade-in border-primary/20 bg-primary/5" style={{ animationDelay: "200ms" }}>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Settings2 className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold">Configure Merge Strategies</h3>
              <p className="text-sm text-muted-foreground">
                Define how fields should be merged when duplicates are found. Access merge strategies from the rule settings.
              </p>
              <Button variant="link" className="h-auto p-0 text-primary">
                Learn more about merge strategies →
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
