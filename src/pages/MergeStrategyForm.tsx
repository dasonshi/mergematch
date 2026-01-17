import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "@/contexts/LocationContext";
import { api, ObjectAssociation } from "@/lib/api";

// Mock data for editing
const mockStrategy = {
  id: "strategy-1",
  name: "Standard Contact Merge",
  objectType: "Contacts",
  masterSelection: "most-complete",
  conflictResolution: "prefer-master",
  notesHandling: "copy-all",
  tasksHandling: "copy-all",
  opportunitiesHandling: "keep-all",
  usedBy: ["Email + Phone Match", "Name + Address Match"],
};

// Map internal object type names to API object types
const OBJECT_TYPE_MAP: Record<string, string> = {
  "Contacts": "contacts",
  "Companies": "companies",
  "Opportunities": "opportunities",
  "Custom Objects": "custom_objects",
};

// Default handling options for related records
type RelatedRecordHandling = "copy_to_master" | "dont_copy" | "keep_all" | "keep_master_only" | "keep_highest_value" | "custom_logic";

export default function MergeStrategyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { locationId } = useLocation();
  const isEditing = Boolean(id);

  // Form state
  const [name, setName] = useState(isEditing ? mockStrategy.name : "");
  const [objectType, setObjectType] = useState(isEditing ? mockStrategy.objectType : "");
  const [masterSelection, setMasterSelection] = useState(isEditing ? mockStrategy.masterSelection : "most-complete");
  const [conflictResolution, setConflictResolution] = useState(isEditing ? mockStrategy.conflictResolution : "prefer-master");

  // Dynamic related records handling state
  const [relatedRecordsHandling, setRelatedRecordsHandling] = useState<Record<string, RelatedRecordHandling>>({});

  // Dialogs
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSaveAsNewDialog, setShowSaveAsNewDialog] = useState(false);
  const [newStrategyName, setNewStrategyName] = useState("");

  // Fetch available object types
  const { data: availableObjects } = useQuery({
    queryKey: ["available-objects", locationId],
    queryFn: () => api.getAvailableObjects(),
    enabled: !!locationId,
  });

  // Fetch associations for selected object type
  // Find the selected object to get its ID for API calls
  const selectedObject = objectTypes.find((o) => o.name === objectType);
  const apiObjectType = selectedObject?.id || OBJECT_TYPE_MAP[objectType] || objectType.toLowerCase();
  const { data: associations, isLoading: associationsLoading } = useQuery({
    queryKey: ["object-associations", apiObjectType, locationId],
    queryFn: () => api.getObjectAssociations(apiObjectType),
    enabled: !!locationId && !!objectType,
  });

  // Initialize default handling for associations when they load
  useEffect(() => {
    if (associations && associations.length > 0) {
      const defaults: Record<string, RelatedRecordHandling> = {};
      associations.forEach((assoc) => {
        if (!relatedRecordsHandling[assoc.id]) {
          // Default based on object type
          if (assoc.objectKey === "opportunity") {
            defaults[assoc.id] = "keep_all";
          } else {
            defaults[assoc.id] = "copy_to_master";
          }
        }
      });
      if (Object.keys(defaults).length > 0) {
        setRelatedRecordsHandling((prev) => ({ ...prev, ...defaults }));
      }
    }
  }, [associations]);

  // Build object types list from API data + fallback
  const objectTypes = availableObjects
    ? [
        // Standard objects (Contacts, Companies, Opportunities)
        ...availableObjects
          .filter((o) => o.standard)
          .map((o) => ({
            id: o.id,
            name: o.name.charAt(0).toUpperCase() + o.name.slice(1),
            isCustom: false,
          })),
        // Custom objects from GHL
        ...availableObjects
          .filter((o) => !o.standard)
          .map((o) => ({
            id: o.id,
            name: o.name,
            isCustom: true,
          })),
      ]
    : [
        { id: "contacts", name: "Contacts", isCustom: false },
        { id: "companies", name: "Companies", isCustom: false },
        { id: "opportunities", name: "Opportunities", isCustom: false },
      ];

  const usedBy = isEditing ? mockStrategy.usedBy : [];
  const isUsedByRules = usedBy.length > 0;

  const handleSave = () => {
    if (isEditing && isUsedByRules) {
      setShowConfirmDialog(true);
      return;
    }
    performSave();
  };

  const performSave = () => {
    toast({
      title: isEditing ? "Strategy updated" : "Strategy created",
      description: `"${name}" has been ${isEditing ? "updated" : "created"} successfully.`,
    });
    navigate("/merge-strategies");
  };

  const handleSaveAsNew = () => {
    setNewStrategyName(name + " (Copy)");
    setShowSaveAsNewDialog(true);
  };

  const performSaveAsNew = () => {
    toast({
      title: "Strategy created",
      description: `"${newStrategyName}" has been created successfully.`,
    });
    setShowSaveAsNewDialog(false);
    navigate("/merge-strategies");
  };

  return (
    <div className="space-y-6 max-w-3xl ">
      {/* Header */}
      <div className="space-y-1">
        <Link
          to="/merge-strategies"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">
          {isEditing ? "Edit Merge Strategy" : "Create Merge Strategy"}
        </h1>
      </div>

      {/* Basic Info */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Strategy Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Standard Contact Merge"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="object">Object</Label>
            {isEditing ? (
              <Input
                id="object"
                value={`${objectType} (locked when editing)`}
                disabled
                className="bg-muted"
              />
            ) : (
              <Select value={objectType} onValueChange={setObjectType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select object type" />
                </SelectTrigger>
                <SelectContent>
                  {objectTypes.map((obj) => (
                    <SelectItem key={obj.id} value={obj.name}>
                      <span className="flex items-center gap-2">
                        {obj.name}
                        {obj.isCustom && (
                          <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Custom</span>
                        )}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Master Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Master Selection</CardTitle>
          <p className="text-sm text-muted-foreground">
            How should the primary (surviving) record be chosen?
          </p>
        </CardHeader>
        <CardContent>
          <RadioGroup value={masterSelection} onValueChange={setMasterSelection}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="most-complete" id="most-complete" />
              <Label htmlFor="most-complete" className="font-normal cursor-pointer">
                Most complete record (most fields populated)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="most-recent" id="most-recent" />
              <Label htmlFor="most-recent" className="font-normal cursor-pointer">
                Most recent activity (last updated)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="oldest" id="oldest" />
              <Label htmlFor="oldest" className="font-normal cursor-pointer">
                Oldest created (original record)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="manual" id="manual" />
              <Label htmlFor="manual" className="font-normal cursor-pointer">
                Manual selection (require review for each match)
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Field Conflicts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Field Conflicts</CardTitle>
          <p className="text-sm text-muted-foreground">
            When both records have different values for the same field:
          </p>
        </CardHeader>
        <CardContent>
          <RadioGroup value={conflictResolution} onValueChange={setConflictResolution}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="prefer-master" id="prefer-master" />
              <Label htmlFor="prefer-master" className="font-normal cursor-pointer">
                Prefer master record values
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="prefer-recent" id="prefer-recent" />
              <Label htmlFor="prefer-recent" className="font-normal cursor-pointer">
                Prefer most recently updated value
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="require-review" id="require-review" />
              <Label htmlFor="require-review" className="font-normal cursor-pointer">
                Require manual review
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Related Records - Only show when object type is selected */}
      {objectType && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Related Records</CardTitle>
            <p className="text-sm text-muted-foreground">
              How should associated records be handled during merge?
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {associationsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Loading associations...</span>
              </div>
            ) : associations && associations.length > 0 ? (
              associations
                .filter((assoc) => assoc.canReassign)
                .map((assoc) => {
                  const isOpportunity = assoc.objectKey === "opportunity";
                  const currentValue = relatedRecordsHandling[assoc.id] || (isOpportunity ? "keep_all" : "copy_to_master");

                  return (
                    <div key={assoc.id} className="space-y-2">
                      <Label className="text-sm font-medium">{assoc.name}:</Label>
                      {isOpportunity ? (
                        // Opportunities have more options
                        <RadioGroup
                          value={currentValue}
                          onValueChange={(value) =>
                            setRelatedRecordsHandling((prev) => ({
                              ...prev,
                              [assoc.id]: value as RelatedRecordHandling,
                            }))
                          }
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="keep_all" id={`${assoc.id}-all`} />
                            <Label htmlFor={`${assoc.id}-all`} className="font-normal cursor-pointer">
                              Keep all from both records
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="keep_master_only" id={`${assoc.id}-master`} />
                            <Label htmlFor={`${assoc.id}-master`} className="font-normal cursor-pointer">
                              Keep from master only
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="keep_highest_value" id={`${assoc.id}-highest`} />
                            <Label htmlFor={`${assoc.id}-highest`} className="font-normal cursor-pointer">
                              Keep highest monetary value
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="custom_logic" id={`${assoc.id}-custom`} />
                            <Label htmlFor={`${assoc.id}-custom`} className="font-normal cursor-pointer">
                              Custom logic (coming soon)
                            </Label>
                          </div>
                        </RadioGroup>
                      ) : (
                        // Simple copy/don't copy for notes, tasks, etc.
                        <RadioGroup
                          value={currentValue}
                          onValueChange={(value) =>
                            setRelatedRecordsHandling((prev) => ({
                              ...prev,
                              [assoc.id]: value as RelatedRecordHandling,
                            }))
                          }
                          className="flex gap-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="copy_to_master" id={`${assoc.id}-copy`} />
                            <Label htmlFor={`${assoc.id}-copy`} className="font-normal cursor-pointer">
                              Copy all to master
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="dont_copy" id={`${assoc.id}-dont`} />
                            <Label htmlFor={`${assoc.id}-dont`} className="font-normal cursor-pointer">
                              Don't copy
                            </Label>
                          </div>
                        </RadioGroup>
                      )}
                    </div>
                  );
                })
            ) : (
              <p className="text-sm text-muted-foreground py-4">
                No related records found for {objectType}.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Warning Box */}
      {isEditing && isUsedByRules && (
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">
                  This strategy is used by {usedBy.length} Match Rules:
                </p>
                <ul className="mt-2 text-sm text-muted-foreground">
                  {usedBy.map((rule) => (
                    <li key={rule}>• {rule}</li>
                  ))}
                </ul>
                <p className="mt-2 text-sm text-muted-foreground">
                  Changes will affect ALL rules using this strategy.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center pt-4 border-t">
        <div>
          {isEditing && (
            <Button variant="outline" onClick={handleSaveAsNew}>
              Save as New
            </Button>
          )}
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link to="/merge-strategies">Cancel</Link>
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>

      {/* Confirm Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Changes</DialogTitle>
            <DialogDescription>
              This strategy is used by {usedBy.length} Match Rules. Saving these changes will affect
              all rules using this strategy. Are you sure you want to continue?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={performSave}>Confirm Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save as New Dialog */}
      <Dialog open={showSaveAsNewDialog} onOpenChange={setShowSaveAsNewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as New Strategy</DialogTitle>
            <DialogDescription>Enter a name for the new strategy.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newStrategyName}
              onChange={(e) => setNewStrategyName(e.target.value)}
              placeholder="Strategy name"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveAsNewDialog(false)}>
              Cancel
            </Button>
            <Button onClick={performSaveAsNew}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
