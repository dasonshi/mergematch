import * as React from "react";
import { cn } from "@/lib/utils";
import { ResponsiveTable, ResponsiveTableContent } from "./responsive-table";
import { Loader2 } from "lucide-react";
import { Checkbox } from "./checkbox";

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
  // Selection props
  selectable?: boolean;
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  isRowSelectable?: (row: T) => boolean;
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
  selectable = false,
  selectedIds = new Set(),
  onSelectionChange,
  isRowSelectable,
}: DataTableProps<T>) {
  // Get selectable rows
  const selectableRows = React.useMemo(() => {
    if (!selectable) return [];
    return data.filter(row => !isRowSelectable || isRowSelectable(row));
  }, [data, selectable, isRowSelectable]);

  const selectableIds = React.useMemo(() => {
    return new Set(selectableRows.map(row => String(row[keyField])));
  }, [selectableRows, keyField]);

  // Check if all selectable rows on current page are selected
  const allSelectableSelected = selectableRows.length > 0 &&
    selectableRows.every(row => selectedIds.has(String(row[keyField])));

  const someSelected = selectableRows.some(row => selectedIds.has(String(row[keyField])));

  const handleSelectAll = () => {
    if (!onSelectionChange) return;

    if (allSelectableSelected) {
      // Deselect all on this page
      const newIds = new Set(selectedIds);
      selectableRows.forEach(row => newIds.delete(String(row[keyField])));
      onSelectionChange(newIds);
    } else {
      // Select all selectable on this page
      const newIds = new Set(selectedIds);
      selectableRows.forEach(row => newIds.add(String(row[keyField])));
      onSelectionChange(newIds);
    }
  };

  const handleSelectRow = (row: T) => {
    if (!onSelectionChange) return;
    const id = String(row[keyField]);
    const newIds = new Set(selectedIds);
    if (newIds.has(id)) {
      newIds.delete(id);
    } else {
      newIds.add(id);
    }
    onSelectionChange(newIds);
  };

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
            {selectable && (
              <th scope="col" className="py-3 px-4 w-[40px]">
                <Checkbox
                  checked={allSelectableSelected}
                  indeterminate={someSelected && !allSelectableSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                  disabled={selectableRows.length === 0}
                />
              </th>
            )}
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
          {data.map((row, rowIdx) => {
            const rowId = String(row[keyField]);
            const isSelected = selectedIds.has(rowId);
            const canSelect = !isRowSelectable || isRowSelectable(row);

            return (
              <tr
                key={rowId}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  "transition-colors",
                  "hover:bg-muted/50",
                  rowIdx % 2 === 1 && "bg-muted/20",
                  isSelected && "bg-primary/5",
                  onRowClick && "cursor-pointer"
                )}
              >
                {selectable && (
                  <td className="py-3 px-4 w-[40px]">
                    {canSelect ? (
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleSelectRow(row)}
                        aria-label={`Select row ${rowIdx + 1}`}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <div className="w-4 h-4" /> // Placeholder for non-selectable rows
                    )}
                  </td>
                )}
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
            );
          })}
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
