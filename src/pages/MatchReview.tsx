import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Star, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useLocation } from "@/contexts/LocationContext";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

// Fields to display and their labels
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
};

const metadataFields = ["dateAdded", "dateUpdated"];

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

  // Merge mutation
  const mergeMutation = useMutation({
    mutationFn: async (data: { matchId: string; masterId: string; selections: Record<string, string> }) => {
      return api.executeMerge(data.matchId, data.masterId, data.selections);
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

  // Build record data from match
  const recordA = match?.record_a_data || {};
  const recordB = match?.record_b_data || {};
  const recordAId = match?.record_a_id || "a";
  const recordBId = match?.record_b_id || "b";
  const confidence = Math.round((match?.confidence_score || 0) * 100);

  // Determine which fields to show
  const allFields = new Set([...Object.keys(recordA), ...Object.keys(recordB)]);
  const displayFields = Object.keys(fieldLabels).filter(f => allFields.has(f));

  // Track selections - default to record A (master) unless empty
  const getDefaultSelections = () => {
    const selections: Record<string, string> = {};
    displayFields.forEach((field) => {
      const valueA = recordA[field];
      const valueB = recordB[field];
      // Default to A if it has a value, otherwise B
      selections[field] = valueA ? "a" : (valueB ? "b" : "a");
    });
    return selections;
  };

  const [selections, setSelections] = useState<Record<string, string>>({});
  const [hideWarning, setHideWarning] = useState(false);
  const [masterId, setMasterId] = useState<string>("a");

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
  };

  const getResultValue = (field: string) => {
    const source = selections[field];
    const value = source === "a" ? recordA[field] : recordB[field];
    if (Array.isArray(value)) return value.join(", ");
    return value || "(empty)";
  };

  const handleMerge = () => {
    const actualMasterId = masterId === "a" ? recordAId : recordBId;
    mergeMutation.mutate({
      matchId: matchId!,
      masterId: actualMasterId,
      selections,
    });
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
      <Card className="shadow-md">
        <CardHeader className="pb-4 bg-muted/30 border-b">
          <CardTitle className="text-lg font-bold">
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
              {recordA.firstName} {recordA.lastName}
            </Button>
            <Button
              variant={masterId === "b" ? "default" : "outline"}
              onClick={() => handleMasterChange("b")}
              className="flex-1"
            >
              <Star className={cn("h-4 w-4 mr-2", masterId === "b" && "fill-current")} />
              {recordB.firstName} {recordB.lastName}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            The master record will be kept. The duplicate will be deleted.
          </p>
        </CardContent>
      </Card>

      {/* Field Comparison Table */}
      <Card className="shadow-md">
        <CardHeader className="pb-4 bg-muted/30 border-b">
          <CardTitle className="text-lg font-bold">Field Comparison</CardTitle>
          <p className="text-sm text-muted-foreground">
            Click any cell to select which value to keep for each field.
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
                      {recordA.firstName} {recordA.lastName}
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
                      {recordB.firstName} {recordB.lastName}
                    </div>
                  </TableHead>
                  <TableHead className="min-w-40 bg-muted/50">
                    <span className="font-semibold">RESULT</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayFields.map((field) => {
                  const valueA = recordA[field];
                  const valueB = recordB[field];
                  const displayValueA = Array.isArray(valueA) ? valueA.join(", ") : valueA;
                  const displayValueB = Array.isArray(valueB) ? valueB.join(", ") : valueB;

                  return (
                    <TableRow key={field}>
                      <TableCell className="font-medium text-muted-foreground">
                        {fieldLabels[field] || field}
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
                })}
              </TableBody>
            </Table>
          </div>

          {/* Legend */}
          <div className="mt-4 pt-4 border-t flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted-foreground">
            <span><span className="text-primary">[Value] ✓</span> = Selected (will be kept)</span>
            <span>Value = Not selected</span>
            <span className="italic">(empty)</span> = No value in record
            <span><Star className="h-3 w-3 inline text-yellow-500 fill-yellow-500" /> = Master record</span>
          </div>
        </CardContent>
      </Card>

      {/* Merge Warning */}
      <Card className="border-yellow-500/50 bg-yellow-500/8 shadow-md">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
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
      <div className="flex justify-between items-center pt-6 mt-6 border-t-2 border-t-muted">
        <Button variant="outline" asChild>
          <Link to={`/match-rules/${ruleId}`}>Cancel</Link>
        </Button>
        <Button
          className="bg-green-600 hover:bg-green-700 text-white"
          onClick={handleMerge}
          disabled={mergeMutation.isPending}
        >
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
