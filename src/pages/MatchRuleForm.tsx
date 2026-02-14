import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Lock, Info, Loader2, ArrowRight, Check, HelpCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
  SelectLabel,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { StepIndicator } from "@/components/ui/step-indicator";
import { UpgradeBadge, LockedFeatureOverlay } from "@/components/ui/upgrade-badge";
import { CustomLogicBuilder, CustomLogicConfig, createEmptyLogicConfig } from "@/components/ui/custom-logic-builder";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, MatchRule, MatchField, ObjectField, RuleMergeSettings, FieldPreservationMapping } from "@/lib/api";
import { useLocation } from "@/contexts/LocationContext";
import { isTypeCompatible, getIncompatibilityReason } from "@/lib/field-compatibility";

// Standard object types with tier requirements
const standardObjectTiers: Record<string, string> = {
  contacts: "free",
};

// Tier hierarchy for comparison
const tierOrder = ["free", "starter", "pro", "agency"] as const;
type Tier = typeof tierOrder[number];

function hasAccess(userPlan: string, requiredTier: string): boolean {
  const userIdx = tierOrder.indexOf(userPlan as Tier);
  const reqIdx = tierOrder.indexOf(requiredTier as Tier);
  return userIdx >= reqIdx;
}

// Fallback fields if API fails
const fallbackFields: Record<string, { id: string; name: string }[]> = {
  contacts: [
    { id: "email", name: "Email" },
    { id: "emailDomain", name: "Email Domain" },
    { id: "phone", name: "Phone" },
    { id: "firstName", name: "First Name" },
    { id: "lastName", name: "Last Name" },
  ],
};

// Fields with a fixed algorithm — the algorithm selector is hidden for these
const FIXED_ALGORITHM_FIELDS: Record<string, { algorithm: string; label: string }> = {
  email: { algorithm: "exact", label: "Exact Match" },
  phone: { algorithm: "exact", label: "Exact Match" },
  emailDomain: { algorithm: "email_domain", label: "Domain Match" },
  website: { algorithm: "exact", label: "Exact Match" },
  dateOfBirth: { algorithm: "exact", label: "Exact Match" },
};

// Text/name fields and custom fields allow algorithm selection
const TEXT_MATCH_TYPES = [
  { id: "exact", name: "Exact Match" },
  { id: "fuzzy", name: "Fuzzy Match (85%)" },
  { id: "fuzzy90", name: "Fuzzy Match (90%)" },
];

const isFixedAlgorithmField = (fieldId: string) => fieldId in FIXED_ALGORITHM_FIELDS;

function normalizeRuleFieldPath(fieldPath?: string): string {
  if (!fieldPath) return "";

  let normalized = fieldPath.trim();

  // Legacy/custom prefixes from older rule payloads.
  normalized = normalized.replace(/^customField\./, "");
  normalized = normalized.replace(/^customFields\./, "");
  normalized = normalized.replace(/^custom_objects\.[^.]+\./, "");
  normalized = normalized.replace(
    /^(contact|contacts|business|businesses|company|companies|opportunity|opportunities)\./,
    ""
  );

  return normalized;
}

type FieldOption = {
  id: string;
  sourceId?: string;
  name: string;
  isCustom: boolean;
  dataType: string;
  fieldKey?: string;
};

function canonicalFieldKey(fieldPath?: string): string {
  return normalizeRuleFieldPath(fieldPath)
    .split(".")
    .pop()
    ?.replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase() || "";
}

const FIELD_ID_ALIASES: Record<string, string> = {
  // Contact/company aliases.
  first_name: "firstName",
  firstname: "firstName",
  last_name: "lastName",
  lastname: "lastName",
  full_name: "name",
  company: "companyName",
  company_name: "companyName",
  business_name: "name",
  email_address: "email",
  phone_number: "phone",
  website_url: "website",
  postal_code: "postalCode",
  zip: "postalCode",
  zip_code: "postalCode",
  address_1: "address1",
  dob: "dateOfBirth",

  // Opportunity legacy/canonical aliases.
  amount: "monetaryValue",
  value: "monetaryValue",
  monetary_value: "monetaryValue",
  pipeline: "pipelineId",
  pipeline_id: "pipelineId",
  stage: "pipelineStageId",
  pipeline_stage: "pipelineStageId",
  pipeline_stage_id: "pipelineStageId",
  contact: "contactId",
  contact_id: "contactId",
  owner: "assignedTo",
  assignee: "assignedTo",
  assigned_to: "assignedTo",
};

function resolveFieldId(fieldPath: string, options: FieldOption[]): string {
  if (!fieldPath) return "";

  const normalized = normalizeRuleFieldPath(fieldPath);

  // Fast path: direct id/sourceId match.
  const direct = options.find(
    (option) =>
      option.id === normalized ||
      option.id === fieldPath ||
      option.sourceId === normalized ||
      option.sourceId === fieldPath
  );
  if (direct) return direct.id;

  const directAlias = FIELD_ID_ALIASES[normalized.toLowerCase()];
  if (directAlias && options.some((option) => option.id === directAlias)) {
    return directAlias;
  }

  const tail = normalized.split(".").pop() || normalized;
  const directTail = options.find(
    (option) =>
      option.id === tail ||
      option.sourceId === tail
  );
  if (directTail) return directTail.id;

  const tailAlias = FIELD_ID_ALIASES[tail.toLowerCase()];
  if (tailAlias && options.some((option) => option.id === tailAlias)) {
    return tailAlias;
  }

  // Match against known field keys returned by API (important for custom objects).
  const byFieldKey = options.find((option) => {
    if (!option.fieldKey) return false;
    const normalizedFieldKey = normalizeRuleFieldPath(option.fieldKey);
    return (
      normalizedFieldKey === normalized ||
      normalizedFieldKey.endsWith(`.${normalized}`) ||
      normalized.endsWith(`.${normalizedFieldKey}`)
    );
  });
  if (byFieldKey) return byFieldKey.id;

  // Last resort: canonical token match (e.g. buyer_name vs Buyer Name variants).
  const canonical = canonicalFieldKey(normalized);
  if (!canonical) return normalized || fieldPath;

  const byCanonical = options.find((option) => {
    if (canonicalFieldKey(option.id) === canonical) return true;
    if (option.fieldKey && canonicalFieldKey(option.fieldKey) === canonical) return true;
    return false;
  });

  return byCanonical?.id || normalized || fieldPath;
}

const strategies = [
  { id: "standard", name: "Standard Merge", description: "Prefer the record with the most complete data", prebuilt: true },
  { id: "recent", name: "Most Recent Wins", description: "Prefer values from the most recently updated record", prebuilt: true },
  { id: "oldest", name: "Original Record Priority", description: "Prefer the oldest record by creation date", prebuilt: true },
  { id: "manual", name: "Manual Review Required", description: "Require manual selection for every field", prebuilt: true },
];

const frequencyOptions = [
  { id: "manual", name: "Manual only", tier: "free" },
  { id: "daily", name: "Daily", tier: "pro" },
  { id: "weekly", name: "Weekly", tier: "pro" },
  { id: "biweekly", name: "Every 2 weeks", tier: "pro" },
  { id: "monthly", name: "Monthly", tier: "pro" },
];

const daysOfWeek = [
  { id: "0", name: "Sunday" },
  { id: "1", name: "Monday" },
  { id: "2", name: "Tuesday" },
  { id: "3", name: "Wednesday" },
  { id: "4", name: "Thursday" },
  { id: "5", name: "Friday" },
  { id: "6", name: "Saturday" },
];

const SCHEDULE_TIME_PATTERN = /^\d{2}:\d{2}$/;
const DEFAULT_SCHEDULE_TIME = "06:00";

// Generate time options in 1-hour increments
const timeOptions = Array.from({ length: 24 }, (_, hour) => {
  const ampm = hour < 12 ? "AM" : "PM";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return {
    id: `${hour.toString().padStart(2, "0")}:00`,
    name: `${displayHour}:00 ${ampm}`,
  };
});

function normalizeHourlyScheduleTime(value?: string | null): string {
  if (!value || !SCHEDULE_TIME_PATTERN.test(value)) {
    return DEFAULT_SCHEDULE_TIME;
  }

  const [hourRaw] = value.split(":");
  const hour = Number.parseInt(hourRaw, 10);

  if (Number.isNaN(hour) || hour < 0 || hour > 23) {
    return DEFAULT_SCHEDULE_TIME;
  }

  return `${hour.toString().padStart(2, "0")}:00`;
}

function getScheduleTimeLabel(time: string): string {
  return timeOptions.find((option) => option.id === time)?.name ?? time;
}

// Generate day of month options
const daysOfMonth = Array.from({ length: 28 }, (_, i) => ({
  id: String(i + 1),
  name: `${i + 1}${getOrdinalSuffix(i + 1)}`,
}));

function getOrdinalSuffix(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

// Wizard steps
const STEPS = [
  { id: 1, name: "Basics", description: "Name & object" },
  { id: 2, name: "Conditions", description: "Match fields" },
  { id: 3, name: "Strategy", description: "Merge behavior" },
  { id: 4, name: "Review", description: "Confirm & create" },
];

export default function MatchRuleForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { locationId, isAuthenticated, plan } = useLocation();
  const isEditing = !!id;
  const hasFieldPreservation = plan === "pro" || plan === "agency";

  // Wizard step state
  const [currentStep, setCurrentStep] = useState(1);

  const [ruleName, setRuleName] = useState("");
  const [objectType, setObjectType] = useState("contacts");
  const [fields, setFields] = useState<{ name: string; matchType: string; operator: "AND" | "OR"; matchAgainst?: string }[]>([
    { name: "", matchType: "exact", operator: "AND" },
  ]);
  const [strategy, setStrategy] = useState("standard");
  const [frequency, setFrequency] = useState("manual");
  const [scheduleTime, setScheduleTime] = useState(DEFAULT_SCHEDULE_TIME);
  const [scheduleDayOfWeek, setScheduleDayOfWeek] = useState("1"); // Monday
  const [scheduleDayOfMonth, setScheduleDayOfMonth] = useState("1"); // 1st

  // Feedback dialog state
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackSending, setFeedbackSending] = useState(false);

  // Related records handling (for contacts)
  const [relatedRecordsConfig, setRelatedRecordsConfig] = useState<{
    notes?: "copy_to_master" | "dont_copy";
    tasks?: "copy_to_master" | "dont_copy";
    opportunities?: "keep_all" | "keep_master_only" | "keep_highest_value" | "custom_logic";
    opportunities_custom_logic?: {
      operator: "AND" | "OR";
      conditions: Array<{
        id: string;
        field: string;
        operator: string;
        value: string;
        valueType: "static" | "field_reference";
      }>;
    };
  }>({
    notes: "copy_to_master",
    tasks: "copy_to_master",
    opportunities: "keep_all",
  });

  // Strategy settings
  const [overwriteBlanks, setOverwriteBlanks] = useState(false);
  const [fieldPreservationMappings, setFieldPreservationMappings] = useState<FieldPreservationMapping[]>([]);
  const hydratedEditFieldsKeyRef = useRef<string | null>(null);

  // Fetch existing rule when editing
  const { data: existingRule, isLoading: ruleLoading } = useQuery({
    queryKey: ['rule', id, locationId],
    queryFn: () => api.getMatchRule(id!),
    enabled: isEditing && isAuthenticated && !!locationId,
  });

  // Fetch all rules to check for duplicate names
  const { data: allRules } = useQuery({
    queryKey: ['rules', locationId],
    queryFn: () => api.getMatchRules(),
    enabled: isAuthenticated && !!locationId,
    staleTime: 30 * 1000, // Cache for 30 seconds
  });

  // Fetch available objects (standard + custom from GHL)
  const { data: fetchedObjects } = useQuery({
    queryKey: ['availableObjects', locationId],
    queryFn: () => api.getAvailableObjects(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Fetch available fields for selected object type
  const { data: fetchedFields, isLoading: fieldsLoading } = useQuery({
    queryKey: ['fields', objectType, locationId],
    queryFn: () => api.getObjectFields(objectType),
    enabled: !!objectType && isAuthenticated,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Fetch pipelines for pipeline stage dropdown in custom logic
  const { data: pipelines } = useQuery({
    queryKey: ['pipelines', locationId],
    queryFn: () => api.getPipelines(),
    enabled: isAuthenticated, // Fetch for opportunity filters
    staleTime: 5 * 60 * 1000,
  });

  // Build pipeline stage options for custom logic builder
  const pipelineStageOptions = pipelines?.flatMap(pipeline =>
    pipeline.stages.map(stage => ({
      id: stage.id,
      name: `${pipeline.name} → ${stage.name}`,
    }))
  ) || [];

  // GHL Opportunity status options
  const opportunityStatusOptions = [
    { id: "open", name: "Open" },
    { id: "won", name: "Won" },
    { id: "lost", name: "Lost" },
    { id: "abandoned", name: "Abandoned" },
  ];

  const fieldOptions = useMemo(() => {
    // Use fetched fields or fallback to static fields
    const baseFieldOptions: FieldOption[] = fetchedFields?.length
      ? fetchedFields.map((f) => ({
          id: f.id,
          sourceId: f.sourceId,
          name: f.name,
          isCustom: f.isCustom,
          dataType: f.dataType || "TEXT",
          fieldKey: f.fieldKey,
        }))
      : (fallbackFields[objectType] || []).map((f) => ({
          ...f,
          isCustom: false,
          dataType: "TEXT",
          fieldKey: undefined,
        }));

    // Add synthetic fields (derived from other fields)
    const syntheticFields: Array<{ id: string; name: string; isCustom: boolean; dataType: string; insertAfter: string; fieldKey?: string }> = [];
    if (objectType === "contacts" || objectType === "companies") {
      // Add Email Domain field after Email if email exists
      const emailIndex = baseFieldOptions.findIndex((f) => f.id === "email");
      if (emailIndex >= 0) {
        syntheticFields.push({ id: "emailDomain", name: "Email Domain", isCustom: false, dataType: "TEXT", insertAfter: "email" });
      }
    }

    // Insert synthetic fields at appropriate positions
    const mergedFieldOptions = [...baseFieldOptions];
    for (const sf of syntheticFields) {
      const insertIndex = mergedFieldOptions.findIndex((f) => f.id === sf.insertAfter);
      if (insertIndex >= 0) {
        mergedFieldOptions.splice(insertIndex + 1, 0, {
          id: sf.id,
          name: sf.name,
          isCustom: sf.isCustom,
          dataType: sf.dataType,
          fieldKey: sf.fieldKey,
        });
      } else {
        mergedFieldOptions.push({
          id: sf.id,
          name: sf.name,
          isCustom: sf.isCustom,
          dataType: sf.dataType,
          fieldKey: sf.fieldKey,
        });
      }
    }

    return mergedFieldOptions;
  }, [fetchedFields, objectType]);

  // Build object types with tier requirements and availability
  const objectTypes = (fetchedObjects || [
    { id: "contacts", name: "Contacts", standard: true },
  ]).map(obj => {
    // Custom objects require pro tier
    const tier = obj.standard ? (standardObjectTiers[obj.id] || "pro") : "pro";
    return {
      id: obj.id,
      name: obj.name,
      tier,
      available: hasAccess(plan, tier),
      isCustom: !obj.standard,
    };
  });

  // Build frequencies with tier requirements and availability
  const frequencies = frequencyOptions.map(f => ({
    ...f,
    available: hasAccess(plan, f.tier),
  }));

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (rule: Partial<MatchRule>) => api.createMatchRule(rule),
    onSuccess: (data: MatchRule) => {
      console.log('Rule created successfully:', data.id);
      queryClient.invalidateQueries({ queryKey: ['rules'] });

      toast({
        title: "Rule created",
        description: `"${ruleName}" created. Starting scan...`,
      });

      // Navigate to the new rule's detail page with scan=pending param
      // The detail page will auto-trigger the scan
      navigate(`/match-rules/${data.id}?scan=pending`);
    },
    onError: (error: Error) => {
      console.error('Rule creation failed:', error);
      toast({
        title: "Error creating rule",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (rule: Partial<MatchRule>) => api.updateMatchRule(id!, rule),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
      queryClient.invalidateQueries({ queryKey: ['rule', id] });
      toast({
        title: "Rule updated",
        description: `"${ruleName}" has been updated successfully.`,
      });
      navigate(`/match-rules/${id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating rule",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Populate form when editing — everything EXCEPT fields (which depend on fieldOptions)
  useEffect(() => {
    if (!existingRule) return;

    setRuleName(existingRule.name);
    setObjectType(existingRule.source_object); // triggers field query refetch
    setStrategy(existingRule.merge_strategy || "standard");
    setFrequency(existingRule.schedule_frequency || "manual");

    // Load schedule time and day fields
    if (existingRule.schedule_time) {
      setScheduleTime(normalizeHourlyScheduleTime(existingRule.schedule_time));
    }
    if (existingRule.schedule_day) {
      const freq = existingRule.schedule_frequency || "manual";
      if (freq === "weekly" || freq === "biweekly") {
        setScheduleDayOfWeek(existingRule.schedule_day);
      } else if (freq === "monthly") {
        setScheduleDayOfMonth(existingRule.schedule_day);
      }
    }

    // Load related records config from merge_settings
    const mergeSettings = existingRule.merge_settings;
    const relatedRecords = mergeSettings?.related_records;
    if (relatedRecords) {
      setRelatedRecordsConfig({
        notes: relatedRecords.notes || "copy_to_master",
        tasks: relatedRecords.tasks || "copy_to_master",
        opportunities: relatedRecords.opportunities || "keep_all",
        opportunities_custom_logic: relatedRecords.opportunities_custom_logic || undefined,
      });
    }

    // Load strategy settings
    if (mergeSettings?.overwrite_blanks !== undefined) {
      setOverwriteBlanks(mergeSettings.overwrite_blanks);
    }
    if (mergeSettings?.field_preservation?.mappings) {
      setFieldPreservationMappings(mergeSettings.field_preservation.mappings);
    }
  }, [existingRule]);

  // Populate fields only when fieldOptions are loaded for the CORRECT object type.
  // This prevents the race condition where stale contact fieldOptions corrupt
  // opportunity/company/custom object field values during edit hydration.
  useEffect(() => {
    if (!isEditing || !existingRule || fieldOptions.length === 0) return;
    // Don't populate fields until fieldOptions correspond to the rule's object type
    if (objectType !== existingRule.source_object) return;
    const hydrationKey = `${existingRule.id}:${existingRule.source_object}`;
    if (hydratedEditFieldsKeyRef.current === hydrationKey) return;

    setFields(existingRule.match_fields.map((f: MatchField) => {
      const resolved = resolveFieldId(
        normalizeRuleFieldPath(f.field),
        fieldOptions
      );
      const normalizedMatchAgainst = f.match_against
        ? resolveFieldId(normalizeRuleFieldPath(f.match_against), fieldOptions)
        : undefined;
      const fixed = FIXED_ALGORITHM_FIELDS[resolved] || FIXED_ALGORITHM_FIELDS[f.field];
      return {
        name: resolved,
        matchType: fixed ? fixed.algorithm : f.algorithm,
        operator: f.operator || "AND",
        matchAgainst: normalizedMatchAgainst || undefined,
      };
    }));
    hydratedEditFieldsKeyRef.current = hydrationKey;
  }, [isEditing, existingRule, fieldOptions, objectType]);

  const addField = (operator: "AND" | "OR" = "AND") => {
    setFields([...fields, { name: "", matchType: "exact", operator }]);
  };

  const removeField = (index: number) => {
    if (fields.length > 1) {
      setFields(fields.filter((_, i) => i !== index));
    }
  };

  const updateField = (index: number, key: "name" | "matchType" | "operator" | "matchAgainst", value: string) => {
    setFields(prev => {
      const updated = [...prev];
      if (key === "operator") {
        updated[index] = { ...updated[index], [key]: value as "AND" | "OR" };
      } else {
        updated[index] = { ...updated[index], [key]: value };
      }
      return updated;
    });
  };

  // Generate human-readable logic expression
  const getLogicExpression = () => {
    if (fields.length === 0 || !fields[0].name) return "";

    const currentGroup: string[] = [];

    fields.forEach((field, i) => {
      if (!field.name) return;
      const fieldLabel = fieldOptions.find(f => f.id === field.name)?.name || field.name;
      const fixed = FIXED_ALGORITHM_FIELDS[field.name];
      const matchLabel = fixed
        ? fixed.label
        : TEXT_MATCH_TYPES.find(m => m.id === field.matchType)?.name || field.matchType;
      const matchAgainstLabel = field.matchAgainst
        ? fieldOptions.find(f => f.id === field.matchAgainst)?.name || field.matchAgainst
        : null;
      const condition = matchAgainstLabel
        ? `${fieldLabel} vs ${matchAgainstLabel} (${matchLabel})`
        : `${fieldLabel} (${matchLabel})`;

      if (i === 0) {
        currentGroup.push(condition);
      } else {
        const prevOperator = fields[i - 1].operator;
        currentGroup.push(` ${prevOperator} ${condition}`);
      }
    });

    return currentGroup.join("");
  };

  // Check if email domain is the only match condition (not allowed - too broad)
  const isEmailDomainOnly = () => {
    const filledFields = fields.filter(f => f.name);
    return filledFields.length === 1 && filledFields[0].name === "emailDomain";
  };

  // Check if rule name is a duplicate (case-insensitive)
  const isDuplicateName = () => {
    if (!ruleName.trim() || !allRules?.data) return false;
    const normalizedName = ruleName.trim().toLowerCase();
    return allRules.data.some(rule =>
      rule.name.toLowerCase() === normalizedName &&
      rule.id !== id // Exclude current rule when editing
    );
  };

  // Step validation
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!ruleName.trim()) {
          toast({
            title: "Rule name required",
            description: "Please enter a name for your rule.",
            variant: "destructive",
          });
          return false;
        }
        if (isDuplicateName()) {
          toast({
            title: "Rule name already exists",
            description: "Please choose a different name for your rule.",
            variant: "destructive",
          });
          return false;
        }
        return true;
      case 2:
        if (fields.some(f => !f.name)) {
          toast({
            title: "Match conditions incomplete",
            description: "Please select a field for all match conditions.",
            variant: "destructive",
          });
          return false;
        }
        if (isEmailDomainOnly()) {
          toast({
            title: "Email Domain cannot be the only condition",
            description: "Add another field (e.g., Name) to avoid matching all records at the same company.",
            variant: "destructive",
          });
          return false;
        }
        return true;
      case 3:
        return true; // Strategy always has a default
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleStepClick = (stepId: number) => {
    // Only allow going back to previous steps
    if (stepId < currentStep) {
      setCurrentStep(stepId);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Filter out empty field preservation mappings (where source or target is blank)
    const validMappings = fieldPreservationMappings.filter(m => m.source && m.target);

    // Build merge_settings
    const mergeSettings: RuleMergeSettings = {
      overwrite_blanks: overwriteBlanks,
      field_preservation: validMappings.length > 0
        ? { enabled: true, auto_create_fields: false, mappings: validMappings }
        : undefined,
    };
    if (objectType === "contacts") {
      mergeSettings.related_records = relatedRecordsConfig;
    }

    // Build schedule fields based on frequency
    const scheduleTimeValue = frequency !== "manual" ? normalizeHourlyScheduleTime(scheduleTime) : undefined;
    const scheduleDayValue = (frequency === "weekly" || frequency === "biweekly")
      ? scheduleDayOfWeek
      : frequency === "monthly"
        ? scheduleDayOfMonth
        : undefined;

    // Build the rule payload
    const rulePayload: Partial<MatchRule> = {
      name: ruleName,
      source_object: objectType,
      match_fields: fields.map(f => ({
        field: f.name,
        algorithm: f.matchType,
        weight: 1.0,
        operator: f.operator,
        ...(f.matchAgainst ? { match_against: f.matchAgainst } : {}),
      })),
      merge_strategy: strategy,
      schedule_frequency: frequency,
      schedule_time: scheduleTimeValue,
      schedule_day: scheduleDayValue,
      auto_merge_threshold: 95,
      review_threshold: 70,
      is_active: true,
      merge_settings: mergeSettings,
    };

    if (isEditing) {
      updateMutation.mutate(rulePayload);
    } else {
      createMutation.mutate(rulePayload);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (isEditing && ruleLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleCancel = () => {
    navigate(isEditing ? `/match-rules/${id}` : "/");
  };

  const handleFeedbackSubmit = async () => {
    if (!feedbackMessage.trim()) return;
    setFeedbackSending(true);
    try {
      await fetch(
        "https://services.leadconnectorhq.com/hooks/gdzneuvA9mUJoRroCv4O/webhook-trigger/f15fbb6a-b632-4a3a-bfb9-3428a8b42622",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: feedbackMessage,
            locationId: locationId || "",
            ruleName: ruleName || "",
            timestamp: new Date().toISOString(),
          }),
        }
      );
      toast({ title: "Feedback sent", description: "Thanks! We'll review your request." });
      setFeedbackMessage("");
      setFeedbackOpen(false);
    } catch {
      toast({ title: "Failed to send", description: "Please try again later.", variant: "destructive" });
    } finally {
      setFeedbackSending(false);
    }
  };

  // Animation variants for step transitions
  const stepVariants = {
    enter: { opacity: 0, x: 20 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <Link
          to={isEditing ? `/match-rules/${id}` : "/"}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {isEditing ? (existingRule?.name || "Match Rule") : "Dashboard"}
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {isEditing ? "Edit Match Rule" : "Create Match Rule"}
        </h1>
      </div>

      {/* Step Indicator - only show for create mode */}
      {!isEditing && (
        <StepIndicator
          steps={STEPS}
          currentStep={currentStep}
          onStepClick={handleStepClick}
          className="mb-8"
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <AnimatePresence mode="wait">
          {/* Step 1: Basics */}
          {(currentStep === 1 || isEditing) && (
            <motion.div
              key="step1"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Rule Name */}
              <Card>
                <CardHeader className="bg-muted/30 border-b">
                  <CardTitle className="text-lg font-bold">Rule Name</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <Input
                      placeholder="e.g., Email + Phone Match"
                      value={ruleName}
                      onChange={(e) => setRuleName(e.target.value.slice(0, 100))}
                      className={`text-lg ${isDuplicateName() ? "border-destructive focus-visible:ring-destructive" : ""}`}
                      maxLength={100}
                      autoFocus
                    />
                    <div className="flex justify-between items-center">
                      {isDuplicateName() ? (
                        <p className="text-sm text-destructive">
                          A rule with this name already exists
                        </p>
                      ) : (
                        <span />
                      )}
                      <p className="text-sm text-muted-foreground">
                        {ruleName.length}/100
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Object Type */}
              <Card>
                <CardHeader className="bg-muted/30 border-b">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    Object Type
                    {isEditing && (
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 text-sm text-muted-foreground font-normal hover:text-foreground transition-colors cursor-help"
                            onClick={(e) => e.preventDefault()}
                          >
                            <Lock className="h-4 w-4" />
                            Locked
                            <Info className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Object type cannot be changed. Create a new rule for a different object.</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {isEditing ? (
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {objectTypes.find(o => o.id === objectType)?.name || objectType}
                      </span>
                    </div>
                  ) : (
                    <Select value={objectType} onValueChange={(val) => {
                      const selected = objectTypes.find(o => o.id === val);
                      if (selected?.available) {
                        setObjectType(val);
                        // Reset fields when object type changes since fields are different
                        setFields([{ name: "", matchType: "exact", operator: "AND" }]);
                      }
                    }}>
                      <SelectTrigger className="w-full sm:w-[280px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Standard Objects */}
                        {objectTypes.filter(o => !o.isCustom).map((obj) => {
                          const featureMap: Record<string, "company_matching" | "opportunities_matching"> = {
                            companies: "company_matching",
                            opportunities: "opportunities_matching",
                          };
                          const feature = featureMap[obj.id];

                          return (
                            <SelectItem
                              key={obj.id}
                              value={obj.id}
                              disabled={!obj.available}
                            >
                              <span className="flex items-center gap-2">
                                <span className={!obj.available ? "opacity-50" : ""}>{obj.name}</span>
                                {!obj.available && (
                                  <>
                                    <Lock className="h-3 w-3 text-muted-foreground" />
                                    <span className="pointer-events-auto">
                                      <UpgradeBadge
                                        tier={obj.tier}
                                        size="sm"
                                        showTooltip={false}
                                        feature={feature}
                                      />
                                    </span>
                                  </>
                                )}
                              </span>
                            </SelectItem>
                          );
                        })}

                        {/* Custom Objects Section - always show */}
                        <SelectSeparator />
                        <SelectGroup>
                          <SelectLabel className="flex items-center gap-2">
                            Custom Objects
                            {!hasAccess(plan, "pro") && (
                              <UpgradeBadge tier="pro" size="sm" showTooltip={false} feature="custom_objects" />
                            )}
                          </SelectLabel>
                          {objectTypes.filter(o => o.isCustom).length > 0 ? (
                            objectTypes.filter(o => o.isCustom).map((obj) => (
                              <SelectItem
                                key={obj.id}
                                value={obj.id}
                                disabled={!obj.available}
                              >
                                <span className="flex items-center gap-2">
                                  <span className={!obj.available ? "opacity-50" : ""}>{obj.name}</span>
                                  {!obj.available && (
                                    <Lock className="h-3 w-3 text-muted-foreground" />
                                  )}
                                </span>
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="_none_" disabled className="text-xs text-muted-foreground italic">
                              No custom objects in this location
                            </SelectItem>
                          )}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Match Conditions */}
          {(currentStep === 2 || isEditing) && (
            <motion.div
              key="step2"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              <Card>
                <CardHeader className="bg-muted/30 border-b">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg font-bold">Match Conditions</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Define which fields to compare and how they should be combined
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-xs text-muted-foreground hover:text-foreground gap-1.5 shrink-0"
                      onClick={() => setFeedbackOpen(true)}
                    >
                      <HelpCircle className="h-4 w-4" />
                      Need help?
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-6">
                  {fields.map((field, index) => (
                    <div key={index} className="space-y-3">
                      {/* Condition Row */}
                      <div className="p-4 rounded-lg border bg-muted/40 hover:bg-muted/50 transition-colors space-y-2">
                        <div className="flex gap-2 items-center">
                          <div className="flex-1 min-w-0">
                            <Select
                              value={field.name}
                              onValueChange={(val) => {
                                const selectedField = fieldOptions.find(f => f.id === val);
                                // Check if custom field and user doesn't have access
                                if (selectedField?.isCustom && !hasAccess(plan, "starter")) {
                                  return;
                                }
                                updateField(index, "name", val);
                                // Auto-assign algorithm for fixed fields, reset for text fields
                                const fixed = FIXED_ALGORITHM_FIELDS[val];
                                if (fixed) {
                                  updateField(index, "matchType", fixed.algorithm);
                                } else if (!TEXT_MATCH_TYPES.some(mt => mt.id === field.matchType)) {
                                  updateField(index, "matchType", "exact");
                                }
                              }}
                              disabled={fieldsLoading}
                            >
                              <SelectTrigger className="bg-background">
                                <SelectValue placeholder={fieldsLoading ? "Loading fields..." : "Select field..."} />
                              </SelectTrigger>
                              <SelectContent>
                                {/* Standard Fields */}
                                {fieldOptions.filter(f => !f.isCustom).map((opt) => (
                                  <SelectItem key={opt.id} value={opt.id}>
                                    {opt.name}
                                  </SelectItem>
                                ))}

                                {/* Custom Fields Section */}
                                {fieldOptions.some(f => f.isCustom) && (
                                  <>
                                    <SelectSeparator />
                                    <SelectGroup>
                                      <SelectLabel className="flex items-center gap-2">
                                        Custom Fields
                                        {!hasAccess(plan, "starter") && (
                                          <UpgradeBadge tier="starter" size="sm" showTooltip={false} feature="custom_fields" />
                                        )}
                                      </SelectLabel>
                                      {fieldOptions.filter(f => f.isCustom).map((opt) => {
                                        const hasCustomFieldAccess = hasAccess(plan, "starter");
                                        return (
                                          <SelectItem
                                            key={opt.id}
                                            value={opt.id}
                                            disabled={!hasCustomFieldAccess}
                                          >
                                            <span className="flex items-center gap-2">
                                              <span className={!hasCustomFieldAccess ? "opacity-50" : ""}>{opt.name}</span>
                                              {!hasCustomFieldAccess && (
                                                <Lock className="h-3 w-3 text-muted-foreground" />
                                              )}
                                            </span>
                                          </SelectItem>
                                        );
                                      })}
                                    </SelectGroup>
                                  </>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          {/* Algorithm selector — hidden for fixed-algorithm fields */}
                          <div className="flex-1 min-w-0">
                            {field.name && isFixedAlgorithmField(field.name) ? (
                              <div className="flex items-center gap-2 h-10 px-3 rounded-md border bg-muted/50 text-sm">
                                <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span className="text-muted-foreground">{FIXED_ALGORITHM_FIELDS[field.name].label}</span>
                              </div>
                            ) : (
                              <Select
                                value={field.matchType}
                                onValueChange={(val) => updateField(index, "matchType", val)}
                              >
                                <SelectTrigger className="bg-background">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {TEXT_MATCH_TYPES.map((opt) => (
                                    <SelectItem key={opt.id} value={opt.id}>
                                      {opt.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeField(index)}
                            disabled={fields.length === 1}
                            className="shrink-0"
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                        {/* Cross-field matching */}
                        {field.name && (
                          <div className="pl-1">
                            {field.matchAgainst ? (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground whitespace-nowrap">vs.</span>
                                <Select
                                  value={field.matchAgainst}
                                  onValueChange={(val) => updateField(index, "matchAgainst", val)}
                                >
                                  <SelectTrigger className="h-8 text-xs bg-background">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {fieldOptions.filter(f => f.id !== field.name).map(opt => (
                                      <SelectItem key={opt.id} value={opt.id}>
                                        {opt.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 shrink-0"
                                  onClick={() => updateField(index, "matchAgainst", "")}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <Tooltip delayDuration={0}>
                                <TooltipTrigger asChild>
                                  <button
                                    type="button"
                                    className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
                                    onClick={() => {
                                      const firstOther = fieldOptions.find(f => f.id !== field.name);
                                      if (firstOther) updateField(index, "matchAgainst", firstOther.id);
                                    }}
                                  >
                                    Match against a different field
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="max-w-xs">
                                  Compare this field's value against a different field on the other record. Useful for matching custom fields like "Phone 2" against the standard "Phone" field.
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Operator Row - shown after each condition except the last */}
                      {index < fields.length - 1 && (
                        <div className="flex items-center gap-2 pl-4">
                          <div className="flex gap-1 bg-muted rounded-md p-1">
                            <Button
                              type="button"
                              size="sm"
                              variant={field.operator === "AND" ? "default" : "ghost"}
                              className="h-7 px-3 text-xs font-semibold"
                              onClick={() => updateField(index, "operator", "AND")}
                            >
                              AND
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant={field.operator === "OR" ? "default" : "ghost"}
                              className="h-7 px-3 text-xs font-semibold"
                              onClick={() => updateField(index, "operator", "OR")}
                            >
                              OR
                            </Button>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {field.operator === "AND" ? "Both must match" : "Either can match"}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Add Condition Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addField("AND")}
                    >
                      <Plus className="mr-1 h-4 w-4" />
                      Add AND condition
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addField("OR")}
                    >
                      <Plus className="mr-1 h-4 w-4" />
                      Add OR condition
                    </Button>
                  </div>

                  {/* Logic Preview */}
                  {fields.length > 0 && fields[0].name && (
                    <div className="mt-4 p-4 bg-primary/8 border-l-4 border-l-primary rounded-lg">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Match Logic Preview</p>
                      <p className="text-sm font-mono">
                        {getLogicExpression()}
                      </p>
                    </div>
                  )}

                  {/* Email Domain Only Warning */}
                  {isEmailDomainOnly() && (
                    <div className="mt-4 p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-3">
                      <Info className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-destructive">Email Domain alone is too broad</p>
                        <p className="text-sm text-destructive/80 mt-1">
                          Add another condition (e.g., Name) to avoid matching all records at the same company.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Strategy & Schedule */}
          {(currentStep === 3 || isEditing) && (
            <motion.div
              key="step3"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Merge Strategy */}
              <Card>
                <CardHeader className="bg-muted/30 border-b">
                  <CardTitle className="text-lg font-bold">Merge Strategy</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Define how duplicate records should be merged
                  </p>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  {/* Prebuilt Strategies */}
                  <div className="space-y-2">
                    <Label>Prebuilt Strategies</Label>
                    <div className="grid gap-2">
                      {strategies.map((s) => (
                        <div
                          key={s.id}
                          onClick={() => setStrategy(s.id)}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            strategy === s.id
                              ? "border-primary bg-primary/8 shadow-md"
                              : "border-muted hover:border-muted-foreground/50 hover:bg-muted/40 hover:shadow-sm"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">{s.name}</span>
                            {strategy === s.id && (
                              <span className="text-xs text-primary font-semibold">Selected</span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{s.description}</p>

                          {/* Expanded settings for selected strategy */}
                          {strategy === s.id && (
                            <div className="mt-4 space-y-4" onClick={(e) => e.stopPropagation()}>
                              {/* Field Merge Rules */}
                              <div className="p-4 rounded-lg border bg-background">
                                <h4 className="text-sm font-semibold mb-3">Field Merge Rules</h4>
                                <div className="flex items-center justify-between">
                                  <div>
                                    <Label htmlFor="overwrite-blanks" className="text-sm font-medium cursor-pointer">
                                      Overwrite with blank values
                                    </Label>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      When enabled, blank values from the winning record will replace non-blank values
                                    </p>
                                  </div>
                                  <Switch
                                    id="overwrite-blanks"
                                    checked={overwriteBlanks}
                                    onCheckedChange={setOverwriteBlanks}
                                  />
                                </div>
                              </div>

                              {/* Field Value Preservation */}
                              {hasFieldPreservation ? (
                              <div className="p-4 rounded-lg border bg-background">
                                <h4 className="text-sm font-semibold mb-1">Field Value Preservation</h4>
                                <p className="text-xs text-muted-foreground mb-3">
                                  Save the duplicate's value to a custom field before it's overwritten.
                                </p>

                                {fieldPreservationMappings.map((mapping, idx) => {
                                  // Filter out synthetic fields (like emailDomain) that aren't real GHL fields
                                  const preservableFields = fieldOptions.filter(f => f.id !== 'emailDomain');

                                  // Get source field's data type for compatibility check
                                  const sourceField = preservableFields.find(f => f.id === mapping.source);
                                  const sourceType = sourceField?.dataType || 'TEXT';

                                  // All fields except the selected source can be targets
                                  const targetFields = preservableFields.filter(f => f.id !== mapping.source);

                                  const compatibleTargets = targetFields.filter(f =>
                                    isTypeCompatible(sourceType, f.dataType || 'TEXT')
                                  );
                                  const incompatibleTargets = targetFields.filter(f =>
                                    !isTypeCompatible(sourceType, f.dataType || 'TEXT')
                                  );

                                  return (
                                  <div key={idx} className="flex items-center gap-2 mb-2">
                                    <Select
                                      value={mapping.source}
                                      onValueChange={(val) => {
                                        const updated = [...fieldPreservationMappings];
                                        updated[idx] = { ...updated[idx], source: val };
                                        // Clear target if now incompatible or same as source
                                        const newSourceField = preservableFields.find(f => f.id === val);
                                        const newSourceType = newSourceField?.dataType || 'TEXT';
                                        const currentTarget = preservableFields.find(f => f.id === mapping.target);
                                        if (currentTarget && (mapping.target === val || !isTypeCompatible(newSourceType, currentTarget.dataType || 'TEXT'))) {
                                          updated[idx].target = '';
                                        }
                                        setFieldPreservationMappings(updated);
                                      }}
                                    >
                                      <SelectTrigger className="flex-1 bg-background">
                                        <SelectValue placeholder="Source field..." />
                                      </SelectTrigger>
                                      <SelectContent>
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

                                    <Select
                                      value={mapping.target}
                                      onValueChange={(val) => {
                                        const updated = [...fieldPreservationMappings];
                                        updated[idx] = { ...updated[idx], target: val };
                                        setFieldPreservationMappings(updated);
                                      }}
                                    >
                                      <SelectTrigger className="flex-1 bg-background">
                                        <SelectValue placeholder="Target custom field..." />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {/* Compatible fields */}
                                        {compatibleTargets.map((opt) => (
                                          <SelectItem key={opt.id} value={opt.id}>
                                            {opt.name}
                                          </SelectItem>
                                        ))}

                                        {/* Incompatible fields */}
                                        {incompatibleTargets.length > 0 && (
                                          <>
                                            <SelectSeparator />
                                            <SelectItem value="_sep_" disabled className="text-muted-foreground text-xs">
                                              ── Incompatible types ──
                                            </SelectItem>
                                            {incompatibleTargets.map((opt) => (
                                              <SelectItem key={opt.id} value={opt.id} disabled className="text-muted-foreground">
                                                {opt.name} ({opt.dataType}) - {getIncompatibilityReason(opt.dataType)}
                                              </SelectItem>
                                            ))}
                                          </>
                                        )}

                                        {/* Empty state */}
                                        {compatibleTargets.length === 0 && incompatibleTargets.length === 0 && (
                                          <SelectItem value="_none_" disabled className="text-muted-foreground text-xs italic">
                                            No available target fields
                                          </SelectItem>
                                        )}
                                      </SelectContent>
                                    </Select>

                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="shrink-0"
                                      onClick={() => {
                                        setFieldPreservationMappings(
                                          fieldPreservationMappings.filter((_, i) => i !== idx)
                                        );
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                  </div>
                                  );
                                })}

                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setFieldPreservationMappings([
                                      ...fieldPreservationMappings,
                                      { source: "", target: "" },
                                    ]);
                                  }}
                                >
                                  <Plus className="mr-1 h-4 w-4" />
                                  Add field mapping
                                </Button>
                              </div>
                              ) : (
                              <LockedFeatureOverlay tier="pro" feature="field_preservation">
                                <div className="p-4 rounded-lg border bg-background">
                                  <h4 className="text-sm font-semibold mb-1">Field Value Preservation</h4>
                                  <p className="text-xs text-muted-foreground mb-3">
                                    Save the duplicate's value to another field before it's overwritten.
                                  </p>
                                  <div className="h-16" />
                                </div>
                              </LockedFeatureOverlay>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Related Records - Only show for contacts */}
              {objectType === "contacts" && (
                <Card>
                  <CardHeader className="bg-muted/30 border-b">
                    <CardTitle className="text-lg font-bold">Related Records</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      How should associated records be handled during merge?
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    {/* Notes */}
                    <div className="space-y-2">
                      <Label>Notes</Label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="notes"
                            checked={relatedRecordsConfig.notes === "copy_to_master"}
                            onChange={() => setRelatedRecordsConfig(prev => ({ ...prev, notes: "copy_to_master" }))}
                            className="h-4 w-4"
                          />
                          <span className="text-sm">Copy all to master</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="notes"
                            checked={relatedRecordsConfig.notes === "dont_copy"}
                            onChange={() => setRelatedRecordsConfig(prev => ({ ...prev, notes: "dont_copy" }))}
                            className="h-4 w-4"
                          />
                          <span className="text-sm">Don't copy</span>
                        </label>
                      </div>
                    </div>

                    {/* Tasks */}
                    <div className="space-y-2">
                      <Label>Tasks</Label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="tasks"
                            checked={relatedRecordsConfig.tasks === "copy_to_master"}
                            onChange={() => setRelatedRecordsConfig(prev => ({ ...prev, tasks: "copy_to_master" }))}
                            className="h-4 w-4"
                          />
                          <span className="text-sm">Copy all to master</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="tasks"
                            checked={relatedRecordsConfig.tasks === "dont_copy"}
                            onChange={() => setRelatedRecordsConfig(prev => ({ ...prev, tasks: "dont_copy" }))}
                            className="h-4 w-4"
                          />
                          <span className="text-sm">Don't copy</span>
                        </label>
                      </div>
                    </div>

                    {/* Opportunities */}
                    <div className="space-y-2">
                      <Label>Opportunities</Label>
                      <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="opportunities"
                            checked={relatedRecordsConfig.opportunities === "keep_all"}
                            onChange={() => setRelatedRecordsConfig(prev => ({ ...prev, opportunities: "keep_all" }))}
                            className="h-4 w-4"
                          />
                          <span className="text-sm">Keep all from both records</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="opportunities"
                            checked={relatedRecordsConfig.opportunities === "keep_master_only"}
                            onChange={() => setRelatedRecordsConfig(prev => ({ ...prev, opportunities: "keep_master_only" }))}
                            className="h-4 w-4"
                          />
                          <span className="text-sm">Keep from master only</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="opportunities"
                            checked={relatedRecordsConfig.opportunities === "keep_highest_value"}
                            onChange={() => setRelatedRecordsConfig(prev => ({ ...prev, opportunities: "keep_highest_value" }))}
                            className="h-4 w-4"
                          />
                          <span className="text-sm">Keep highest monetary value</span>
                        </label>
                        <label className={`flex items-center gap-2 ${hasAccess(plan, "pro") ? "cursor-pointer" : "cursor-not-allowed"}`}>
                          <input
                            type="radio"
                            name="opportunities"
                            checked={relatedRecordsConfig.opportunities === "custom_logic"}
                            onChange={() => {
                              if (!hasAccess(plan, "pro")) return;
                              setRelatedRecordsConfig(prev => ({
                                ...prev,
                                opportunities: "custom_logic",
                                opportunities_custom_logic: prev.opportunities_custom_logic || createEmptyLogicConfig(),
                              }));
                            }}
                            disabled={!hasAccess(plan, "pro")}
                            className="h-4 w-4"
                          />
                          <span className={`text-sm ${!hasAccess(plan, "pro") ? "opacity-50" : ""}`}>Custom logic (filter by conditions)</span>
                          {!hasAccess(plan, "pro") && (
                            <UpgradeBadge tier="pro" size="sm" showTooltip={false} feature="custom_logic" />
                          )}
                        </label>
                      </div>

                      {/* Custom Logic Builder */}
                      {relatedRecordsConfig.opportunities === "custom_logic" && (
                        <div className="mt-3 p-3 border rounded-lg bg-muted/20">
                          <CustomLogicBuilder
                            value={relatedRecordsConfig.opportunities_custom_logic || createEmptyLogicConfig()}
                            onChange={(config) => setRelatedRecordsConfig(prev => ({
                              ...prev,
                              opportunities_custom_logic: config,
                            }))}
                            availableFields={[
                              { id: "monetaryValue", name: "Monetary Value", dataType: "number" },
                              { id: "status", name: "Status", dataType: "select" },
                              { id: "name", name: "Name", dataType: "text" },
                              { id: "pipelineStageId", name: "Pipeline Stage", dataType: "select" },
                            ]}
                            objectLabel="opportunity"
                            fieldValueOptions={{
                              status: opportunityStatusOptions,
                            }}
                            pipelines={pipelines || []}
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Schedule */}
              <Card>
                <CardHeader className="bg-muted/30 border-b">
                  <CardTitle className="text-lg font-bold">Schedule</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Configure when this rule automatically scans for duplicates
                  </p>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  {/* Frequency Selection */}
                  <div className="space-y-2">
                    <Label>Frequency</Label>
                    <Select
                      value={frequency}
                      onValueChange={(val) => {
                        const selected = frequencies.find(f => f.id === val);
                        if (selected?.available) {
                          setFrequency(val);
                        } else {
                          toast({
                            title: "Upgrade Required",
                            description: "Scheduled scans require Pro plan or higher.",
                          });
                        }
                      }}
                    >
                      <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {frequencies.map((f) => (
                          <SelectItem
                            key={f.id}
                            value={f.id}
                            disabled={!f.available}
                            className={!f.available ? "opacity-60" : ""}
                          >
                            <span className="flex items-center gap-2">
                              {f.name}
                              {!f.available && (
                                <UpgradeBadge 
                                  tier={f.tier} 
                                  size="sm" 
                                  feature="scheduled_scans"
                                  showTooltip={false}
                                />
                              )}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Time Selection - shown for all scheduled options */}
                  {frequency !== "manual" && (
                    <div className="space-y-2">
                      <Label>Time</Label>
                      <Select value={scheduleTime} onValueChange={setScheduleTime}>
                        <SelectTrigger className="w-full sm:w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          {timeOptions.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Day of Week - shown for weekly/biweekly */}
                  {(frequency === "weekly" || frequency === "biweekly") && (
                    <div className="space-y-2">
                      <Label>Day of Week</Label>
                      <Select value={scheduleDayOfWeek} onValueChange={setScheduleDayOfWeek}>
                        <SelectTrigger className="w-full sm:w-[160px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {daysOfWeek.map((d) => (
                            <SelectItem key={d.id} value={d.id}>
                              {d.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Day of Month - shown for monthly */}
                  {frequency === "monthly" && (
                    <div className="space-y-2">
                      <Label>Day of Month</Label>
                      <Select value={scheduleDayOfMonth} onValueChange={setScheduleDayOfMonth}>
                        <SelectTrigger className="w-full sm:w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          {daysOfMonth.map((d) => (
                            <SelectItem key={d.id} value={d.id}>
                              {d.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Schedule Preview */}
                  {frequency !== "manual" && (
                    <div className="p-4 bg-muted/40 rounded-lg border-l-4 border-l-primary">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Schedule Preview</p>
                      <p className="font-medium">
                        {frequency === "daily" && `Every day at ${getScheduleTimeLabel(scheduleTime)}`}
                        {frequency === "weekly" && `Every ${daysOfWeek.find(d => d.id === scheduleDayOfWeek)?.name} at ${getScheduleTimeLabel(scheduleTime)}`}
                        {frequency === "biweekly" && `Every other ${daysOfWeek.find(d => d.id === scheduleDayOfWeek)?.name} at ${getScheduleTimeLabel(scheduleTime)}`}
                        {frequency === "monthly" && `${daysOfMonth.find(d => d.id === scheduleDayOfMonth)?.name} of each month at ${getScheduleTimeLabel(scheduleTime)}`}
                      </p>
                    </div>
                  )}

                  {/* Tier Gate Note */}
                  {frequency !== "manual" && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Info className="h-4 w-4 text-warning" />
                      Scheduled scans require Pro plan or higher.
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && !isEditing && (
            <motion.div
              key="step4"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              <Card>
                <CardHeader className="bg-muted/30 border-b">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" />
                    Review Your Rule
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Confirm your settings before creating the rule
                  </p>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {/* Summary Grid */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="p-4 bg-muted/40 rounded-lg">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Rule Name</p>
                      <p className="font-semibold text-lg">{ruleName}</p>
                    </div>
                    <div className="p-4 bg-muted/40 rounded-lg">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Object Type</p>
                      <p className="font-semibold text-lg">{objectTypes.find(o => o.id === objectType)?.name}</p>
                    </div>
                  </div>

                  {/* Match Logic */}
                  <div className="p-4 bg-primary/8 border-l-4 border-l-primary rounded-lg">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Match Logic</p>
                    <p className="font-mono text-sm">{getLogicExpression() || "No conditions set"}</p>
                  </div>

                  {/* Strategy & Schedule */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="p-4 bg-muted/40 rounded-lg">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Merge Strategy</p>
                      <p className="font-semibold">{strategies.find(s => s.id === strategy)?.name}</p>
                      <p className="text-sm text-muted-foreground">{strategies.find(s => s.id === strategy)?.description}</p>
                    </div>
                    <div className="p-4 bg-muted/40 rounded-lg">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Schedule</p>
                      <p className="font-semibold">{frequencies.find(f => f.id === frequency)?.name}</p>
                      {frequency !== "manual" && (
                        <p className="text-sm text-muted-foreground">
                          {frequency === "daily" && `Every day at ${getScheduleTimeLabel(scheduleTime)}`}
                          {frequency === "weekly" && `Every ${daysOfWeek.find(d => d.id === scheduleDayOfWeek)?.name}`}
                          {frequency === "biweekly" && `Every other ${daysOfWeek.find(d => d.id === scheduleDayOfWeek)?.name}`}
                          {frequency === "monthly" && `${daysOfMonth.find(d => d.id === scheduleDayOfMonth)?.name} of each month`}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Related Records Summary - Only for contacts */}
                  {objectType === "contacts" && (
                    <div className="p-4 bg-muted/40 rounded-lg">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Related Records</p>
                      <div className="grid gap-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Notes:</span>
                          <span className="font-medium">{relatedRecordsConfig.notes === "copy_to_master" ? "Copy to master" : "Don't copy"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tasks:</span>
                          <span className="font-medium">{relatedRecordsConfig.tasks === "copy_to_master" ? "Copy to master" : "Don't copy"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Opportunities:</span>
                          <span className="font-medium">
                            {relatedRecordsConfig.opportunities === "keep_all" && "Keep all"}
                            {relatedRecordsConfig.opportunities === "keep_master_only" && "Keep master only"}
                            {relatedRecordsConfig.opportunities === "keep_highest_value" && "Keep highest value"}
                            {relatedRecordsConfig.opportunities === "custom_logic" && "Custom logic"}
                          </span>
                        </div>
                        {relatedRecordsConfig.opportunities === "custom_logic" && relatedRecordsConfig.opportunities_custom_logic?.conditions?.length > 0 && (
                          <div className="mt-1 pl-2 text-xs text-muted-foreground font-mono">
                            {relatedRecordsConfig.opportunities_custom_logic.conditions.map((c, i) => (
                              <span key={c.id}>
                                {i > 0 && ` ${relatedRecordsConfig.opportunities_custom_logic?.operator} `}
                                {c.field} {c.operator} {c.value ? `"${c.value}"` : ""}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Info Box */}
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900 dark:text-blue-100">What happens next?</p>
                      <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                        After you create this rule, we'll automatically scan your {objectTypes.find(o => o.id === objectType)?.name?.toLowerCase()} for duplicates. 
                        You'll be able to review matches before merging.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Actions */}
        <div className={`pt-6 mt-6 border-t-2 border-t-muted ${currentStep === 4 && !isEditing ? "flex flex-col items-center gap-4" : "flex justify-between items-center"}`}>
          {isEditing ? (
            <>
              <Button type="button" variant="outline" onClick={handleCancel} disabled={isSaving}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </>
          ) : currentStep === 4 ? (
            /* Final step - prominent centered CTA */
            <>
              <Button
                type="submit"
                size="lg"
                className="w-full max-w-md text-lg py-6"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating & Scanning...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-5 w-5" />
                    Create Rule & Scan for Duplicates
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={handlePrevious}
                disabled={isSaving}
                className="text-muted-foreground"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to edit
              </Button>
            </>
          ) : (
            /* Steps 1-3 - standard navigation */
            <>
              <Button
                type="button"
                variant="outline"
                onClick={currentStep === 1 ? handleCancel : handlePrevious}
                disabled={isSaving}
              >
                {currentStep === 1 ? "Cancel" : (
                  <>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </>
                )}
              </Button>
              <Button
                type="button"
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && (isDuplicateName() || !ruleName.trim())) ||
                  (currentStep === 2 && isEmailDomainOnly())
                }
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </form>

      {/* Feedback Dialog */}
      <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Custom Match Logic</DialogTitle>
            <DialogDescription>
              Tell us what matching logic you need and we'll review your request.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Describe the matching logic you need..."
            value={feedbackMessage}
            onChange={(e) => setFeedbackMessage(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeedbackOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleFeedbackSubmit} disabled={feedbackSending || !feedbackMessage.trim()}>
              {feedbackSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
