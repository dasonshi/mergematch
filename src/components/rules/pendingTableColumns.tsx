import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ConfidenceBadge } from "@/components/ui/confidence-badge";
import { DataTableColumn } from "@/components/ui/data-table";
import { MatchField } from "@/lib/api";
import { getMatchFieldSubheading, getRecordName } from "./helpers";

export interface PendingMatchRow {
  id: string;
  rule_id: string;
  record_a_id: string;
  record_b_id: string;
  record_a_data?: Record<string, unknown>;
  record_b_data?: Record<string, unknown>;
  confidence_score: number;
  created_at?: string;
}

export interface PendingRuleContext {
  ruleId: string;
  ruleName?: string;
  sourceObject?: string;
  matchFields?: MatchField[];
  displayField?: string;
}

interface PendingTableColumnOptions {
  includeRuleColumn?: boolean;
  includeFoundColumn?: boolean;
  columnDisplayField?: string;
  resolveRuleContext: (match: PendingMatchRow) => PendingRuleContext | undefined;
}

function formatFieldContextLabel(field: string): string {
  const normalized = field.replace(/^customField\./, "");
  const leaf = normalized.split(".").pop() || normalized;
  const words = leaf
    .replace(/_/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return field;
  if (words.length === 1 && words[0].length <= 4) return words[0].toUpperCase();

  return words
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function getMatchFieldsTooltip(matchFields: MatchField[]): string | undefined {
  if (!matchFields.length) return undefined;
  const fields = [
    ...new Set(
      matchFields
        .map((field) => field.field)
        .filter(Boolean)
        .map((field) => formatFieldContextLabel(field))
    ),
  ];
  if (!fields.length) return undefined;
  return `Match fields: ${fields.join(", ")}`;
}

function renderRecordCell(
  match: PendingMatchRow,
  side: "a" | "b",
  context: PendingRuleContext | undefined
) {
  const matchFields = context?.matchFields || [];
  const recordData = side === "a" ? match.record_a_data || {} : match.record_b_data || {};
  const name = getRecordName(recordData, matchFields, context?.displayField);
  const subheading = getMatchFieldSubheading(recordData, matchFields);
  const showSubheading = Boolean(subheading && subheading !== name);
  const matchTooltip = getMatchFieldsTooltip(matchFields);

  return (
    <div>
      <Link
        to={`/match-rules/${match.rule_id}/review/${match.id}`}
        className="font-medium hover:text-primary hover:underline"
        title={matchTooltip}
      >
        {name}
      </Link>
      {showSubheading && (
        <span className="block text-xs text-muted-foreground" title={matchTooltip}>
          {subheading}
        </span>
      )}
    </div>
  );
}

export function createPendingMatchColumns({
  includeRuleColumn = false,
  includeFoundColumn = true,
  columnDisplayField,
  resolveRuleContext,
}: PendingTableColumnOptions): DataTableColumn<PendingMatchRow>[] {
  const headerSuffix = columnDisplayField
    ? ` (${formatFieldContextLabel(columnDisplayField)})`
    : "";

  const columns: DataTableColumn<PendingMatchRow>[] = [
    {
      header: `Record A${headerSuffix}`,
      accessor: (match) => renderRecordCell(match, "a", resolveRuleContext(match)),
    },
    {
      header: `Record B${headerSuffix}`,
      accessor: (match) => renderRecordCell(match, "b", resolveRuleContext(match)),
    },
  ];

  if (includeRuleColumn) {
    columns.push({
      header: "Rule",
      hideOnMobile: true,
      accessor: (match) => {
        const context = resolveRuleContext(match);
        const ruleLabel = context?.ruleName || "Unknown";
        return (
          <Link
            to={`/match-rules/${match.rule_id}`}
            className="text-sm text-muted-foreground hover:text-primary"
          >
            {ruleLabel}
          </Link>
        );
      },
    });
  }

  columns.push({
    header: "Confidence",
    accessor: (match) => <ConfidenceBadge score={match.confidence_score || 0} />,
  });

  if (includeFoundColumn) {
    columns.push({
      header: "Found",
      hideOnMobile: true,
      accessor: (match) => (
        <span className="text-muted-foreground text-sm">
          {match.created_at ? new Date(match.created_at).toLocaleDateString() : "—"}
        </span>
      ),
    });
  }

  columns.push({
    header: "Actions",
    align: "right",
    accessor: (match) => (
      <Button size="sm" asChild>
        <Link to={`/match-rules/${match.rule_id}/review/${match.id}`}>Merge</Link>
      </Button>
    ),
  });

  return columns;
}
