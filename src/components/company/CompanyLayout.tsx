import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/SimpleAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useCompanyId } from "@/hooks/useCompanyId";
import {
  LayoutDashboard, FileText, Users, ClipboardList, MessageSquare,
  Settings, BarChart3, Briefcase, LogOut, Menu, X, ChevronDown,
  Building2, Bell, ScrollText, AlertCircle, Plus, UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/company" },
  { label: "Jobs / JDs", icon: Briefcase, path: "/company/jobs" },
  { label: "Candidates (ATS)", icon: Users, path: "/company/candidates" },
  { label: "Tests & Questions", icon: ClipboardList, path: "/company/tests" },
  { label: "Interviews", icon: MessageSquare, path: "/company/interviews" },
  { label: "Results & Reports", icon: BarChart3, path: "/company/results" },
  { label: "Team", icon: UserPlus, path: "/company/team" },
  { label: "Notifications", icon: Bell, path: "/company/notifications" },
  { label: "Audit Logs", icon: ScrollText, path: "/company/logs" },
  { label: "Settings", icon: Settings, path: "/company/settings" },
];

interface Company {
  id: string;
  name: string;
  logo_url: string | null;
}

export function CompanyLayout() {
  const { user, signOut, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { companyId, loading: companyIdLoading } = useCompanyId();
  const [company, setCompany] = useState<Company | null>(null);
  const [loadingCompany, setLoadingCompany] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }
    if (!user || companyIdLoading) return;

    if (user.isDemo && user.role === "company") {
      setCompany({
        id: companyId || "comp_demo_001",
        name: user.companyName || "TechCorp Solutions",
        logo_url: null
      });
      setLoadingCompany(false);
      return;
    }

    if (!companyId) {
      setCompany(null);
      setLoadingCompany(false);
      return;
    }

    const fetchCompany = async () => {
      try {
        const { data } = await supabase
          .from("companies")
          .select("id, name, logo_url")
          .eq("id", companyId)
          .maybeSingle();

        setCompany(data as Company | null);
      } catch (error) {
        console.error("Error fetching company:", error);
      } finally {
        setLoadingCompany(false);
      }
    };
    fetchCompany();
  }, [user, authLoading, navigate, companyId, companyIdLoading]);

  if (authLoading || companyIdLoading || loadingCompany) {
    return (
      <div className="flex h-screen bg-background">
        <div className="w-64 border-r p-4 space-y-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
        <div className="flex-1 p-8"><Skeleton className="h-64 w-full" /></div>
      </div>
    );
  }

  if (!company) {
    // Demo users cannot create companies
    if (user?.isDemo) {
      return (
        <div className="flex items-center justify-center h-screen p-4">
          <div className="text-center space-y-4 max-w-md">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold">Demo Account</h2>
            <p className="text-muted-foreground">
              Demo accounts cannot access company features. Please sign in with a real account to manage your company workspace.
            </p>
            <div className="flex flex-col gap-2">
              <Button onClick={() => navigate("/auth")} className="w-full">
                Sign In with Real Account
              </Button>
              <Button variant="outline" onClick={() => navigate("/")} className="w-full">
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center h-screen p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
            <Building2 className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold">Welcome to InterQ!</h2>
          <p className="text-muted-foreground">
            You don't have a company workspace yet. Create one to start managing your hiring pipeline and team.
          </p>
          <Button onClick={() => navigate("/company-signup")} size="lg" className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Create Your Company
          </Button>
          <p className="text-sm text-muted-foreground">
            Or{" "}
            <button onClick={() => { signOut(); navigate("/auth"); }} className="text-primary hover:underline">
              sign in with a different account
            </button>
          </p>
        </div>
      </div>
    );
  }

  const isActive = (path: string) => {
    if (path === "/company") return location.pathname === "/company";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col`}>
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <img src="/interq-logo.png" alt="InterQ" className="h-10 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{company.name}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.path}
              onClick={() => { navigate(item.path); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.path)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t">
          <button onClick={signOut} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 border-b flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
<div className="flex items-center gap-2">
            </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon"><Bell className="h-4 w-4" /></Button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet context={{ company, user }} />
        </main>
      </div>
    </div>
  );
}
