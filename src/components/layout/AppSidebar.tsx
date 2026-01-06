import { NavLink, useLocation as useRouterLocation } from "react-router-dom";
import {
  LayoutDashboard,
  GitMerge,
  History,
  Settings,
  HelpCircle,
  ArrowUpRight,
  Menu,
  X,
  Lock,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useLocation } from "@/contexts/LocationContext";
import { NotificationsDrawer, useUnreadNotificationCount } from "@/components/ui/notifications-drawer";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresPlan?: boolean;
}

const navItems: NavItem[] = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Merge Strategies", href: "/merge-strategies", icon: GitMerge, requiresPlan: true },
  { title: "History", href: "/history", icon: History },
  { title: "Settings", href: "/settings", icon: Settings },
  { title: "Help", href: "/help", icon: HelpCircle },
];

export function AppSidebar() {
  const routerLocation = useRouterLocation();
  const { canUseStrategies, plan } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const unreadCount = useUnreadNotificationCount();

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo + Notifications */}
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
            <span className="text-sm font-bold text-sidebar-primary-foreground">M</span>
          </div>
          <span className="text-lg font-semibold text-sidebar-accent-foreground">MergeMatch</span>
        </div>
        <NotificationsDrawer>
          <Button variant="ghost" size="icon" className="relative h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent">
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
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-sidebar-border" />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = routerLocation.pathname === item.href ||
            (item.href !== "/" && routerLocation.pathname.startsWith(item.href));
          const isLocked = item.requiresPlan && !canUseStrategies;

          if (isLocked) {
            return (
              <div
                key={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-muted cursor-not-allowed opacity-60"
                title="Upgrade to access this feature"
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{item.title}</span>
                <Lock className="h-3 w-3" />
              </div>
            );
          }

          return (
            <NavLink
              key={item.href}
              to={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className={cn(
                "h-4 w-4 shrink-0",
                isActive ? "text-sidebar-primary" : "text-sidebar-muted"
              )} />
              <span>{item.title}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-4 h-px bg-sidebar-border" />

      {/* Plan Badge & Upgrade */}
      <div className="p-4 space-y-3">
        <Badge
          variant="outline"
          className="w-full justify-center border-sidebar-border bg-sidebar-accent/50 text-sidebar-foreground py-1.5 capitalize"
        >
          {plan} Plan
        </Badge>
        {plan === 'free' && (
          <Button
            variant="ghost"
            className="w-full justify-center gap-1 text-sidebar-primary hover:text-sidebar-primary hover:bg-sidebar-accent"
          >
            Upgrade
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-50 lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-60 bg-sidebar transition-transform duration-300 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
