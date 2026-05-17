
import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Building2, Users, Shield, Briefcase, UserCheck,
  Calendar, FileText, BarChart3, Settings, CreditCard, Plug,
  ScrollText, LogOut, Menu, X, Search, Bell, ChevronRight,
  Moon, Sun, HelpCircle, Keyboard, Activity, UserCog, Flag, Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { useTheme } from '@/components/theme-provider';
import { mockNotifications } from '@/data/adminModuleData';

const navSections = [
  {
    label: "Main",
    items: [
      { to: "/admin", icon: LayoutDashboard, label: "Dashboard", exact: true },
      { to: "/admin/companies", icon: Building2, label: "Companies" },
      { to: "/admin/users", icon: Users, label: "Users & Teams" },
      { to: "/admin/role-management", icon: Shield, label: "Roles & Permissions" },
    ],
  },
  {
    label: "Recruitment",
    items: [
      { to: "/admin/jobs", icon: Briefcase, label: "Jobs" },
      { to: "/admin/job-seekers", icon: UserCheck, label: "Job Seekers" },
      { to: "/admin/interviews", icon: Calendar, label: "Interviews" },
      { to: "/admin/offers", icon: FileText, label: "Offers" },
    ],
  },
  {
    label: "Assessments",
    items: [
      { to: "/admin/tests", icon: UserCog, label: "Test Management" },
      { to: "/admin/results", icon: BarChart3, label: "Results" },
      { to: "/admin/certificates", icon: Award, label: "Certificates" },
    ],
  },
  {
    label: "Analytics",
    items: [
      { to: "/admin/reports", icon: BarChart3, label: "Reports" },
      { to: "/admin/logs", icon: Activity, label: "Activity Logs" },
    ],
  },
  {
    label: "Administration",
    items: [
      { to: "/admin/billing", icon: CreditCard, label: "Billing" },
      { to: "/admin/integrations", icon: Plug, label: "Integrations" },
      { to: "/admin/security", icon: Shield, label: "Security" },
      { to: "/admin/audit-logs", icon: ScrollText, label: "Audit Logs" },
      { to: "/admin/settings", icon: Settings, label: "Settings" },
    ],
  },
];

export function AdminLayout() {
  const { logout, user } = useAuth();
  const location = useLocation();
  const userInitials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AD';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { theme, setTheme } = useTheme();

  const unreadNotifications = mockNotifications.filter(n => !n.read).length;

  const isActive = (item: typeof navSections[0]['items'][0]) => {
    if (item.exact) {
      return location.pathname === item.to;
    }
    return location.pathname === item.to || location.pathname.startsWith(item.to + '/');
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col md:flex-row bg-muted/30 dark:bg-background">
        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-16 border-b bg-card shadow-sm">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <h2 className="text-lg font-bold tracking-tight">Admin Portal</h2>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
                      {unreadNotifications}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {mockNotifications.slice(0, 5).map(notif => (
                  <DropdownMenuItem key={notif.id} className="flex flex-col items-start gap-1 py-3 cursor-pointer">
                    <div className="flex items-center gap-2 w-full">
                      {!notif.read && <div className="h-2 w-2 rounded-full bg-primary" />}
                      <span className="font-medium text-sm">{notif.title}</span>
                    </div>
                    <span className="text-xs text-muted-foreground line-clamp-2">{notif.message}</span>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-center text-primary justify-center">
                  View all notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Avatar className="h-8 w-8">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">{userInitials}</AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Overlay for mobile */}
        {isMobileMenuOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={cn(
          "fixed md:relative z-50 md:z-auto w-[280px] h-screen border-r bg-card flex-shrink-0 transition-all duration-300 overflow-hidden",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}>
          <div className="flex flex-col h-full">
            {/* Logo & Profile */}
            <div className="p-5 border-b flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                    <img src="/interq-logo.png" alt="InterQ" className="h-10 w-auto" />
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Admin Portal</p>
                </div>
              </div>
              
              {/* Admin Profile */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Avatar className="h-10 w-10 border-2 border-primary/20">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold">{userInitials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.name || 'Admin'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email || 'admin@interq.com'}</p>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="p-3 flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Quick search..." 
                  className="pl-9 h-9 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Navigation */}
            <ScrollArea className="flex-1 px-3">
              {navSections.map((section, sectionIdx) => (
                <div key={section.label} className={cn(sectionIdx > 0 && "mt-4")}>
                  <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                    {section.label}
                  </p>
                  <nav className="space-y-0.5">
                    {section.items.map((item) => (
                      <Tooltip key={item.to} delayDuration={0}>
                        <TooltipTrigger asChild>
                          <Link to={item.to} onClick={() => setIsMobileMenuOpen(false)}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={cn(
                                "w-full justify-start h-10 text-sm font-medium rounded-lg",
                                isActive(item)
                                  ? "bg-primary/10 text-primary hover:bg-primary/15"
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                              )}
                            >
                              <item.icon className="h-4 w-4 mr-3 flex-shrink-0" />
                              {item.label}
                              {isActive(item) && (
                                <ChevronRight className="ml-auto h-4 w-4" />
                              )}
                            </Button>
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right" sideOffset={10}>
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </nav>
                  {sectionIdx < navSections.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </ScrollArea>

            {/* Footer Actions */}
            <div className="p-3 border-t flex-shrink-0 space-y-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start h-9 text-sm text-muted-foreground hover:text-foreground"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  >
                    {theme === 'dark' ? <Sun className="h-4 w-4 mr-2.5" /> : <Moon className="h-4 w-4 mr-2.5" />}
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={10}>
                  Toggle Theme
                </TooltipContent>
              </Tooltip>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
<Button variant="ghost" size="sm" className="w-full justify-start h-9 text-sm text-muted-foreground hover:text-destructive" onClick={logout}>
                    <LogOut className="h-4 w-4 mr-2.5" />
                    Logout
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <UserCog className="h-4 w-4 mr-2" />
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Help & Support
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Keyboard className="h-4 w-4 mr-2" />
                    Keyboard Shortcuts
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive" onClick={logout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen md:ml-0 pt-16 md:pt-0">
          {/* Top Bar */}
          <div className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-4 md:px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Link to="/admin" className="text-muted-foreground hover:text-foreground">Admin</Link>
                <span className="text-muted-foreground">/</span>
                <span className="font-medium">Dashboard</span>
              </div>
              <div className="flex items-center gap-2">
                {/* Notifications Desktop */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative hidden md:flex">
                      <Bell className="h-4 w-4" />
                      {unreadNotifications > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
                          {unreadNotifications}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {mockNotifications.slice(0, 5).map(notif => (
                      <DropdownMenuItem key={notif.id} className="flex flex-col items-start gap-1 py-3 cursor-pointer">
                        <div className="flex items-center gap-2 w-full">
                          {!notif.read && <div className="h-2 w-2 rounded-full bg-primary" />}
                          <span className="font-medium text-sm">{notif.title}</span>
                        </div>
                        <span className="text-xs text-muted-foreground line-clamp-2">{notif.message}</span>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-center text-primary justify-center">
                      View all notifications
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Help */}
                <Button variant="ghost" size="icon" className="hidden md:flex">
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div className="p-4 md:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
