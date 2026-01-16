import * as React from "react";
import { cn } from "@/lib/utils";
import { ResponsiveTable, ResponsiveTableContent } from "./responsive-table";
import { Loader2 } from "lucide-react";

export interface DataTableColumn<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  align?: "left" | "center" | "right";
  className?: string;
  hideOnMobile?: boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  keyField: keyof T;
  emptyState?: React.ReactNode;
  onRowClick?: (row: T) => void;
  stickyHeader?: boolean;
  maxHeight?: string;
  loading?: boolean;
  minWidth?: string;
}

function getCellValue<T>(row: T, accessor: DataTableColumn<T>["accessor"]): React.ReactNode {
  if (typeof accessor === "function") {
    return accessor(row);
  }
  return row[accessor] as React.ReactNode;
}

export function DataTable<T>({
  data,
  columns,
  keyField,
  emptyState,
  onRowClick,
  stickyHeader = false,
  maxHeight,
  loading = false,
  minWidth = "600px",
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  const tableContent = (
    <ResponsiveTable>
      <ResponsiveTableContent minWidth={minWidth}>
        <thead>
          <tr
            className={cn(
              "border-y bg-muted/40",
              stickyHeader && "sticky top-0 z-10 shadow-[0_1px_0_0_hsl(var(--border))]"
            )}
          >
            {columns.map((col, idx) => (
              <th
                key={idx}
                scope="col"
                className={cn(
                  "py-3 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground",
                  col.align === "center" && "text-center",
                  col.align === "right" && "text-right",
                  col.align !== "center" && col.align !== "right" && "text-left",
                  col.hideOnMobile && "hidden sm:table-cell",
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {data.map((row, rowIdx) => (
            <tr
              key={String(row[keyField])}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn(
                "transition-colors",
                "hover:bg-muted/50",
                rowIdx % 2 === 1 && "bg-muted/20",
                onRowClick && "cursor-pointer"
              )}
            >
              {columns.map((col, colIdx) => (
                <td
                  key={colIdx}
                  className={cn(
                    "py-3 px-4",
                    col.align === "center" && "text-center",
                    col.align === "right" && "text-right",
                    col.hideOnMobile && "hidden sm:table-cell",
                    col.className
                  )}
                >
                  {getCellValue(row, col.accessor)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </ResponsiveTableContent>
    </ResponsiveTable>
  );

  if (maxHeight) {
    return (
      <div className="overflow-y-auto" style={{ maxHeight }}>
        {tableContent}
      </div>
    );
  }

  return tableContent;
}
