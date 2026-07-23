import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  CheckCircle,
  Calendar,
  FileText,
  Briefcase,
  Check,
} from "lucide-react";
import { useAuth } from "@/contexts/SimpleAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeTable } from "@/hooks/useRealtimeTable";
import {
  type DisplayNotification,
  type NotificationRow,
  mapDbNotification,
  getDemoNotifications,
} from "@/lib/notifications";

const notificationIcons: Record<DisplayNotification["icon"], React.ReactNode> = {
  interview: <Calendar className="w-5 h-5 text-blue-600" />,
  job: <Briefcase className="w-5 h-5 text-indigo-600" />,
  offer: <FileText className="w-5 h-5 text-amber-600" />,
  candidate: <CheckCircle className="w-5 h-5 text-green-600" />,
  alert: <Bell className="w-5 h-5 text-gray-600" />,
};

export default function JobSeekerNotifications() {
  const { user } = useAuth();
  const isRealUser = !!user && !user.isDemo;
  const [filter, setFilter] = useState<string>("all");
  const [notifications, setNotifications] = useState<DisplayNotification[]>(() =>
    isRealUser ? [] : getDemoNotifications("jobseeker")
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

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === "unread") return !notif.read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500">Stay updated with your applications</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <Check className="w-4 h-4 mr-2" />
            Mark all as read
          </Button>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        <Button
          variant={filter === "unread" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("unread")}
        >
          Unread
          {unreadCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-sm text-muted-foreground">Loading...</div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={`transition cursor-pointer ${!notification.read ? "bg-blue-50/50 border-blue-200" : ""}`}
              onClick={() => markRead(notification.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                      !notification.read ? "bg-blue-100" : "bg-gray-100"
                    }`}
                  >
                    {notificationIcons[notification.icon] || <Bell className="w-5 h-5 text-gray-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                        {notification.message && (
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        )}
                      </div>
                      {!notification.read && (
                        <Badge variant="default" className="ml-2">
                          New
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">{notification.time}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && filteredNotifications.length === 0 && (
        <div className="text-center py-12">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
          <p className="text-gray-500">
            {filter === "unread"
              ? "You've read all your notifications"
              : "You're all caught up!"}
          </p>
        </div>
      )}
    </div>
  );
}
