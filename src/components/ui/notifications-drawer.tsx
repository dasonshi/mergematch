import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, CheckCheck, Loader2, AlertCircle, GitMerge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { api, Notification } from "@/lib/api";
import { useLocation } from "@/contexts/LocationContext";

interface NotificationsDrawerProps {
  children?: React.ReactNode;
}

export function NotificationsDrawer({ children }: NotificationsDrawerProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useLocation();

  // Fetch notifications
  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api.getNotifications(50, 0, false),
    enabled: isAuthenticated,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Mark as read mutation
  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-count"] });
    },
  });

  // Mark all as read mutation
  const markAllReadMutation = useMutation({
    mutationFn: () => api.markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-count"] });
    },
  });

  const notifications = notificationsData?.data || [];
  const unreadCount = notificationsData?.unread_count || 0;

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      markReadMutation.mutate(notification.id);
    }

    // Navigate to the rule's history if metadata includes rule_id
    if (notification.metadata?.rule_id) {
      navigate(`/match-rules/${notification.metadata.rule_id}#history`);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "bulk_merge":
        return <GitMerge className="h-4 w-4" />;
      case "scan_complete":
        return <Check className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children || (
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 min-w-5 px-1 text-xs flex items-center justify-center"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle>Notifications</SheetTitle>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAllReadMutation.mutate()}
                disabled={markAllReadMutation.isPending}
              >
                <CheckCheck className="h-4 w-4 mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center px-6">
              <Bell className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No notifications yet</p>
              <p className="text-sm text-muted-foreground">
                Bulk operation results will appear here
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "w-full text-left px-6 py-4 hover:bg-muted/50 transition-colors",
                    !notification.read && "bg-primary/5"
                  )}
                >
                  <div className="flex gap-3">
                    <div
                      className={cn(
                        "flex-shrink-0 rounded-full p-1.5",
                        notification.metadata?.fail_count && notification.metadata.fail_count > 0
                          ? "bg-destructive/10 text-destructive"
                          : "bg-primary/10 text-primary"
                      )}
                    >
                      {notification.metadata?.fail_count && notification.metadata.fail_count > 0 ? (
                        <AlertCircle className="h-4 w-4" />
                      ) : (
                        getNotificationIcon(notification.type)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={cn(
                            "font-medium text-sm truncate",
                            !notification.read && "text-foreground",
                            notification.read && "text-muted-foreground"
                          )}
                        >
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <span className="flex-shrink-0 h-2 w-2 rounded-full bg-primary" />
                        )}
                      </div>
                      {notification.message && (
                        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                          {notification.message}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(notification.created_at)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

// Standalone hook for unread count (for sidebar badge)
export function useUnreadNotificationCount() {
  const { isAuthenticated } = useLocation();

  const { data } = useQuery({
    queryKey: ["unread-count"],
    queryFn: () => api.getUnreadNotificationCount(),
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  return data?.count || 0;
}
