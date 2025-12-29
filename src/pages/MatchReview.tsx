import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Star, AlertTriangle, FileText, CheckSquare, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

// Mock data for the match
const mockMatch = {
  id: "match-1",
  ruleId: "rule-1",
  ruleName: "Email + Phone Match",
  confidence: 98,
  records: [
    {
      id: "rec-1",
      isMaster: true,
      name: "John Smith",
      fields: {
        firstName: "John",
        lastName: "Smith",
        email: "john@acme.com",
        phone: null,
        company: "Acme Inc",
        tags: "lead, hot",
        created: "Jan 15, 2024",
        updated: "Dec 20, 2024",
      },
    },
    {
      id: "rec-2",
      isMaster: false,
      name: "Jon Smith",
      fields: {
        firstName: "Jon",
        lastName: "Smith",
        email: "jon.smith@acme",
        phone: "+1 555-0123",
        company: null,
        tags: "prospect",
        created: "Mar 22, 2024",
        updated: "Dec 24, 2024",
      },
    },
  ],
  relatedRecords: {
    notes: 3,
    tasks: 1,
    taskDue: "due tomorrow",
    opportunities: 2,
    opportunitiesValue: "$5,400",
  },
};

type FieldKey = keyof typeof mockMatch.records[0]["fields"];

const fieldLabels: Record<FieldKey, string> = {
  firstName: "First Name",
  lastName: "Last Name",
  email: "Email",
  phone: "Phone",
  company: "Company",
  tags: "Tags",
  created: "Created",
  updated: "Updated",
};

const metadataFields: FieldKey[] = ["created", "updated"];

export default function MatchReview() {
  const { id } = useParams();
  const match = mockMatch;

  // Track which record is selected for each field
  // Default to master record for all fields, except pick non-empty from duplicate if master is empty
  const getDefaultSelections = () => {
    const selections: Record<FieldKey, string> = {} as Record<FieldKey, string>;
    const fieldKeys = Object.keys(match.records[0].fields) as FieldKey[];

    fieldKeys.forEach((field) => {
      if (metadataFields.includes(field)) {
        selections[field] = "metadata";
        return;
      }

      const masterRecord = match.records.find((r) => r.isMaster);
      const masterValue = masterRecord?.fields[field];

      if (masterValue) {
        selections[field] = masterRecord!.id;
      } else {
        // Find first non-empty value
        const recordWithValue = match.records.find((r) => r.fields[field]);
        selections[field] = recordWithValue?.id || masterRecord!.id;
      }
    });

    return selections;
  };

  const [selections, setSelections] = useState<Record<FieldKey, string>>(getDefaultSelections);
  const [hideWarning, setHideWarning] = useState(false);

  const handleCellClick = (field: FieldKey, recordId: string) => {
    if (metadataFields.includes(field)) return;
    setSelections((prev) => ({ ...prev, [field]: recordId }));
  };

  const getResultValue = (field: FieldKey) => {
    if (metadataFields.includes(field)) return "(metadata)";
    const selectedRecordId = selections[field];
    const record = match.records.find((r) => r.id === selectedRecordId);
    return record?.fields[field] || "(empty)";
  };

  const duplicateRecord = match.records.find((r) => !r.isMaster);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Link
            to={`/match-rules/${id}`}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {match.ruleName}
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">
            Review Match
          </h1>
        </div>
        <Badge variant="secondary" className="text-base px-4 py-1.5 w-fit">
          {match.confidence}% confidence
        </Badge>
      </div>

      {/* Field Comparison Table */}
      <Card>
        <CardHeader className="pb-3">
          <p className="text-sm text-muted-foreground">
            Click any cell to select it as the value to keep.
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32"></TableHead>
                  {match.records.map((record) => (
                    <TableHead key={record.id} className="min-w-40">
                      <div className="flex items-center gap-2">
                        {record.isMaster && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                        <span className={record.isMaster ? "font-semibold" : ""}>
                          {record.isMaster ? "MASTER" : "DUPLICATE 1"}
                        </span>
                      </div>
                      <div className="text-sm font-normal text-muted-foreground mt-1">
                        {record.name}
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="min-w-40 bg-muted/50">
                    <span className="font-semibold">RESULT</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(Object.keys(fieldLabels) as FieldKey[]).map((field) => (
                  <TableRow key={field}>
                    <TableCell className="font-medium text-muted-foreground">
                      {fieldLabels[field]}
                    </TableCell>
                    {match.records.map((record) => {
                      const value = record.fields[field];
                      const isSelected = selections[field] === record.id;
                      const isMetadata = metadataFields.includes(field);
                      const isEmpty = !value;

                      return (
                        <TableCell
                          key={record.id}
                          className={cn(
                            "transition-colors",
                            !isMetadata && "cursor-pointer hover:bg-muted/50",
                            isSelected && !isMetadata && "bg-primary/10"
                          )}
                          onClick={() => handleCellClick(field, record.id)}
                        >
                          <div className="flex items-center gap-2">
                            {isSelected && !isMetadata && (
                              <span className="text-primary font-medium">[</span>
                            )}
                            <span className={cn(isEmpty && "text-muted-foreground italic")}>
                              {isEmpty ? "(empty)" : value}
                            </span>
                            {isSelected && !isMetadata && (
                              <>
                                <span className="text-primary font-medium">]</span>
                                <span className="text-primary">✓</span>
                              </>
                            )}
                          </div>
                        </TableCell>
                      );
                    })}
                    <TableCell className="bg-muted/50 font-medium">
                      <span className={cn(getResultValue(field) === "(empty)" && "text-muted-foreground italic")}>
                        {getResultValue(field)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Legend */}
          <div className="mt-4 pt-4 border-t flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span><span className="text-primary">[Value] ✓</span> = Selected (will be kept)</span>
            <span>Value = Not selected</span>
            <span className="italic">(empty)</span> = No value in record
            <span><Star className="h-3 w-3 inline text-yellow-500 fill-yellow-500" /> = Master record</span>
          </div>
        </CardContent>
      </Card>

      {/* Related Records */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Related Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            From "{duplicateRecord?.name}" (will be copied to master):
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span>{match.relatedRecords.notes} notes</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
              <span>{match.relatedRecords.tasks} task ({match.relatedRecords.taskDue})</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span>{match.relatedRecords.opportunities} opportunities ({match.relatedRecords.opportunitiesValue} total value)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Merge Warning */}
      <Card className="border-yellow-500/50 bg-yellow-500/5">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-foreground">MERGE WARNING</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  "{duplicateRecord?.name}" will be <span className="font-semibold text-destructive">PERMANENTLY DELETED</span> from GoHighLevel.
                </p>
                <p className="text-sm text-muted-foreground">
                  Notes/tasks will be copied to master with new IDs.
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
      <div className="flex justify-between items-center pt-4 border-t">
        <Button variant="outline" asChild>
          <Link to={`/match-rules/${id}`}>Cancel</Link>
        </Button>
        <Button className="bg-green-600 hover:bg-green-700 text-white">
          Confirm Merge
        </Button>
      </div>
    </div>
  );
}
