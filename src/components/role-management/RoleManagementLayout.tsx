import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Users, Shield, Network, ClipboardList,
  BarChart3, Settings, LogOut, Menu, X, Search, Bell,
  ChevronRight, Moon, Sun
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
import { useTheme } from '@/components/theme-provider';

const navItems = [
  { to: '/admin/role-management', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/admin/role-management/roles', icon: Shield, label: 'Roles & Permissions' },
  { to: '/admin/role-management/users', icon: Users, label: 'User Assignment' },
  { to: '/admin/role-management/hierarchy', icon: Network, label: 'Hierarchy & Teams' },
  { to: '/admin/role-management/audit', icon: ClipboardList, label: 'Audit & Logs' },
  { to: '/admin/role-management/reports', icon: BarChart3, label: 'Reports & Insights' },
  { to: '/admin/role-management/settings', icon: Settings, label: 'Settings & Security' },
];

export function RoleManagementLayout() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { theme, setTheme } = useTheme();

  const isActive = (item: typeof navItems[0]) => {
    if (item.exact) {
      return location.pathname === item.to;
    }
    return location.pathname.startsWith(item.to);
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
            <h2 className="text-lg font-bold tracking-tight">Role Management</h2>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary">Admin</Badge>
            <Avatar className="h-8 w-8">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">SJ</AvatarFallback>
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
          "fixed md:relative z-50 md:z-auto w-[280px] h-screen border-r bg-card flex-shrink-0 transition-all duration-300",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}>
          <div className="flex flex-col h-full">
            {/* Logo & Profile */}
            <div className="p-5 border-b">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-foreground">Role Management</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">RBAC Dashboard</p>
                </div>
              </div>
              
              {/* Admin Profile */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Avatar className="h-10 w-10 border-2 border-primary/20">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">SJ</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">Sarah Johnson</p>
                  <p className="text-xs text-muted-foreground truncate">sarah.johnson@company.com</p>
                </div>
                <Badge variant="outline" className="text-[10px] bg-red-500/10 text-red-600 border-red-200">Admin</Badge>
              </div>
            </div>

            {/* Search */}
            <div className="p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search roles, users..." 
                  className="pl-9 h-9 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Navigation */}
            <ScrollArea className="flex-1 px-3">
              <nav className="space-y-1">
                {navItems.map((item) => (
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
            </ScrollArea>

            {/* Footer Actions */}
            <div className="p-3 border-t space-y-1">
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
                  <Button variant="ghost" size="sm" className="w-full justify-start h-9 text-sm text-muted-foreground hover:text-destructive">
                    <LogOut className="h-4 w-4 mr-2.5" />
                    Logout
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile Settings</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">Logout</DropdownMenuItem>
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
                <span className="font-medium">Role Management</span>
              </div>
              <div className="flex items-center gap-2">
                {/* Notifications */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <Bell className="h-4 w-4" />
                      <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">3</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                      <span className="font-medium">New role created</span>
                      <span className="text-xs text-muted-foreground">Team Lead role was added by Sarah Johnson</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                      <span className="font-medium">Permission updated</span>
                      <span className="text-xs text-muted-foreground">TAP permissions were modified</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                      <span className="font-medium">User deactivated</span>
                      <span className="text-xs text-muted-foreground">Anna Brown's account was deactivated</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Quick Actions */}
                <Button size="sm" className="hidden md:flex">
                  <Shield className="h-4 w-4 mr-2" />
                  Add Role
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
