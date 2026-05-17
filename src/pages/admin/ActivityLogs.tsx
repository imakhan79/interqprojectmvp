import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Activity, Filter, Download, User, Shield, Building2, FileText, CheckCircle2, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityLog {
  id: string;
  timestamp: string;
  user: string;
  userEmail: string;
  action: string;
  actionType: "create" | "update" | "delete" | "login" | "logout" | "export" | "approve" | "reject";
  module: string;
  entity: string;
  ipAddress: string;
  status: "success" | "failed" | "warning";
  details: string;
}

interface TestResult {
  id: string;
  timestamp: string;
  userId: string;
  assessment: string;
  score: number;
  passed: boolean;
  duration: number;
  ipAddress: string;
}

interface TestSession {
  id: string;
  startedAt: string;
  userId: string;
  assessment: string;
  status: "completed" | "in_progress" | "abandoned";
  tabSwitches: number;
  duration: number;
}

const MOCK_LOGS: ActivityLog[] = [
  { id: "1", timestamp: "2024-03-18T10:30:00Z", user: "Sarah Johnson", userEmail: "sarah@techcorp.com", action: "Created", actionType: "create", module: "Users", entity: "User Account", ipAddress: "192.168.1.1", status: "success", details: "Created new user account for mike@example.com" },
  { id: "2", timestamp: "2024-03-18T10:15:00Z", user: "Michael Chen", userEmail: "michael@techcorp.com", action: "Updated", actionType: "update", module: "Companies", entity: "TechCorp Solutions", ipAddress: "192.168.1.2", status: "success", details: "Updated subscription plan from Professional to Enterprise" },
  { id: "3", timestamp: "2024-03-18T09:45:00Z", user: "Admin", userEmail: "admin@interq.com", action: "Login", actionType: "login", module: "Auth", entity: "Session", ipAddress: "10.0.0.1", status: "success", details: "Successful login from Chrome browser" },
  { id: "4", timestamp: "2024-03-18T09:30:00Z", user: "Emily Davis", userEmail: "emily@techcorp.com", action: "Exported", actionType: "export", module: "Reports", entity: "User Report", ipAddress: "192.168.1.5", status: "success", details: "Exported user activity report (CSV, 342 rows)" },
  { id: "5", timestamp: "2024-03-18T09:00:00Z", user: "James Wilson", userEmail: "james@techcorp.com", action: "Deleted", actionType: "delete", module: "Jobs", entity: "Job Posting", ipAddress: "192.168.1.8", status: "success", details: "Deleted expired job posting: Senior Developer (ID: JB-291)" },
  { id: "6", timestamp: "2024-03-18T08:45:00Z", user: "Unknown", userEmail: "hacker@evil.com", action: "Login Failed", actionType: "login", module: "Auth", entity: "Session", ipAddress: "203.0.113.1", status: "failed", details: "Failed login attempt - invalid credentials (3rd attempt)" },
  { id: "7", timestamp: "2024-03-17T17:20:00Z", user: "Lisa Martinez", userEmail: "lisa@techcorp.com", action: "Approved", actionType: "approve", module: "Candidates", entity: "Alex Thompson", ipAddress: "192.168.1.10", status: "success", details: "Moved candidate to offer stage" },
  { id: "8", timestamp: "2024-03-17T16:00:00Z", user: "David Kim", userEmail: "david@medhealth.com", action: "Updated", actionType: "update", module: "Roles", entity: "Recruiter Role", ipAddress: "192.168.2.1", status: "success", details: "Updated permissions for Recruiter role - added export access" },
  { id: "9", timestamp: "2024-03-17T15:30:00Z", user: "Jennifer Lee", userEmail: "jennifer@financehub.com", action: "Created", actionType: "create", module: "Jobs", entity: "Financial Analyst", ipAddress: "192.168.3.1", status: "success", details: "Created new job posting for Financial Analyst position" },
  { id: "10", timestamp: "2024-03-17T14:00:00Z", user: "Robert Taylor", userEmail: "robert@financehub.com", action: "Rejected", actionType: "reject", module: "Candidates", entity: "John Smith", ipAddress: "192.168.3.2", status: "warning", details: "Rejected candidate application for Financial Analyst role" },
];

const MOCK_RESULTS: TestResult[] = [
  { id: "1", timestamp: "2024-03-18T10:00:00Z", userId: "usr_abc123", assessment: "JavaScript Fundamentals", score: 88, passed: true, duration: 28, ipAddress: "192.168.1.10" },
  { id: "2", timestamp: "2024-03-18T09:30:00Z", userId: "usr_def456", assessment: "React Advanced Patterns", score: 62, passed: false, duration: 58, ipAddress: "192.168.1.11" },
  { id: "3", timestamp: "2024-03-18T08:45:00Z", userId: "usr_ghi789", assessment: "Python Data Structures", score: 91, passed: true, duration: 42, ipAddress: "192.168.1.12" },
  { id: "4", timestamp: "2024-03-17T17:00:00Z", userId: "usr_jkl012", assessment: "SQL Database Design", score: 75, passed: true, duration: 29, ipAddress: "192.168.1.13" },
  { id: "5", timestamp: "2024-03-17T16:20:00Z", userId: "usr_mno345", assessment: "System Design Interview", score: 55, passed: false, duration: 87, ipAddress: "192.168.1.14" },
];

const MOCK_SESSIONS: TestSession[] = [
  { id: "1", startedAt: "2024-03-18T10:00:00Z", userId: "usr_abc123", assessment: "JavaScript Fundamentals", status: "completed", tabSwitches: 0, duration: 28 },
  { id: "2", startedAt: "2024-03-18T09:30:00Z", userId: "usr_def456", assessment: "React Advanced Patterns", status: "completed", tabSwitches: 3, duration: 58 },
  { id: "3", startedAt: "2024-03-18T09:15:00Z", userId: "usr_pqr678", assessment: "DevOps & CI/CD", status: "in_progress", tabSwitches: 1, duration: 22 },
  { id: "4", startedAt: "2024-03-18T08:45:00Z", userId: "usr_ghi789", assessment: "Python Data Structures", status: "completed", tabSwitches: 0, duration: 42 },
  { id: "5", startedAt: "2024-03-17T16:00:00Z", userId: "usr_stu901", assessment: "AWS Cloud Practitioner", status: "abandoned", tabSwitches: 7, duration: 12 },
];

const ACTION_COLORS: Record<string, string> = {
  create: "bg-green-500/10 text-green-600 border-green-500/30",
  update: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  delete: "bg-red-500/10 text-red-600 border-red-500/30",
  login: "bg-gray-500/10 text-gray-600 border-gray-500/30",
  logout: "bg-gray-500/10 text-gray-600 border-gray-500/30",
  export: "bg-purple-500/10 text-purple-600 border-purple-500/30",
  approve: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  reject: "bg-orange-500/10 text-orange-600 border-orange-500/30",
};

const STATUS_COLORS: Record<string, string> = {
  success: "bg-green-500/10 text-green-600 border-green-500/30",
  failed: "bg-red-500/10 text-red-600 border-red-500/30",
  warning: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
};

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export default function ActivityLogs() {
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredLogs = MOCK_LOGS.filter((log) => {
    const matchSearch =
      log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.module.toLowerCase().includes(search.toLowerCase()) ||
      log.entity.toLowerCase().includes(search.toLowerCase());
    const matchModule = moduleFilter === "all" || log.module === moduleFilter;
    const matchStatus = statusFilter === "all" || log.status === statusFilter;
    return matchSearch && matchModule && matchStatus;
  });

  const filteredResults = MOCK_RESULTS.filter(r =>
    r.assessment.toLowerCase().includes(search.toLowerCase()) ||
    r.userId.toLowerCase().includes(search.toLowerCase())
  );

  const filteredSessions = MOCK_SESSIONS.filter(s =>
    s.assessment.toLowerCase().includes(search.toLowerCase()) ||
    s.userId.toLowerCase().includes(search.toLowerCase())
  );

  const modules = [...new Set(MOCK_LOGS.map(l => l.module))];

  const stats = {
    total: MOCK_LOGS.length,
    success: MOCK_LOGS.filter(l => l.status === "success").length,
    failed: MOCK_LOGS.filter(l => l.status === "failed").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Activity Logs</h1>
          <p className="text-sm text-muted-foreground mt-1">Monitor platform activity and audit trail</p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export Logs
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-muted-foreground">Total Events</p><p className="text-2xl font-bold">{stats.total}</p></div>
              <Activity className="h-8 w-8 text-blue-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-muted-foreground">Successful</p><p className="text-2xl font-bold text-green-600">{stats.success}</p></div>
              <CheckCircle2 className="h-8 w-8 text-green-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-muted-foreground">Failed</p><p className="text-2xl font-bold text-red-600">{stats.failed}</p></div>
              <XCircle className="h-8 w-8 text-red-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="audit">
        <TabsList>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
          <TabsTrigger value="results">Test Results</TabsTrigger>
          <TabsTrigger value="sessions">Test Sessions</TabsTrigger>
        </TabsList>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search logs..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={moduleFilter} onValueChange={setModuleFilter}>
            <SelectTrigger className="w-[160px]">
              <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Module" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modules</SelectItem>
              {modules.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="audit" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id} title={log.details}>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(log.timestamp)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                              {getInitials(log.user)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{log.user}</p>
                            <p className="text-xs text-muted-foreground">{log.userEmail}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("text-xs", ACTION_COLORS[log.actionType])}>
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{log.module}</TableCell>
                      <TableCell className="text-sm">{log.entity}</TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">{log.ipAddress}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("text-xs capitalize", STATUS_COLORS[log.status])}>
                          {log.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!filteredLogs.length && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">No logs found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Assessment</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>IP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResults.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{formatTime(r.timestamp)}</TableCell>
                      <TableCell className="font-mono text-xs">{r.userId}</TableCell>
                      <TableCell className="text-sm">{r.assessment}</TableCell>
                      <TableCell className="font-semibold text-sm">{r.score}%</TableCell>
                      <TableCell className="text-sm">{r.duration}m</TableCell>
                      <TableCell>
                        <Badge variant={r.passed ? "default" : "destructive"} className="text-xs">
                          {r.passed ? "Pass" : "Fail"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{r.ipAddress}</TableCell>
                    </TableRow>
                  ))}
                  {!filteredResults.length && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">No results found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Started At</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Assessment</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Tab Switches</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSessions.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{formatTime(s.startedAt)}</TableCell>
                      <TableCell className="font-mono text-xs">{s.userId}</TableCell>
                      <TableCell className="text-sm">{s.assessment}</TableCell>
                      <TableCell className="text-sm">{s.duration}m</TableCell>
                      <TableCell>
                        <span className={cn("text-sm font-medium", s.tabSwitches > 3 && "text-red-600")}>
                          {s.tabSwitches}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={s.status === "completed" ? "default" : s.status === "in_progress" ? "secondary" : "outline"}
                          className="text-xs capitalize"
                        >
                          {s.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!filteredSessions.length && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">No sessions found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
