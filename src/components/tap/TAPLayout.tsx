import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Video, LogOut, Menu, X, ShieldCheck, Clock, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/SimpleAuthContext";

const navItems = [
  { to: "/tap", icon: LayoutDashboard, label: "Dashboard" },
];

export function TAPLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { logout, user } = useAuth();

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "TP";

  const handleLogout = async () => {
    setIsMobileMenuOpen(false);
    await logout();
  };

  const isPending = user?.tapStatus === "pending";

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-slate-50 via-white to-teal-50/30">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b bg-white shadow-sm">
        <img src="/interq-logo.png" alt="InterQ" className="h-10 w-auto" />
        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed md:relative z-50 md:z-auto w-72 md:w-64 lg:w-72 h-screen border-r bg-slate-950 flex-shrink-0 flex flex-col transition-all duration-300",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-5 hidden md:block border-b border-white/10">
          <div className="flex items-center gap-3">
            <img src="/interq-logo.png" alt="InterQ" className="h-9 w-auto" />
            <div>
              <p className="text-sm font-semibold text-white leading-none">InterQ</p>
              <p className="text-xs text-teal-400 mt-1">TAP Partner Portal</p>
            </div>
          </div>
        </div>

        <div className="flex-1 px-3 py-4">
          <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
            Workspace
          </p>
          <div className="space-y-0.5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Link key={item.to} to={item.to} onClick={() => setIsMobileMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-full justify-start h-9 text-sm font-medium",
                      isActive
                        ? "bg-teal-500/15 text-teal-400 hover:bg-teal-500/20"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <item.icon className="h-4 w-4 mr-2.5 flex-shrink-0" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>

          <Separator className="my-4 bg-white/10" />

          <div className="px-3 py-3 rounded-lg bg-white/5 ring-1 ring-white/10">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
              <ShieldCheck className={cn("h-4 w-4", isPending ? "text-amber-400" : "text-teal-400")} />
              {isPending ? "Approval Pending" : "Approved TAP"}
            </div>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              {isPending
                ? "Your application is under InterQ Team review."
                : "You're verified to conduct interviews on InterQ's behalf."}
            </p>
          </div>
        </div>

        <div className="p-3 border-t border-white/10">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start h-9 text-sm text-slate-400 hover:text-red-400 hover:bg-white/5"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2.5" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto min-h-screen pt-16 md:pt-0">
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b px-4 md:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Talent Acquisition Partner</h2>
              <p className="text-xs text-slate-500">Approved Interview Partner Network</p>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-r from-teal-500 to-purple-600 text-white">{initials}</AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline text-sm font-medium text-slate-900">{user?.name || "TAP Partner"}</span>
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="font-medium">{user?.name || "TAP Partner"}</p>
                  <p className="text-xs text-muted-foreground">{user?.email || ""}</p>
                </div>
                <Separator className="my-2" />
                <Button variant="ghost" className="w-full justify-start text-sm text-destructive" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </PopoverContent>
            </Popover>
          </div>
        </header>

        <div className="p-4 md:p-6 lg:p-8">
          {isPending ? (
            <div className="max-w-xl mx-auto mt-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-6">
                <Clock className="h-8 w-8 text-amber-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-3">Your TAP Application Is Under Review</h1>
              <p className="text-slate-600 leading-relaxed">
                Thanks for applying to become an InterQ Talent Acquisition Partner. Our team is verifying your
                application. Once approved, your assigned interviews, candidate details, and evaluation tools will
                unlock right here automatically.
              </p>
              <Button variant="outline" className="mt-6" onClick={() => navigate("/")}>
                Back to Home
              </Button>
            </div>
          ) : (
            <Outlet />
          )}
        </div>
      </main>
    </div>
  );
}
