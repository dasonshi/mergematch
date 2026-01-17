import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Lock, Info, Loader2, ArrowRight, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
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
import { StepIndicator } from "@/components/ui/step-indicator";
import { UpgradeBadge } from "@/components/ui/upgrade-badge";
import { CustomLogicBuilder, CustomLogicConfig, createEmptyLogicConfig } from "@/components/ui/custom-logic-builder";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, MatchRule, MatchField, ObjectField, RuleMergeSettings } from "@/lib/api";
import { useLocation } from "@/contexts/LocationContext";

// Standard object types with tier requirements
const standardObjectTiers: Record<string, string> = {
  contacts: "free",
  companies: "starter",
  opportunities: "pro",
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
    { id: "phone", name: "Phone" },
    { id: "firstName", name: "First Name" },
    { id: "lastName", name: "Last Name" },
  ],
  companies: [
    { id: "name", name: "Company Name" },
    { id: "email", name: "Email" },
    { id: "phone", name: "Phone" },
  ],
};

const matchTypes = [
  { id: "exact", name: "Exact Match" },
  { id: "fuzzy", name: "Fuzzy Match (85%)" },
  { id: "fuzzy90", name: "Fuzzy Match (90%)" },
];

const strategies = [
  { id: "standard", name: "Standard Contact Merge", description: "Keep most complete record, prefer master values", prebuilt: true },
  { id: "recent", name: "Most Recent Wins", description: "Keep most recently updated values", prebuilt: true },
  { id: "oldest", name: "Original Record Priority", description: "Prefer oldest/original record data", prebuilt: true },
  { id: "manual", name: "Manual Review Required", description: "Require manual selection for every field", prebuilt: true },
];

const frequencies = [
  { id: "manual", name: "Manual only", tier: "free", available: true },
  { id: "daily", name: "Daily", tier: "starter", available: false },
  { id: "weekly", name: "Weekly", tier: "starter", available: false },
  { id: "biweekly", name: "Every 2 weeks", tier: "starter", available: false },
  { id: "monthly", name: "Monthly", tier: "starter", available: false },
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

// Generate time options in 30-min increments
const timeOptions = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? "00" : "30";
  const ampm = hour < 12 ? "AM" : "PM";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return {
    id: `${hour.toString().padStart(2, "0")}:${minute}`,
    name: `${displayHour}:${minute} ${ampm}`,
  };
});

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

  // Wizard step state
  const [currentStep, setCurrentStep] = useState(1);

  const [ruleName, setRuleName] = useState("");
  const [objectType, setObjectType] = useState("contacts");
  const [fields, setFields] = useState<{ name: string; matchType: string; operator: "AND" | "OR" }[]>([
    { name: "", matchType: "exact", operator: "AND" },
  ]);
  const [strategy, setStrategy] = useState("standard");
  const [frequency, setFrequency] = useState("manual");
  const [scheduleTime, setScheduleTime] = useState("06:00");
  const [scheduleDayOfWeek, setScheduleDayOfWeek] = useState("1"); // Monday
  const [scheduleDayOfMonth, setScheduleDayOfMonth] = useState("1"); // 1st

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

  // Fetch existing rule when editing
  const { data: existingRule, isLoading: ruleLoading } = useQuery({
    queryKey: ['rule', id],
    queryFn: () => api.getMatchRule(id!),
    enabled: isEditing && isAuthenticated && !!locationId,
  });

  // Fetch available objects (standard + custom from GHL)
  const { data: fetchedObjects } = useQuery({
    queryKey: ['available-objects'],
    queryFn: () => api.getAvailableObjects(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Fetch available fields for selected object type
  const { data: fetchedFields, isLoading: fieldsLoading } = useQuery({
    queryKey: ['object-fields', objectType],
    queryFn: () => api.getObjectFields(objectType),
    enabled: !!objectType && isAuthenticated,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Use fetched fields or fallback to static fields
  const fieldOptions = fetchedFields?.length
    ? fetchedFields.map(f => ({ id: f.id, name: f.name, isCustom: f.isCustom }))
    : (fallbackFields[objectType] || []).map(f => ({ ...f, isCustom: false }));

  // Build object types with tier requirements and availability
  const objectTypes = (fetchedObjects || [
    { id: "contacts", name: "Contacts", standard: true },
    { id: "companies", name: "Companies", standard: true },
    { id: "opportunities", name: "Opportunities", standard: true },
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

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (rule: Partial<MatchRule>) => api.createMatchRule(rule),
    onSuccess: (data: MatchRule & { initial_scan?: { matches_found: number; records_scanned: number } }) => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });

      // Build description with scan results
      let description = `"${ruleName}" has been created successfully.`;
      if (data.initial_scan) {
        const { matches_found, records_scanned } = data.initial_scan;
        description = `"${ruleName}" created. Scanned ${records_scanned.toLocaleString()} records, found ${matches_found} potential duplicate${matches_found !== 1 ? 's' : ''}.`;
      }

      toast({
        title: "Rule created",
        description,
      });
      navigate("/");
    },
    onError: (error: Error) => {
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

  // Populate form when editing
  useEffect(() => {
    if (existingRule) {
      setRuleName(existingRule.name);
      setObjectType(existingRule.source_object);
      setFields(existingRule.match_fields.map((f: MatchField) => ({
        name: f.field,
        matchType: f.algorithm,
        operator: f.operator || "AND"
      })));
      setStrategy(existingRule.merge_strategy || "standard");
      setFrequency(existingRule.schedule_frequency || "manual");

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
    }
  }, [existingRule]);

  const addField = (operator: "AND" | "OR" = "AND") => {
    setFields([...fields, { name: "", matchType: "exact", operator }]);
  };

  const removeField = (index: number) => {
    if (fields.length > 1) {
      setFields(fields.filter((_, i) => i !== index));
    }
  };

  const updateField = (index: number, key: "name" | "matchType" | "operator", value: string) => {
    const updated = [...fields];
    (updated[index] as any)[key] = value;
    setFields(updated);
  };

  // Generate human-readable logic expression
  const getLogicExpression = () => {
    if (fields.length === 0 || !fields[0].name) return "";

    let currentGroup: string[] = [];

    fields.forEach((field, i) => {
      if (!field.name) return;
      const fieldLabel = fieldOptions.find(f => f.id === field.name)?.name || field.name;
      const matchLabel = matchTypes.find(m => m.id === field.matchType)?.name || field.matchType;
      const condition = `${fieldLabel} (${matchLabel})`;

      if (i === 0) {
        currentGroup.push(condition);
      } else {
        const prevOperator = fields[i - 1].operator;
        currentGroup.push(` ${prevOperator} ${condition}`);
      }
    });

    return currentGroup.join("");
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

    // Build merge_settings with related records config (for contacts)
    const mergeSettings: RuleMergeSettings = {};
    if (objectType === "contacts") {
      mergeSettings.related_records = relatedRecordsConfig;
    }

    // Build the rule payload
    const rulePayload: Partial<MatchRule> = {
      name: ruleName,
      source_object: objectType,
      match_fields: fields.map(f => ({
        field: f.name,
        algorithm: f.matchType,
        weight: 1.0,
        operator: f.operator,
      })),
      merge_strategy: strategy,
      schedule_frequency: frequency,
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
              <Card className="shadow-md">
                <CardHeader className="bg-muted/30 border-b">
                  <CardTitle className="text-lg font-bold">Rule Name</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <Input
                      placeholder="e.g., Email + Phone Match"
                      value={ruleName}
                      onChange={(e) => setRuleName(e.target.value.slice(0, 100))}
                      className="text-lg"
                      maxLength={100}
                      autoFocus
                    />
                    <p className="text-sm text-muted-foreground text-right">
                      {ruleName.length}/100
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Object Type */}
              <Card className="shadow-md">
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
                              className={!obj.available ? "opacity-50" : ""}
                            >
                              <span className="flex items-center gap-2">
                                {obj.name}
                                {!obj.available && (
                                  <>
                                    <Lock className="h-3 w-3 text-muted-foreground" />
                                    <UpgradeBadge
                                      tier={obj.tier}
                                      size="sm"
                                      showTooltip={false}
                                      feature={feature}
                                    />
                                  </>
                                )}
                              </span>
                            </SelectItem>
                          );
                        })}

                        {/* Custom Objects Section - always show */}
                        <SelectSeparator />
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
                              className={!obj.available ? "opacity-50" : ""}
                            >
                              <span className="flex items-center gap-2">
                                {obj.name}
                                {!obj.available && (
                                  <Lock className="h-3 w-3 text-muted-foreground" />
                                )}
                              </span>
                            </SelectItem>
                          ))
                        ) : (
                          <div className="px-2 py-1.5 text-xs text-muted-foreground italic">
                            No custom objects in this location
                          </div>
                        )}
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
              <Card className="shadow-md">
                <CardHeader className="bg-muted/30 border-b">
                  <CardTitle className="text-lg font-bold">Match Conditions</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Define which fields to compare and how they should be combined
                  </p>
                </CardHeader>
                <CardContent className="space-y-3 pt-6">
                  {fields.map((field, index) => (
                    <div key={index} className="space-y-3">
                      {/* Condition Row */}
                      <div className="flex gap-2 items-center p-4 bg-muted/40 rounded-lg border hover:bg-muted/50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <Select
                            value={field.name}
                            onValueChange={(val) => {
                              const selectedField = fieldOptions.find(f => f.id === val);
                              // Check if custom field and user doesn't have access
                              if (selectedField?.isCustom && !hasAccess(plan, "starter")) {
                                return; // Don't allow selection
                              }
                              updateField(index, "name", val);
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

                              {/* Custom Fields Section - only show if there are custom fields */}
                              {fieldOptions.some(f => f.isCustom) && (
                                <>
                                  <SelectSeparator />
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
                                        className={!hasCustomFieldAccess ? "opacity-50" : ""}
                                      >
                                        <span className="flex items-center gap-2">
                                          {opt.name}
                                          {!hasCustomFieldAccess && (
                                            <Lock className="h-3 w-3 text-muted-foreground" />
                                          )}
                                        </span>
                                      </SelectItem>
                                    );
                                  })}
                                </>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex-1 min-w-0">
                          <Select
                            value={field.matchType}
                            onValueChange={(val) => updateField(index, "matchType", val)}
                          >
                            <SelectTrigger className="bg-background">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {matchTypes.map((opt) => (
                                <SelectItem key={opt.id} value={opt.id}>
                                  {opt.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
              <Card className="shadow-md">
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
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">or</span>
                    </div>
                  </div>

                  {/* Custom Strategy Option */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Custom Strategy</Label>
                      <UpgradeBadge tier="pro" feature="custom_strategy" />
                    </div>
                    <div
                      onClick={() => {
                        // In real app, check if user has Pro+ tier
                        const hasProPlan = plan === "pro" || plan === "agency";
                        if (!hasProPlan) {
                          // The UpgradeBadge handles the modal, but we can also trigger from the card
                          return;
                        }
                        // Navigate to create custom strategy
                        navigate("/merge-strategies/new");
                      }}
                      className="p-4 rounded-lg border-2 border-dashed border-muted bg-muted/20 cursor-pointer hover:border-primary/30 hover:bg-muted/30 transition-all group"
                    >
                      <div className="flex items-center gap-2">
                        <Plus className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        <span className="font-medium opacity-60 group-hover:opacity-100 transition-opacity">Create Custom Strategy</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Define custom field-level merge rules for complete control
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Related Records - Only show for contacts */}
              {objectType === "contacts" && (
                <Card className="shadow-md">
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
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="opportunities"
                            checked={relatedRecordsConfig.opportunities === "custom_logic"}
                            onChange={() => setRelatedRecordsConfig(prev => ({
                              ...prev,
                              opportunities: "custom_logic",
                              opportunities_custom_logic: prev.opportunities_custom_logic || createEmptyLogicConfig(),
                            }))}
                            className="h-4 w-4"
                          />
                          <span className="text-sm">Custom logic (filter by conditions)</span>
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
                              { id: "status", name: "Status", dataType: "text" },
                              { id: "name", name: "Name", dataType: "text" },
                              { id: "pipelineStageId", name: "Pipeline Stage", dataType: "text" },
                            ]}
                            objectLabel="opportunity"
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Schedule */}
              <Card className="shadow-md">
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
                            description: "Scheduled scans require Starter plan or higher.",
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
                        {frequency === "daily" && `Every day at ${timeOptions.find(t => t.id === scheduleTime)?.name}`}
                        {frequency === "weekly" && `Every ${daysOfWeek.find(d => d.id === scheduleDayOfWeek)?.name} at ${timeOptions.find(t => t.id === scheduleTime)?.name}`}
                        {frequency === "biweekly" && `Every other ${daysOfWeek.find(d => d.id === scheduleDayOfWeek)?.name} at ${timeOptions.find(t => t.id === scheduleTime)?.name}`}
                        {frequency === "monthly" && `${daysOfMonth.find(d => d.id === scheduleDayOfMonth)?.name} of each month at ${timeOptions.find(t => t.id === scheduleTime)?.name}`}
                      </p>
                    </div>
                  )}

                  {/* Tier Gate Note */}
                  {frequency !== "manual" && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Info className="h-4 w-4 text-warning" />
                      Scheduled scans require Starter plan or higher.
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
              <Card className="shadow-md">
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
                          {frequency === "daily" && `Every day at ${timeOptions.find(t => t.id === scheduleTime)?.name}`}
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
        <div className="flex justify-between items-center pt-6 mt-6 border-t-2 border-t-muted">
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
          ) : (
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
              {currentStep < 4 ? (
                <Button type="button" onClick={handleNext}>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSaving ? "Creating & Scanning..." : "Create Rule"}
                </Button>
              )}
            </>
          )}
        </div>
      </form>
    </div>
  );
}
