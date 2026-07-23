import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Check, Clock, Briefcase, Calendar, CheckCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/SimpleAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeTable } from "@/hooks/useRealtimeTable";
import {
  type DisplayNotification,
  type NotificationRow,
  mapDbNotification,
  getDemoNotifications,
} from "@/lib/notifications";

const getIcon = (icon: DisplayNotification["icon"]) => {
  switch (icon) {
    case "job": return <Briefcase className="h-4 w-4 text-blue-500" />;
    case "interview": return <Calendar className="h-4 w-4 text-purple-500" />;
    case "offer": return <Check className="h-4 w-4 text-green-500" />;
    default: return <Bell className="h-4 w-4 text-gray-500" />;
  }
};

export default function CompanyNotifications() {
  const { user } = useAuth();
  const isRealUser = !!user && !user.isDemo;
  const [notifications, setNotifications] = useState<DisplayNotification[]>(() =>
    isRealUser ? [] : getDemoNotifications("company")
  );
  const [loading, setLoading] = useState(isRealUser);

  const load = useCallback(async () => {
    if (!isRealUser || !user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100);
    if (!error && data) {
      setNotifications((data as NotificationRow[]).map(mapDbNotification));
    }
    setLoading(false);
  }, [isRealUser, user]);

  useEffect(() => { load(); }, [load]);

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

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    if (isRealUser) {
      supabase.from("notifications").update({ is_read: true }).eq("id", id);
    }
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    if (isRealUser && user) {
      supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-sm text-muted-foreground">Approvals, applications, and hiring pipeline updates</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1">
            {unreadCount} Unread
          </Badge>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllRead}>
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">Loading...</CardContent></Card>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">You're all caught up</h3>
            <p className="text-muted-foreground">Job and company approvals, and pipeline updates will show up here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`hover:bg-muted/50 transition-colors cursor-pointer ${!notification.read ? "border-l-4 border-l-primary" : ""}`}
              onClick={() => markRead(notification.id)}
            >
              <CardContent className="p-4 flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                  {getIcon(notification.icon)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-4">
                    <p className={`text-sm font-semibold ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}>
                      {notification.title}
                    </p>
                    <span className="text-xs text-muted-foreground flex items-center flex-shrink-0">
                      <Clock className="h-3 w-3 mr-1" />
                      {notification.time}
                    </span>
                  </div>
                  {notification.message && (
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
