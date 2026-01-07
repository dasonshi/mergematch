import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Star, ExternalLink, Loader2, RotateCcw, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResponsiveTable, ResponsiveTableContent } from "@/components/ui/responsive-table";
import { cn } from "@/lib/utils";
import { useLocation } from "@/contexts/LocationContext";
import { api } from "@/lib/api";

// Fields to display and their labels
const fieldLabels: Record<string, string> = {
  firstName: "First Name",
  lastName: "Last Name",
  email: "Email",
  phone: "Phone",
  companyName: "Company",
  tags: "Tags",
  address1: "Address",
  city: "City",
  state: "State",
  postalCode: "Postal Code",
};

export default function MergeDetail() {
  const { mergeId } = useParams();
  const { locationId, isLoading: authLoading } = useLocation();

  // Fetch merge details with snapshots
  const { data: merge, isLoading } = useQuery({
    queryKey: ["merge", mergeId, locationId],
    queryFn: () => api.getMerge(mergeId!),
    enabled: !!locationId && !!mergeId,
  });

  if (authLoading || isLoading || !merge) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const masterSnapshot = merge.master_snapshot || {};
  const duplicateSnapshot = merge.duplicate_snapshot || {};
  const fieldSelections = merge.field_selections || {};
  const ghlLocationId = merge.ghl_location_id || locationId;

  // Build GHL contact URL
  const getGhlContactUrl = (contactId: string) => {
    return `https://app.gohighlevel.com/v2/location/${ghlLocationId}/contacts/detail/${contactId}`;
  };

  // Determine which record was master/duplicate based on IDs
  const masterIsMasterSnapshot = masterSnapshot?.id === merge.master_record_id;
  const recordA = masterIsMasterSnapshot ? masterSnapshot : duplicateSnapshot;
  const recordB = masterIsMasterSnapshot ? duplicateSnapshot : masterSnapshot;

  // Determine which fields to show
  const allFields = new Set([...Object.keys(recordA || {}), ...Object.keys(recordB || {})]);
  const displayFields = Object.keys(fieldLabels).filter(f => allFields.has(f));

  const getDisplayValue = (value: any) => {
    if (Array.isArray(value)) return value.join(", ");
    return value || "(empty)";
  };

  const getResultValue = (field: string) => {
    const source = fieldSelections[field];
    const value = source === "a" ? recordA?.[field] : recordB?.[field];
    return getDisplayValue(value);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-600 hover:bg-green-700">Merged</Badge>;
      case "rolled_back":
        return <Badge variant="outline" className="border-amber-500 text-amber-600">Restored</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6 ">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Link
            to="/history"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Merge History
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Merge Details
          </h1>
        </div>
        {getStatusBadge(merge.status)}
      </div>

      {/* Merge Info Card */}
      <Card className="shadow-md border-l-4 border-l-primary">
        <CardHeader className="pb-3 bg-muted/30 border-b">
          <CardTitle className="text-lg font-bold">
            Merge Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Master Record (Kept)</p>
              <div className="flex items-center gap-2 mt-1">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <span className="font-medium">
                  {masterSnapshot?.firstName} {masterSnapshot?.lastName}
                </span>
                {merge.status === "completed" && (
                  <a
                    href={getGhlContactUrl(merge.master_record_id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    View in GHL <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
              <p className="text-xs text-muted-foreground font-mono mt-1">
                ID: {merge.master_record_id}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Duplicate Record ({merge.status === "rolled_back" ? "Restored" : "Deleted"})
              </p>
              <div className="flex items-center gap-2 mt-1">
                {merge.status === "rolled_back" ? (
                  <RotateCcw className="h-4 w-4 text-blue-500" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )}
                <span className="font-medium">
                  {duplicateSnapshot?.firstName} {duplicateSnapshot?.lastName}
                </span>
                {merge.status === "rolled_back" && merge.restored_record_id && (
                  <a
                    href={getGhlContactUrl(merge.restored_record_id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    View in GHL <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
              <p className="text-xs text-muted-foreground font-mono mt-1">
                {merge.status === "rolled_back" && merge.restored_record_id ? (
                  <>New ID: {merge.restored_record_id}</>
                ) : (
                  <>ID: {merge.duplicate_record_id}</>
                )}
              </p>
            </div>
          </div>
          <div className="pt-2 border-t text-sm text-muted-foreground">
            <p>Merged on: {formatDate(merge.created_at)}</p>
            {merge.rolled_back_at && (
              <p>Rolled back on: {formatDate(merge.rolled_back_at)}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Field Comparison Table */}
      <Card className="shadow-md">
        <CardHeader className="pb-3 bg-muted/30 border-b">
          <CardTitle className="text-lg font-bold">
            Field Values at Time of Merge
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveTable>
            <ResponsiveTableContent minWidth="600px">
              <thead className="bg-muted/30">
                <tr className="border-b">
                  <th className="w-32 py-3 px-4 text-left"></th>
                  <th className="min-w-40 py-3 px-4 text-left">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold text-foreground">Master</span>
                    </div>
                    <div className="text-sm font-normal text-muted-foreground mt-1">
                      {recordA?.firstName} {recordA?.lastName}
                    </div>
                  </th>
                  <th className="min-w-40 py-3 px-4 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">Duplicate</span>
                    </div>
                    <div className="text-sm font-normal text-muted-foreground mt-1">
                      {recordB?.firstName} {recordB?.lastName}
                    </div>
                  </th>
                  <th className="min-w-40 py-3 px-4 text-left bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="font-semibold text-foreground">Result</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayFields.map((field) => {
                  const valueA = recordA?.[field];
                  const valueB = recordB?.[field];
                  const selectedSource = fieldSelections[field];

                  return (
                    <tr key={field} className="border-b last:border-0">
                      <td className="py-3 px-4 font-medium text-muted-foreground">
                        {fieldLabels[field] || field}
                      </td>
                      <td
                        className={cn(
                          "py-3 px-4",
                          selectedSource === "a" && "bg-green-500/10"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          {selectedSource === "a" && (
                            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                          )}
                          <span className={cn(!valueA && "text-muted-foreground italic")}>
                            {getDisplayValue(valueA)}
                          </span>
                        </div>
                      </td>
                      <td
                        className={cn(
                          "py-3 px-4",
                          selectedSource === "b" && "bg-green-500/10"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          {selectedSource === "b" && (
                            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                          )}
                          <span className={cn(!valueB && "text-muted-foreground italic")}>
                            {getDisplayValue(valueB)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 bg-muted/50 font-medium">
                        <span className={cn(getResultValue(field) === "(empty)" && "text-muted-foreground italic")}>
                          {getResultValue(field)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </ResponsiveTableContent>
          </ResponsiveTable>

          {/* Legend */}
          <div className="mt-4 pt-4 border-t flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span><Check className="h-3 w-3 inline text-green-500" /> = Value was selected</span>
            <span className="italic">(empty)</span> = No value in record
            <span><Star className="h-3 w-3 inline text-yellow-500 fill-yellow-500" /> = Master record (kept)</span>
          </div>
        </CardContent>
      </Card>

      {/* Footer Actions */}
      <div className="flex justify-between items-center pt-6 mt-6 border-t-2 border-t-muted">
        <Button variant="outline" asChild>
          <Link to="/history">Back to History</Link>
        </Button>
        {merge.status === "completed" && (
          <Button variant="outline" asChild>
            <a
              href={getGhlContactUrl(merge.master_record_id)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View Master in GHL
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
