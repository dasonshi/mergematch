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
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address");

export default function Settings() {
  const { toast } = useToast();
  const [isAgencyPlan] = useState(false); // Toggle this to show Agency plan features
  const [isProPlan] = useState(false); // Toggle this to show Pro plan features
  
  const [preferences, setPreferences] = useState({
    showIndividualMergeWarning: true,
    showBulkMergeWarning: true,
    showRestoreWarning: true,
  });

  const [notifications, setNotifications] = useState({
    dailySummary: true,
    newDuplicatesAlert: true,
    weeklyReport: true,
    autoMergeCompletion: false,
  });

  const [notificationEmail, setNotificationEmail] = useState("user@agency.com");
  const [emailError, setEmailError] = useState<string | null>(null);

  const handleSaveNotifications = () => {
    const result = emailSchema.safeParse(notificationEmail);
    if (!result.success) {
      setEmailError(result.error.errors[0].message);
      return;
    }
    setEmailError(null);
    toast({
      title: "Notification settings saved",
      description: "Your notification preferences have been updated.",
    });
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
    <div className="space-y-8 pt-12 lg:pt-0">
      <PageHeader 
        title="Settings" 
        description="Configure your MergeMatch preferences"
      />

      {/* Connection Section */}
      <Card className="animate-fade-in border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle>Connection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">GoHighLevel Status:</span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                  <span className="text-sm font-medium text-success">Connected</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Location ID:</span>
                <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded">loc_abc123</code>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Location Name:</span>
                <span className="text-sm font-medium">Acme Marketing Agency</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Connected Since:</span>
                <span className="text-sm">December 15, 2024</span>
              </div>
            </div>
            <Button variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reconnect
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Section */}
      <Card className="animate-fade-in border-border/50 shadow-sm" style={{ animationDelay: "50ms" }}>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Current Plan:</span>
              <span className="text-sm font-medium">Starter ($39/mo)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Billing:</span>
              <span className="text-sm">Managed via GHL Marketplace</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Next Billing:</span>
              <span className="text-sm">January 15, 2025</span>
            </div>
          </div>

          {/* Upgrade CTA Card */}
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Rocket className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Upgrade to Pro ($59/mo)</span>
                  </div>
                  <ul className="space-y-1.5 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-primary" />
                      Scheduled scans (hourly)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-primary" />
                      Auto-merge high-confidence matches
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-primary" />
                      Opportunities & Custom Objects
                    </li>
                  </ul>
                </div>
                <Button>
                  Upgrade Now
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Notifications Section */}
      <Card className="animate-fade-in border-border/50 shadow-sm" style={{ animationDelay: "100ms" }}>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Configure email notifications for your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-base">Email Notifications</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="daily-summary" 
                  checked={notifications.dailySummary}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, dailySummary: checked as boolean }))
                  }
                />
                <label htmlFor="daily-summary" className="text-sm cursor-pointer">
                  Daily summary of pending matches
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="new-duplicates" 
                  checked={notifications.newDuplicatesAlert}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, newDuplicatesAlert: checked as boolean }))
                  }
                />
                <label htmlFor="new-duplicates" className="text-sm cursor-pointer">
                  Alert when new duplicates are found
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="weekly-report" 
                  checked={notifications.weeklyReport}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, weeklyReport: checked as boolean }))
                  }
                />
                <label htmlFor="weekly-report" className="text-sm cursor-pointer">
                  Weekly merge activity report
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="auto-merge" 
                  checked={notifications.autoMergeCompletion}
                  disabled={!isProPlan}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, autoMergeCompletion: checked as boolean }))
                  }
                />
                <label 
                  htmlFor="auto-merge" 
                  className={`text-sm cursor-pointer ${!isProPlan ? 'text-muted-foreground' : ''}`}
                >
                  Alert on auto-merge completion {!isProPlan && <span className="text-muted-foreground">(Pro+ only)</span>}
                </label>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notification-email">Notification Email</Label>
            <Input 
              id="notification-email" 
              type="email"
              value={notificationEmail}
              onChange={(e) => {
                setNotificationEmail(e.target.value);
                setEmailError(null);
              }}
              className={emailError ? "border-destructive" : ""}
            />
            {emailError && (
              <p className="text-sm text-destructive">{emailError}</p>
            )}
          </div>
          <Button onClick={handleSaveNotifications}>
            Save Notification Settings
          </Button>
        </CardContent>
      </Card>

      {/* Preferences Section */}
      <Card className="animate-fade-in border-border/50 shadow-sm" style={{ animationDelay: "150ms" }}>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-base">Merge Warnings</Label>
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
      <Card className="animate-fade-in border-border/50 shadow-sm" style={{ animationDelay: "150ms" }}>
        <CardHeader>
          <CardTitle>White-Label</CardTitle>
          <CardDescription>Customize branding for your clients</CardDescription>
        </CardHeader>
        <CardContent>
          {!isAgencyPlan ? (
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
                    <span className="text-xs text-muted-foreground whitespace-nowrap">(from GHL)</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo-url">Logo URL</Label>
                  <div className="flex items-center gap-2">
                    <Input id="logo-url" defaultValue="https://acme.com/logo.png" />
                    <span className="text-xs text-muted-foreground whitespace-nowrap">(from GHL)</span>
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
        <Card className="animate-fade-in border-destructive/30" style={{ animationDelay: "200ms" }}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  <span className="font-medium">Force Full Resync</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Clear local cache and re-pull all records from GHL.
                </p>
                <p className="text-sm text-muted-foreground">
                  Use if data seems out of sync after a large GHL import.
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
                      This will clear all cached data and re-pull records from GoHighLevel. 
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
        <Card className="animate-fade-in border-destructive/30" style={{ animationDelay: "250ms" }}>
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
                  Your GHL contacts will NOT be affected.
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
                      Your GoHighLevel contacts will not be affected. This action cannot be undone.
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
        <Card className="animate-fade-in border-destructive/30" style={{ animationDelay: "300ms" }}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Unplug className="h-4 w-4 text-destructive" />
                  <span className="font-medium">Disconnect Account</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Revoke MergeMatch's access to this GHL location.
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
                      This will revoke MergeMatch's access to your GoHighLevel location and 
                      permanently delete all data. You can reinstall from the GHL Marketplace 
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
