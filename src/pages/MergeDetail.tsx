import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Star, ExternalLink, Loader2, RotateCcw, Check, X, ChevronDown, ChevronUp, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResponsiveTable, ResponsiveTableContent } from "@/components/ui/responsive-table";
import { MergeStatusBadge, getMergeStatusLabel } from "@/components/ui/merge-status-badge";
import { cn, getGhlRecordUrl } from "@/lib/utils";
import { useLocation } from "@/contexts/LocationContext";
import { api } from "@/lib/api";
import { getRecordName } from "@/components/rules/helpers";

// Standard fields for contacts
const CONTACT_STANDARD_FIELDS = [
  "firstName", "lastName", "email", "phone", "companyName",
  "tags", "address1", "city", "state", "postalCode", "country"
];

// Standard fields for companies
const COMPANY_STANDARD_FIELDS = [
  "name", "email", "phone", "website", "address1", "city", "state", "postalCode", "country"
];

// Human-readable labels for fields
const FIELD_LABELS: Record<string, string> = {
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
  country: "Country",
  timezone: "Timezone",
  source: "Source",
  website: "Website",
  dateAdded: "Date Added",
  dateUpdated: "Date Updated",
  dateOfBirth: "Date of Birth",
  assignedTo: "Assigned To",
  dnd: "Do Not Disturb",
  type: "Type",
  fullName: "Full Name",
  name: "Name",
};

// Fields to exclude from display (internal/system fields)
const EXCLUDED_FIELDS = [
  "id", "locationId", "businessId", "contactName", "followers",
  "dndSettings", "inboundDndSettings", "customFields", "additionalEmails",
  "firstNameRaw", "lastNameRaw", "profilePhoto"
];

interface RuleData {
  name?: string;
  source_object?: string;
  match_fields?: Array<{ field: string; algorithm: string; operator: string }>;
  merge_strategy?: string;
  merge_settings?: {
    field_preservation?: {
      enabled: boolean;
      mappings: Array<{ sourceField: string; targetField: string }>;
    };
  };
}

// Extract fields used in rule logic
const getRuleFields = (rule?: RuleData): Set<string> => {
  const fields = new Set<string>();
  if (!rule) return fields;

  // Match logic fields
  rule.match_fields?.forEach(f => fields.add(f.field));

  // Field preservation mappings
  rule.merge_settings?.field_preservation?.mappings?.forEach(m => {
    fields.add(m.sourceField);
    fields.add(m.targetField);
  });

  return fields;
};

export default function MergeDetail() {
  const { mergeId } = useParams();
  const { locationId, isLoading: authLoading } = useLocation();
  const [showAllFields, setShowAllFields] = useState(false);

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
  const crmLocationId = merge.ghl_location_id || locationId;
  const rule = merge.rule as RuleData | undefined;

  // Build CRM contact URL (assumes contacts since source_object isn't stored in merge record)
  const getCrmContactUrl = (contactId: string) => {
    return getGhlRecordUrl(crmLocationId!, "contacts", contactId);
  };

  // Determine which record was master/duplicate based on IDs
  const masterIsMasterSnapshot = masterSnapshot?.id === merge.master_record_id;
  const recordA = masterIsMasterSnapshot ? masterSnapshot : duplicateSnapshot;
  const recordB = masterIsMasterSnapshot ? duplicateSnapshot : masterSnapshot;

  // Get all fields from both records (excluding system fields)
  const allFields = new Set([
    ...Object.keys(recordA || {}),
    ...Object.keys(recordB || {})
  ].filter(f => !EXCLUDED_FIELDS.includes(f)));

  // Categorize fields - handle custom objects differently
  const ruleFieldSet = getRuleFields(rule);
  const isCustomObject = rule?.source_object && !["contacts", "companies"].includes(rule.source_object);

  // Get standard fields based on object type
  const standardFieldsForObject = rule?.source_object === "companies"
    ? COMPANY_STANDARD_FIELDS
    : CONTACT_STANDARD_FIELDS;

  // For custom objects, use match fields as the "standard" (primary) display fields
  let standardFields: string[];
  let ruleFields: string[];
  let otherFields: string[];

  if (isCustomObject) {
    const matchFieldNames = rule?.match_fields?.map(f => f.field) || [];
    standardFields = matchFieldNames.filter(f => allFields.has(f));
    ruleFields = [];
    otherFields = [...allFields].filter(f => !matchFieldNames.includes(f));
  } else {
    standardFields = standardFieldsForObject.filter(f => allFields.has(f));
    ruleFields = [...ruleFieldSet].filter(f =>
      allFields.has(f) && !standardFieldsForObject.includes(f)
    );
    otherFields = [...allFields].filter(f =>
      !standardFieldsForObject.includes(f) && !ruleFieldSet.has(f)
    );
  }

  const getDisplayValue = (value: unknown) => {
    if (value === null || value === undefined) return "(empty)";
    if (Array.isArray(value)) return value.length > 0 ? value.join(", ") : "(empty)";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value) || "(empty)";
  };

  const getResultValue = (field: string) => {
    const source = fieldSelections[field];
    const value = source === "a" ? recordA?.[field] : recordB?.[field];
    return getDisplayValue(value);
  };

  const getFieldLabel = (field: string) => {
    return FIELD_LABELS[field] || field.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
  };

  const getStatusBadge = (status: string) => <MergeStatusBadge status={status} />;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Render a field row
  const renderFieldRow = (field: string, isRuleField: boolean = false) => {
    const valueA = recordA?.[field];
    const valueB = recordB?.[field];
    const selectedSource = fieldSelections[field];

    return (
      <tr key={field} className="hover:bg-muted/50 transition-colors">
        <td className="py-3 px-4 font-medium text-muted-foreground">
          <div className="flex items-center gap-2">
            {getFieldLabel(field)}
            {isRuleField && (
              <Badge variant="outline" className="text-xs px-1.5 py-0 border-primary-subtle-border text-primary-subtle-foreground bg-primary-subtle">
                Rule
              </Badge>
            )}
          </div>
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
            <span className={cn((!valueA || (Array.isArray(valueA) && valueA.length === 0)) && "text-muted-foreground italic")}>
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
            <span className={cn((!valueB || (Array.isArray(valueB) && valueB.length === 0)) && "text-muted-foreground italic")}>
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
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
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
                  {getRecordName(masterSnapshot, rule?.match_fields)}
                </span>
                {merge.status === "completed" && getCrmContactUrl(merge.master_record_id) && (
                  <a
                    href={getCrmContactUrl(merge.master_record_id)!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    View Record <ExternalLink className="h-3 w-3" />
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
                  {getRecordName(duplicateSnapshot, rule?.match_fields)}
                </span>
                {merge.status === "rolled_back" && merge.restored_record_id && getCrmContactUrl(merge.restored_record_id) && (
                  <a
                    href={getCrmContactUrl(merge.restored_record_id)!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    View Record <ExternalLink className="h-3 w-3" />
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
          {rule?.name && (
            <div className="pt-2 border-t">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Match Rule</p>
              <p className="text-sm mt-1">{rule.name}</p>
            </div>
          )}
          <div className="pt-2 border-t text-sm text-muted-foreground">
            <p>Merged on: {formatDate(merge.created_at)}</p>
            {merge.rolled_back_at && (
              <p>Rolled back on: {formatDate(merge.rolled_back_at)}</p>
            )}
            {merge.status === "completed" && (() => {
              const mergedAt = new Date(merge.created_at).getTime();
              const expiresAt = mergedAt + 30 * 24 * 60 * 60 * 1000; // 30 days
              const now = Date.now();
              const daysRemaining = Math.ceil((expiresAt - now) / (24 * 60 * 60 * 1000));

              if (daysRemaining > 0) {
                return (
                  <p className={daysRemaining <= 7 ? "text-amber-600" : ""}>
                    Rollback available for {daysRemaining} more day{daysRemaining !== 1 ? 's' : ''}
                  </p>
                );
              } else {
                return (
                  <p className="text-red-600">
                    Rollback window has expired
                  </p>
                );
              }
            })()}
          </div>
          {/* Error Message for Failed Merges */}
          {merge.status === "failed" && merge.error_message && (
            <div className="pt-4 border-t">
              <p className="text-xs font-semibold uppercase tracking-wide text-destructive mb-2">Error Details</p>
              <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                <p className="text-sm text-destructive whitespace-pre-wrap break-words font-mono">
                  {merge.error_message}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Field Comparison Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Field Values at Time of Merge
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveTable>
            <ResponsiveTableContent minWidth="600px">
              <thead>
                <tr className="border-y bg-muted/40">
                  <th className="w-40 py-3 px-4 text-left"></th>
                  <th className="min-w-40 py-3 px-4 text-left">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold text-foreground">Master</span>
                    </div>
                    <div className="text-sm font-normal text-muted-foreground mt-1">
                      {getRecordName(recordA || {}, rule?.match_fields)}
                    </div>
                  </th>
                  <th className="min-w-40 py-3 px-4 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">Duplicate</span>
                    </div>
                    <div className="text-sm font-normal text-muted-foreground mt-1">
                      {getRecordName(recordB || {}, rule?.match_fields)}
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
              <tbody className="divide-y">
                {/* Standard Fields */}
                {standardFields.map((field) => renderFieldRow(field))}

                {/* Rule Fields (if any beyond standard) */}
                {ruleFields.length > 0 && (
                  <>
                    <tr className="bg-muted/20">
                      <td colSpan={4} className="py-2 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Rule Logic Fields
                      </td>
                    </tr>
                    {ruleFields.map((field) => renderFieldRow(field, true))}
                  </>
                )}

                {/* Expandable Other Fields */}
                {otherFields.length > 0 && (
                  <>
                    <tr>
                      <td colSpan={4} className="py-0 px-0">
                        <button
                          onClick={() => setShowAllFields(!showAllFields)}
                          className="w-full py-3 px-4 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
                        >
                          {showAllFields ? (
                            <>
                              <ChevronUp className="h-4 w-4" />
                              Hide {otherFields.length} additional fields
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4" />
                              Show {otherFields.length} additional fields
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                    {showAllFields && (
                      <>
                        <tr className="bg-muted/20">
                          <td colSpan={4} className="py-2 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Additional Fields
                          </td>
                        </tr>
                        {otherFields.map((field) => renderFieldRow(field))}
                      </>
                    )}
                  </>
                )}

                {/* Field Preservation Values - show if rule had preservation mappings */}
                {rule?.merge_settings?.field_preservation?.mappings && rule.merge_settings.field_preservation.mappings.length > 0 && (
                  <>
                    <tr className="bg-primary/10">
                      <td colSpan={4} className="py-2 px-4 text-xs font-semibold uppercase tracking-wide text-primary">
                        <div className="flex items-center gap-2">
                          <Save className="h-4 w-4" />
                          Preserved Values
                        </div>
                      </td>
                    </tr>
                    {rule.merge_settings.field_preservation.mappings.map((mapping, idx) => {
                      const preservedValue = duplicateSnapshot?.[mapping.sourceField];
                      return (
                        <tr key={`preserve-${idx}`} className="bg-primary/5 hover:bg-primary/10 transition-colors">
                          <td className="py-3 px-4 font-medium text-muted-foreground">
                            <div className="flex items-center gap-2">
                              {getFieldLabel(mapping.targetField)}
                              <Badge variant="outline" className="text-xs px-1.5 py-0 border-primary/50 text-primary">
                                Preserve
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              ← from {getFieldLabel(mapping.sourceField)}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground italic">(source field)</td>
                          <td className="py-3 px-4">
                            <span className={cn((!preservedValue || preservedValue === "") && "text-muted-foreground italic")}>
                              {getDisplayValue(preservedValue)}
                            </span>
                          </td>
                          <td className="py-3 px-4 bg-primary/10 font-medium">
                            <span className={cn((!preservedValue || preservedValue === "") && "text-muted-foreground italic")}>
                              {getDisplayValue(preservedValue)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </>
                )}
              </tbody>
            </ResponsiveTableContent>
          </ResponsiveTable>

          {/* Legend */}
          <div className="mt-4 pt-4 border-t flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span><Check className="h-3 w-3 inline text-green-500" /> = Value was selected</span>
            <span className="italic">(empty)</span> = No value in record
            <span><Star className="h-3 w-3 inline text-yellow-500 fill-yellow-500" /> = Master record (kept)</span>
            {ruleFields.length > 0 && (
              <span><Badge variant="outline" className="text-xs px-1.5 py-0 border-primary-subtle-border text-primary-subtle-foreground bg-primary-subtle">Rule</Badge> = Used in match/preserve logic</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Footer Actions */}
      <div className="flex justify-between items-center pt-6">
        <Button variant="outline" asChild>
          <Link to="/history">Back to History</Link>
        </Button>
        {merge.status === "completed" && (
          <Button variant="outline" asChild>
            <a
              href={getCrmContactUrl(merge.master_record_id)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View Master Contact
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
