import { NavLink, useLocation as useRouterLocation } from "react-router-dom";
import {
  LayoutDashboard,
  GitMerge,
  History,
  Settings,
  HelpCircle,
  Bell,
  Menu,
  X,
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
import { UpgradeBadge } from "@/components/ui/upgrade-badge";
import { useUpgradeModal } from "@/components/ui/upgrade-modal";

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

export function TopNav() {
  const routerLocation = useRouterLocation();
  const { canUseStrategies, plan } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const unreadCount = useUnreadNotificationCount();
  const { openUpgradeModal } = useUpgradeModal();

  const NavItems = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {navItems.map((item) => {
        const isActive = routerLocation.pathname === item.href ||
          (item.href !== "/" && routerLocation.pathname.startsWith(item.href));
        const isLocked = item.requiresPlan && !canUseStrategies;

        if (isLocked) {
          return (
            <div
              key={item.href}
              onClick={() => openUpgradeModal("merge_strategies")}
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors group cursor-pointer",
                "text-muted-foreground hover:bg-muted/50",
                mobile && "w-full"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0 opacity-60 group-hover:opacity-80" />
              <span className="opacity-60 group-hover:opacity-80">{item.title}</span>
              <div className="ml-auto">
                <UpgradeBadge tier="pro" showTooltip={false} feature="merge_strategies" />
              </div>
            </div>
          );
        }

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
                const isLocked = item.requiresPlan && !canUseStrategies;

                if (isLocked) {
                  return (
                    <DropdownMenuItem
                      key={item.href}
                      className="cursor-pointer"
                      onSelect={(e) => {
                        e.preventDefault();
                        openUpgradeModal("merge_strategies");
                        setMobileOpen(false);
                      }}
                    >
                      <item.icon className="h-4 w-4 mr-2 opacity-60" />
                      <span className="opacity-60">{item.title}</span>
                      <div className="ml-auto">
                        <UpgradeBadge tier="pro" showTooltip={false} feature="merge_strategies" />
                      </div>
                    </DropdownMenuItem>
                  );
                }

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
