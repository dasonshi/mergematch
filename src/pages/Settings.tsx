import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  RefreshCw,
  Trash2,
  Unplug,
  Rocket,
  ExternalLink,
  Lightbulb
} from "lucide-react";
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

export default function Settings() {
  const { toast } = useToast();
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
    <div className="space-y-8 ">
      <PageHeader 
        title="Settings" 
        description="Configure your MergeMatch preferences"
      />

      {/* Connection Section */}
      <Card className="animate-fade-in shadow-md">
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
      <Card className="animate-fade-in shadow-md" style={{ animationDelay: "50ms" }}>
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
            <Card className="border-primary/50 bg-primary/10 shadow-md">
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
      <Card className="animate-fade-in shadow-md" style={{ animationDelay: "150ms" }}>
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

      {/* White-Label Section */}
      <Card className="animate-fade-in shadow-md" style={{ animationDelay: "150ms" }}>
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
        <Card className="animate-fade-in border-destructive/50 shadow-md" style={{ animationDelay: "200ms" }}>
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
        <Card className="animate-fade-in border-destructive/50 shadow-md" style={{ animationDelay: "250ms" }}>
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
        <Card className="animate-fade-in border-destructive/50 shadow-md" style={{ animationDelay: "300ms" }}>
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
