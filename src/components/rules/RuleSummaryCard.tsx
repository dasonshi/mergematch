import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";

interface MatchField {
  field: string;
  algorithm: string;
  match_against?: string;
}

interface Rule {
  name: string;
  source_object: string;
  merge_strategy?: string;
  is_active: boolean;
  match_fields: MatchField[];
  auto_merge_threshold: number;
  review_threshold: number;
  schedule_frequency?: string;
}

interface RuleSummaryCardProps {
  rule: Rule;
  onToggleStatus: () => void;
  isTogglePending: boolean;
}

export function RuleSummaryCard({
  rule,
  onToggleStatus,
  isTogglePending,
}: RuleSummaryCardProps) {
  return (
    <Card className="shadow-md">
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Object</span>
            <p className="font-medium capitalize mt-1">{rule.source_object}</p>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Strategy</span>
            <p className="font-medium capitalize mt-1">{rule.merge_strategy || 'standard'}</p>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</span>
            <div className="flex items-center gap-2 mt-1">
              <Switch
                checked={rule.is_active}
                onCheckedChange={onToggleStatus}
                disabled={isTogglePending}
              />
              <span className="text-sm font-medium">
                {rule.is_active ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Fields</span>
            <p className="font-medium mt-1">
              {(rule.match_fields || []).map((f, i) => (
                <span key={f.field}>
                  {f.match_against
                    ? `${f.field} vs ${f.match_against} (${f.algorithm})`
                    : `${f.field} (${f.algorithm})`}
                  {i < rule.match_fields.length - 1 ? ", " : ""}
                </span>
              ))}
            </p>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Thresholds</span>
            <p className="font-medium mt-1">
              Auto: {Math.round(rule.auto_merge_threshold * 100)}% | Review: {Math.round(rule.review_threshold * 100)}%
            </p>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Schedule</span>
            <p className="font-medium capitalize mt-1">{rule.schedule_frequency || "manual"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
