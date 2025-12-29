import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Key, 
  Bell, 
  Shield, 
  Zap,
  ExternalLink
} from "lucide-react";

export default function Settings() {
  return (
    <div className="space-y-8 pt-12 lg:pt-0">
      <PageHeader 
        title="Settings" 
        description="Configure your MergeMatch preferences"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* API Configuration */}
        <Card className="animate-fade-in border-border/50 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              <CardTitle>API Configuration</CardTitle>
            </div>
            <CardDescription>Connect to your GoHighLevel account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <Input id="api-key" type="password" placeholder="Enter your GHL API key" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location-id">Location ID</Label>
              <Input id="location-id" placeholder="Enter your location ID" />
            </div>
            <div className="flex items-center justify-between pt-2">
              <Badge variant="outline" className="bg-success/10 text-success">
                Connected
              </Badge>
              <Button variant="outline" size="sm">
                Test Connection
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="animate-fade-in border-border/50 shadow-sm" style={{ animationDelay: "50ms" }}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>Manage your notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-xs text-muted-foreground">Receive daily digest emails</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Merge Alerts</Label>
                <p className="text-xs text-muted-foreground">Get notified for new duplicates</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Weekly Reports</Label>
                <p className="text-xs text-muted-foreground">Summary of merge activity</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Safety Settings */}
        <Card className="animate-fade-in border-border/50 shadow-sm" style={{ animationDelay: "100ms" }}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Safety Settings</CardTitle>
            </div>
            <CardDescription>Configure merge protection options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Confirmation</Label>
                <p className="text-xs text-muted-foreground">Confirm before merging</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Keep Backup</Label>
                <p className="text-xs text-muted-foreground">Create backup before merge</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow Undo</Label>
                <p className="text-xs text-muted-foreground">Enable undo for 30 days</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Plan Details */}
        <Card className="animate-fade-in border-border/50 shadow-sm" style={{ animationDelay: "150ms" }}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <CardTitle>Plan Details</CardTitle>
            </div>
            <CardDescription>Your current subscription</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Current Plan</span>
              <Badge>Starter Plan</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Monthly Merges</span>
              <span className="text-sm font-medium">423 / 1,000</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Auto-merge Rules</span>
              <span className="text-sm font-medium">2 / 3</span>
            </div>
            <Separator />
            <Button className="w-full">
              Upgrade Plan
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
