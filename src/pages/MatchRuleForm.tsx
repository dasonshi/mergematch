import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Lock, Info, Crown } from "lucide-react";
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

// Mock data for editing
const mockRules: Record<string, {
  name: string;
  object: string;
  fields: { name: string; matchType: string }[];
  logic: string;
  strategy: string;
  schedule: string;
}> = {
  "1": {
    name: "Email + Phone Match",
    object: "contacts",
    fields: [
      { name: "email", matchType: "exact" },
      { name: "phone", matchType: "fuzzy" },
    ],
    logic: "all",
    strategy: "standard",
    schedule: "daily6am",
  },
  "2": {
    name: "Company Domain Match",
    object: "companies",
    fields: [
      { name: "domain", matchType: "exact" },
    ],
    logic: "all",
    strategy: "recent",
    schedule: "manual",
  },
  "3": {
    name: "Phone Number Match",
    object: "contacts",
    fields: [
      { name: "phone", matchType: "exact" },
    ],
    logic: "all",
    strategy: "standard",
    schedule: "daily6am",
  },
};

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
  { id: "manual", name: "Manual only" },
  { id: "daily", name: "Daily" },
  { id: "weekly", name: "Weekly" },
  { id: "biweekly", name: "Every 2 weeks" },
  { id: "monthly", name: "Monthly" },
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
  const isEditing = !!id;

  const existingRule = id ? mockRules[id] : null;

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

  useEffect(() => {
    if (existingRule) {
      setRuleName(existingRule.name);
      setObjectType(existingRule.object);
      // Migrate old fields format to new format with operators
      setFields(existingRule.fields.map((f, i) => ({
        ...f,
        operator: (f as any).operator || "AND"
      })));
      setStrategy(existingRule.strategy);
      setSchedule(existingRule.schedule);
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

    toast({
      title: isEditing ? "Rule updated" : "Rule created",
      description: isEditing 
        ? `"${ruleName}" has been updated successfully.`
        : `"${ruleName}" has been created successfully.`,
    });

    navigate(isEditing ? `/match-rules/${id}` : "/match-rules");
  };

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
          {isEditing ? existingRule?.name || "Match Rule" : "Match Rules"}
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
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {frequencies.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name}
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
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {isEditing ? "Save Changes" : "Create Rule"}
          </Button>
        </div>
      </form>
    </div>
  );
}
