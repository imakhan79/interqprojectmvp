import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/SimpleAuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, FileText, Video, Award, User, Bell, Settings,
  LogOut, BookOpen, TrendingUp, ChevronLeft, ChevronRight, Menu, X, Shield, Briefcase
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { NotificationBell } from "@/components/NotificationBell";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/jobseeker" },
  { icon: Briefcase, label: "Job Board", path: "/jobseeker/jobs" },
  { icon: FileText, label: "Assessments", path: "/jobseeker/assessments" },
  { icon: Video, label: "Interviews", path: "/jobseeker/interviews" },
  { icon: TrendingUp, label: "Results", path: "/jobseeker/results" },
  { icon: Briefcase, label: "Offers", path: "/jobseeker/offers" },
  { icon: Award, label: "Certificates", path: "/jobseeker/certificates" },
  { icon: User, label: "Profile", path: "/jobseeker/profile" },
  { icon: Shield, label: "Privacy", path: "/jobseeker/privacy" },
  { icon: BookOpen, label: "Guidelines", path: "/jobseeker/guidelines" },
  { icon: Bell, label: "Notifications", path: "/jobseeker/notifications" },
  { icon: Settings, label: "Settings", path: "/jobseeker/settings" },
];

export function JobSeekerLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: profile } = useQuery({
    queryKey: ["jobseeker-profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await (supabase as any).from("profiles").select("*").eq("id", user.id).single();
      return data;
    },
    enabled: !!user?.id,
  });

  const userName = profile?.full_name || user?.name || user?.email?.split("@")[0] || "Job Seeker";

  const handleSignOut = () => {
    signOut();
    navigate("/");
  };

  const isActive = (path: string) => {
    if (path === "/jobseeker") return location.pathname === "/jobseeker";
    return location.pathname.startsWith(path);
  };

  const SidebarContent = () => (
    <>
      <div className="p-4 border-b border-border flex items-center gap-3">
        <img src="/interq-logo.png" alt="InterQ" className="h-10 w-auto object-contain flex-shrink-0" />
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => { navigate(item.path); setMobileOpen(false); }}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative",
              isActive(item.path)
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-border space-y-2">
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar className="w-8 h-8 border border-border">
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                {userName[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{userName}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden lg:flex flex-col border-r border-border bg-card transition-all duration-300 sticky top-0 h-screen",
        collapsed ? "w-16" : "w-64"
      )}>
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-72 bg-card flex flex-col h-full shadow-xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <main className="flex-1 overflow-auto min-w-0">
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border px-4 md:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 hover:bg-muted rounded-lg" onClick={() => setMobileOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
<div>
            <p className="text-xs text-muted-foreground">Manage your career journey</p>
          </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <Avatar className="w-8 h-8 border border-border cursor-pointer" onClick={() => navigate("/jobseeker/profile")}>
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                {userName[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
