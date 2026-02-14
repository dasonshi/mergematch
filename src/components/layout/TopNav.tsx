import { NavLink, useLocation as useRouterLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ListChecks,
  Users,
  History,
  Settings,
  HelpCircle,
  Bell,
  Menu,
  X,
  MessageCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useLocation } from "@/contexts/LocationContext";
import { NotificationsDrawer, useUnreadNotificationCount } from "@/components/ui/notifications-drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Match Rules", href: "/match-rules", icon: ListChecks },
  { title: "Pending Matches", href: "/pending-matches", icon: Users },
  { title: "Merge History", href: "/history", icon: History },
  { title: "Settings", href: "/settings", icon: Settings },
  { title: "Help", href: "/help", icon: HelpCircle },
];

export function TopNav() {
  const routerLocation = useRouterLocation();
  const { plan, locationId } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const unreadCount = useUnreadNotificationCount();
  const { toast } = useToast();
  const [supportOpen, setSupportOpen] = useState(false);
  const [supportForm, setSupportForm] = useState({ name: "", email: "", topic: "", message: "" });
  const [supportSubmitting, setSupportSubmitting] = useState(false);

  const handleSupportSubmit = async () => {
    if (!supportForm.name || !supportForm.email || !supportForm.topic || !supportForm.message) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setSupportSubmitting(true);
    try {
      const res = await fetch(
        "https://services.leadconnectorhq.com/hooks/gdzneuvA9mUJoRroCv4O/webhook-trigger/3d25db25-63fc-4cdd-962c-b95a93d256f7",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...supportForm, locationId }),
        }
      );
      if (!res.ok) throw new Error("Failed to send");
      setSupportForm({ name: "", email: "", topic: "", message: "" });
      setSupportOpen(false);
      toast({ title: "Message sent!", description: "We'll get back to you soon." });
    } catch {
      toast({ title: "Failed to send message", description: "Please try again later.", variant: "destructive" });
    } finally {
      setSupportSubmitting(false);
    }
  };

  const NavItems = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {navItems.map((item) => {
        const isActive = routerLocation.pathname === item.href ||
          (item.href !== "/" && routerLocation.pathname.startsWith(item.href));

        return (
          <NavLink
            key={item.href}
            to={item.href}
            onClick={() => mobile && setMobileOpen(false)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
              mobile && "w-full",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className={cn(
              "h-4 w-4 shrink-0",
              isActive ? "text-primary" : ""
            )} />
            <span>{item.title}</span>
          </NavLink>
        );
      })}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 mr-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
            <span className="text-xs font-bold text-primary-foreground">M</span>
          </div>
          <span className="text-base font-semibold hidden sm:inline">MergeMatch</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          <NavItems />
        </nav>

        {/* Right side items */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Plan Badge */}
          <Badge
            variant="outline"
            className="hidden sm:flex capitalize text-xs"
          >
            {plan}
          </Badge>

          {/* Support */}
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSupportOpen(true)}>
            <MessageCircle className="h-4 w-4" />
          </Button>
          <Dialog open={supportOpen} onOpenChange={setSupportOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Contact Support</DialogTitle>
                <DialogDescription>Send us a message and we'll get back to you as soon as possible.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="grid gap-2">
                  <Label htmlFor="support-name">Name</Label>
                  <Input
                    id="support-name"
                    value={supportForm.name}
                    onChange={(e) => setSupportForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Your name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="support-email">Email</Label>
                  <Input
                    id="support-email"
                    type="email"
                    value={supportForm.email}
                    onChange={(e) => setSupportForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="you@example.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="support-topic">Topic</Label>
                  <Select
                    value={supportForm.topic}
                    onValueChange={(val) => setSupportForm((f) => ({ ...f, topic: val }))}
                  >
                    <SelectTrigger id="support-topic">
                      <SelectValue placeholder="Select a topic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Match Rules">Match Rules</SelectItem>
                      <SelectItem value="Scanning & Matches">Scanning & Matches</SelectItem>
                      <SelectItem value="Merging & Rollback">Merging & Rollback</SelectItem>
                      <SelectItem value="Billing & Subscription">Billing & Subscription</SelectItem>
                      <SelectItem value="Bug Report">Bug Report</SelectItem>
                      <SelectItem value="Feature Request">Feature Request</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="support-message">Message</Label>
                  <Textarea
                    id="support-message"
                    value={supportForm.message}
                    onChange={(e) => setSupportForm((f) => ({ ...f, message: e.target.value }))}
                    placeholder="Describe your issue or question..."
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSupportSubmit} disabled={supportSubmitting}>
                  {supportSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Send Message
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Notifications */}
          <NotificationsDrawer>
            <Button variant="ghost" size="icon" className="relative h-8 w-8">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] flex items-center justify-center"
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Badge>
              )}
            </Button>
          </NotificationsDrawer>

          {/* Mobile Menu */}
          <DropdownMenu open={mobileOpen} onOpenChange={setMobileOpen}>
            <DropdownMenuTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {navItems.map((item) => {
                const isActive = routerLocation.pathname === item.href ||
                  (item.href !== "/" && routerLocation.pathname.startsWith(item.href));

                return (
                  <DropdownMenuItem
                    key={item.href}
                    asChild
                    className={cn(isActive && "bg-accent")}
                  >
                    <NavLink to={item.href} onClick={() => setMobileOpen(false)}>
                      <item.icon className="h-4 w-4 mr-2" />
                      {item.title}
                    </NavLink>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
