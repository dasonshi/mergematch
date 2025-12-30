import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface Strategy {
  id: string;
  name: string;
  objectType: "Contacts" | "Companies";
  masterSelection: string;
  conflictResolution: string;
  notes?: string;
  tasks?: string;
  opportunities?: string;
  usedBy: string[];
}

const mockStrategies: Strategy[] = [
  {
    id: "strategy-1",
    name: "Standard Contact Merge",
    objectType: "Contacts",
    masterSelection: "Most complete",
    conflictResolution: "Prefer master",
    notes: "Copy all",
    tasks: "Copy all",
    opportunities: "Keep all",
    usedBy: ["Email + Phone Match", "Name + Address Match"],
  },
  {
    id: "strategy-2",
    name: "Most Recent Wins",
    objectType: "Contacts",
    masterSelection: "Most recent activity",
    conflictResolution: "Most recent",
    notes: "Copy all",
    tasks: "Copy all",
    opportunities: "Keep all",
    usedBy: [],
  },
  {
    id: "strategy-3",
    name: "Company Standard",
    objectType: "Companies",
    masterSelection: "Most complete",
    conflictResolution: "Prefer master",
    usedBy: ["Company Domain Match"],
  },
];

const unusedObjectTypes = ["Opportunities", "Custom Objects"];

export default function MergeStrategies() {
  const { toast } = useToast();

  const contactStrategies = mockStrategies.filter((s) => s.objectType === "Contacts");
  const companyStrategies = mockStrategies.filter((s) => s.objectType === "Companies");

  const handleDelete = (strategy: Strategy) => {
    if (strategy.usedBy.length > 0) {
      toast({
        title: "Cannot delete",
        description: `This strategy is used by ${strategy.usedBy.length} Match Rules`,
        variant: "destructive",
      });
      return;
    }
    // TODO: Implement actual deletion
    toast({
      title: "Strategy deleted",
      description: `"${strategy.name}" has been deleted.`,
    });
  };

  const StrategyCard = ({ strategy }: { strategy: Strategy }) => (
    <Card className="group">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-semibold text-foreground">{strategy.name}</h3>
          <Button variant="ghost" size="sm" className="h-8 px-3">
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </div>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span>Master: {strategy.masterSelection}</span>
          <span className="text-muted-foreground/50">|</span>
          <span>Conflicts: {strategy.conflictResolution}</span>
        </div>

        {(strategy.notes || strategy.tasks || strategy.opportunities) && (
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {strategy.notes && <span>Notes: {strategy.notes}</span>}
            {strategy.notes && strategy.tasks && <span className="text-muted-foreground/50">|</span>}
            {strategy.tasks && <span>Tasks: {strategy.tasks}</span>}
            {strategy.tasks && strategy.opportunities && <span className="text-muted-foreground/50">|</span>}
            {strategy.opportunities && <span>Opps: {strategy.opportunities}</span>}
          </div>
        )}

        <div className="mt-4 pt-3 border-t">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Used by:</p>
              {strategy.usedBy.length > 0 ? (
                <ul className="text-sm text-foreground space-y-0.5">
                  {strategy.usedBy.map((rule) => (
                    <li key={rule}>• {rule}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground italic">• (none)</p>
              )}
            </div>
            {strategy.usedBy.length === 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => handleDelete(strategy)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const StrategyGroup = ({ title, strategies }: { title: string; strategies: Strategy[] }) => (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground uppercase tracking-wide">{title}</h2>
      <div className="space-y-4">
        {strategies.map((strategy) => (
          <StrategyCard key={strategy.id} strategy={strategy} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
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
            Merge Strategies
          </h1>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Merge Strategy
        </Button>
      </div>

      {/* Strategy Groups */}
      {contactStrategies.length > 0 && (
        <StrategyGroup title="Contacts" strategies={contactStrategies} />
      )}

      {companyStrategies.length > 0 && (
        <StrategyGroup title="Companies" strategies={companyStrategies} />
      )}

      {/* Footer Note */}
      <div className="pt-4 border-t text-sm text-muted-foreground">
        <p>No strategies for: {unusedObjectTypes.join(", ")}</p>
        <p className="mt-1">(Create a Match Rule to add strategies for these objects)</p>
      </div>
    </div>
  );
}
