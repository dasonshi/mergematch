import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  RefreshCw,
  Trash2,
  Unplug,
  Rocket,
  ExternalLink,
  Lightbulb,
  Plus,
  X,
  ArrowRight,
  Loader2,
  Save,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, MergeStrategySettings, FieldPreservationMapping, CustomField } from "@/lib/api";
// Note: Email notifications removed - using in-app notifications only
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useLocation } from "@/contexts/LocationContext";

// Source fields that can be preserved
const PRESERVABLE_FIELDS = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'address1', label: 'Address' },
];

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const {
    locationId,
    locationName,
    connectionStatus,
    plan,
    reconnect,
    isOnTrial,
    trialEndsAt,
    upgradeUrl,
    features,
  } = useLocation();

  const isAgencyPlan = plan === 'agency';
  const isProPlan = plan === 'pro' || plan === 'agency';
  const canUpgrade = plan === 'free' || plan === 'starter';

  // Format trial end date
  const trialEndDate = trialEndsAt ? new Date(trialEndsAt).toLocaleDateString() : null;

  const [preferences, setPreferences] = useState({
    showIndividualMergeWarning: true,
    showBulkMergeWarning: true,
    showRestoreWarning: true,
  });

  // Merge Strategy state
  const [mergeStrategyDirty, setMergeStrategyDirty] = useState(false);
  const [fieldPreservation, setFieldPreservation] = useState<{
    enabled: boolean;
    auto_create_fields: boolean;
    mappings: FieldPreservationMapping[];
  }>({
    enabled: false,
    auto_create_fields: false,
    mappings: [],
  });
  const [newFieldName, setNewFieldName] = useState('');

  // Fetch merge strategy settings
  const { data: mergeStrategy, isLoading: loadingStrategy } = useQuery({
    queryKey: ['mergeStrategy', locationId],
    queryFn: () => api.getMergeStrategy(),
    staleTime: 60000,
  });

  // Fetch custom fields from GHL
  const { data: customFields = [], isLoading: loadingFields } = useQuery({
    queryKey: ['customFields', locationId],
    queryFn: () => api.getCustomFields(),
    staleTime: 60000,
  });

  // Initialize state when data loads
  useState(() => {
    if (mergeStrategy) {
      setFieldPreservation(mergeStrategy.field_preservation);
    }
  });

  // Update state when mergeStrategy changes
  if (mergeStrategy && !mergeStrategyDirty) {
    if (JSON.stringify(fieldPreservation) !== JSON.stringify(mergeStrategy.field_preservation)) {
      setFieldPreservation(mergeStrategy.field_preservation);
    }
  }

  // Save merge strategy mutation
  const saveMergeStrategy = useMutation({
    mutationFn: (settings: MergeStrategySettings) => api.updateMergeStrategy(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mergeStrategy'] });
      setMergeStrategyDirty(false);
      toast({
        title: 'Settings saved',
        description: 'Merge strategy settings have been updated.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Create custom field mutation
  const createCustomField = useMutation({
    mutationFn: (name: string) => api.createCustomField(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customFields'] });
      setNewFieldName('');
      toast({
        title: 'Field created',
        description: 'Custom field has been created in your CRM.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create custom field. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleAddMapping = () => {
    setFieldPreservation(prev => ({
      ...prev,
      mappings: [...prev.mappings, { source: '', target: '' }],
    }));
    setMergeStrategyDirty(true);
  };

  const handleRemoveMapping = (index: number) => {
    setFieldPreservation(prev => ({
      ...prev,
      mappings: prev.mappings.filter((_, i) => i !== index),
    }));
    setMergeStrategyDirty(true);
  };

  const handleUpdateMapping = (index: number, field: 'source' | 'target', value: string) => {
    setFieldPreservation(prev => ({
      ...prev,
      mappings: prev.mappings.map((m, i) =>
        i === index ? { ...m, [field]: value } : m
      ),
    }));
    setMergeStrategyDirty(true);
  };

  const handleSaveMergeStrategy = () => {
    saveMergeStrategy.mutate({ field_preservation: fieldPreservation });
  };

  const handleCreateCustomField = () => {
    if (newFieldName.trim()) {
      createCustomField.mutate(newFieldName.trim());
    }
  };

  const handleResetWarnings = () => {
    setPreferences({
      showIndividualMergeWarning: true,
      showBulkMergeWarning: true,
      showRestoreWarning: true,
    });
    toast({
      title: "Warnings reset",
      description: "All warning preferences have been restored to defaults.",
    });
  };

  const handleForceResync = () => {
    toast({
      title: "Resync started",
      description: "Full resync initiated. This may take a few minutes.",
    });
  };

  const handleDeleteAllData = () => {
    toast({
      title: "Data deleted",
      description: "All match rules, merge history, and settings have been removed.",
      variant: "destructive",
    });
  };

  const handleDisconnect = () => {
    toast({
      title: "Account disconnected",
      description: "MergeMatch access has been revoked. Reinstall from Marketplace to reconnect.",
      variant: "destructive",
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Settings" 
        description="Configure your MergeMatch preferences"
      />

      {/* Connection Section */}
      <Card className="shadow-sm">
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle className="text-lg font-bold">Connection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">CRM Status:</span>
                {connectionStatus === 'connected' ? (
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                    <span className="text-sm font-medium text-success">Connected</span>
                  </span>
                ) : connectionStatus === 'token_expired' ? (
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-destructive" />
                    <span className="text-sm font-medium text-destructive">Token Expired</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Disconnected</span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Location ID:</span>
                <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded">{locationId || '—'}</code>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Location Name:</span>
                <span className="text-sm font-medium">{locationName || '—'}</span>
              </div>
            </div>
            <Button variant="outline" onClick={reconnect}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reconnect
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Section */}
      <Card className="shadow-sm">
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle className="text-lg font-bold">Subscription</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Current Plan:</span>
              <span className="text-sm font-medium capitalize">{plan}</span>
              {isOnTrial && (
                <span className="text-xs bg-warning/20 text-warning px-2 py-0.5 rounded-full">
                  Trial
                </span>
              )}
            </div>
            {isOnTrial && trialEndDate && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Trial ends:</span>
                <span className="text-sm font-medium">{trialEndDate}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Billing:</span>
              <span className="text-sm">Managed via Marketplace</span>
            </div>
          </div>

          {/* Upgrade CTA Card - only show if can upgrade */}
          {canUpgrade && (
            <Card className="border-primary/50 bg-primary/10 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Rocket className="h-5 w-5 text-primary" />
                      <span className="font-semibold">
                        {plan === 'free' ? 'Upgrade to Pro ($29/mo)' : 'Upgrade to Agency ($49/mo)'}
                      </span>
                    </div>
                    <ul className="space-y-1.5 text-sm text-muted-foreground">
                      {plan === 'free' ? (
                        <>
                          <li className="flex items-center gap-2">
                            <span className="h-1 w-1 rounded-full bg-primary" />
                            Unlimited merges
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="h-1 w-1 rounded-full bg-primary" />
                            Scheduled scans & auto-merge
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="h-1 w-1 rounded-full bg-primary" />
                            Company & opportunity matching
                          </li>
                        </>
                      ) : (
                        <>
                          <li className="flex items-center gap-2">
                            <span className="h-1 w-1 rounded-full bg-primary" />
                            White-label branding
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="h-1 w-1 rounded-full bg-primary" />
                            Priority support
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                  <Button asChild>
                    <a href={upgradeUrl || '#'} target="_blank" rel="noopener noreferrer">
                      Upgrade Now
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Preferences Section */}
      <Card className="shadow-sm">
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle className="text-lg font-bold">Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label className="text-base font-semibold">Merge Warnings</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="individual-warning" 
                  checked={preferences.showIndividualMergeWarning}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, showIndividualMergeWarning: checked as boolean }))
                  }
                />
                <label htmlFor="individual-warning" className="text-sm cursor-pointer">
                  Show warning before individual merges
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="bulk-warning" 
                  checked={preferences.showBulkMergeWarning}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, showBulkMergeWarning: checked as boolean }))
                  }
                />
                <label htmlFor="bulk-warning" className="text-sm cursor-pointer">
                  Show warning before bulk merges
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="restore-warning" 
                  checked={preferences.showRestoreWarning}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, showRestoreWarning: checked as boolean }))
                  }
                />
                <label htmlFor="restore-warning" className="text-sm cursor-pointer">
                  Show warning before restoring merges
                </label>
              </div>
            </div>
          </div>
          <Button variant="outline" onClick={handleResetWarnings}>
            Reset All Warnings
          </Button>
        </CardContent>
      </Card>

      {/* Merge Strategies Section */}
      <Card className="shadow-sm">
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle className="text-lg font-bold">Merge Strategies</CardTitle>
          <CardDescription>Configure how alternate values are preserved during merges</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {loadingStrategy ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Enable Field Preservation */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="enable-preservation"
                  checked={fieldPreservation.enabled}
                  onCheckedChange={(checked) => {
                    setFieldPreservation(prev => ({ ...prev, enabled: checked as boolean }));
                    setMergeStrategyDirty(true);
                  }}
                />
                <label htmlFor="enable-preservation" className="text-sm cursor-pointer">
                  Enable field preservation (save alternate values to custom fields)
                </label>
              </div>

              {fieldPreservation.enabled && (
                <>
                  {/* Field Mappings */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Field Mappings</Label>
                    <p className="text-sm text-muted-foreground">
                      When merging, the non-selected value will be saved to the target custom field.
                    </p>

                    {fieldPreservation.mappings.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic py-2">
                        No mappings configured. Add a mapping to preserve alternate values.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {fieldPreservation.mappings.map((mapping, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Select
                              value={mapping.source}
                              onValueChange={(value) => handleUpdateMapping(index, 'source', value)}
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Source field" />
                              </SelectTrigger>
                              <SelectContent>
                                {PRESERVABLE_FIELDS.map(f => (
                                  <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />

                            <Select
                              value={mapping.target}
                              onValueChange={(value) => handleUpdateMapping(index, 'target', value)}
                            >
                              <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Target custom field" />
                              </SelectTrigger>
                              <SelectContent>
                                {customFields.map((f: CustomField) => (
                                  <SelectItem key={f.id} value={f.name}>{f.name}</SelectItem>
                                ))}
                                {customFields.length === 0 && (
                                  <SelectItem value="" disabled>No custom fields found</SelectItem>
                                )}
                              </SelectContent>
                            </Select>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveMapping(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    <Button variant="outline" size="sm" onClick={handleAddMapping}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Mapping
                    </Button>
                  </div>

                  {/* Auto-create fields */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="auto-create-fields"
                      checked={fieldPreservation.auto_create_fields}
                      onCheckedChange={(checked) => {
                        setFieldPreservation(prev => ({ ...prev, auto_create_fields: checked as boolean }));
                        setMergeStrategyDirty(true);
                      }}
                    />
                    <label htmlFor="auto-create-fields" className="text-sm cursor-pointer">
                      Auto-create custom fields if they don't exist
                    </label>
                  </div>

                  {/* Create Custom Field */}
                  <div className="space-y-2 pt-2">
                    <Label className="text-sm font-medium">Create New Custom Field</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g., Secondary Email"
                        value={newFieldName}
                        onChange={(e) => setNewFieldName(e.target.value)}
                        className="max-w-[250px]"
                      />
                      <Button
                        variant="outline"
                        onClick={handleCreateCustomField}
                        disabled={!newFieldName.trim() || createCustomField.isPending}
                      >
                        {createCustomField.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-1" />
                            Create
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              )}

              {/* Save Button */}
              <div className="pt-2">
                <Button
                  onClick={handleSaveMergeStrategy}
                  disabled={!mergeStrategyDirty || saveMergeStrategy.isPending}
                >
                  {saveMergeStrategy.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* White-Label Section */}
      <Card className="shadow-sm">
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle className="text-lg font-bold">White-Label</CardTitle>
          <CardDescription>Customize branding for your clients</CardDescription>
        </CardHeader>
        <CardContent>
          {!features.white_label ? (
            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
              <Lightbulb className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                Upgrade to Agency plan to customize branding for your clients.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <div className="flex items-center gap-2">
                    <Input id="company-name" defaultValue="Acme Marketing Agency" />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">(from CRM)</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo-url">Logo URL</Label>
                  <div className="flex items-center gap-2">
                    <Input id="logo-url" defaultValue="https://acme.com/logo.png" />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">(from CRM)</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="custom-css">Custom CSS</Label>
                <Textarea 
                  id="custom-css" 
                  placeholder="Enter custom CSS styles..."
                  className="min-h-[100px] font-mono text-sm"
                />
              </div>
              <div className="flex items-center justify-between pt-2">
                <Button variant="outline">
                  Open Preview
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
                <Button>Save Branding</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-destructive">Danger Zone</h2>
        <Separator />

        {/* Force Full Resync */}
        <Card className="border-destructive/50 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  <span className="font-medium">Force Full Resync</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Clear local cache and re-pull all records from your CRM.
                </p>
                <p className="text-sm text-muted-foreground">
                  Use if data seems out of sync after a large import.
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline">Force Resync</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Force Full Resync?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will clear all cached data and re-pull records from your CRM.
                      This process may take several minutes depending on your data volume.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleForceResync}>
                      Start Resync
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        {/* Delete All Data */}
        <Card className="border-destructive/50 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4 text-destructive" />
                  <span className="font-medium">Delete All Data</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Remove all match rules, merge history, and settings.
                </p>
                <p className="text-sm text-muted-foreground">
                  Your CRM contacts will NOT be affected.
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Delete All Data</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete All Data?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all match rules, merge history, and settings.
                      Your CRM contacts will not be affected. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDeleteAllData}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete All Data
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        {/* Disconnect Account */}
        <Card className="border-destructive/50 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Unplug className="h-4 w-4 text-destructive" />
                  <span className="font-medium">Disconnect Account</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Revoke MergeMatch's access to this location.
                </p>
                <p className="text-sm text-muted-foreground">
                  All data will be deleted. You can reinstall from Marketplace.
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Disconnect</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Disconnect Account?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will revoke MergeMatch's access to your CRM location and
                      permanently delete all data. You can reinstall from the Marketplace
                      to reconnect. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDisconnect}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Disconnect Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
