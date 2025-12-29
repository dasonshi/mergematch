import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Lock, Info } from "lucide-react";
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
  { id: "contacts", name: "Contacts" },
  { id: "companies", name: "Companies" },
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
  { id: "standard", name: "Standard Contact Merge" },
  { id: "recent", name: "Most Recent Wins" },
];

const schedules = [
  { id: "daily6am", name: "Daily 6am" },
  { id: "daily12pm", name: "Daily 12pm" },
  { id: "weekly", name: "Weekly" },
  { id: "manual", name: "Manual only" },
];

export default function MatchRuleForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = !!id;

  const existingRule = id ? mockRules[id] : null;

  const [ruleName, setRuleName] = useState("");
  const [objectType, setObjectType] = useState("contacts");
  const [fields, setFields] = useState<{ name: string; matchType: string }[]>([
    { name: "", matchType: "exact" },
  ]);
  const [logic, setLogic] = useState("all");
  const [strategy, setStrategy] = useState("standard");
  const [schedule, setSchedule] = useState("daily6am");

  useEffect(() => {
    if (existingRule) {
      setRuleName(existingRule.name);
      setObjectType(existingRule.object);
      setFields(existingRule.fields);
      setLogic(existingRule.logic);
      setStrategy(existingRule.strategy);
      setSchedule(existingRule.schedule);
    }
  }, [existingRule]);

  const addField = () => {
    setFields([...fields, { name: "", matchType: "exact" }]);
  };

  const removeField = (index: number) => {
    if (fields.length > 1) {
      setFields(fields.filter((_, i) => i !== index));
    }
  };

  const updateField = (index: number, key: "name" | "matchType", value: string) => {
    const updated = [...fields];
    updated[index][key] = value;
    setFields(updated);
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
              <Select value={objectType} onValueChange={setObjectType}>
                <SelectTrigger className="w-full sm:w-[240px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {objectTypes.map((obj) => (
                    <SelectItem key={obj.id} value={obj.id}>
                      {obj.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </CardContent>
        </Card>

        {/* Match Fields */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Match Fields</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addField}>
              <Plus className="mr-2 h-4 w-4" />
              Add Field
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={index} className="flex gap-3 items-start">
                <div className="flex-1 space-y-2">
                  <Label>Field {index + 1}</Label>
                  <Select 
                    value={field.name} 
                    onValueChange={(val) => updateField(index, "name", val)}
                  >
                    <SelectTrigger>
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
                <div className="flex-1 space-y-2">
                  <Label>Match Type</Label>
                  <Select 
                    value={field.matchType} 
                    onValueChange={(val) => updateField(index, "matchType", val)}
                  >
                    <SelectTrigger>
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
                  className="mt-8"
                  onClick={() => removeField(index)}
                  disabled={fields.length === 1}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Match Logic */}
        <Card>
          <CardHeader>
            <CardTitle>Match Logic</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={logic} onValueChange={setLogic}>
              <SelectTrigger className="w-full sm:w-[320px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All fields must match (AND)</SelectItem>
                <SelectItem value="any">Any field can match (OR)</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Merge Strategy */}
        <Card>
          <CardHeader>
            <CardTitle>Merge Strategy</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={strategy} onValueChange={setStrategy}>
              <SelectTrigger className="w-full sm:w-[320px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {strategies.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={schedule} onValueChange={setSchedule}>
              <SelectTrigger className="w-full sm:w-[240px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {schedules.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
