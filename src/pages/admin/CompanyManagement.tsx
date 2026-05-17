import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Search, Building2, Plus, MoreHorizontal, Edit, Eye,
  Ban, CheckCircle2, XCircle, AlertCircle, Clock, Filter
} from "lucide-react";
import { mockCompanies } from "@/data/adminModuleData";
import { Company, CompanyStatus } from "@/types/adminModule";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<CompanyStatus, { label: string; color: string; icon: React.ReactNode }> = {
  active: { label: "Active", color: "bg-green-500/10 text-green-600 border-green-500/30", icon: <CheckCircle2 className="h-3 w-3" /> },
  inactive: { label: "Inactive", color: "bg-gray-500/10 text-gray-600 border-gray-500/30", icon: <XCircle className="h-3 w-3" /> },
  suspended: { label: "Suspended", color: "bg-red-500/10 text-red-600 border-red-500/30", icon: <Ban className="h-3 w-3" /> },
  trial: { label: "Trial", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30", icon: <Clock className="h-3 w-3" /> },
};

const PLAN_COLORS: Record<string, string> = {
  enterprise: "bg-purple-500/10 text-purple-600 border-purple-500/30",
  professional: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  basic: "bg-gray-500/10 text-gray-600 border-gray-500/30",
};

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function CompanyManagement() {
  const [companies, setCompanies] = useState<Company[]>(mockCompanies);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [viewCompany, setViewCompany] = useState<Company | null>(null);
  const [editCompany, setEditCompany] = useState<Company | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const filtered = companies.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
      c.contactEmail.toLowerCase().includes(search.toLowerCase()) ||
      c.industry.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    const matchPlan = planFilter === "all" || c.subscriptionPlan === planFilter;
    return matchSearch && matchStatus && matchPlan;
  });

  const handleStatusChange = (id: string, status: CompanyStatus) => {
    setCompanies(companies.map(c => c.id === id ? { ...c, status } : c));
  };

  const handleSaveEdit = () => {
    if (!editCompany) return;
    setCompanies(companies.map(c => c.id === editCompany.id ? editCompany : c));
    setIsEditOpen(false);
    setEditCompany(null);
  };

  const openView = (company: Company) => {
    setViewCompany(company);
    setIsViewOpen(true);
  };

  const openEdit = (company: Company) => {
    setEditCompany({ ...company });
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Company Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filtered.length} of {companies.length} companies
          </p>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Company
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(["active", "trial", "inactive", "suspended"] as CompanyStatus[]).map((status) => {
          const count = companies.filter(c => c.status === status).length;
          const cfg = STATUS_CONFIG[status];
          return (
            <Card key={status} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter(statusFilter === status ? "all" : status)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground capitalize">{status}</p>
                    <p className="text-2xl font-bold">{count}</p>
                  </div>
                  <Badge variant="outline" className={cn("text-xs", cfg.color)}>
                    {cfg.icon}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search companies, contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="trial">Trial</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
        <Select value={planFilter} onValueChange={setPlanFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Plans</SelectItem>
            <SelectItem value="enterprise">Enterprise</SelectItem>
            <SelectItem value="professional">Professional</SelectItem>
            <SelectItem value="basic">Basic</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Recruiters</TableHead>
                <TableHead>Jobs</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((company) => {
                const statusCfg = STATUS_CONFIG[company.status];
                return (
                  <TableRow key={company.id} className="group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-border/50">
                          <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                            {getInitials(company.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{company.name}</p>
                          <p className="text-xs text-muted-foreground">{company.contactEmail}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{company.industry}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-xs capitalize", PLAN_COLORS[company.subscriptionPlan])}>
                        {company.subscriptionPlan}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-xs gap-1", statusCfg.color)}>
                        {statusCfg.icon}
                        {statusCfg.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{company.recruiterCount}</TableCell>
                    <TableCell className="text-sm">{company.jobCount}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(company.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openView(company)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEdit(company)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {company.status === "active" ? (
                            <DropdownMenuItem
                              className="text-orange-600"
                              onClick={() => handleStatusChange(company.id, "suspended")}
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              Suspend
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              className="text-green-600"
                              onClick={() => handleStatusChange(company.id, "active")}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Activate
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
              {!filtered.length && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-12">
                    <Building2 className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="font-medium">No companies found</p>
                    <p className="text-xs mt-1">Try adjusting your search or filters</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Company Details</DialogTitle>
          </DialogHeader>
          {viewCompany && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-4 pb-4 border-b">
                <Avatar className="h-14 w-14 border-2 border-border/50">
                  <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary">
                    {getInitials(viewCompany.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-lg">{viewCompany.name}</p>
                  <p className="text-sm text-muted-foreground">{viewCompany.industry} · {viewCompany.size} employees</p>
                  <Badge variant="outline" className={cn("text-xs mt-1", STATUS_CONFIG[viewCompany.status].color)}>
                    {STATUS_CONFIG[viewCompany.status].label}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-muted-foreground text-xs">Contact Person</p><p className="font-medium">{viewCompany.contactPerson}</p></div>
                <div><p className="text-muted-foreground text-xs">Email</p><p className="font-medium">{viewCompany.contactEmail}</p></div>
                <div><p className="text-muted-foreground text-xs">Phone</p><p className="font-medium">{viewCompany.phone}</p></div>
                <div><p className="text-muted-foreground text-xs">Country</p><p className="font-medium">{viewCompany.country}</p></div>
                <div><p className="text-muted-foreground text-xs">Plan</p><p className="font-medium capitalize">{viewCompany.subscriptionPlan}</p></div>
                <div><p className="text-muted-foreground text-xs">Recruiters</p><p className="font-medium">{viewCompany.recruiterCount}</p></div>
                <div><p className="text-muted-foreground text-xs">Active Jobs</p><p className="font-medium">{viewCompany.jobCount}</p></div>
                <div><p className="text-muted-foreground text-xs">Candidates</p><p className="font-medium">{viewCompany.candidateCount}</p></div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>Close</Button>
            <Button onClick={() => { setIsViewOpen(false); if (viewCompany) openEdit(viewCompany); }}>Edit Company</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
          </DialogHeader>
          {editCompany && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label>Company Name</Label>
                  <Input value={editCompany.name} onChange={(e) => setEditCompany({ ...editCompany, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Contact Person</Label>
                  <Input value={editCompany.contactPerson} onChange={(e) => setEditCompany({ ...editCompany, contactPerson: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Contact Email</Label>
                  <Input value={editCompany.contactEmail} onChange={(e) => setEditCompany({ ...editCompany, contactEmail: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={editCompany.status} onValueChange={(v) => setEditCompany({ ...editCompany, status: v as CompanyStatus })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="trial">Trial</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Plan</Label>
                  <Select value={editCompany.subscriptionPlan} onValueChange={(v) => setEditCompany({ ...editCompany, subscriptionPlan: v as any })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
