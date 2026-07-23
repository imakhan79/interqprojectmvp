import { useCallback, useEffect, useState } from "react";
import { Bell, CheckCheck, Briefcase, UserCheck, Calendar, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/SimpleAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeTable } from "@/hooks/useRealtimeTable";
import {
  type DisplayNotification,
  type NotificationRow,
  mapDbNotification,
  getDemoNotifications,
} from "@/lib/notifications";

type Notification = DisplayNotification;

const IconMap: Record<string, any> = {
  job: Briefcase,
  candidate: UserCheck,
  interview: Calendar,
  offer: FileText,
  alert: AlertCircle,
};

const typeColors: Record<string, string> = {
  info: "bg-blue-500",
  success: "bg-green-500",
  warning: "bg-yellow-500",
  error: "bg-red-500",
};

export function NotificationBell() {
  const { user } = useAuth();
  const role = user?.role || "jobseeker";
  const isRealUser = !!user && !user.isDemo;

  const [notifications, setNotifications] = useState<Notification[]>(() =>
    isRealUser ? [] : getDemoNotifications(role)
  );
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isRealUser || !user) return;

    let cancelled = false;
    supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data, error }) => {
        if (cancelled || error || !data) return;
        setNotifications((data as NotificationRow[]).map(mapDbNotification));
      });

    return () => {
      cancelled = true;
    };
  }, [isRealUser, user]);

  useRealtimeTable({
    table: "notifications",
    filter: user ? `user_id=eq.${user.id}` : undefined,
    enabled: isRealUser,
    onChange: (payload) => {
      if (payload.eventType === "INSERT") {
        setNotifications(prev => [mapDbNotification(payload.new as unknown as NotificationRow), ...prev]);
      } else if (payload.eventType === "UPDATE") {
        const updated = mapDbNotification(payload.new as unknown as NotificationRow);
        setNotifications(prev => prev.map(n => (n.id === updated.id ? updated : n)));
      } else if (payload.eventType === "DELETE") {
        const oldId = (payload.old as { id?: string })?.id;
        setNotifications(prev => prev.filter(n => n.id !== oldId));
      }
    },
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    if (isRealUser && user) {
      supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);
    }
  }, [isRealUser, user]);

  const markRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    if (isRealUser) {
      supabase.from("notifications").update({ is_read: true }).eq("id", id);
    }
  }, [isRealUser]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-84 p-0" align="end" style={{ width: "340px" }}>
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm">Notifications</h4>
            {unreadCount > 0 && <Badge className="bg-red-100 text-red-700 text-xs">{unreadCount} new</Badge>}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-xs text-primary hover:underline flex items-center gap-1">
              <CheckCheck className="h-3 w-3" /> Mark all read
            </button>
          )}
        </div>
        <ScrollArea className="max-h-[360px]">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
              No notifications
            </div>
          ) : notifications.map(n => {
            const Icon = IconMap[n.icon] || Bell;
            return (
              <div
                key={n.id}
                className={cn("px-4 py-3 border-b last:border-0 cursor-pointer hover:bg-muted/50 transition-colors", !n.read && "bg-primary/5")}
                onClick={() => markRead(n.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={cn("w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5", typeColors[n.type] || "bg-gray-400")}>
                    <Icon className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-snug">{n.title}</p>
                    {n.message && <p className="text-xs text-muted-foreground leading-snug">{n.message}</p>}
                    <p className="text-xs text-muted-foreground mt-0.5">{n.time}</p>
                  </div>
                  {!n.read && <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />}
                </div>
              </div>
            );
          })}
        </ScrollArea>
        <div className="px-4 py-2 border-t">
          <button className="text-xs text-primary hover:underline w-full text-center">View all notifications</button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
