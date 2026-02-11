import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api, ObjectField } from "@/lib/api";
import { useLocation } from "@/contexts/LocationContext";

interface MatchField {
  field: string;
  algorithm: string;
  operator?: 'AND' | 'OR';
  match_against?: string;
}

interface FieldPreservationMapping {
  source: string;
  target: string;
}

interface RelatedRecordsConfig {
  notes?: string;
  tasks?: string;
  opportunities?: string;
}

interface MergeSettings {
  overwrite_blanks?: boolean;
  field_preservation?: {
    enabled?: boolean;
    mappings?: FieldPreservationMapping[];
  };
  related_records?: RelatedRecordsConfig;
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
  schedule_time?: string;
  schedule_day?: string;
  merge_settings?: MergeSettings;
}

interface RuleSummaryCardProps {
  rule: Rule;
  onToggleStatus: () => void;
  isTogglePending: boolean;
  objectDisplayName?: string;
}

// Format match logic with AND/OR operators
function formatMatchLogic(fields: MatchField[]): string {
  if (!fields || fields.length === 0) return "None";

  return fields.map((f, i) => {
    const fieldPart = f.match_against
      ? `${f.field} vs ${f.match_against}`
      : f.field;
    const algPart = `(${f.algorithm})`;

    // First field has no operator prefix
    if (i === 0) {
      return `${fieldPart} ${algPart}`;
    }

    // Subsequent fields show their operator
    const op = f.operator || 'AND';
    return `${op} ${fieldPart} ${algPart}`;
  }).join(' ');
}

// Format schedule with time and day details
function formatSchedule(
  frequency?: string,
  time?: string,
  scheduleDay?: string
): string {
  if (!frequency || frequency === 'manual') return 'Manual';

  const dayNames: Record<string, string> = {
    '0': 'Sunday', '1': 'Monday', '2': 'Tuesday', '3': 'Wednesday',
    '4': 'Thursday', '5': 'Friday', '6': 'Saturday'
  };

  let result = frequency.charAt(0).toUpperCase() + frequency.slice(1);

  if ((frequency === 'weekly' || frequency === 'biweekly') && scheduleDay) {
    result += ` on ${dayNames[scheduleDay] || scheduleDay}`;
  } else if (frequency === 'monthly' && scheduleDay) {
    result += ` on day ${scheduleDay}`;
  }

  if (time) {
    result += ` at ${time}`;
  }

  return result;
}

// Format related records config for display
function formatRelatedRecords(config?: RelatedRecordsConfig): string {
  if (!config) return "Default";
  const parts: string[] = [];
  if (config.notes && config.notes !== "copy_to_master") {
    parts.push(`Notes: ${config.notes.replace(/_/g, ' ')}`);
  }
  if (config.tasks && config.tasks !== "copy_to_master") {
    parts.push(`Tasks: ${config.tasks.replace(/_/g, ' ')}`);
  }
  if (config.opportunities && config.opportunities !== "keep_all") {
    parts.push(`Opps: ${config.opportunities.replace(/_/g, ' ')}`);
  }
  return parts.length > 0 ? parts.join(", ") : "Default";
}

// Format strategy name for display
function formatStrategy(strategy?: string): string {
  if (!strategy) return 'Standard';
  return strategy
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function RuleSummaryCard({
  rule,
  onToggleStatus,
  isTogglePending,
  objectDisplayName,
}: RuleSummaryCardProps) {
  const { locationId } = useLocation();
  const mergeSettings = rule.merge_settings;
  const fieldPreservation = mergeSettings?.field_preservation;
  const hasPreservationMappings = fieldPreservation?.mappings && fieldPreservation.mappings.length > 0;
  const relatedRecords = mergeSettings?.related_records;
  const overwriteBlanks = mergeSettings?.overwrite_blanks;

  // Fetch field metadata for resolving field IDs to names
  const { data: fieldOptions = [] } = useQuery<ObjectField[]>({
    queryKey: ["fields", rule.source_object, locationId],
    queryFn: () => api.getObjectFields(rule.source_object),
    enabled: !!locationId && !!rule.source_object && hasPreservationMappings,
  });

  // Helper to resolve field ID to display name
  const getFieldName = (fieldId: string): string => {
    const field = fieldOptions.find(f => f.id === fieldId || f.fieldKey === fieldId);
    return field?.name || fieldId;
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          {/* Row 1: Object, Strategy, Status */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Object</span>
            <p className="font-medium mt-1">{objectDisplayName || rule.source_object}</p>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Strategy</span>
            <p className="font-medium mt-1">{formatStrategy(rule.merge_strategy)}</p>
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

          {/* Row 2: Match Logic (full width) */}
          <div className="col-span-2 sm:col-span-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Match Logic</span>
            <p className="font-medium mt-1 font-mono text-xs">
              {formatMatchLogic(rule.match_fields)}
            </p>
          </div>

          {/* Row 3: Thresholds, Schedule, Overwrite Blanks */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Thresholds</span>
            <p className="font-medium mt-1">
              Auto: {Math.round(rule.auto_merge_threshold * 100)}% | Review: {Math.round(rule.review_threshold * 100)}%
            </p>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Schedule</span>
            <p className="font-medium mt-1">
              {formatSchedule(
                rule.schedule_frequency,
                rule.schedule_time,
                rule.schedule_day
              )}
            </p>
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Overwrite Blanks</span>
            <p className="font-medium mt-1">{overwriteBlanks ? "Yes" : "No"}</p>
          </div>

          {/* Row 4: Related Records (contacts and companies) */}
          {(rule.source_object === "contacts" || rule.source_object === "companies") && (
            <div className="col-span-2 sm:col-span-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Related Records</span>
              <p className="font-medium mt-1">{formatRelatedRecords(relatedRecords)}</p>
            </div>
          )}

          {/* Row 5: Field Preservation (if configured) */}
          {hasPreservationMappings && (
            <div className="col-span-2 sm:col-span-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Field Preservation</span>
              <div className="mt-1 flex flex-wrap gap-2">
                {fieldPreservation!.mappings!.map((mapping, i) => (
                  <span key={i} className="inline-flex items-center gap-1 text-sm font-medium bg-muted px-2 py-0.5 rounded">
                    {getFieldName(mapping.source)}
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    {getFieldName(mapping.target)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
