import { Link } from "react-router-dom";
import { ExternalLink, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MergeStatusBadge } from "@/components/ui/merge-status-badge";
import { DataTableColumn } from "@/components/ui/data-table";
import { getGhlRecordUrl } from "@/lib/utils";

export interface MergeHistoryRow {
  id: string;
  master_record_id?: string;
  master_record_name?: string;
  master_record_display_name?: string;
  master_pipeline_id?: string;
  duplicate_record_id?: string;
  restored_record_id?: string;
  status: string;
  error_message?: string;
  created_at?: string;
  rule_id?: string;
  rule_name?: string;
  source_object?: string;
}

interface MergeHistoryColumnOptions {
  locationId?: string;
  includeDuplicateColumn?: boolean;
  includeRuleColumn?: boolean;
  includeDateColumn?: boolean;
  dateHeader?: string;
  formatDate?: (createdAt: string) => string;
  onRestore?: (mergeId: string) => void;
  restorePending?: boolean;
}

function getMasterRecordLabel(item: MergeHistoryRow) {
  if (item.master_record_display_name) return item.master_record_display_name;
  if (item.master_record_name) return item.master_record_name;
  if (item.master_record_id) return `${item.master_record_id.slice(0, 8)}...`;
  return "Unknown";
}

function getMasterRecordUrl(item: MergeHistoryRow, locationId?: string) {
  if (!locationId || !item.master_record_id) return null;
  return getGhlRecordUrl(locationId, item.source_object || "contacts", item.master_record_id, {
    pipelineId: item.master_pipeline_id,
  });
}

function isRolledBackStatus(status: string) {
  return status === "rolled_back" || status === "rolled_back_partial";
}

export function createMergeHistoryColumns({
  locationId,
  includeDuplicateColumn = false,
  includeRuleColumn = false,
  includeDateColumn = true,
  dateHeader = "Date",
  formatDate,
  onRestore,
  restorePending = false,
}: MergeHistoryColumnOptions): DataTableColumn<MergeHistoryRow>[] {
  const columns: DataTableColumn<MergeHistoryRow>[] = [
    {
      header: "Master Record",
      accessor: (item) => {
        const url = getMasterRecordUrl(item, locationId);
        if (url) {
          return (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1 font-medium text-foreground hover:text-primary hover:underline"
            >
              {getMasterRecordLabel(item)}
              <ExternalLink className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
            </a>
          );
        }
        return <span className="font-medium">{getMasterRecordLabel(item)}</span>;
      },
    },
  ];

  if (includeDuplicateColumn) {
    columns.push({
      header: "Duplicate",
      hideOnMobile: true,
      accessor: (item) => {
        const isRestored = isRolledBackStatus(item.status) && Boolean(item.restored_record_id);
        const restoredUrl =
          isRestored && locationId
            ? getGhlRecordUrl(locationId, item.source_object || "contacts", item.restored_record_id, {
                pipelineId: item.master_pipeline_id,
              })
            : null;
        const duplicateLabel =
          isRestored
            ? `${item.restored_record_id.slice(0, 8)}...`
            : item.duplicate_record_id
              ? `${item.duplicate_record_id.slice(0, 8)}...`
              : "—";

        if (restoredUrl) {
          return (
            <a
              href={restoredUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1 text-muted-foreground hover:text-primary hover:underline"
              title="View restored duplicate record"
            >
              <span>{duplicateLabel}</span>
              <ExternalLink className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
            </a>
          );
        }

        return <span className="text-muted-foreground">{duplicateLabel}</span>;
      },
    });
  }

  columns.push({
    header: "Status",
    accessor: (item) => (
      <div className="flex items-center gap-2">
        <MergeStatusBadge status={item.status} />
        {item.status === "failed" && item.error_message && (
          <span className="text-xs text-destructive/80 max-w-[150px] truncate" title={item.error_message}>
            {item.error_message}
          </span>
        )}
      </div>
    ),
  });

  if (includeRuleColumn) {
    columns.push({
      header: "Rule",
      hideOnMobile: true,
      accessor: (item) =>
        item.rule_id ? (
          <Link to={`/match-rules/${item.rule_id}`} className="text-primary hover:underline">
            {item.rule_name || "Unknown"}
          </Link>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    });
  }

  if (includeDateColumn) {
    columns.push({
      header: dateHeader,
      hideOnMobile: true,
      accessor: (item) => (
        <span className="text-muted-foreground">
          {item.created_at
            ? formatDate
              ? formatDate(item.created_at)
              : new Date(item.created_at).toLocaleString()
            : "—"}
        </span>
      ),
    });
  }

  columns.push({
    header: "Actions",
    align: "right",
    accessor: (item) => (
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link to={`/history/${item.id}`}>View</Link>
        </Button>
        {item.status === "completed" && onRestore && (
          <Button variant="ghost" size="sm" onClick={() => onRestore(item.id)} disabled={restorePending}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Restore
          </Button>
        )}
      </div>
    ),
  });

  return columns;
}
