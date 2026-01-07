import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle } from "lucide-react";
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

const objectTypes = ["Contacts", "Companies", "Opportunities", "Custom Objects"];

export default function MergeStrategyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = Boolean(id);

  // Form state
  const [name, setName] = useState(isEditing ? mockStrategy.name : "");
  const [objectType, setObjectType] = useState(isEditing ? mockStrategy.objectType : "");
  const [masterSelection, setMasterSelection] = useState(isEditing ? mockStrategy.masterSelection : "most-complete");
  const [conflictResolution, setConflictResolution] = useState(isEditing ? mockStrategy.conflictResolution : "prefer-master");
  const [notesHandling, setNotesHandling] = useState(isEditing ? mockStrategy.notesHandling : "copy-all");
  const [tasksHandling, setTasksHandling] = useState(isEditing ? mockStrategy.tasksHandling : "copy-all");
  const [opportunitiesHandling, setOpportunitiesHandling] = useState(isEditing ? mockStrategy.opportunitiesHandling : "keep-all");

  // Dialogs
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSaveAsNewDialog, setShowSaveAsNewDialog] = useState(false);
  const [newStrategyName, setNewStrategyName] = useState("");

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
                  {objectTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
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

      {/* Related Records */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Related Records</CardTitle>
          <p className="text-sm text-muted-foreground">
            How should associated records be handled during merge?
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Notes:</Label>
            <RadioGroup value={notesHandling} onValueChange={setNotesHandling} className="flex gap-6">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="copy-all" id="notes-copy" />
                <Label htmlFor="notes-copy" className="font-normal cursor-pointer">
                  Copy all to master
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dont-copy" id="notes-dont" />
                <Label htmlFor="notes-dont" className="font-normal cursor-pointer">
                  Don't copy
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Tasks */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Tasks:</Label>
            <RadioGroup value={tasksHandling} onValueChange={setTasksHandling} className="flex gap-6">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="copy-all" id="tasks-copy" />
                <Label htmlFor="tasks-copy" className="font-normal cursor-pointer">
                  Copy all to master
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dont-copy" id="tasks-dont" />
                <Label htmlFor="tasks-dont" className="font-normal cursor-pointer">
                  Don't copy
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Opportunities */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Opportunities:</Label>
            <RadioGroup value={opportunitiesHandling} onValueChange={setOpportunitiesHandling}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="keep-all" id="opps-all" />
                <Label htmlFor="opps-all" className="font-normal cursor-pointer">
                  Keep all from both records
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="keep-master" id="opps-master" />
                <Label htmlFor="opps-master" className="font-normal cursor-pointer">
                  Keep from master only
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="keep-highest" id="opps-highest" />
                <Label htmlFor="opps-highest" className="font-normal cursor-pointer">
                  Keep highest monetary value
                </Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

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
