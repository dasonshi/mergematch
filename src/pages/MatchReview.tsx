import { useState, useMemo, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Star, AlertTriangle, Loader2, Save, ChevronDown, ChevronUp, Plus, Trash2, ArrowRight, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useLocation } from "@/contexts/LocationContext";
import { useToast } from "@/hooks/use-toast";
import { useWarningPreferences } from "@/hooks/use-warning-preferences";
import { api, FieldPreservationMapping, ObjectField, ObjectType } from "@/lib/api";
import { computeStrategySelections, computeMasterId, StrategyId } from "@/lib/merge-strategies";
import { LockedFeatureOverlay, UpgradeBadge } from "@/components/ui/upgrade-badge";
import { useUpgradeModal } from "@/components/ui/upgrade-modal";
import { isTypeCompatible, getIncompatibilityReason } from "@/lib/field-compatibility";
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

// Fields to exclude from display (internal/system fields)
const EXCLUDED_FIELDS = [
  "id", "locationId", "businessId", "contactName", "followers",
  "dndSettings", "inboundDndSettings", "customFields", "additionalEmails",
  "firstNameRaw", "lastNameRaw", "profilePhoto", "_raw"
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
  const { locationId, isLoading: authLoading, plan } = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { preferences: warningPrefs } = useWarningPreferences();
  const { openUpgradeModal } = useUpgradeModal();

  // Tier check for field preservation
  const hasFieldPreservation = plan === "pro" || plan === "agency";

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

  // Fetch merge quota for free tier limits
  const { data: mergeQuota } = useQuery({
    queryKey: ["mergeQuota", locationId],
    queryFn: () => api.getMergeQuota(),
    enabled: !!locationId,
  });

  // Fetch available objects to get displayField for custom objects
  const { data: availableObjects = [] } = useQuery<ObjectType[]>({
    queryKey: ["availableObjects", locationId],
    queryFn: () => api.getAvailableObjects(),
    enabled: !!locationId,
  });

  // Get the displayField for the current object type
  const objectDisplayField = useMemo(() => {
    if (!rule?.source_object) return undefined;
    const objectType = availableObjects.find(o => o.id === rule.source_object);
    return objectType?.displayField;
  }, [rule?.source_object, availableObjects]);

  // Fetch available fields for field preservation dropdowns (use rule's source_object)
  // Always fetch fields for proper label resolution, regardless of plan tier
  const { data: fieldOptions = [] } = useQuery<ObjectField[]>({
    queryKey: ["fields", rule?.source_object, locationId],
    queryFn: () => api.getObjectFields(rule!.source_object),
    enabled: !!locationId && !!rule?.source_object,
  });

  // Filter out synthetic fields (like emailDomain) that aren't real GHL fields
  const preservableFields = useMemo(() =>
    fieldOptions.filter(f => f.id !== 'emailDomain'),
    [fieldOptions]
  );

  // Helper to find a field by id or fieldKey (handles different ID formats)
  const findField = (fieldId: string) =>
    preservableFields.find(f => f.id === fieldId || f.fieldKey === fieldId);

  // Get display name for a field (used in dropdowns when value is set but no match in options)
  const getFieldDisplayName = (fieldId: string) => {
    const field = findField(fieldId);
    return field?.name || getFieldLabel(fieldId);
  };

  // State for editable field preservation mappings
  const [fieldPreservationMappings, setFieldPreservationMappings] = useState<FieldPreservationMapping[]>([]);
  const [mappingsInitialized, setMappingsInitialized] = useState(false);

  // Reset mappings initialization when navigating to different match
  useEffect(() => {
    setMappingsInitialized(false);
  }, [matchId]);

  // Initialize field preservation mappings from rule (once per match)
  useEffect(() => {
    if (rule?.merge_settings?.field_preservation?.mappings && !mappingsInitialized) {
      setFieldPreservationMappings(rule.merge_settings.field_preservation.mappings);
      setMappingsInitialized(true);
    }
  }, [rule, mappingsInitialized]);

  // Merge mutation
  const mergeMutation = useMutation({
    mutationFn: async (data: {
      matchId: string;
      masterId: string;
      selections: Record<string, string>;
      preserveAlternates: boolean;
      fieldPreservationMappings?: FieldPreservationMapping[];
    }) => {
      return api.executeMerge(
        data.matchId,
        data.masterId,
        data.selections,
        data.preserveAlternates,
        data.fieldPreservationMappings
      );
    },
    onSuccess: () => {
      toast({
        title: "Merge Successful",
        description: "The records have been merged successfully.",
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
  const isCustomObject = rule?.source_object?.startsWith("custom_objects.") ?? false;

  // Get all fields from both records (excluding system fields)
  const allFields = useMemo(() => new Set([
    ...Object.keys(recordA),
    ...Object.keys(recordB)
  ].filter(f => !EXCLUDED_FIELDS.includes(f))), [recordA, recordB]);

  // Categorize fields
  const ruleFieldSet = useMemo(() => getRuleFields(rule), [rule]);

  // Get standard fields based on object type
  const standardFieldsForObject = useMemo(() => {
    const objectType = rule?.source_object;
    if (objectType === "contacts") return CONTACT_STANDARD_FIELDS;
    if (objectType === "companies") return COMPANY_STANDARD_FIELDS;
    // For custom objects, use match fields as "standard" if no standard fields exist
    // This ensures custom object fields are shown prominently
    return [];
  }, [rule?.source_object]);

  const { standardFields, ruleFields, otherFields } = useMemo(() => {
    const isCustomObject = rule?.source_object && !["contacts", "companies"].includes(rule.source_object);

    // For custom objects, match fields become the "standard" (primary) fields
    if (isCustomObject) {
      const matchFieldNames = rule?.match_fields?.map(f => f.field) || [];
      const ruleSpecific = matchFieldNames.filter(f => allFields.has(f));
      const other = [...allFields].filter(f =>
        !matchFieldNames.includes(f) && !metadataFields.includes(f)
      );
      return { standardFields: ruleSpecific, ruleFields: [], otherFields: other };
    }

    // For standard objects (contacts, companies)
    const standard = standardFieldsForObject.filter(f => allFields.has(f));
    const ruleSpecific = [...ruleFieldSet].filter(f =>
      allFields.has(f) && !standardFieldsForObject.includes(f)
    );
    const other = [...allFields].filter(f =>
      !standardFieldsForObject.includes(f) && !ruleFieldSet.has(f) && !metadataFields.includes(f)
    );
    return { standardFields: standard, ruleFields: ruleSpecific, otherFields: other };
  }, [allFields, ruleFieldSet, standardFieldsForObject, rule]);

  // Fields to display (for selection logic)
  const displayFields = useMemo(() => {
    const base = [...standardFields, ...ruleFields];
    if (showAllFields) {
      return [...base, ...otherFields];
    }
    return base;
  }, [standardFields, ruleFields, otherFields, showAllFields]);

  // Compute which record should be master based on rule's strategy
  const computeInitialMaster = (): "a" | "b" => {
    if (!match || !rule) return "a";
    const strategy = (rule.merge_strategy || "standard") as StrategyId;
    const allFieldsList = [...standardFields, ...ruleFields, ...otherFields];
    const computedMasterId = computeMasterId(
      strategy,
      recordA as Record<string, unknown>,
      recordB as Record<string, unknown>,
      allFieldsList,
      recordAId,
      recordBId
    );
    return computedMasterId === recordAId ? "a" : "b";
  };

  // Get default field selections - prefer master's values, fall back to duplicate only if master is blank
  const getDefaultSelections = (forMaster: "a" | "b") => {
    const overwriteBlanks = rule?.merge_settings?.overwrite_blanks ?? false;
    const allFieldsList = [...standardFields, ...ruleFields, ...otherFields];

    const masterRecord = forMaster === "a" ? recordA : recordB;
    const duplicateRecord = forMaster === "a" ? recordB : recordA;

    const selections: Record<string, "a" | "b"> = {};

    for (const field of allFieldsList) {
      const masterVal = masterRecord[field];
      const duplicateVal = duplicateRecord[field];

      const masterBlank =
        masterVal === undefined ||
        masterVal === null ||
        masterVal === "" ||
        (Array.isArray(masterVal) && masterVal.length === 0);

      const duplicateBlank =
        duplicateVal === undefined ||
        duplicateVal === null ||
        duplicateVal === "" ||
        (Array.isArray(duplicateVal) && duplicateVal.length === 0);

      // Prefer master's value, fall back to duplicate only if master is blank
      if (masterBlank && !duplicateBlank && !overwriteBlanks) {
        selections[field] = forMaster === "a" ? "b" : "a";
      } else {
        selections[field] = forMaster;
      }
    }

    return selections;
  };

  const [selections, setSelections] = useState<Record<string, string>>({});
  const [acknowledgedWarning, setAcknowledgedWarning] = useState(false);
  const [showWarningError, setShowWarningError] = useState(false);
  const [masterId, setMasterId] = useState<string>("a");
  const [initialized, setInitialized] = useState(false);

  // Initialize master and selections when match/rule load
  useEffect(() => {
    if (match && rule && !initialized) {
      const initialMaster = computeInitialMaster();
      setMasterId(initialMaster);
      setSelections(getDefaultSelections(initialMaster));
      setInitialized(true);
    }
  }, [match, rule, initialized]);

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

  // Helper to get field label - check fieldOptions first for custom object fields
  const getFieldLabel = (field: string) => {
    // Check if we have field metadata from the API
    const fieldMeta = fieldOptions.find(f => f.id === field || f.fieldKey === field);
    if (fieldMeta?.name) return fieldMeta.name;
    // Fall back to static labels, or return raw field key (don't mangle it with regex)
    return fieldLabels[field] || field;
  };

  const getResultValue = (field: string): string => {
    const source = selections[field];
    const value = source === "a" ? recordA[field] : recordB[field];
    const formatted = formatDisplayValue(value);
    return formatted || "(empty)";
  };

  const formatRecordLabel = (record: Record<string, unknown>, recordId: string): string => {
    const name = getRecordName(record, rule?.match_fields, objectDisplayField);
    if (!isCustomObject) {
      return name;
    }
    const shortId = recordId && recordId.length > 6 ? recordId.slice(-6) : "";
    return shortId ? `${name} [${shortId}]` : name;
  };

  // Compute preservation preview - shows values from the DUPLICATE record that will be preserved
  const preservationPreview = useMemo(() => {
    if (fieldPreservationMappings.length === 0) return [];

    // The duplicate record is the one being deleted (not the master)
    const duplicateRecord = masterId === "a" ? recordB : recordA;

    return fieldPreservationMappings
      .filter(m => m.source && m.target)
      .map(mapping => {
        // Value to preserve always comes from the duplicate record
        const valueToPreserve = duplicateRecord[mapping.source];

        return {
          sourceLabel: getFieldLabel(mapping.source),
          targetLabel: getFieldLabel(mapping.target),
          value: formatDisplayValue(valueToPreserve),
        };
      });
  }, [fieldPreservationMappings, masterId, recordA, recordB, getFieldLabel, formatDisplayValue]);

  const handleMerge = () => {
    // Only require acknowledgment if warning is enabled
    if (warningPrefs.showIndividualMergeWarning && !acknowledgedWarning) {
      setShowWarningError(true);
      return;
    }
    const actualMasterId = masterId === "a" ? recordAId : recordBId;
    const hasValidMappings = hasFieldPreservation && fieldPreservationMappings.some(m => m.source && m.target);

    // Build mappings with the actual values to preserve
    // For each mapping, the value to preserve is the one NOT selected for that field
    const mappingsWithValues = hasValidMappings
      ? fieldPreservationMappings
          .filter(m => m.source && m.target)
          .map(m => {
            const selectedSource = selections[m.source] || masterId;
            const valueToPreserve = selectedSource === "a" ? recordB[m.source] : recordA[m.source];
            return {
              source: m.source,
              target: m.target,
              value: valueToPreserve, // The actual value to preserve
            };
          })
      : undefined;

    mergeMutation.mutate({
      matchId: matchId!,
      masterId: actualMasterId,
      selections,
      preserveAlternates: hasValidMappings,
      fieldPreservationMappings: mappingsWithValues,
    });
  };

  // Render a field row - Record A always on left, Record B always on right
  const renderFieldRow = (field: string, isRuleField: boolean) => {
    const valueA = recordA[field];
    const valueB = recordB[field];
    const displayValueA = formatDisplayValue(valueA);
    const displayValueB = formatDisplayValue(valueB);

    // Determine if A or B is selected
    const isASelected = selections[field] === "a";
    const isBSelected = selections[field] === "b";

    return (
      <TableRow key={field}>
        <TableCell className="font-medium text-muted-foreground">
          <div className="flex items-center gap-2">
            {getFieldLabel(field)}
            {isRuleField && (
              <Badge variant="outline" className="text-xs px-1.5 py-0 border-primary-subtle-border text-primary-subtle-foreground bg-primary-subtle">
                Rule
              </Badge>
            )}
          </div>
        </TableCell>
        <TableCell
          className={cn(
            "cursor-pointer hover:bg-muted/50 transition-colors",
            isASelected && "bg-primary/10"
          )}
          onClick={() => handleCellClick(field, "a")}
        >
          <div className="flex items-center gap-2">
            {isASelected && (
              <span className="text-primary font-medium">[</span>
            )}
            <span className={cn(!displayValueA && "text-muted-foreground italic")}>
              {displayValueA || "(empty)"}
            </span>
            {isASelected && (
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
            isBSelected && "bg-primary/10"
          )}
          onClick={() => handleCellClick(field, "b")}
        >
          <div className="flex items-center gap-2">
            {isBSelected && (
              <span className="text-primary font-medium">[</span>
            )}
            <span className={cn(!displayValueB && "text-muted-foreground italic")}>
              {displayValueB || "(empty)"}
            </span>
            {isBSelected && (
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

  // Get the name of whichever record is currently the duplicate (will be deleted)
  const duplicateName = masterId === "a"
    ? formatRecordLabel(recordB, recordBId)
    : formatRecordLabel(recordA, recordAId);

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
          variant={confidence >= 80 ? "success-subtle" : confidence >= 60 ? "warning-subtle" : "destructive-subtle"}
          className="text-base px-4 py-1.5 w-fit font-semibold"
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
            {/* Record A button (always left) */}
            <Button
              variant={masterId === "a" ? "default" : "outline"}
              onClick={() => handleMasterChange("a")}
              className="flex-1"
              title={recordAId}
            >
              <Star className={cn("h-4 w-4 mr-2", masterId === "a" && "fill-current")} />
              {formatRecordLabel(recordA, recordAId)}
            </Button>
            {/* Record B button (always right) */}
            <Button
              variant={masterId === "b" ? "default" : "outline"}
              onClick={() => handleMasterChange("b")}
              className="flex-1"
              title={recordBId}
            >
              <Star className={cn("h-4 w-4 mr-2", masterId === "b" && "fill-current")} />
              {formatRecordLabel(recordB, recordBId)}
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
                      <span className={cn("font-semibold", masterId === "a" ? "" : "text-muted-foreground")}>
                        {masterId === "a" ? "MASTER" : "DUPLICATE"}
                      </span>
                    </div>
                    <div className="text-sm font-normal text-muted-foreground mt-1" title={recordAId}>
                      {formatRecordLabel(recordA, recordAId)}
                    </div>
                  </TableHead>
                  <TableHead className="min-w-40">
                    <div className="flex items-center gap-2">
                      {masterId === "b" && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                      <span className={cn("font-semibold", masterId === "b" ? "" : "text-muted-foreground")}>
                        {masterId === "b" ? "MASTER" : "DUPLICATE"}
                      </span>
                    </div>
                    <div className="text-sm font-normal text-muted-foreground mt-1" title={recordBId}>
                      {formatRecordLabel(recordB, recordBId)}
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
              <span><Badge variant="outline" className="text-xs px-1.5 py-0 border-primary-subtle-border text-primary-subtle-foreground bg-primary-subtle">Rule</Badge> = Used in match logic</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Field Preservation Configuration */}
      <Card className="border-primary/30">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Save className="h-5 w-5 text-primary" />
              <CardTitle className="text-base font-semibold">Field Preservation</CardTitle>
            </div>
            {!hasFieldPreservation && (
              <UpgradeBadge tier="pro" feature="field_preservation" />
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Save values from the duplicate record to custom fields on the master.
          </p>
        </CardHeader>
        <CardContent className="pt-2">
          {hasFieldPreservation ? (
            <div className="space-y-4">
              {/* Mapping list */}
              {fieldPreservationMappings.map((mapping, idx) => {
                // Get source field's data type for compatibility check (check both id and fieldKey)
                const sourceField = findField(mapping.source);
                const sourceType = sourceField?.dataType || 'TEXT';

                // Check if current source value exists in options (by id or fieldKey)
                const sourceInOptions = mapping.source && findField(mapping.source);

                // Only custom fields can be targets (standard fields can't receive values via customFields API)
                const customFields = preservableFields.filter(f =>
                  f.id !== mapping.source && f.fieldKey !== mapping.source && f.isCustom
                );

                const compatibleCustom = customFields.filter(f =>
                  isTypeCompatible(sourceType, f.dataType || 'TEXT')
                );
                const incompatibleCustom = customFields.filter(f =>
                  !isTypeCompatible(sourceType, f.dataType || 'TEXT')
                );

                // Check if current target value exists in options
                const targetInOptions = mapping.target && findField(mapping.target);

                return (
                  <div key={idx} className="flex items-center gap-2">
                    {/* Source Select */}
                    <Select
                      value={mapping.source}
                      onValueChange={(val) => {
                        const updated = [...fieldPreservationMappings];
                        updated[idx] = { ...updated[idx], source: val };
                        // Clear target if now incompatible or same as source
                        const newSourceField = findField(val);
                        const newSourceType = newSourceField?.dataType || 'TEXT';
                        const currentTarget = findField(mapping.target);
                        if (currentTarget && (mapping.target === val || !isTypeCompatible(newSourceType, currentTarget.dataType || 'TEXT'))) {
                          updated[idx].target = '';
                        }
                        setFieldPreservationMappings(updated);
                      }}
                    >
                      <SelectTrigger className="flex-1 bg-background">
                        <SelectValue placeholder="Source field...">
                          {mapping.source ? getFieldDisplayName(mapping.source) : "Source field..."}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {/* Show current value if not in standard options */}
                        {mapping.source && !sourceInOptions && (
                          <SelectItem key={mapping.source} value={mapping.source}>
                            {getFieldDisplayName(mapping.source)}
                          </SelectItem>
                        )}
                        {preservableFields.filter(f => !f.isCustom).map((opt) => (
                          <SelectItem key={opt.id} value={opt.id}>
                            {opt.name}
                          </SelectItem>
                        ))}
                        {preservableFields.some(f => f.isCustom) && (
                          <>
                            <SelectSeparator />
                            <SelectGroup>
                              <SelectLabel>Custom Fields</SelectLabel>
                              {preservableFields.filter(f => f.isCustom).map((opt) => (
                                <SelectItem key={opt.id} value={opt.id}>
                                  {opt.name}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </>
                        )}
                      </SelectContent>
                    </Select>

                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />

                    {/* Target Select */}
                    <Select
                      value={mapping.target}
                      onValueChange={(val) => {
                        const updated = [...fieldPreservationMappings];
                        updated[idx] = { ...updated[idx], target: val };
                        setFieldPreservationMappings(updated);
                      }}
                    >
                      <SelectTrigger className="flex-1 bg-background">
                        <SelectValue placeholder="Target custom field...">
                          {mapping.target ? getFieldDisplayName(mapping.target) : "Target custom field..."}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {/* Show current value if not in options */}
                        {mapping.target && !targetInOptions && (
                          <SelectItem key={mapping.target} value={mapping.target}>
                            {getFieldDisplayName(mapping.target)}
                          </SelectItem>
                        )}
                        {/* Custom Fields - Compatible */}
                        {compatibleCustom.map((opt) => (
                          <SelectItem key={opt.id} value={opt.id}>
                            {opt.name}
                          </SelectItem>
                        ))}

                        {/* Incompatible Custom Fields */}
                        {incompatibleCustom.length > 0 && (
                          <>
                            <SelectSeparator />
                            <SelectItem value="_sep_" disabled className="text-muted-foreground text-xs">
                              ── Incompatible types ──
                            </SelectItem>
                            {incompatibleCustom.map((opt) => (
                              <SelectItem key={opt.id} value={opt.id} disabled className="text-muted-foreground">
                                {opt.name} ({opt.dataType}) - {getIncompatibilityReason(opt.dataType)}
                              </SelectItem>
                            ))}
                          </>
                        )}

                        {/* Info about targets */}
                        {compatibleCustom.length === 0 && incompatibleCustom.length === 0 && (
                          <SelectItem value="_none_" disabled className="text-muted-foreground text-xs italic">
                            No custom fields available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>

                    {/* Remove button */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      onClick={() => {
                        setFieldPreservationMappings(fieldPreservationMappings.filter((_, i) => i !== idx));
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                );
              })}

              {/* Add mapping button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFieldPreservationMappings([...fieldPreservationMappings, { source: "", target: "" }])}
              >
                <Plus className="mr-1 h-4 w-4" />
                Add field mapping
              </Button>

              {/* Preview of what will be preserved */}
              {preservationPreview.length > 0 && (
                <div className="mt-4 p-3 bg-muted/30 rounded-md">
                  <p className="text-sm font-medium mb-2">Values to be preserved from duplicate:</p>
                  <div className="space-y-1 text-sm">
                    {preservationPreview.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-muted-foreground">{item.sourceLabel}:</span>
                        <span className="font-medium">{item.value || <span className="italic text-muted-foreground">(empty)</span>}</span>
                        <span className="text-muted-foreground">→</span>
                        <span>{item.targetLabel}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <LockedFeatureOverlay tier="pro" feature="field_preservation">
              <div className="h-24 flex items-center justify-center text-muted-foreground">
                Configure which values to preserve from duplicate records
              </div>
            </LockedFeatureOverlay>
          )}
        </CardContent>
      </Card>

      {/* Merge Warning */}
      {warningPrefs.showIndividualMergeWarning ? (
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
                <div className={cn(
                  "flex items-center gap-2 p-2 -m-2 rounded-md transition-colors",
                  showWarningError && !acknowledgedWarning && "bg-destructive/10 ring-2 ring-destructive"
                )}>
                  <Checkbox
                    id="acknowledge-warning"
                    checked={acknowledgedWarning}
                    onCheckedChange={(checked) => {
                      setAcknowledgedWarning(checked as boolean);
                      if (checked) setShowWarningError(false);
                    }}
                  />
                  <label
                    htmlFor="acknowledge-warning"
                    className={cn(
                      "text-sm cursor-pointer",
                      showWarningError && !acknowledgedWarning ? "text-destructive font-medium" : "text-muted-foreground"
                    )}
                  >
                    I understand this action cannot be undone
                  </label>
                </div>
                <div className="pt-1 border-t border-warning/20">
                  <Link
                    to="/settings"
                    className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                  >
                    <Settings className="h-3 w-3" />
                    Manage warning preferences in Settings
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex items-center justify-between text-sm text-muted-foreground bg-muted/30 px-4 py-3 rounded-md">
          <span>
            <AlertTriangle className="h-4 w-4 inline mr-2 text-warning" />
            "{duplicateName}" will be deleted. A snapshot will be saved for rollback.
          </span>
          <Link to="/settings" className="underline hover:text-foreground">
            Re-enable warning
          </Link>
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex justify-between items-center pt-6">
        <Button variant="outline" asChild>
          <Link to={`/match-rules/${ruleId}`}>Cancel</Link>
        </Button>
        {mergeQuota && !mergeQuota.allowed ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              Free plan limit reached ({mergeQuota.used}/{mergeQuota.limit} merges)
            </span>
            <Button
              variant="success"
              onClick={() => openUpgradeModal("unlimited_merges")}
            >
              Upgrade to Merge
            </Button>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}
