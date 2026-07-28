import { useState, useMemo } from "react";
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Copy,
  Archive,
  XCircle,
  CheckCircle,
  FileCheck,
  Briefcase,
  MapPin,
  Users,
  DollarSign,
  Calendar,
  Filter,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Job,
  JobStatus,
  INDUSTRIES,
  DEPARTMENTS,
  EMPLOYMENT_TYPES,
  WORKPLACE_TYPES,
  EXPERIENCE_LEVELS,
} from "@/types/adminModule";
import { mockJobs, mockCompanies, mockUsers } from "@/data/adminModuleData";

const statusConfig: Record<JobStatus, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  draft: { label: "Draft", variant: "secondary" },
  open: { label: "Open", variant: "default" },
  closed: { label: "Closed", variant: "outline" },
  pending_approval: { label: "Pending Approval", variant: "secondary" },
  on_hold: { label: "On Hold", variant: "destructive" },
};

const ITEMS_PER_PAGE = 10;

interface JobFormData {
  title: string;
  department: string;
  location: string;
  employmentType: string;
  workplaceType: string;
  experienceLevel: string;
  salaryMin: string;
  salaryMax: string;
  openings: string;
  description: string;
  companyId: string;
  recruiterId: string;
}

const initialFormData: JobFormData = {
  title: "",
  department: "",
  location: "",
  employmentType: "",
  workplaceType: "",
  experienceLevel: "",
  salaryMin: "",
  salaryMax: "",
  openings: "1",
  description: "",
  companyId: "",
  recruiterId: "",
};

export default function JobsManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [formData, setFormData] = useState<JobFormData>(initialFormData);

  const [filters, setFilters] = useState({
    companyId: "",
    department: "",
    recruiterId: "",
    status: "" as JobStatus | "",
  });

  const filteredJobs = useMemo(() => {
    return mockJobs.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesTab =
        activeTab === "all" ||
        (activeTab === "open" && job.status === "open") ||
        (activeTab === "draft" && job.status === "draft") ||
        (activeTab === "closed" && job.status === "closed") ||
        (activeTab === "pending" && job.status === "pending_approval") ||
        (activeTab === "on_hold" && job.status === "on_hold");

      const matchesCompany =
        !filters.companyId || job.companyId === filters.companyId;
      const matchesDepartment =
        !filters.department || job.department === filters.department;
      const matchesRecruiter =
        !filters.recruiterId || job.recruiterId === filters.recruiterId;
      const matchesStatus = !filters.status || job.status === filters.status;

      return (
        matchesSearch &&
        matchesTab &&
        matchesCompany &&
        matchesDepartment &&
        matchesRecruiter &&
        matchesStatus
      );
    });
  }, [searchTerm, activeTab, filters]);

  const totalPages = Math.ceil(filteredJobs.length / ITEMS_PER_PAGE);
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleEditJob = (job: Job) => {
    setSelectedJob(job);
    setFormData({
      title: job.title,
      department: job.department,
      location: job.location,
      employmentType: job.employmentType,
      workplaceType: job.workplaceType,
      experienceLevel: job.experienceLevel,
      salaryMin: job.salaryMin.toString(),
      salaryMax: job.salaryMax.toString(),
      openings: job.openings.toString(),
      description: job.description,
      companyId: job.companyId,
      recruiterId: job.recruiterId,
    });
    setIsEditDialogOpen(true);
  };

  const handleDuplicateJob = (job: Job) => {
    setFormData({
      title: `${job.title} (Copy)`,
      department: job.department,
      location: job.location,
      employmentType: job.employmentType,
      workplaceType: job.workplaceType,
      experienceLevel: job.experienceLevel,
      salaryMin: job.salaryMin.toString(),
      salaryMax: job.salaryMax.toString(),
      openings: job.openings.toString(),
      description: job.description,
      companyId: job.companyId,
      recruiterId: job.recruiterId,
    });
    setIsCreateDialogOpen(true);
  };

  const handleAction = (action: string, job: Job) => {
    console.log(`${action} on job:`, job.title);
  };

  const clearFilters = () => {
    setFilters({
      companyId: "",
      department: "",
      recruiterId: "",
      status: "",
    });
    setSearchTerm("");
    setActiveTab("all");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    filters.companyId ||
    filters.department ||
    filters.recruiterId ||
    filters.status ||
    searchTerm ||
    activeTab !== "all";

  const formatSalary = (min: number, max: number) => {
    const formatNumber = (num: number) =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(num);
    return `${formatNumber(min)} - ${formatNumber(max)}`;
  };

  const getUniqueCompanies = () => {
    const companies = mockJobs.map((job) => ({
      id: job.companyId,
      name: job.companyName,
    }));
    return companies.filter(
      (c, index, self) => index === self.findIndex((t) => t.id === c.id)
    );
  };

  const getUniqueRecruiters = () => {
    const recruiters = mockJobs.map((job) => ({
      id: job.recruiterId,
      name: job.recruiterName,
    }));
    return recruiters.filter(
      (r, index, self) => index === self.findIndex((t) => t.id === r.id)
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Jobs Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredJobs.length} jobs found
          </p>
        </div>
        <Button
          className="gap-2"
          onClick={() => {
            setFormData(initialFormData);
            setIsCreateDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Create New Job
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs by title, company, or location..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <Select
              value={filters.companyId}
              onValueChange={(value) => {
                setFilters((prev) => ({ ...prev, companyId: value }));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Companies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Companies</SelectItem>
                {getUniqueCompanies().map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.department}
              onValueChange={(value) => {
                setFilters((prev) => ({ ...prev, department: value }));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Departments</SelectItem>
                {DEPARTMENTS.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.recruiterId}
              onValueChange={(value) => {
                setFilters((prev) => ({ ...prev, recruiterId: value }));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All TAPs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All TAPs</SelectItem>
                {getUniqueRecruiters().map((recruiter) => (
                  <SelectItem key={recruiter.id} value={recruiter.id}>
                    {recruiter.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.status}
              onValueChange={(value) => {
                setFilters((prev) => ({
                  ...prev,
                  status: value as JobStatus | "",
                }));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="pending_approval">Pending Approval</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="gap-1"
              >
                <X className="h-3 w-3" />
                Clear Filters
              </Button>
            )}
          </div>
        </CardHeader>

        <Tabs
          defaultValue="all"
          onValueChange={(value) => {
            setActiveTab(value);
            setCurrentPage(1);
          }}
          className="w-full"
        >
          <TabsList className="mx-6">
            <TabsTrigger value="all">All Jobs</TabsTrigger>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="on_hold">On Hold</TabsTrigger>
            <TabsTrigger value="closed">Closed</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Salary Range</TableHead>
                    <TableHead>Applications</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>TAP</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedJobs.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        className="h-32 text-center text-muted-foreground"
                      >
                        <Briefcase className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                        No jobs found matching your criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedJobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{job.title}</span>
                            <span className="text-xs text-muted-foreground">
                              {job.department} • {job.experienceLevel}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{job.companyName}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            {job.location}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{job.employmentType}</span>
                            <span className="text-xs text-muted-foreground">
                              {job.workplaceType}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3 text-muted-foreground" />
                            {formatSalary(job.salaryMin, job.salaryMax)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            {job.applications}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusConfig[job.status].variant}>
                            {statusConfig[job.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell>{job.recruiterName}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="h-8 w-8 p-0"
                              >
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleEditJob(job)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDuplicateJob(job)}
                              >
                                <Copy className="h-4 w-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleAction("archive", job)}
                              >
                                <Archive className="h-4 w-4 mr-2" />
                                Archive
                              </DropdownMenuItem>
                              {job.status === "open" && (
                                <DropdownMenuItem
                                  onClick={() => handleAction("close", job)}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Close
                                </DropdownMenuItem>
                              )}
                              {job.status === "closed" && (
                                <DropdownMenuItem
                                  onClick={() => handleAction("reopen", job)}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Reopen
                                </DropdownMenuItem>
                              )}
                              {job.status === "pending_approval" && (
                                <DropdownMenuItem
                                  onClick={() => handleAction("approve", job)}
                                >
                                  <FileCheck className="h-4 w-4 mr-2" />
                                  Approve
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4">
                <div className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredJobs.length)} of{" "}
                  {filteredJobs.length} jobs
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Button
                        key={page}
                        variant={
                          currentPage === page ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    )
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Job</DialogTitle>
            <DialogDescription>
              Fill in the job details to create a new job posting.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                placeholder="e.g. Senior Software Engineer"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="company">Company</Label>
                <Select
                  value={formData.companyId}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, companyId: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockCompanies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, department: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g. San Francisco, CA"
                value={formData.location}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, location: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="employmentType">Employment Type</Label>
                <Select
                  value={formData.employmentType}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      employmentType: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {EMPLOYMENT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="workplaceType">Workplace Type</Label>
                <Select
                  value={formData.workplaceType}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      workplaceType: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select workplace" />
                  </SelectTrigger>
                  <SelectContent>
                    {WORKPLACE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="experienceLevel">Experience Level</Label>
                <Select
                  value={formData.experienceLevel}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      experienceLevel: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPERIENCE_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="openings">Number of Openings</Label>
                <Input
                  id="openings"
                  type="number"
                  min="1"
                  value={formData.openings}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      openings: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="salaryMin">Minimum Salary ($)</Label>
                <Input
                  id="salaryMin"
                  type="number"
                  placeholder="e.g. 100000"
                  value={formData.salaryMin}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      salaryMin: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="salaryMax">Maximum Salary ($)</Label>
                <Input
                  id="salaryMax"
                  type="number"
                  placeholder="e.g. 150000"
                  value={formData.salaryMax}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      salaryMax: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="recruiter">TAP</Label>
              <Select
                value={formData.recruiterId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, recruiterId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select recruiter" />
                </SelectTrigger>
                <SelectContent>
                  {mockUsers
                    .filter((u) => u.role === "TAP")
                    .map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Job Description</Label>
              <Textarea
                id="description"
                placeholder="Enter job description..."
                rows={5}
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={() => setIsCreateDialogOpen(false)}>
              Create Job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Job</DialogTitle>
            <DialogDescription>
              Update the job details for "{selectedJob?.title}".
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Job Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-company">Company</Label>
                <Select
                  value={formData.companyId}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, companyId: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockCompanies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-department">Department</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, department: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                value={formData.location}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, location: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-employmentType">Employment Type</Label>
                <Select
                  value={formData.employmentType}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      employmentType: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {EMPLOYMENT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-workplaceType">Workplace Type</Label>
                <Select
                  value={formData.workplaceType}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      workplaceType: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select workplace" />
                  </SelectTrigger>
                  <SelectContent>
                    {WORKPLACE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-experienceLevel">Experience Level</Label>
                <Select
                  value={formData.experienceLevel}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      experienceLevel: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPERIENCE_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-openings">Number of Openings</Label>
                <Input
                  id="edit-openings"
                  type="number"
                  min="1"
                  value={formData.openings}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      openings: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-salaryMin">Minimum Salary ($)</Label>
                <Input
                  id="edit-salaryMin"
                  type="number"
                  value={formData.salaryMin}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      salaryMin: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-salaryMax">Maximum Salary ($)</Label>
                <Input
                  id="edit-salaryMax"
                  type="number"
                  value={formData.salaryMax}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      salaryMax: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-recruiter">TAP</Label>
              <Select
                value={formData.recruiterId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, recruiterId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select recruiter" />
                </SelectTrigger>
                <SelectContent>
                  {mockUsers
                    .filter((u) => u.role === "TAP")
                    .map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Job Description</Label>
              <Textarea
                id="edit-description"
                rows={5}
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={() => setIsEditDialogOpen(false)}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}