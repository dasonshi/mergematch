import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Lock, Info, Crown, Loader2 } from "lucide-react";
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
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, MatchRule, MatchField } from "@/lib/api";
import { useLocation } from "@/contexts/LocationContext";

const objectTypes = [
  { id: "contacts", name: "Contacts", tier: "free", available: true },
  { id: "companies", name: "Companies", tier: "starter", available: true },
  { id: "opportunities", name: "Opportunities", tier: "pro", available: false },
  { id: "custom", name: "Custom Objects", tier: "agency", available: false },
];

const fieldOptions = [
  { id: "email", name: "Email" },
  { id: "phone", name: "Phone" },
  { id: "firstName", name: "First Name" },
  { id: "lastName", name: "Last Name" },
  { id: "fullName", name: "Full Name" },
  { id: "company", name: "Company" },
  { id: "domain", name: "Domain" },
  { id: "address", name: "Address" },
];

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

export default function MatchRuleForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { locationId, isAuthenticated } = useLocation();
  const isEditing = !!id;

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

  // Fetch existing rule when editing
  const { data: existingRule, isLoading: ruleLoading } = useQuery({
    queryKey: ['rule', id],
    queryFn: () => api.getMatchRule(id!),
    enabled: isEditing && isAuthenticated && !!locationId,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (rule: Partial<MatchRule>) => api.createMatchRule(rule),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
      toast({
        title: "Rule created",
        description: `"${ruleName}" has been created successfully.`,
      });
      navigate("/match-rules");
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

    let expr = "";
    let needsParens = false;
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
        if (prevOperator === "OR") {
          needsParens = true;
        }
        currentGroup.push(` ${prevOperator} ${condition}`);
      }
    });

    return currentGroup.join("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!ruleName.trim()) {
      toast({
        title: "Validation error",
        description: "Please enter a rule name.",
        variant: "destructive",
      });
      return;
    }

    if (fields.some(f => !f.name)) {
      toast({
        title: "Validation error",
        description: "Please select a field for all match conditions.",
        variant: "destructive",
      });
      return;
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
    navigate(isEditing ? `/match-rules/${id}` : "/match-rules");
  };

  return (
    <div className="space-y-6 pt-12 lg:pt-0">
      {/* Header */}
      <div className="space-y-1">
        <Link
          to={isEditing ? `/match-rules/${id}` : "/match-rules"}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {isEditing ? (existingRule?.name || "Match Rule") : "Match Rules"}
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">
          {isEditing ? "Edit Match Rule" : "Create Match Rule"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rule Name - First and Prominent */}
        <Card>
          <CardHeader>
            <CardTitle>Rule Name</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Input
                placeholder="e.g., Email + Phone Match"
                value={ruleName}
                onChange={(e) => setRuleName(e.target.value.slice(0, 100))}
                className="text-lg"
                maxLength={100}
              />
              <p className="text-sm text-muted-foreground text-right">
                {ruleName.length}/100
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Object Type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Object Type
              {isEditing && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center gap-1 text-sm text-muted-foreground font-normal">
                      <Lock className="h-4 w-4" />
                      Locked
                      <Info className="h-4 w-4" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Object type cannot be changed. Create a new rule for a different object.</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                if (selected?.available) setObjectType(val);
              }}>
                <SelectTrigger className="w-full sm:w-[280px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {objectTypes.map((obj) => (
                    <SelectItem
                      key={obj.id}
                      value={obj.id}
                      disabled={!obj.available}
                      className={!obj.available ? "opacity-60" : ""}
                    >
                      <span className="flex items-center gap-2">
                        {obj.name}
                        {!obj.available && (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Crown className="h-3 w-3" />
                            {obj.tier === "pro" ? "Pro" : "Agency"}
                          </span>
                        )}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </CardContent>
        </Card>

        {/* Match Conditions with Inline Logic */}
        <Card>
          <CardHeader>
            <CardTitle>Match Conditions</CardTitle>
            <p className="text-sm text-muted-foreground">
              Define which fields to compare and how they should be combined
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {fields.map((field, index) => (
              <div key={index} className="space-y-3">
                {/* Condition Row */}
                <div className="flex gap-2 items-center p-3 bg-muted/30 rounded-lg border">
                  <div className="flex-1 min-w-0">
                    <Select
                      value={field.name}
                      onValueChange={(val) => updateField(index, "name", val)}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select field..." />
                      </SelectTrigger>
                      <SelectContent>
                        {fieldOptions.map((opt) => (
                          <SelectItem key={opt.id} value={opt.id}>
                            {opt.name}
                          </SelectItem>
                        ))}
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
              <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Match Logic Preview:</p>
                <p className="text-sm font-mono">
                  {getLogicExpression()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Merge Strategy */}
        <Card>
          <CardHeader>
            <CardTitle>Merge Strategy</CardTitle>
            <p className="text-sm text-muted-foreground">
              Define how duplicate records should be merged
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Prebuilt Strategies */}
            <div className="space-y-2">
              <Label>Prebuilt Strategies</Label>
              <div className="grid gap-2">
                {strategies.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setStrategy(s.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      strategy === s.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "hover:border-muted-foreground/50 hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{s.name}</span>
                      {strategy === s.id && (
                        <span className="text-xs text-primary font-medium">Selected</span>
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
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Crown className="h-3 w-3" />
                  Pro+
                </span>
              </div>
              <div
                onClick={() => {
                  // In real app, check if user has Pro+ tier
                  const hasProPlan = false; // mock
                  if (!hasProPlan) {
                    toast({
                      title: "Upgrade Required",
                      description: "Custom merge strategies require Pro plan or higher.",
                    });
                    return;
                  }
                  // Navigate to create custom strategy
                  navigate("/merge-strategies/new");
                }}
                className="p-3 rounded-lg border border-dashed cursor-pointer hover:border-muted-foreground/50 hover:bg-muted/30 transition-all opacity-70"
              >
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Create Custom Strategy</span>
                  <Lock className="h-3 w-3 text-muted-foreground ml-auto" />
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Define custom field-level merge rules for complete control
                </p>
              </div>
            </div>

            {/* Selected Strategy Preview */}
            {strategy && (
              <div className="p-3 bg-muted/50 rounded-lg border">
                <p className="text-xs text-muted-foreground mb-1">Selected Strategy:</p>
                <p className="font-medium">{strategies.find(s => s.id === strategy)?.name}</p>
                <p className="text-sm text-muted-foreground">{strategies.find(s => s.id === strategy)?.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
            <p className="text-sm text-muted-foreground">
              Configure when this rule automatically scans for duplicates
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
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
                          <Lock className="h-3 w-3 text-muted-foreground" />
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
              <div className="p-3 bg-muted/50 rounded-lg border">
                <p className="text-sm">
                  <span className="text-muted-foreground">Runs: </span>
                  <span className="font-medium">
                    {frequency === "daily" && `Every day at ${timeOptions.find(t => t.id === scheduleTime)?.name}`}
                    {frequency === "weekly" && `Every ${daysOfWeek.find(d => d.id === scheduleDayOfWeek)?.name} at ${timeOptions.find(t => t.id === scheduleTime)?.name}`}
                    {frequency === "biweekly" && `Every other ${daysOfWeek.find(d => d.id === scheduleDayOfWeek)?.name} at ${timeOptions.find(t => t.id === scheduleTime)?.name}`}
                    {frequency === "monthly" && `${daysOfMonth.find(d => d.id === scheduleDayOfMonth)?.name} of each month at ${timeOptions.find(t => t.id === scheduleTime)?.name}`}
                  </span>
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

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <Button type="button" variant="outline" onClick={handleCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Save Changes" : "Create Rule"}
          </Button>
        </div>
      </form>
    </div>
  );
}
