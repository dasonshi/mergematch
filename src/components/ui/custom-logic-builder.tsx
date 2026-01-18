import { useState } from "react";
import { Plus, Trash2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface LogicCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
  valueType: "static" | "field_reference";
  // For cascading selects (e.g., pipeline -> stage)
  parentValue?: string;
}

export interface CustomLogicConfig {
  operator: "AND" | "OR";
  conditions: LogicCondition[];
}

interface FieldValueOption {
  id: string;
  name: string;
}

// Pipeline structure for cascading dropdown
export interface Pipeline {
  id: string;
  name: string;
  stages: { id: string; name: string }[];
}

interface CustomLogicBuilderProps {
  value: CustomLogicConfig;
  onChange: (config: CustomLogicConfig) => void;
  availableFields: { id: string; name: string; dataType?: string }[];
  objectLabel?: string; // e.g., "opportunity" for display
  fieldValueOptions?: Record<string, FieldValueOption[]>; // Field ID -> possible values
  pipelines?: Pipeline[]; // For cascading pipeline -> stage selection
}

const OPERATORS = [
  { id: "=", name: "equals", types: ["all"] },
  { id: "!=", name: "not equals", types: ["all"] },
  { id: ">", name: "greater than", types: ["number", "date"] },
  { id: "<", name: "less than", types: ["number", "date"] },
  { id: ">=", name: "greater or equal", types: ["number", "date"] },
  { id: "<=", name: "less or equal", types: ["number", "date"] },
  { id: "contains", name: "contains", types: ["text"] },
  { id: "not_contains", name: "does not contain", types: ["text"] },
  { id: "starts_with", name: "starts with", types: ["text"] },
  { id: "ends_with", name: "ends with", types: ["text"] },
  { id: "is_empty", name: "is empty", types: ["all"] },
  { id: "is_not_empty", name: "is not empty", types: ["all"] },
];

// Common opportunity fields as fallback
const DEFAULT_OPPORTUNITY_FIELDS = [
  { id: "monetaryValue", name: "Monetary Value", dataType: "number" },
  { id: "status", name: "Status", dataType: "text" },
  { id: "name", name: "Name", dataType: "text" },
  { id: "pipelineStageId", name: "Pipeline Stage", dataType: "text" },
  { id: "assignedTo", name: "Assigned To", dataType: "text" },
  { id: "createdAt", name: "Created Date", dataType: "date" },
  { id: "updatedAt", name: "Updated Date", dataType: "date" },
];

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function CustomLogicBuilder({
  value,
  onChange,
  availableFields,
  objectLabel = "record",
  fieldValueOptions = {},
  pipelines = [],
}: CustomLogicBuilderProps) {
  const fields = availableFields.length > 0 ? availableFields : DEFAULT_OPPORTUNITY_FIELDS;

  const getFieldOptions = (fieldId: string): FieldValueOption[] | undefined => {
    return fieldValueOptions[fieldId];
  };

  // Check if field uses cascading pipeline selection
  const isPipelineStageField = (fieldId: string): boolean => {
    return fieldId === "pipelineStageId" && pipelines.length > 0;
  };

  // Get stages for a specific pipeline
  const getStagesForPipeline = (pipelineId: string): FieldValueOption[] => {
    const pipeline = pipelines.find(p => p.id === pipelineId);
    return pipeline?.stages.map(s => ({ id: s.id, name: s.name })) || [];
  };

  // Get stage name for display
  const getStageName = (stageId: string): string => {
    for (const pipeline of pipelines) {
      const stage = pipeline.stages.find(s => s.id === stageId);
      if (stage) return `${pipeline.name} → ${stage.name}`;
    }
    return stageId;
  };

  const addCondition = () => {
    const newCondition: LogicCondition = {
      id: generateId(),
      field: "",
      operator: "=",
      value: "",
      valueType: "static",
    };
    onChange({
      ...value,
      conditions: [...value.conditions, newCondition],
    });
  };

  const removeCondition = (id: string) => {
    onChange({
      ...value,
      conditions: value.conditions.filter((c) => c.id !== id),
    });
  };

  const updateCondition = (id: string, updates: Partial<LogicCondition>) => {
    onChange({
      ...value,
      conditions: value.conditions.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    });
  };

  const toggleOperator = () => {
    onChange({
      ...value,
      operator: value.operator === "AND" ? "OR" : "AND",
    });
  };

  const getFieldDataType = (fieldId: string): string => {
    const field = fields.find((f) => f.id === fieldId);
    return field?.dataType || "text";
  };

  const getAvailableOperators = (fieldId: string) => {
    const dataType = getFieldDataType(fieldId);
    return OPERATORS.filter(
      (op) => op.types.includes("all") || op.types.includes(dataType)
    );
  };

  const needsValueInput = (operator: string): boolean => {
    return !["is_empty", "is_not_empty"].includes(operator);
  };

  return (
    <div className="space-y-3">
      {/* Header with operator toggle */}
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">
          Filter {objectLabel}s where:
        </Label>
        {value.conditions.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Match</span>
            <Button
              type="button"
              variant={value.operator === "AND" ? "default" : "outline"}
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => onChange({ ...value, operator: "AND" })}
            >
              ALL
            </Button>
            <Button
              type="button"
              variant={value.operator === "OR" ? "default" : "outline"}
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => onChange({ ...value, operator: "OR" })}
            >
              ANY
            </Button>
          </div>
        )}
      </div>

      {/* Conditions list */}
      <div className="space-y-2">
        {value.conditions.map((condition, index) => (
          <div key={condition.id} className="flex items-center gap-2">
            {/* Condition row */}
            <div className="flex-1 flex items-center gap-2 p-2 bg-muted/40 rounded-lg border">
              {/* Field selector */}
              <Select
                value={condition.field}
                onValueChange={(v) => updateCondition(condition.id, { field: v })}
              >
                <SelectTrigger className="w-[140px] h-8 text-xs bg-background">
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  {fields.map((field) => (
                    <SelectItem key={field.id} value={field.id} className="text-xs">
                      {field.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Operator selector */}
              <Select
                value={condition.operator}
                onValueChange={(v) => updateCondition(condition.id, { operator: v })}
              >
                <SelectTrigger className="w-[120px] h-8 text-xs bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableOperators(condition.field).map((op) => (
                    <SelectItem key={op.id} value={op.id} className="text-xs">
                      {op.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Value input - cascading for pipeline, dropdown if options, otherwise text */}
              {needsValueInput(condition.operator) && (
                isPipelineStageField(condition.field) ? (
                  // Cascading Pipeline -> Stage selector
                  <div className="flex-1 flex items-center gap-1">
                    {/* Pipeline selector */}
                    <Select
                      value={condition.parentValue || ""}
                      onValueChange={(v) => updateCondition(condition.id, { parentValue: v, value: "" })}
                    >
                      <SelectTrigger className="w-[140px] h-8 text-xs bg-background">
                        <SelectValue placeholder="Pipeline..." />
                      </SelectTrigger>
                      <SelectContent>
                        {pipelines.map((pipeline) => (
                          <SelectItem key={pipeline.id} value={pipeline.id} className="text-xs">
                            {pipeline.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {condition.parentValue && (
                      <>
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        {/* Stage selector */}
                        <Select
                          value={condition.value}
                          onValueChange={(v) => updateCondition(condition.id, { value: v })}
                        >
                          <SelectTrigger className="flex-1 h-8 text-xs bg-background">
                            <SelectValue placeholder="Stage..." />
                          </SelectTrigger>
                          <SelectContent>
                            {getStagesForPipeline(condition.parentValue).map((stage) => (
                              <SelectItem key={stage.id} value={stage.id} className="text-xs">
                                {stage.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </>
                    )}
                  </div>
                ) : getFieldOptions(condition.field) ? (
                  <Select
                    value={condition.value}
                    onValueChange={(v) => updateCondition(condition.id, { value: v })}
                  >
                    <SelectTrigger className="flex-1 h-8 text-xs bg-background">
                      <SelectValue placeholder="Select value" />
                    </SelectTrigger>
                    <SelectContent>
                      {getFieldOptions(condition.field)?.map((opt) => (
                        <SelectItem key={opt.id} value={opt.id} className="text-xs">
                          {opt.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={condition.value}
                    onChange={(e) =>
                      updateCondition(condition.id, { value: e.target.value })
                    }
                    placeholder="Value"
                    className="flex-1 h-8 text-xs"
                  />
                )
              )}
            </div>

            {/* Remove button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => removeCondition(condition.id)}
            >
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </Button>

            {/* AND/OR indicator between conditions */}
            {index < value.conditions.length - 1 && (
              <div className="absolute -bottom-3 left-4 z-10">
                <span className="text-xs font-medium text-muted-foreground bg-background px-1">
                  {value.operator}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add condition button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addCondition}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-1" />
        Add Condition
      </Button>

      {/* Preview */}
      {value.conditions.length > 0 && value.conditions.some((c) => c.field) && (
        <div className="p-2 bg-primary/5 rounded border border-primary/20 text-xs">
          <span className="font-medium text-muted-foreground">Preview: </span>
          <span className="font-mono">
            {value.conditions
              .filter((c) => c.field)
              .map((c, i) => {
                const fieldName = fields.find((f) => f.id === c.field)?.name || c.field;
                const opName = OPERATORS.find((o) => o.id === c.operator)?.name || c.operator;
                // Show option name if available, pipeline stage name, or raw value
                let valueName = c.value;
                if (isPipelineStageField(c.field) && c.value) {
                  valueName = getStageName(c.value);
                } else {
                  const fieldOpts = getFieldOptions(c.field);
                  valueName = fieldOpts?.find((o) => o.id === c.value)?.name || c.value;
                }
                const valueDisplay = needsValueInput(c.operator) ? ` "${valueName}"` : "";
                const prefix = i > 0 ? ` ${value.operator} ` : "";
                return `${prefix}${fieldName} ${opName}${valueDisplay}`;
              })
              .join("")}
          </span>
        </div>
      )}
    </div>
  );
}

// Helper to create empty config
export function createEmptyLogicConfig(): CustomLogicConfig {
  return {
    operator: "AND",
    conditions: [],
  };
}

// Helper to validate config
export function isValidLogicConfig(config: CustomLogicConfig): boolean {
  return (
    config.conditions.length > 0 &&
    config.conditions.every(
      (c) =>
        c.field &&
        c.operator &&
        (["is_empty", "is_not_empty"].includes(c.operator) || c.value)
    )
  );
}
