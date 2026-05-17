import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollText, Search, Download, Filter, User, Settings, Shield, Building2, Briefcase } from "lucide-react";

const auditLogs = [
  { id: 1, user: "Sarah Admin", action: "Created company", resource: "TechCorp Solutions", type: "company", timestamp: "2026-05-17 10:32:15", ip: "192.168.1.1", severity: "info" },
  { id: 2, user: "Sarah Admin", action: "Updated role permissions", resource: "Recruiter Role", type: "role", timestamp: "2026-05-17 10:15:00", ip: "192.168.1.1", severity: "warning" },
  { id: 3, user: "Alex Manager", action: "Deactivated user", resource: "john.doe@example.com", type: "user", timestamp: "2026-05-17 09:45:22", ip: "10.0.0.5", severity: "warning" },
  { id: 4, user: "Sarah Admin", action: "Updated system settings", resource: "Email Configuration", type: "settings", timestamp: "2026-05-17 09:30:00", ip: "192.168.1.1", severity: "info" },
  { id: 5, user: "John Recruiter", action: "Exported candidate data", resource: "Candidates Report", type: "data", timestamp: "2026-05-17 09:00:00", ip: "10.0.0.8", severity: "info" },
  { id: 6, user: "Sarah Admin", action: "Deleted job posting", resource: "Senior Developer", type: "job", timestamp: "2026-05-16 18:20:00", ip: "192.168.1.1", severity: "critical" },
  { id: 7, user: "Alex Manager", action: "Invited new recruiter", resource: "recruiter@company.com", type: "user", timestamp: "2026-05-16 17:10:00", ip: "10.0.0.5", severity: "info" },
  { id: 8, user: "Sarah Admin", action: "Changed billing plan", resource: "Professional → Enterprise", type: "billing", timestamp: "2026-05-16 15:00:00", ip: "192.168.1.1", severity: "warning" },
];

const typeIcon: Record<string, React.ReactNode> = {
  company: <Building2 className="h-4 w-4" />,
  role: <Shield className="h-4 w-4" />,
  user: <User className="h-4 w-4" />,
  settings: <Settings className="h-4 w-4" />,
  data: <ScrollText className="h-4 w-4" />,
  job: <Briefcase className="h-4 w-4" />,
  billing: <Settings className="h-4 w-4" />,
};

const severityClass: Record<string, string> = {
  info: "bg-blue-50 text-blue-700 border-blue-200",
  warning: "bg-yellow-50 text-yellow-700 border-yellow-200",
  critical: "bg-red-50 text-red-700 border-red-200",
};

export default function AdminAuditLogs() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");

  const filtered = auditLogs.filter((log) => {
    const matchesSearch =
      !search ||
      log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.resource.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || log.type === typeFilter;
    const matchesSeverity = severityFilter === "all" || log.severity === severityFilter;
    return matchesSearch && matchesType && matchesSeverity;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground text-sm mt-1">Track all admin and user actions across the platform</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Events", value: auditLogs.length, color: "text-blue-600 bg-blue-50" },
          { label: "Info", value: auditLogs.filter((l) => l.severity === "info").length, color: "text-blue-600 bg-blue-50" },
          { label: "Warnings", value: auditLogs.filter((l) => l.severity === "warning").length, color: "text-yellow-600 bg-yellow-50" },
          { label: "Critical", value: auditLogs.filter((l) => l.severity === "critical").length, color: "text-red-600 bg-red-50" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className={`text-3xl font-bold mt-1 ${stat.color.split(" ")[0]}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by user, action, or resource..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[160px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="company">Company</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="role">Role</SelectItem>
                <SelectItem value="job">Job</SelectItem>
                <SelectItem value="settings">Settings</SelectItem>
                <SelectItem value="billing">Billing</SelectItem>
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScrollText className="h-5 w-5" />
            {filtered.length} Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filtered.map((log) => (
              <div
                key={log.id}
                className="flex items-start justify-between gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2 bg-muted rounded-lg flex-shrink-0 mt-0.5">
                    {typeIcon[log.type] || <ScrollText className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{log.action}</p>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{log.user}</span> · {log.resource}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">IP: {log.ip}</p>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right space-y-1">
                  <Badge variant="outline" className={severityClass[log.severity]}>
                    {log.severity}
                  </Badge>
                  <p className="text-xs text-muted-foreground">{log.timestamp}</p>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <ScrollText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No audit logs match your filters</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
