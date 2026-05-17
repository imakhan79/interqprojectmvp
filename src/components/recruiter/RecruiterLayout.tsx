import { Outlet, Link, useLocation } from "react-router-dom";
import { RecruiterProvider } from "@/contexts/RecruiterContext";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Briefcase, Users, ClipboardList, MessageCircle, BarChart3, Settings, LogOut, Menu, X,
  Plus, Bell, Search, ChevronDown, Calendar, User, FileText, Video, MapPin, Clock, CheckCircle, XCircle,
  TrendingUp, Eye, MoreHorizontal, Filter, Download, Mail, Phone, Star, ArrowUpRight, ArrowDownRight,
  PieChart, Activity, UsersRound, BriefcaseBusiness, ClipboardCheck, Send, RefreshCw, Trash2, Copy,
  Edit, Archive, Sun, Moon, UserPlus, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { NotificationBell } from "@/components/NotificationBell";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTheme } from "next-themes";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/SimpleAuthContext";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPie, Pie, Cell, BarChart, Bar, Legend, Area, AreaChart
} from 'recharts';
import { format, addDays, startOfWeek, addWeeks, isSameDay } from "date-fns";
import { DetailedCandidate, mockCandidates } from "@/data/candidateEvaluationsMock";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const navSections = [
  {
    label: "Recruiting",
    items: [
      { to: "/recruiter", icon: LayoutDashboard, label: "Dashboard" },
      { to: "/recruiter/jobs", icon: Briefcase, label: "Job Openings" },
      { to: "/recruiter/candidates", icon: Users, label: "Candidates" },
      { to: "/recruiter/evaluation-reports", icon: FileText, label: "Evaluation Reports" },
      { to: "/recruiter/interviews", icon: Calendar, label: "Interviews" },
      { to: "/recruiter/offers", icon: FileText, label: "Offers" },
    ],
  },
  {
    label: "Analytics",
    items: [
      { to: "/recruiter/reports", icon: BarChart3, label: "Reports" },
    ],
  },
  {
    label: "Settings",
    items: [
      { to: "/recruiter/settings", icon: Settings, label: "Settings" },
    ],
  },
];

const monthlyHiringData = [
  { month: 'Jan', applications: 45, hires: 3 },
  { month: 'Feb', applications: 52, hires: 5 },
  { month: 'Mar', applications: 68, hires: 7 },
  { month: 'Apr', applications: 74, hires: 4 },
  { month: 'May', applications: 89, hires: 8 },
  { month: 'Jun', applications: 95, hires: 6 },
  { month: 'Jul', applications: 110, hires: 9 },
  { month: 'Aug', applications: 125, hires: 11 },
  { month: 'Sep', applications: 140, hires: 12 },
  { month: 'Oct', applications: 135, hires: 10 },
  { month: 'Nov', applications: 150, hires: 14 },
  { month: 'Dec', applications: 160, hires: 13 },
];

const candidateSources = [
  { name: 'LinkedIn', value: 35, color: '#0077B5' },
  { name: 'Job Portals', value: 28, color: '#10B981' },
  { name: 'Referrals', value: 22, color: '#F59E0B' },
  { name: 'Direct', value: 15, color: '#8B5CF6' },
];

const departmentPositions = [
  { department: 'Engineering', positions: 12, filled: 8 },
  { department: 'Sales', positions: 8, filled: 5 },
  { department: 'Marketing', positions: 5, filled: 3 },
  { department: 'Design', positions: 4, filled: 2 },
  { department: 'Operations', positions: 6, filled: 4 },
  { department: 'HR', positions: 3, filled: 2 },
];

const jobOpenings = [
  { id: 1, title: "Senior Frontend Developer", department: "Engineering", status: "Open", applications: 24, postedDate: "2024-01-15", salary: "$120k - $150k" },
  { id: 2, title: "Product Manager", department: "Product", status: "Open", applications: 18, postedDate: "2024-01-18", salary: "$110k - $140k" },
  { id: 3, title: "UX Designer", department: "Design", status: "Open", applications: 32, postedDate: "2024-01-20", salary: "$90k - $120k" },
  { id: 4, title: "DevOps Engineer", department: "Engineering", status: "Closed", applications: 15, postedDate: "2024-01-10", salary: "$130k - $160k" },
  { id: 5, title: "Sales Representative", department: "Sales", status: "Draft", applications: 0, postedDate: "2024-01-22", salary: "$60k - $80k" },
  { id: 6, title: "Marketing Specialist", department: "Marketing", status: "Open", applications: 28, postedDate: "2024-01-12", salary: "$70k - $90k" },
];

const candidates = [
  { id: 1, name: "Sarah Johnson", email: "sarah.j@email.com", phone: "+1 (555) 123-4567", position: "Senior Frontend Developer", stage: "Interviewed", rating: 4.8, appliedDate: "2024-01-15" },
  { id: 2, name: "Michael Chen", email: "m.chen@email.com", phone: "+1 (555) 234-5678", position: "Product Manager", stage: "Offered", rating: 4.5, appliedDate: "2024-01-12" },
  { id: 3, name: "Emily Davis", email: "emily.d@email.com", phone: "+1 (555) 345-6789", position: "UX Designer", stage: "Screened", rating: 4.2, appliedDate: "2024-01-18" },
  { id: 4, name: "James Wilson", email: "j.wilson@email.com", phone: "+1 (555) 456-7890", position: "DevOps Engineer", stage: "Applied", rating: 3.8, appliedDate: "2024-01-20" },
  { id: 5, name: "Lisa Anderson", email: "lisa.a@email.com", phone: "+1 (555) 567-8901", position: "Sales Representative", stage: "Hired", rating: 4.9, appliedDate: "2024-01-08" },
  { id: 6, name: "David Martinez", email: "d.martinez@email.com", phone: "+1 (555) 678-9012", position: "Marketing Specialist", stage: "Interviewed", rating: 4.1, appliedDate: "2024-01-14" },
];

const interviews = [
  { id: 1, candidate: "Sarah Johnson", interviewer: "John Smith", position: "Senior Frontend Developer", date: "2024-01-25", time: "10:00 AM", mode: "Video", status: "Scheduled" },
  { id: 2, candidate: "David Martinez", interviewer: "Jane Doe", position: "Marketing Specialist", date: "2024-01-25", time: "02:00 PM", mode: "In-person", status: "Scheduled" },
  { id: 3, candidate: "Emily Davis", interviewer: "Mike Johnson", position: "UX Designer", date: "2024-01-26", time: "11:00 AM", mode: "Video", status: "Pending" },
  { id: 4, candidate: "Robert Brown", interviewer: "Sarah Wilson", position: "Product Manager", date: "2024-01-27", time: "03:00 PM", mode: "Video", status: "Scheduled" },
];

const offers = [
  { id: 1, candidate: "Michael Chen", position: "Product Manager", salary: "$125,000", status: "Pending", sentDate: "2024-01-24", responseDate: "-" },
  { id: 2, candidate: "Lisa Anderson", position: "Sales Representative", salary: "$72,000", status: "Accepted", sentDate: "2024-01-20", responseDate: "2024-01-22" },
  { id: 3, candidate: "Alex Thompson", position: "Senior Developer", salary: "$145,000", status: "Declined", sentDate: "2024-01-18", responseDate: "2024-01-21" },
  { id: 4, candidate: "Jennifer Lee", position: "UX Designer", salary: "$105,000", status: "Pending", sentDate: "2024-01-23", responseDate: "-" },
];

const COLORS = ['#0077B5', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#EC4899'];

export function RecruiterLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [jobStatus, setJobStatus] = useState("all");
  const [candidateStage, setCandidateStage] = useState("all");
  const [selectedCandidate, setSelectedCandidate] = useState<DetailedCandidate | null>(null);
  const [viewModal, setViewModal] = useState(false);
  const { logout, user } = useAuth();
  const recruiterInitials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'RC';

  const handleLogout = async () => {
    setIsMobileMenuOpen(false);
    await logout();
  };

  const handleViewReport = (candidate: DetailedCandidate) => {
    setSelectedCandidate(candidate);
    setViewModal(true);
  };

  const generatePDF = async () => {
    const element = document.getElementById('report-content');
    if (element) {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${selectedCandidate?.name}_Evaluation_Report.pdf`);
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "Applied": return "bg-blue-100 text-blue-800";
      case "Screened": return "bg-yellow-100 text-yellow-800";
      case "Interviewed": return "bg-purple-100 text-purple-800";
      case "Offered": return "bg-orange-100 text-orange-800";
      case "Hired": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open": return "bg-green-100 text-green-800";
      case "Closed": return "bg-red-100 text-red-800";
      case "Draft": return "bg-gray-100 text-gray-800";
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "Accepted": return "bg-green-100 text-green-800";
      case "Declined": return "bg-red-100 text-red-800";
      case "Scheduled": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredJobs = jobOpenings.filter(job => 
    jobStatus === "all" || job.status.toLowerCase() === jobStatus
  );

  const filteredCandidates = candidates.filter(c => 
    candidateStage === "all" || c.stage.toLowerCase() === candidateStage
  );

  return (
    <RecruiterProvider>
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b bg-card shadow-sm">
        <img src="/interq-logo.png" alt="InterQ" className="h-10 w-auto" />
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed md:relative z-50 md:z-auto w-72 md:w-64 lg:w-72 h-screen border-r bg-card flex-shrink-0 flex flex-col transition-all duration-300",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-5 hidden md:block border-b">
          <div className="flex items-center justify-between">
            <div>
              <img src="/interq-logo.png" alt="InterQ" className="h-10 w-auto" />
              <p className="text-xs text-muted-foreground mt-1">Recruiter Portal</p>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 px-3 py-4">
          {navSections.map((section, idx) => (
            <div key={section.label} className={cn(idx > 0 && "mt-4")}>
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = location.pathname === item.to ||
                    (item.to !== "/recruiter" && location.pathname.startsWith(item.to));
                  return (
                    <Link key={item.to} to={item.to} onClick={() => setIsMobileMenuOpen(false)}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "w-full justify-start h-9 text-sm font-medium",
                          isActive
                            ? "bg-primary/10 text-primary hover:bg-primary/15"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <item.icon className="h-4 w-4 mr-2.5 flex-shrink-0" />
                        {item.label}
                        {item.label === "Interviews" && (
                          <Badge variant="secondary" className="ml-auto text-xs">{interviews.length}</Badge>
                        )}
                        {item.label === "Candidates" && (
                          <Badge variant="secondary" className="ml-auto text-xs">{candidates.length}</Badge>
                        )}
                      </Button>
                    </Link>
                  );
                })}
              </div>
              {idx < navSections.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
        </ScrollArea>

        <div className="p-3 border-t">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start h-9 text-sm text-muted-foreground hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2.5" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto min-h-screen md:ml-0 pt-16 md:pt-0">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b px-4 md:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search candidates, jobs..."
                  className="pl-10 bg-muted/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <NotificationBell />
              <Dialog open={showCreateJob} onOpenChange={setShowCreateJob}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Job
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Create New Job Opening</DialogTitle>
                    <DialogDescription>Fill in the details to post a new job opening.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">Job Title</Label>
                      <Input id="title" placeholder="e.g., Senior Developer" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="department">Department</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="engineering">Engineering</SelectItem>
                            <SelectItem value="sales">Sales</SelectItem>
                            <SelectItem value="marketing">Marketing</SelectItem>
                            <SelectItem value="design">Design</SelectItem>
                            <SelectItem value="hr">HR</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="location">Location</Label>
                        <Input id="location" placeholder="e.g., New York" />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Job Description</Label>
                      <Textarea id="description" placeholder="Describe the role..." className="min-h-[100px]" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="salary">Salary Range</Label>
                        <Input id="salary" placeholder="e.g., $80k - $100k" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="type">Employment Type</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fulltime">Full-time</SelectItem>
                            <SelectItem value="parttime">Part-time</SelectItem>
                            <SelectItem value="contract">Contract</SelectItem>
                            <SelectItem value="internship">Internship</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setShowCreateJob(false)}>Cancel</Button>
                    <Button onClick={() => setShowCreateJob(false)}>Create Job</Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-primary text-primary-foreground">{recruiterInitials}</AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline text-sm font-medium">{user?.name || 'Recruiter'}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="font-medium">{user?.name || 'Recruiter'}</p>
                    <p className="text-xs text-muted-foreground">{user?.email || ''}</p>
                  </div>
                  <Separator className="my-2" />
                  <Button variant="ghost" className="w-full justify-start text-sm" onClick={() => navigate("/recruiter/settings")}>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-sm text-destructive" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 md:p-6 lg:p-8">
          {location.pathname === "/recruiter" || location.pathname === "/recruiter/jobs" ? (
            <div className="space-y-6">
              {/* Dashboard Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Active Jobs</p>
                        <p className="text-3xl font-bold mt-1">{jobOpenings.filter(j => j.status === "Open").length}</p>
                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                          <ArrowUpRight className="h-3 w-3" /> +2 this week
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-blue-500/10">
                        <Briefcase className="h-8 w-8 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Candidates</p>
                        <p className="text-3xl font-bold mt-1">{candidates.length}</p>
                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                          <ArrowUpRight className="h-3 w-3" /> +12 today
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-green-500/10">
                        <Users className="h-8 w-8 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Interviews Today</p>
                        <p className="text-3xl font-bold mt-1">{interviews.filter(i => i.date === format(new Date(), 'yyyy-MM-dd')).length || 2}</p>
                        <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> 2 scheduled
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-orange-500/10">
                        <Calendar className="h-8 w-8 text-orange-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Offers Pending</p>
                        <p className="text-3xl font-bold mt-1">{offers.filter(o => o.status === "Pending").length}</p>
                        <p className="text-xs text-purple-600 mt-1 flex items-center gap-1">
                          <FileText className="h-3 w-3" /> Awaiting response
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-purple-500/10">
                        <Send className="h-8 w-8 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" size="sm" className="gap-2" onClick={() => {}}>
                  <Plus className="h-4 w-4" /> Add Candidate
                </Button>
                <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate("/recruiter/interviews")}>
                  <Calendar className="h-4 w-4" /> Schedule Interview
                </Button>
                <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate("/recruiter/offers")}>
                  <Send className="h-4 w-4" /> Extend Offer
                </Button>
                <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate("/recruiter/reports")}>
                  <Download className="h-4 w-4" /> Export Report
                </Button>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Monthly Hiring Trends */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Monthly Hiring Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={monthlyHiringData}>
                        <defs>
                          <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0077B5" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#0077B5" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorHires" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="month" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                        <Legend />
                        <Area type="monotone" dataKey="applications" stroke="#0077B5" fillOpacity={1} fill="url(#colorApps)" name="Applications" />
                        <Area type="monotone" dataKey="hires" stroke="#10B981" fillOpacity={1} fill="url(#colorHires)" name="Hires" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Candidate Sources */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5 text-primary" />
                      Candidate Sources
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <RechartsPie>
                        <Pie
                          data={candidateSources}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {candidateSources.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPie>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {candidateSources.map((source) => (
                        <div key={source.name} className="flex items-center gap-2 text-xs">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: source.color }} />
                          <span className="text-muted-foreground">{source.name}</span>
                          <span className="font-medium ml-auto">{source.value}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Department Positions & Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Department-wise Open Positions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Open Positions by Department
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={departmentPositions} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis type="number" className="text-xs" />
                        <YAxis dataKey="department" type="category" width={100} className="text-xs" />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                        <Legend />
                        <Bar dataKey="positions" fill="#0077B5" name="Open Positions" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="filled" fill="#10B981" name="Filled" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-primary" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                          <UserPlus className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">New application received</p>
                          <p className="text-xs text-muted-foreground">Sarah Johnson applied for Senior Frontend Developer</p>
                          <p className="text-xs text-muted-foreground mt-1">2 minutes ago</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-green-500/10">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">Interview completed</p>
                          <p className="text-xs text-muted-foreground">David Martinez - Marketing Specialist</p>
                          <p className="text-xs text-muted-foreground mt-1">15 minutes ago</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/10">
                          <Send className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">Offer sent</p>
                          <p className="text-xs text-muted-foreground">Michael Chen - Product Manager</p>
                          <p className="text-xs text-muted-foreground mt-1">1 hour ago</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-orange-500/10">
                          <Calendar className="h-4 w-4 text-orange-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">Interview scheduled</p>
                          <p className="text-xs text-muted-foreground">Emily Davis - UX Designer for tomorrow 11:00 AM</p>
                          <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Job Openings Table */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-primary" />
                      Job Openings
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Select value={jobStatus} onValueChange={setJobStatus}>
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Jobs</SelectItem>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm" onClick={() => setShowCreateJob(true)}>
                        <Plus className="h-4 w-4 mr-2" /> Add Job
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Job Title</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Applications</TableHead>
                        <TableHead>Posted Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredJobs.map((job) => (
                        <TableRow key={job.id} className="hover:bg-muted/50 transition-colors">
                          <TableCell className="font-medium">
                            <div>
                              <p>{job.title}</p>
                              <p className="text-xs text-muted-foreground">{job.salary}</p>
                            </div>
                          </TableCell>
                          <TableCell>{job.department}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              {job.applications}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{job.postedDate}</TableCell>
                          <TableCell className="text-right">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent align="end" className="w-48">
                                <Button variant="ghost" size="sm" className="w-full justify-start">
                                  <Eye className="h-4 w-4 mr-2" /> View Details
                                </Button>
                                <Button variant="ghost" size="sm" className="w-full justify-start">
                                  <Edit className="h-4 w-4 mr-2" /> Edit
                                </Button>
                                <Button variant="ghost" size="sm" className="w-full justify-start">
                                  <Copy className="h-4 w-4 mr-2" /> Duplicate
                                </Button>
                                <Button variant="ghost" size="sm" className="w-full justify-start">
                                  <Archive className="h-4 w-4 mr-2" /> Archive
                                </Button>
                                <Separator className="my-2" />
                                <Button variant="ghost" size="sm" className="w-full justify-start text-destructive">
                                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                                </Button>
                              </PopoverContent>
                            </Popover>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Top Candidates */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-primary" />
                      Top Candidates
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => navigate("/recruiter/candidates")}>
                      View All <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {candidates.slice(0, 3).map((candidate) => (
                      <div key={candidate.id} className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                              {candidate.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{candidate.name}</p>
                            <p className="text-sm text-muted-foreground truncate">{candidate.position}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge className={getStageColor(candidate.stage)}>{candidate.stage}</Badge>
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs font-medium">{candidate.rating}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Mail className="h-4 w-4 mr-1" /> Email
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Phone className="h-4 w-4 mr-1" /> Call
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : location.pathname === "/recruiter/candidates" ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Candidates</h1>
                  <p className="text-muted-foreground">Manage and track your candidate pipeline</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Mail className="h-4 w-4" /> Send Email
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <RefreshCw className="h-4 w-4" /> Move to Stage
                  </Button>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" /> Add Candidate
                  </Button>
                </div>
              </div>

              {/* Filter Tabs */}
              <Tabs value={candidateStage} onValueChange={setCandidateStage}>
                <TabsList>
                  <TabsTrigger value="all">All Candidates</TabsTrigger>
                  <TabsTrigger value="applied">Applied</TabsTrigger>
                  <TabsTrigger value="screened">Screened</TabsTrigger>
                  <TabsTrigger value="interviewed">Interviewed</TabsTrigger>
                  <TabsTrigger value="offered">Offered</TabsTrigger>
                  <TabsTrigger value="hired">Hired</TabsTrigger>
                </TabsList>

                <TabsContent value={candidateStage} className="mt-6">
                  <Card>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">
                              <Checkbox />
                            </TableHead>
                            <TableHead>Candidate</TableHead>
                            <TableHead>Position</TableHead>
                            <TableHead>Stage</TableHead>
                            <TableHead>Rating</TableHead>
                            <TableHead>Applied</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredCandidates.map((candidate) => (
                            <TableRow key={candidate.id} className="hover:bg-muted/50 transition-colors">
                              <TableCell><Checkbox /></TableCell>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-10 w-10">
                                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                                      {candidate.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">{candidate.name}</p>
                                    <p className="text-xs text-muted-foreground">{candidate.email}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{candidate.position}</TableCell>
                              <TableCell>
                                <Badge className={getStageColor(candidate.stage)}>{candidate.stage}</Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  <span className="font-medium">{candidate.rating}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-muted-foreground">{candidate.appliedDate}</TableCell>
                              <TableCell className="text-right">
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent align="end" className="w-48">
                                    <Button variant="ghost" size="sm" className="w-full justify-start">
                                      <Eye className="h-4 w-4 mr-2" /> View Profile
                                    </Button>
                                    <Button variant="ghost" size="sm" className="w-full justify-start">
                                      <Mail className="h-4 w-4 mr-2" /> Send Email
                                    </Button>
                                    <Button variant="ghost" size="sm" className="w-full justify-start">
                                      <Calendar className="h-4 w-4 mr-2" /> Schedule Interview
                                    </Button>
                                    <Button variant="ghost" size="sm" className="w-full justify-start">
                                      <TrendingUp className="h-4 w-4 mr-2" /> Move to Next Stage
                                    </Button>
                                    <Separator className="my-2" />
                                    <Button variant="ghost" size="sm" className="w-full justify-start text-destructive">
                                      <XCircle className="h-4 w-4 mr-2" /> Reject
                                    </Button>
                                  </PopoverContent>
                                </Popover>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          ) : location.pathname === "/recruiter/interviews" ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Interviews</h1>
                  <p className="text-muted-foreground">Schedule and manage candidate interviews</p>
                </div>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" /> Schedule Interview
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      Interview Schedule
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {interviews.map((interview) => (
                        <div key={interview.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-blue-500/10">
                              <Video className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">{interview.candidate}</p>
                              <p className="text-sm text-muted-foreground">{interview.position}</p>
                              <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" /> {interview.time}
                                </span>
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" /> {interview.interviewer}
                                </span>
                                <Badge variant="outline" className="text-xs">{interview.mode}</Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(interview.status)}>{interview.status}</Badge>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent align="end" className="w-48">
                                <Button variant="ghost" size="sm" className="w-full justify-start">
                                  <Eye className="h-4 w-4 mr-2" /> View Details
                                </Button>
                                <Button variant="ghost" size="sm" className="w-full justify-start">
                                  <Calendar className="h-4 w-4 mr-2" /> Reschedule
                                </Button>
                                <Button variant="ghost" size="sm" className="w-full justify-start">
                                  <Video className="h-4 w-4 mr-2" /> Start Call
                                </Button>
                                <Button variant="ghost" size="sm" className="w-full justify-start">
                                  <CheckCircle className="h-4 w-4 mr-2" /> Mark Complete
                                </Button>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Interview Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">This Week</span>
                        <span className="font-medium">12 interviews</span>
                      </div>
                      <Progress value={60} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Completed</span>
                        <span className="font-medium">8</span>
                      </div>
                      <Progress value={66} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Pending</span>
                        <span className="font-medium">4</span>
                      </div>
                      <Progress value={33} className="h-2" />
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Interview Modes</h4>
                      <div className="flex items-center gap-2 text-sm">
                        <Video className="h-4 w-4 text-blue-600" />
                        <span>Video: 75%</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-green-600" />
                        <span>In-person: 25%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : location.pathname === "/recruiter/offers" ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Offers</h1>
                  <p className="text-muted-foreground">Manage and track job offers</p>
                </div>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" /> Create Offer
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-3xl font-bold mt-1">{offers.filter(o => o.status === "Pending").length}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground">Accepted</p>
                    <p className="text-3xl font-bold mt-1 text-green-600">{offers.filter(o => o.status === "Accepted").length}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground">Declined</p>
                    <p className="text-3xl font-bold mt-1 text-red-600">{offers.filter(o => o.status === "Declined").length}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground">Total Value</p>
                    <p className="text-3xl font-bold mt-1">$347k</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Offer Letters
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Candidate</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Salary</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Sent Date</TableHead>
                        <TableHead>Response Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {offers.map((offer) => (
                        <TableRow key={offer.id} className="hover:bg-muted/50 transition-colors">
                          <TableCell className="font-medium">{offer.candidate}</TableCell>
                          <TableCell>{offer.position}</TableCell>
                          <TableCell className="font-mono">{offer.salary}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(offer.status)}>{offer.status}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{offer.sentDate}</TableCell>
                          <TableCell className="text-muted-foreground">{offer.responseDate}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Send className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          ) : location.pathname === "/recruiter/reports" ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
                  <p className="text-muted-foreground">Insights and metrics for your hiring process</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" /> Export CSV
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" /> Export PDF
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      Time to Hire
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold">24 days</p>
                    <p className="text-sm text-muted-foreground mt-2">Average time from application to hire</p>
                    <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                      <ArrowDownRight className="h-4 w-4" /> 3 days faster than last month
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Source Effectiveness
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold">68%</p>
                    <p className="text-sm text-muted-foreground mt-2">Candidates from top sources hired</p>
                    <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                      <ArrowUpRight className="h-4 w-4" /> LinkedIn is most effective
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UsersRound className="h-5 w-5 text-primary" />
                      Interview-to-Offer
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold">4:1</p>
                    <p className="text-sm text-muted-foreground mt-2">Interviews per offer extended</p>
                    <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                      Industry average: 5:1
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-primary" />
                      Hiring Funnel
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">Applied</span>
                          <span className="font-medium">160</span>
                        </div>
                        <Progress value={100} className="h-3" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">Screened</span>
                          <span className="font-medium">120 (75%)</span>
                        </div>
                        <Progress value={75} className="h-3" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">Interviewed</span>
                          <span className="font-medium">48 (30%)</span>
                        </div>
                        <Progress value={30} className="h-3" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm">Offered</span>
                          <span className="font-medium">12 (7.5%)</span>
                        </div>
                        <Progress value={7.5} className="h-3" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Hired</span>
                          <span className="font-medium">9 (5.6%)</span>
                        </div>
                        <Progress value={5.6} className="h-3 bg-green-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5 text-primary" />
                      Department Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={280}>
                      <RechartsPie>
                        <Pie
                          data={departmentPositions}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          dataKey="positions"
                          nameKey="department"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {departmentPositions.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : location.pathname === "/recruiter/evaluation-reports" ? (
            <div className="space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Evaluation Reports</h1>
                  <p className="text-muted-foreground">Manage candidate assessments and reports ({mockCandidates.length})</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" /> Export CSV
                  </Button>
                  <Button size="sm" className="gap-2">
                    <FileText className="h-4 w-4" /> Generate Report
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Reports</p>
                        <p className="text-3xl font-bold mt-1">{mockCandidates.length}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-blue-500/10">
                        <FileText className="h-8 w-8 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Advance</p>
                        <p className="text-3xl font-bold mt-1 text-green-600">
                          {mockCandidates.filter(c => c.status === 'advance').length}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-green-500/10">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Hold</p>
                        <p className="text-3xl font-bold mt-1 text-yellow-600">
                          {mockCandidates.filter(c => c.status === 'advance-reserve').length}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-yellow-500/10">
                        <Clock className="h-8 w-8 text-yellow-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Rejected</p>
                        <p className="text-3xl font-bold mt-1 text-red-600">
                          {mockCandidates.filter(c => c.status === 'reject').length}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-red-500/10">
                        <XCircle className="h-8 w-8 text-red-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Candidate Evaluations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockCandidates.map((candidate) => (
                      <div key={candidate.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                                {candidate.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-lg">{candidate.name}</p>
                              <p className="text-sm text-muted-foreground">{candidate.position}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={
                              candidate.status === 'advance' ? 'bg-green-100 text-green-800' :
                              candidate.status === 'advance-reserve' ? 'bg-yellow-100 text-yellow-800' :
                              candidate.status === 'reject' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }>
                              {candidate.status === 'advance' ? 'Advance' :
                               candidate.status === 'advance-reserve' ? 'Hold' :
                               candidate.status === 'reject' ? 'Reject' : 'Pending'}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                          {candidate.features.slice(0, 5).map((feature, idx) => (
                            <div key={idx} className="text-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                              <div className="text-lg font-bold text-primary">
                                {Math.round((feature.score / feature.maxScore) * 100)}%
                              </div>
                              <p className="text-xs text-muted-foreground">{feature.name}</p>
                            </div>
                          ))}
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewReport(candidate)}>
                            <Eye className="h-4 w-4 mr-2" /> View Full Report
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" /> Download PDF
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Dialog open={viewModal} onOpenChange={setViewModal}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  {selectedCandidate && (
                    <div id="report-content">
                      <div className="flex items-center gap-4 mb-6">
                        <Avatar className="h-16 w-16">
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xl">
                            {selectedCandidate.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h2 className="text-2xl font-bold">{selectedCandidate.name}</h2>
                          <p className="text-muted-foreground">{selectedCandidate.position}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="p-4 bg-primary/5 rounded-lg text-center">
                          <div className="text-2xl font-bold text-primary">
                            {Math.round((selectedCandidate.overallScore / 5) * 100)}%
                          </div>
                          <p className="text-sm text-muted-foreground">Overall Score</p>
                        </div>
                        <div className="p-4 bg-green-500/5 rounded-lg text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {selectedCandidate.interviewer}
                          </div>
                          <p className="text-sm text-muted-foreground">Interviewer</p>
                        </div>
                        <div className="p-4 bg-blue-500/5 rounded-lg text-center">
                          <div className="text-2xl font-bold text-blue-600">{selectedCandidate.date}</div>
                          <p className="text-sm text-muted-foreground">Interview Date</p>
                        </div>
                        <div className="p-4 bg-purple-500/5 rounded-lg text-center">
                          <Badge className={
                            selectedCandidate.status === 'advance' ? 'bg-green-100 text-green-800' :
                            selectedCandidate.status === 'advance-reserve' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {selectedCandidate.status === 'advance' ? 'Advance' :
                             selectedCandidate.status === 'advance-reserve' ? 'Hold' : 'Reject'}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">Recommendation</p>
                        </div>
                      </div>

                      <h3 className="font-semibold mb-3">Detailed Evaluation</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {selectedCandidate.features.map((feature, idx) => (
                          <div key={idx} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">{feature.name}</span>
                              <Badge variant="outline">
                                {feature.category}
                              </Badge>
                            </div>
                            <Progress value={(feature.score / feature.maxScore) * 100} className="mb-2" />
                            <p className="text-sm text-muted-foreground">{feature.comments}</p>
                          </div>
                        ))}
                      </div>

                      <div className="p-4 bg-muted rounded-lg">
                        <h4 className="font-semibold mb-2">Final Recommendation</h4>
                        <p className="text-sm">{selectedCandidate.recommendation}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => setViewModal(false)}>Close</Button>
                    <Button onClick={generatePDF}><Download className="h-4 w-4 mr-2" /> Download PDF</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          ) : location.pathname === "/recruiter/settings" ? (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your account and preferences</p>
              </div>

              <Tabs defaultValue="profile">
                <TabsList>
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="integrations">Integrations</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                  <TabsTrigger value="appearance">Appearance</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="mt-6 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Profile Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                          <AvatarFallback className="text-xl bg-primary text-primary-foreground">JD</AvatarFallback>
                        </Avatar>
                        <Button variant="outline">Change Photo</Button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>First Name</Label>
                          <Input defaultValue="John" />
                        </div>
                        <div className="space-y-2">
                          <Label>Last Name</Label>
                          <Input defaultValue="Doe" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Email</Label>
                          <Input defaultValue="john@company.com" />
                        </div>
                        <div className="space-y-2">
                          <Label>Phone</Label>
                          <Input defaultValue="+1 (555) 123-4567" />
                        </div>
                      </div>
                      <Button>Save Changes</Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="integrations" className="mt-6 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Connected Services</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-blue-500/10">
                            <Mail className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">Email</p>
                            <p className="text-sm text-muted-foreground">Connect your email for candidate communication</p>
                          </div>
                        </div>
                        <Button variant="outline">Connect</Button>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-green-500/10">
                            <Calendar className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">Calendar</p>
                            <p className="text-sm text-muted-foreground">Sync interviews with your calendar</p>
                          </div>
                        </div>
                        <Button variant="outline">Connect</Button>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-blue-500/10">
                            <BriefcaseBusiness className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">Job Portals</p>
                            <p className="text-sm text-muted-foreground">Auto-post jobs to multiple job boards</p>
                          </div>
                        </div>
                        <Button variant="outline">Connect</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="notifications" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Notification Preferences</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">New Applications</p>
                          <p className="text-sm text-muted-foreground">Get notified when new candidates apply</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Interview Reminders</p>
                          <p className="text-sm text-muted-foreground">Receive reminders before scheduled interviews</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Offer Responses</p>
                          <p className="text-sm text-muted-foreground">Get notified when candidates respond to offers</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Weekly Reports</p>
                          <p className="text-sm text-muted-foreground">Receive weekly hiring analytics summary</p>
                        </div>
                        <Switch />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="appearance" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Appearance Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Dark Mode</p>
                          <p className="text-sm text-muted-foreground">Toggle dark mode for the interface</p>
                        </div>
                        <Switch 
                          checked={theme === "dark"} 
                          onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                        />
                      </div>
                      <Separator />
                      <div>
                        <p className="font-medium mb-3">Accent Color</p>
                        <div className="flex gap-3">
                          <Button variant="outline" className="w-12 h-12 rounded-full bg-blue-500 p-0" />
                          <Button variant="outline" className="w-12 h-12 rounded-full bg-green-500 p-0" />
                          <Button variant="outline" className="w-12 h-12 rounded-full bg-purple-500 p-0" />
                          <Button variant="outline" className="w-12 h-12 rounded-full bg-orange-500 p-0" />
                          <Button variant="outline" className="w-12 h-12 rounded-full bg-pink-500 p-0" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[60vh]">
              <div className="text-center">
                <h2 className="text-2xl font-bold">Evaluation Reports</h2>
                <p className="text-muted-foreground mt-2">Comprehensive candidate evaluations from assessments and interviews</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
    </RecruiterProvider>
  );
}
