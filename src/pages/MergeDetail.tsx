import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Star, ExternalLink, Loader2, RotateCcw, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useLocation } from "@/contexts/LocationContext";

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
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/v1/merges/${mergeId}?location_id=${locationId}`
      );
      if (!response.ok) throw new Error("Failed to fetch merge");
      return response.json();
    },
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
        return <Badge className="bg-green-500">Completed</Badge>;
      case "rolled_back":
        return <Badge variant="secondary">Rolled Back</Badge>;
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
    <div className="space-y-6 pt-12 lg:pt-0">
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
          <h1 className="text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">
            Merge Details
          </h1>
        </div>
        {getStatusBadge(merge.status)}
      </div>

      {/* Merge Info Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Merge Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Master Record (Kept)</p>
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
              <p className="text-sm text-muted-foreground">
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
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Field Values at Time of Merge
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32"></TableHead>
                  <TableHead className="min-w-40">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold">MASTER</span>
                    </div>
                    <div className="text-sm font-normal text-muted-foreground mt-1">
                      {recordA?.firstName} {recordA?.lastName}
                    </div>
                  </TableHead>
                  <TableHead className="min-w-40">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">DUPLICATE</span>
                    </div>
                    <div className="text-sm font-normal text-muted-foreground mt-1">
                      {recordB?.firstName} {recordB?.lastName}
                    </div>
                  </TableHead>
                  <TableHead className="min-w-40 bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="font-semibold">RESULT</span>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayFields.map((field) => {
                  const valueA = recordA?.[field];
                  const valueB = recordB?.[field];
                  const selectedSource = fieldSelections[field];

                  return (
                    <TableRow key={field}>
                      <TableCell className="font-medium text-muted-foreground">
                        {fieldLabels[field] || field}
                      </TableCell>
                      <TableCell
                        className={cn(
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
                      </TableCell>
                      <TableCell
                        className={cn(
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
                      </TableCell>
                      <TableCell className="bg-muted/50 font-medium">
                        <span className={cn(getResultValue(field) === "(empty)" && "text-muted-foreground italic")}>
                          {getResultValue(field)}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Legend */}
          <div className="mt-4 pt-4 border-t flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span><Check className="h-3 w-3 inline text-green-500" /> = Value was selected</span>
            <span className="italic">(empty)</span> = No value in record
            <span><Star className="h-3 w-3 inline text-yellow-500 fill-yellow-500" /> = Master record (kept)</span>
          </div>
        </CardContent>
      </Card>

      {/* Footer Actions */}
      <div className="flex justify-between items-center pt-4 border-t">
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
