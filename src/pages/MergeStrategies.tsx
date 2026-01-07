import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Pencil, Trash2, Lock, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "@/contexts/LocationContext";

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

// Custom strategies would be fetched from API - empty for now
const customStrategies: Strategy[] = [];

export default function MergeStrategies() {
  const { toast } = useToast();
  const { canUseStrategies } = useLocation();

  const contactStrategies = customStrategies.filter((s) => s.objectType === "Contacts");
  const companyStrategies = customStrategies.filter((s) => s.objectType === "Companies");
  const hasCustomStrategies = customStrategies.length > 0;

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
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ">
        <div className="space-y-1">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">
            Merge Strategies
          </h1>
        </div>
        {canUseStrategies ? (
          <Button asChild>
            <Link to="/merge-strategies/new">
              <Plus className="h-4 w-4 mr-2" />
              New Merge Strategy
            </Link>
          </Button>
        ) : (
          <Button disabled>
            <Lock className="h-4 w-4 mr-2" />
            New Merge Strategy
          </Button>
        )}
      </div>

      {/* Content */}
      {hasCustomStrategies ? (
        <>
          {/* Strategy Groups */}
          {contactStrategies.length > 0 && (
            <StrategyGroup title="Contacts" strategies={contactStrategies} />
          )}

          {companyStrategies.length > 0 && (
            <StrategyGroup title="Companies" strategies={companyStrategies} />
          )}
        </>
      ) : (
        /* Empty State */
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Layers className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Custom Merge Strategies</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              Custom merge strategies let you define exactly how records are combined during a merge.
              The built-in strategies (Standard, Most Recent, etc.) are available in the Match Rule dropdown.
            </p>
            {!canUseStrategies && (
              <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-4 py-2 rounded-lg">
                <Lock className="h-4 w-4" />
                <span>Upgrade to Starter or higher to create custom strategies</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
