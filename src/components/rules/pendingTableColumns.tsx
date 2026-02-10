import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ConfidenceBadge } from "@/components/ui/confidence-badge";
import { DataTableColumn } from "@/components/ui/data-table";
import { MatchField } from "@/lib/api";
import { getGhlRecordUrl } from "@/lib/utils";
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
  locationId?: string;
  includeRuleColumn?: boolean;
  includeFoundColumn?: boolean;
  resolveRuleContext: (match: PendingMatchRow) => PendingRuleContext | undefined;
}

function renderRecordCell(
  match: PendingMatchRow,
  side: "a" | "b",
  locationId: string | undefined,
  context: PendingRuleContext | undefined
) {
  const matchFields = context?.matchFields || [];
  const sourceObject = context?.sourceObject || "contacts";
  const recordData = side === "a" ? match.record_a_data || {} : match.record_b_data || {};
  const recordId = side === "a" ? match.record_a_id : match.record_b_id;
  const name = getRecordName(recordData, matchFields, context?.displayField);
  const subheading = getMatchFieldSubheading(recordData, matchFields);
  const showSubheading = Boolean(subheading && subheading !== name);
  const ghlUrl = locationId ? getGhlRecordUrl(locationId, sourceObject, recordId) : null;

  return (
    <div>
      <Link
        to={`/match-rules/${match.rule_id}/review/${match.id}`}
        className="font-medium hover:text-primary hover:underline"
      >
        {name}
      </Link>
      {showSubheading && ghlUrl && (
        <a
          href={ghlUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-xs text-muted-foreground hover:text-primary hover:underline"
        >
          {subheading}
        </a>
      )}
      {showSubheading && !ghlUrl && (
        <span className="block text-xs text-muted-foreground">{subheading}</span>
      )}
    </div>
  );
}

export function createPendingMatchColumns({
  locationId,
  includeRuleColumn = false,
  includeFoundColumn = true,
  resolveRuleContext,
}: PendingTableColumnOptions): DataTableColumn<PendingMatchRow>[] {
  const columns: DataTableColumn<PendingMatchRow>[] = [
    {
      header: "Record A",
      accessor: (match) => renderRecordCell(match, "a", locationId, resolveRuleContext(match)),
    },
    {
      header: "Record B",
      accessor: (match) => renderRecordCell(match, "b", locationId, resolveRuleContext(match)),
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
