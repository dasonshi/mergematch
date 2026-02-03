import { useState, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Star, AlertTriangle, Loader2, Save, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useLocation } from "@/contexts/LocationContext";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { computeStrategySelections, StrategyId } from "@/lib/merge-strategies";

// Standard fields always shown
const STANDARD_FIELDS = [
  "firstName", "lastName", "email", "phone", "companyName",
  "tags", "address1", "city", "state", "postalCode", "country"
];

// Fields to exclude from display (internal/system fields)
const EXCLUDED_FIELDS = [
  "id", "locationId", "businessId", "contactName", "followers",
  "dndSettings", "inboundDndSettings", "customFields", "additionalEmails",
  "firstNameRaw", "lastNameRaw", "profilePhoto"
];

// Human-readable labels for fields
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

const metadataFields = ["dateAdded", "dateUpdated"];

// Extract fields used in rule logic
const getRuleFields = (rule?: { match_fields?: Array<{ field: string }>; merge_settings?: { field_preservation?: { mappings?: Array<{ sourceField: string; targetField: string }> } } }): Set<string> => {
  const fields = new Set<string>();
  if (!rule) return fields;
  rule.match_fields?.forEach(f => fields.add(f.field));
  rule.merge_settings?.field_preservation?.mappings?.forEach(m => {
    fields.add(m.sourceField);
    fields.add(m.targetField);
  });
  return fields;
};

export default function MatchReview() {
  const { id: ruleId, matchId } = useParams();
  const navigate = useNavigate();
  const { locationId, isLoading: authLoading } = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch match details
  const { data: match, isLoading: matchLoading } = useQuery({
    queryKey: ["match", matchId, locationId],
    queryFn: () => api.getMatch(matchId!),
    enabled: !!locationId && !!matchId,
  });

  // Fetch rule details for the back link
  const { data: rule } = useQuery({
    queryKey: ["rule", ruleId, locationId],
    queryFn: () => api.getMatchRule(ruleId!),
    enabled: !!locationId && !!ruleId,
  });

  // Check if field preservation is enabled in the rule's merge_settings
  const preservationEnabled = rule?.merge_settings?.field_preservation?.enabled
    && (rule?.merge_settings?.field_preservation?.mappings?.length || 0) > 0;

  // Merge mutation
  const mergeMutation = useMutation({
    mutationFn: async (data: { matchId: string; masterId: string; selections: Record<string, string>; preserveAlternates: boolean }) => {
      return api.executeMerge(data.matchId, data.masterId, data.selections, data.preserveAlternates);
    },
    onSuccess: () => {
      toast({
        title: "Merge Successful",
        description: "The contacts have been merged successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({ queryKey: ["merges"] });
      navigate(`/match-rules/${ruleId}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Merge Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // State for expanding all fields
  const [showAllFields, setShowAllFields] = useState(false);

  // Build record data from match
  const recordA = match?.record_a_data || {};
  const recordB = match?.record_b_data || {};
  const recordAId = match?.record_a_id || "a";
  const recordBId = match?.record_b_id || "b";
  const confidence = Math.round((match?.confidence_score || 0) * 100);

  // Get all fields from both records (excluding system fields)
  const allFields = useMemo(() => new Set([
    ...Object.keys(recordA),
    ...Object.keys(recordB)
  ].filter(f => !EXCLUDED_FIELDS.includes(f))), [recordA, recordB]);

  // Categorize fields
  const ruleFieldSet = useMemo(() => getRuleFields(rule), [rule]);

  const { standardFields, ruleFields, otherFields } = useMemo(() => {
    const standard = STANDARD_FIELDS.filter(f => allFields.has(f));
    const ruleSpecific = [...ruleFieldSet].filter(f =>
      allFields.has(f) && !STANDARD_FIELDS.includes(f)
    );
    const other = [...allFields].filter(f =>
      !STANDARD_FIELDS.includes(f) && !ruleFieldSet.has(f) && !metadataFields.includes(f)
    );
    return { standardFields: standard, ruleFields: ruleSpecific, otherFields: other };
  }, [allFields, ruleFieldSet]);

  // Fields to display (for selection logic)
  const displayFields = useMemo(() => {
    const base = [...standardFields, ...ruleFields];
    if (showAllFields) {
      return [...base, ...otherFields];
    }
    return base;
  }, [standardFields, ruleFields, otherFields, showAllFields]);

  // Track selections - strategy-aware defaults
  const getDefaultSelections = (forMaster: "a" | "b" = "a") => {
    const strategy = (rule?.merge_strategy || "standard") as StrategyId;
    const overwriteBlanks = rule?.merge_settings?.overwrite_blanks ?? false;

    // Use ALL fields for selection computation (including additional fields)
    const allFields = [...standardFields, ...ruleFields, ...otherFields];

    // If master is "b", swap records so strategy prefers record B
    const [primaryRecord, secondaryRecord] = forMaster === "a"
      ? [recordA, recordB]
      : [recordB, recordA];

    const rawSelections = computeStrategySelections({
      strategy,
      recordA: primaryRecord as Record<string, unknown>,
      recordB: secondaryRecord as Record<string, unknown>,
      fields: allFields,
      overwriteBlanks,
    });

    // Map selections back to original a/b identifiers if we swapped
    if (forMaster === "b") {
      const mappedSelections: Record<string, "a" | "b"> = {};
      for (const [field, sel] of Object.entries(rawSelections)) {
        mappedSelections[field] = sel === "a" ? "b" : "a";
      }
      return mappedSelections;
    }

    return rawSelections;
  };

  const [selections, setSelections] = useState<Record<string, string>>({});
  const [hideWarning, setHideWarning] = useState(false);
  const [masterId, setMasterId] = useState<string>("a");
  const [preserveAlternates, setPreserveAlternates] = useState(false);

  // Initialize selections when match loads
  if (match && Object.keys(selections).length === 0) {
    const defaults = getDefaultSelections();
    setSelections(defaults);
  }

  const handleCellClick = (field: string, source: "a" | "b") => {
    setSelections((prev) => ({ ...prev, [field]: source }));
  };

  const handleMasterChange = (newMaster: "a" | "b") => {
    setMasterId(newMaster);
    // Re-compute all field selections based on new master
    const newSelections = getDefaultSelections(newMaster);
    setSelections(newSelections);
  };

  // Helper to format display values (handles boolean, null, arrays)
  const formatDisplayValue = (value: unknown): string => {
    if (value === null || value === undefined) return "";
    if (Array.isArray(value)) return value.join(", ");
    if (typeof value === "boolean") return value ? "Yes" : "No";
    return String(value);
  };

  const getResultValue = (field: string): string => {
    const source = selections[field];
    const value = source === "a" ? recordA[field] : recordB[field];
    const formatted = formatDisplayValue(value);
    return formatted || "(empty)";
  };

  const handleMerge = () => {
    const actualMasterId = masterId === "a" ? recordAId : recordBId;
    mergeMutation.mutate({
      matchId: matchId!,
      masterId: actualMasterId,
      selections,
      preserveAlternates: preservationEnabled && preserveAlternates,
    });
  };

  // Helper to get field label
  const getFieldLabel = (field: string) => {
    return fieldLabels[field] || field.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
  };

  // Render a field row
  const renderFieldRow = (field: string, isRuleField: boolean) => {
    const valueA = recordA[field];
    const valueB = recordB[field];
    const displayValueA = formatDisplayValue(valueA);
    const displayValueB = formatDisplayValue(valueB);

    return (
      <TableRow key={field}>
        <TableCell className="font-medium text-muted-foreground">
          <div className="flex items-center gap-2">
            {getFieldLabel(field)}
            {isRuleField && (
              <Badge variant="outline" className="text-xs px-1.5 py-0 border-blue-300 text-blue-600">
                Rule
              </Badge>
            )}
          </div>
        </TableCell>
        <TableCell
          className={cn(
            "cursor-pointer hover:bg-muted/50 transition-colors",
            selections[field] === "a" && "bg-primary/10"
          )}
          onClick={() => handleCellClick(field, "a")}
        >
          <div className="flex items-center gap-2">
            {selections[field] === "a" && (
              <span className="text-primary font-medium">[</span>
            )}
            <span className={cn(!displayValueA && "text-muted-foreground italic")}>
              {displayValueA || "(empty)"}
            </span>
            {selections[field] === "a" && (
              <>
                <span className="text-primary font-medium">]</span>
                <span className="text-primary">✓</span>
              </>
            )}
          </div>
        </TableCell>
        <TableCell
          className={cn(
            "cursor-pointer hover:bg-muted/50 transition-colors",
            selections[field] === "b" && "bg-primary/10"
          )}
          onClick={() => handleCellClick(field, "b")}
        >
          <div className="flex items-center gap-2">
            {selections[field] === "b" && (
              <span className="text-primary font-medium">[</span>
            )}
            <span className={cn(!displayValueB && "text-muted-foreground italic")}>
              {displayValueB || "(empty)"}
            </span>
            {selections[field] === "b" && (
              <>
                <span className="text-primary font-medium">]</span>
                <span className="text-primary">✓</span>
              </>
            )}
          </div>
        </TableCell>
        <TableCell className="bg-muted/50 font-medium">
          <span className={cn(getResultValue(field) === "(empty)" && "text-muted-foreground italic")}>
            {getResultValue(field)}
          </span>
        </TableCell>
      </TableRow>
    );
  };

  if (authLoading || matchLoading || !match) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const duplicateName = masterId === "a"
    ? `${recordB.firstName || ''} ${recordB.lastName || ''}`.trim() || "Record B"
    : `${recordA.firstName || ''} ${recordA.lastName || ''}`.trim() || "Record A";

  return (
    <div className="space-y-6 ">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Link
            to={`/match-rules/${ruleId}`}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {rule?.name || "Match Rule"}
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Review Match
          </h1>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "text-base px-4 py-1.5 w-fit font-semibold",
            confidence >= 80 ? "bg-green-100 text-green-700 border-green-200" :
            confidence >= 60 ? "bg-amber-100 text-amber-700 border-amber-200" :
            "bg-red-100 text-red-700 border-red-200"
          )}
        >
          {confidence}% confidence
        </Badge>
      </div>

      {/* Master Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Select Master Record
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Button
              variant={masterId === "a" ? "default" : "outline"}
              onClick={() => handleMasterChange("a")}
              className="flex-1"
            >
              <Star className={cn("h-4 w-4 mr-2", masterId === "a" && "fill-current")} />
              {String(recordA.firstName || '')} {String(recordA.lastName || '')}
            </Button>
            <Button
              variant={masterId === "b" ? "default" : "outline"}
              onClick={() => handleMasterChange("b")}
              className="flex-1"
            >
              <Star className={cn("h-4 w-4 mr-2", masterId === "b" && "fill-current")} />
              {String(recordB.firstName || '')} {String(recordB.lastName || '')}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            The master record will be kept. The duplicate will be deleted.
          </p>
        </CardContent>
      </Card>

      {/* Field Comparison Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Field Comparison</CardTitle>
          <p className="text-sm text-muted-foreground">
            Click any cell to select which value to keep.
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32"></TableHead>
                  <TableHead className="min-w-40">
                    <div className="flex items-center gap-2">
                      {masterId === "a" && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                      <span className={masterId === "a" ? "font-semibold" : ""}>
                        {masterId === "a" ? "MASTER" : "DUPLICATE"}
                      </span>
                    </div>
                    <div className="text-sm font-normal text-muted-foreground mt-1">
                      {String(recordA.firstName || '')} {String(recordA.lastName || '')}
                    </div>
                  </TableHead>
                  <TableHead className="min-w-40">
                    <div className="flex items-center gap-2">
                      {masterId === "b" && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                      <span className={masterId === "b" ? "font-semibold" : ""}>
                        {masterId === "b" ? "MASTER" : "DUPLICATE"}
                      </span>
                    </div>
                    <div className="text-sm font-normal text-muted-foreground mt-1">
                      {String(recordB.firstName || '')} {String(recordB.lastName || '')}
                    </div>
                  </TableHead>
                  <TableHead className="min-w-40 bg-muted/50">
                    <span className="font-semibold">RESULT</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Standard Fields */}
                {standardFields.map((field) => renderFieldRow(field, false))}

                {/* Rule Fields (if any beyond standard) */}
                {ruleFields.length > 0 && (
                  <>
                    <TableRow className="bg-muted/20">
                      <TableCell colSpan={4} className="py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Rule Logic Fields
                      </TableCell>
                    </TableRow>
                    {ruleFields.map((field) => renderFieldRow(field, true))}
                  </>
                )}

                {/* Expandable Other Fields */}
                {otherFields.length > 0 && (
                  <>
                    <TableRow>
                      <TableCell colSpan={4} className="p-0">
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
                      </TableCell>
                    </TableRow>
                    {showAllFields && (
                      <>
                        <TableRow className="bg-muted/20">
                          <TableCell colSpan={4} className="py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Additional Fields
                          </TableCell>
                        </TableRow>
                        {otherFields.map((field) => renderFieldRow(field, false))}
                      </>
                    )}
                  </>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Legend */}
          <div className="mt-4 pt-4 border-t flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span><span className="text-primary">[Value] ✓</span> = Selected</span>
            <span className="italic">(empty)</span> = No value
            <span><Star className="h-3 w-3 inline text-yellow-500 fill-yellow-500" /> = Master record</span>
            {ruleFields.length > 0 && (
              <span><Badge variant="outline" className="text-xs px-1.5 py-0 border-blue-300 text-blue-600">Rule</Badge> = Used in match logic</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Field Preservation Option (only show if configured in settings) */}
      {preservationEnabled && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Save className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-foreground">Preserve Alternate Values</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Save non-selected email/phone values to custom fields.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="preserve-alternates"
                    checked={preserveAlternates}
                    onCheckedChange={(checked) => setPreserveAlternates(checked as boolean)}
                  />
                  <label htmlFor="preserve-alternates" className="text-sm cursor-pointer">
                    Save alternate values to custom fields
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Merge Warning */}
      <Card className="border-warning/30 bg-warning/5">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-foreground">Merge Warning</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  "{duplicateName}" will be <span className="font-semibold text-destructive">DELETED</span>.
                </p>
                <p className="text-sm text-muted-foreground">
                  A snapshot will be saved for 30-day rollback.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="hide-warning"
                  checked={hideWarning}
                  onCheckedChange={(checked) => setHideWarning(checked as boolean)}
                />
                <label htmlFor="hide-warning" className="text-sm text-muted-foreground cursor-pointer">
                  Do not show this warning again
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer Actions */}
      <div className="flex justify-between items-center pt-6">
        <Button variant="outline" asChild>
          <Link to={`/match-rules/${ruleId}`}>Cancel</Link>
        </Button>
        <Button variant="success" onClick={handleMerge} disabled={mergeMutation.isPending}>
          {mergeMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Merging...
            </>
          ) : (
            "Confirm Merge"
          )}
        </Button>
      </div>
    </div>
  );
}
