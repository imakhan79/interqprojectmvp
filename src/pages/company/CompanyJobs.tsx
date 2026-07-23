import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  MoreVertical,
  Briefcase,
  MapPin,
  DollarSign,
  Users,
  Edit,
  Trash2,
  Copy,
  Loader2,
  Ban,
  CheckCircle2,
  Send,
  FileEdit,
  ClipboardList,
  ClipboardCheck,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCompanyId } from "@/hooks/useCompanyId";
import { useRealtimeTable } from "@/hooks/useRealtimeTable";
import { useAssessments } from "@/hooks/useAssessments";
import { notifyRole } from "@/lib/notifications";
import { WorkflowStepper, type Step } from "@/components/assessment/WorkflowStepper";

interface JobRow {
  id: string;
  company_id: string;
  title: string;
  department: string | null;
  location: string | null;
  employment_type: string | null;
  salary_min: number | null;
  salary_max: number | null;
  description: string | null;
  status: string;
  assessment_id: string | null;
  rejection_reason: string | null;
  created_at: string;
}

const emptyForm = {
  title: "",
  department: "",
  location: "",
  employment_type: "Full-time",
  salary_min: "",
  salary_max: "",
  description: "",
};

const emptyWizardForm = { ...emptyForm, assessment_id: "" };

const POST_JOB_STEPS: Step[] = [
  { id: 1, title: "Details", subtitle: "Role & location", icon: FileEdit },
  { id: 2, title: "Requirements", subtitle: "Salary & type", icon: ClipboardList },
  { id: 3, title: "Assessment", subtitle: "Link a skills test", icon: ClipboardCheck },
  { id: 4, title: "Review", subtitle: "Submit for approval", icon: Send },
];

const statusColors: Record<string, string> = {
  open: "bg-green-100 text-green-700",
  closed: "bg-red-100 text-red-700",
  draft: "bg-muted text-foreground",
  pending_approval: "bg-amber-100 text-amber-700",
  rejected: "bg-red-100 text-red-700",
};

const statusLabels: Record<string, string> = {
  open: "Open",
  closed: "Closed",
  draft: "Draft",
  pending_approval: "Pending Approval",
  rejected: "Rejected",
};

export default function CompanyJobs() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { companyId, loading: companyLoading, isDemo } = useCompanyId();

  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [applicantCounts, setApplicantCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobRow | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardForm, setWizardForm] = useState(emptyWizardForm);
  const { data: assessmentOptions = [] } = useAssessments();

  const loadJobs = useCallback(async () => {
    if (!companyId) {
      setJobs([]);
      setLoading(false);
      return;
    }
    setLoading(true);

    const [{ data: jobsData }, { data: candidatesData }] = await Promise.all([
      supabase.from("jobs").select("*").eq("company_id", companyId).order("created_at", { ascending: false }),
      supabase.from("candidates").select("job_id").eq("company_id", companyId),
    ]);

    setJobs((jobsData as JobRow[]) || []);

    const counts: Record<string, number> = {};
    (candidatesData || []).forEach((c: { job_id: string | null }) => {
      if (c.job_id) counts[c.job_id] = (counts[c.job_id] || 0) + 1;
    });
    setApplicantCounts(counts);
    setLoading(false);
  }, [companyId]);

  useEffect(() => {
    if (!companyLoading) loadJobs();
  }, [companyLoading, loadJobs]);

  useRealtimeTable({
    table: "jobs",
    filter: companyId ? `company_id=eq.${companyId}` : undefined,
    enabled: !!companyId && !isDemo,
    onChange: () => loadJobs(),
  });

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.department || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalApplicants = Object.values(applicantCounts).reduce((sum, n) => sum + n, 0);
  const stats = {
    total: jobs.length,
    open: jobs.filter((j) => j.status === "open").length,
    totalApplicants,
    avgPerJob: jobs.length > 0 ? Math.round(totalApplicants / jobs.length) : 0,
  };

  const openPostWizard = () => {
    setWizardForm(emptyWizardForm);
    setWizardStep(1);
    setWizardOpen(true);
  };

  const submitJob = async (status: "draft" | "pending_approval") => {
    if (!wizardForm.title.trim()) {
      toast({ title: "Job title is required", variant: "destructive" });
      setWizardStep(1);
      return;
    }
    if (!companyId) return;

    setSaving(true);
    const { data: inserted, error } = await supabase
      .from("jobs")
      .insert({
        title: wizardForm.title.trim(),
        department: wizardForm.department.trim() || null,
        location: wizardForm.location.trim() || null,
        employment_type: wizardForm.employment_type,
        salary_min: wizardForm.salary_min ? Number(wizardForm.salary_min) : null,
        salary_max: wizardForm.salary_max ? Number(wizardForm.salary_max) : null,
        description: wizardForm.description.trim() || null,
        assessment_id: wizardForm.assessment_id || null,
        company_id: companyId,
        status,
      })
      .select("id")
      .single();

    setSaving(false);
    if (error) {
      toast({ title: "Failed to save job", description: error.message, variant: "destructive" });
      return;
    }

    if (status === "pending_approval") {
      await notifyRole("admin", {
        type: "job.pending_approval",
        title: "New job awaiting approval",
        message: `${wizardForm.title.trim()} needs review before it can go live.`,
        link: "/admin/approvals",
      });
      toast({ title: "Submitted for approval", description: "An admin will review it shortly." });
    } else {
      toast({ title: "Saved as draft" });
    }

    setWizardOpen(false);
    loadJobs();
  };

  const handleResubmit = async (job: JobRow) => {
    const { error } = await supabase.from("jobs").update({ status: "pending_approval", rejection_reason: null }).eq("id", job.id);
    if (error) {
      toast({ title: "Failed to resubmit", description: error.message, variant: "destructive" });
      return;
    }
    await notifyRole("admin", {
      type: "job.pending_approval",
      title: "Job resubmitted for approval",
      message: `${job.title} was updated and resubmitted.`,
      link: "/admin/approvals",
    });
    toast({ title: "Resubmitted for approval" });
    loadJobs();
  };

  const openEditDialog = (job: JobRow) => {
    setEditingJob(job);
    setForm({
      title: job.title,
      department: job.department || "",
      location: job.location || "",
      employment_type: job.employment_type || "Full-time",
      salary_min: job.salary_min?.toString() || "",
      salary_max: job.salary_max?.toString() || "",
      description: job.description || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !editingJob) {
      toast({ title: "Job title is required", variant: "destructive" });
      return;
    }

    setSaving(true);
    const payload = {
      title: form.title.trim(),
      department: form.department.trim() || null,
      location: form.location.trim() || null,
      employment_type: form.employment_type,
      salary_min: form.salary_min ? Number(form.salary_min) : null,
      salary_max: form.salary_max ? Number(form.salary_max) : null,
      description: form.description.trim() || null,
    };

    const { error } = await supabase.from("jobs").update(payload).eq("id", editingJob.id);

    setSaving(false);
    if (error) {
      toast({ title: "Failed to save job", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Job updated" });
    setDialogOpen(false);
    loadJobs();
  };

  const handleDelete = async (job: JobRow) => {
    if (!window.confirm(`Delete "${job.title}"? This can't be undone.`)) return;
    const { error } = await supabase.from("jobs").delete().eq("id", job.id);
    if (error) {
      toast({ title: "Failed to delete job", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Job deleted" });
    loadJobs();
  };

  const handleDuplicate = async (job: JobRow) => {
    if (!companyId) return;
    const { error } = await supabase.from("jobs").insert({
      company_id: companyId,
      title: `${job.title} (Copy)`,
      department: job.department,
      location: job.location,
      employment_type: job.employment_type,
      salary_min: job.salary_min,
      salary_max: job.salary_max,
      description: job.description,
      status: "draft",
    });
    if (error) {
      toast({ title: "Failed to duplicate job", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Job duplicated as draft" });
    loadJobs();
  };

  const handleStatusChange = async (job: JobRow, status: string) => {
    const { error } = await supabase.from("jobs").update({ status }).eq("id", job.id);
    if (error) {
      toast({ title: "Failed to update status", description: error.message, variant: "destructive" });
      return;
    }
    loadJobs();
  };

  if (companyLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!companyId) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center gap-3">
        <Briefcase className="h-10 w-10 text-muted-foreground" />
        <p className="text-muted-foreground">No company workspace found for your account.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Management</h1>
          <p className="text-gray-500">Post and manage your job listings</p>
        </div>
        <Button onClick={openPostWizard}>
          <Plus className="w-4 h-4 mr-2" />
          Post New Job
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Open Positions</p>
                <p className="text-2xl font-bold text-green-600">{stats.open}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Applicants</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalApplicants}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg per Job</p>
                <p className="text-2xl font-bold text-purple-600">{stats.avgPerJob}</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-lg font-semibold text-gray-900">All Job Postings</h2>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 pl-10"
                />
              </div>
              <select
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="pending_approval">Pending Approval</option>
                <option value="closed">Closed</option>
                <option value="draft">Draft</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Position</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Salary Range</TableHead>
              <TableHead>Applicants</TableHead>
              <TableHead>Work Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredJobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                  No jobs yet — post your first opening.
                </TableCell>
              </TableRow>
            ) : (
              filteredJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <p className="font-medium">{job.title}</p>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{job.department || "—"}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-1" />
                      {job.location || "—"}
                    </div>
                  </TableCell>
                  <TableCell>
                    {job.salary_min || job.salary_max ? (
                      <div className="flex items-center text-sm">
                        <DollarSign className="w-4 h-4" />
                        {job.salary_min ? `${(job.salary_min / 1000).toFixed(0)}k` : "—"} - {job.salary_max ? `${(job.salary_max / 1000).toFixed(0)}k` : "—"}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <button
                      className="flex items-center hover:underline"
                      onClick={() => navigate(`/company/candidates?job=${job.id}`)}
                    >
                      <Users className="w-4 h-4 mr-1 text-gray-400" />
                      <span className="font-medium">{applicantCounts[job.id] || 0}</span>
                    </button>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{job.employment_type || "—"}</span>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[job.status] || "bg-muted text-foreground"} title={job.rejection_reason || undefined}>
                      {statusLabels[job.status] || job.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(job)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/company/candidates?job=${job.id}`)}>
                          <Users className="w-4 h-4 mr-2" />
                          View Applicants
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(job)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        {job.status === "draft" && (
                          <DropdownMenuItem
                            onClick={async () => {
                              await notifyRole("admin", {
                                type: "job.pending_approval",
                                title: "New job awaiting approval",
                                message: `${job.title} needs review before it can go live.`,
                                link: "/admin/approvals",
                              });
                              handleStatusChange(job, "pending_approval");
                            }}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Submit for Approval
                          </DropdownMenuItem>
                        )}
                        {job.status === "rejected" && (
                          <DropdownMenuItem onClick={() => handleResubmit(job)}>
                            <Send className="w-4 h-4 mr-2" />
                            Resubmit for Approval
                          </DropdownMenuItem>
                        )}
                        {job.status === "closed" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(job, "open")}>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Reopen
                          </DropdownMenuItem>
                        )}
                        {job.status === "open" && (
                          <DropdownMenuItem onClick={() => handleStatusChange(job, "closed")}>
                            <Ban className="w-4 h-4 mr-2" />
                            Close
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(job)}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Job</DialogTitle>
            <DialogDescription>Update this job posting.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="job-title">Job Title</Label>
              <Input id="job-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Senior Backend Engineer" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="job-department">Department</Label>
                <Input id="job-department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="Engineering" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job-location">Location</Label>
                <Input id="job-location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Remote" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="job-type">Employment Type</Label>
                <select
                  id="job-type"
                  className="w-full h-10 px-3 border border-input rounded-md bg-background text-sm"
                  value={form.employment_type}
                  onChange={(e) => setForm({ ...form, employment_type: e.target.value })}
                >
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Contract</option>
                  <option>Internship</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="job-salary-min">Salary Min</Label>
                <Input id="job-salary-min" type="number" value={form.salary_min} onChange={(e) => setForm({ ...form, salary_min: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job-salary-max">Salary Max</Label>
                <Input id="job-salary-max" type="number" value={form.salary_max} onChange={(e) => setForm({ ...form, salary_max: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="job-description">Description</Label>
              <Textarea id="job-description" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Post New Job — guided wizard */}
      <Dialog open={wizardOpen} onOpenChange={setWizardOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Post New Job</DialogTitle>
            <DialogDescription>New jobs go live once an admin approves them.</DialogDescription>
          </DialogHeader>

          <WorkflowStepper
            currentStep={wizardStep}
            onStepClick={setWizardStep}
            canProceedToStep={(step) => step <= wizardStep + 1}
            steps={POST_JOB_STEPS}
          />

          <div className="py-2">
            {wizardStep === 1 && (
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="wiz-title">Job Title</Label>
                  <Input id="wiz-title" value={wizardForm.title} onChange={(e) => setWizardForm({ ...wizardForm, title: e.target.value })} placeholder="Senior Backend Engineer" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="wiz-department">Department</Label>
                    <Input id="wiz-department" value={wizardForm.department} onChange={(e) => setWizardForm({ ...wizardForm, department: e.target.value })} placeholder="Engineering" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wiz-location">Location</Label>
                    <Input id="wiz-location" value={wizardForm.location} onChange={(e) => setWizardForm({ ...wizardForm, location: e.target.value })} placeholder="Remote" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wiz-description">Description</Label>
                  <Textarea id="wiz-description" rows={4} value={wizardForm.description} onChange={(e) => setWizardForm({ ...wizardForm, description: e.target.value })} />
                </div>
              </div>
            )}

            {wizardStep === 2 && (
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="wiz-type">Employment Type</Label>
                  <select
                    id="wiz-type"
                    className="w-full h-10 px-3 border border-input rounded-md bg-background text-sm"
                    value={wizardForm.employment_type}
                    onChange={(e) => setWizardForm({ ...wizardForm, employment_type: e.target.value })}
                  >
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                    <option>Internship</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="wiz-salary-min">Salary Min</Label>
                    <Input id="wiz-salary-min" type="number" value={wizardForm.salary_min} onChange={(e) => setWizardForm({ ...wizardForm, salary_min: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wiz-salary-max">Salary Max</Label>
                    <Input id="wiz-salary-max" type="number" value={wizardForm.salary_max} onChange={(e) => setWizardForm({ ...wizardForm, salary_max: e.target.value })} />
                  </div>
                </div>
              </div>
            )}

            {wizardStep === 3 && (
              <div className="space-y-3">
                <Label>Link a Skills Assessment (optional)</Label>
                <p className="text-sm text-muted-foreground">Candidates who apply will be prompted to take this assessment.</p>
                <select
                  className="w-full h-10 px-3 border border-input rounded-md bg-background text-sm"
                  value={wizardForm.assessment_id}
                  onChange={(e) => setWizardForm({ ...wizardForm, assessment_id: e.target.value })}
                >
                  <option value="">No assessment linked</option>
                  {assessmentOptions.map((a: any) => (
                    <option key={a.id} value={a.id}>{a.title}</option>
                  ))}
                </select>
              </div>
            )}

            {wizardStep === 4 && (
              <div className="space-y-4">
                <div className="rounded-lg border p-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Title</span><span>{wizardForm.title || "—"}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Department</span><span>{wizardForm.department || "—"}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Location</span><span>{wizardForm.location || "—"}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span>{wizardForm.employment_type}</span></div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Assessment</span>
                    <span>{assessmentOptions.find((a: any) => a.id === wizardForm.assessment_id)?.title || "None"}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Submitting sends this job to InterQ admins for approval. You can save it as a draft instead and submit later.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="flex items-center justify-between sm:justify-between">
            <Button variant="ghost" onClick={() => (wizardStep > 1 ? setWizardStep(wizardStep - 1) : setWizardOpen(false))} disabled={saving}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {wizardStep > 1 ? "Back" : "Cancel"}
            </Button>
            <div className="flex gap-2">
              {wizardStep === 4 && (
                <Button variant="outline" onClick={() => submitJob("draft")} disabled={saving}>
                  Save as Draft
                </Button>
              )}
              {wizardStep < 4 ? (
                <Button onClick={() => setWizardStep(wizardStep + 1)}>
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={() => submitJob("pending_approval")} disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Submit for Approval
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
