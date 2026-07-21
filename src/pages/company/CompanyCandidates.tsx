import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Users,
  Filter,
  Star,
  Calendar,
  Briefcase,
  Eye,
  Mail,
  Trash2,
  Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/SimpleAuthContext";
import { useCompanyId } from "@/hooks/useCompanyId";
import { useRealtimeTable } from "@/hooks/useRealtimeTable";

interface CandidateRow {
  id: string;
  company_id: string;
  job_id: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  current_title: string | null;
  location: string | null;
  status: string;
  source: string | null;
  skills: string[] | null;
  rating: number | null;
  created_at: string;
}

interface JobOption {
  id: string;
  title: string;
}

const statusColors: Record<string, string> = {
  applied: "bg-blue-100 text-blue-700",
  screening: "bg-indigo-100 text-indigo-700",
  interview: "bg-orange-100 text-orange-700",
  offer: "bg-emerald-100 text-emerald-700",
  hired: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const statusLabel = (status: string) => status.charAt(0).toUpperCase() + status.slice(1);

const emptyAddForm = { full_name: "", email: "", phone: "", current_title: "", job_id: "", source: "" };
const emptyInterviewForm = { scheduled_at: "", duration_minutes: "45", meeting_link: "" };

export default function CompanyCandidates() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { companyId, loading: companyLoading, isDemo } = useCompanyId();
  const [searchParams, setSearchParams] = useSearchParams();

  const [candidates, setCandidates] = useState<CandidateRow[]>([]);
  const [jobs, setJobs] = useState<JobOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const jobFilter = searchParams.get("job") || "";

  const [viewCandidate, setViewCandidate] = useState<CandidateRow | null>(null);
  const [moveCandidate, setMoveCandidate] = useState<CandidateRow | null>(null);
  const [moveJobId, setMoveJobId] = useState("");
  const [interviewCandidate, setInterviewCandidate] = useState<CandidateRow | null>(null);
  const [interviewForm, setInterviewForm] = useState(emptyInterviewForm);
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState(emptyAddForm);
  const [saving, setSaving] = useState(false);

  const jobTitleById = useMemo(() => new Map(jobs.map(j => [j.id, j.title])), [jobs]);

  const load = useCallback(async () => {
    if (!companyId) {
      setCandidates([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const [{ data: candidateRows }, { data: jobRows }] = await Promise.all([
      supabase.from("candidates").select("*").eq("company_id", companyId).order("created_at", { ascending: false }),
      supabase.from("jobs").select("id, title").eq("company_id", companyId),
    ]);
    setCandidates((candidateRows as CandidateRow[]) || []);
    setJobs((jobRows as JobOption[]) || []);
    setLoading(false);
  }, [companyId]);

  useEffect(() => {
    if (!companyLoading) load();
  }, [companyLoading, load]);

  useRealtimeTable({
    table: "candidates",
    filter: companyId ? `company_id=eq.${companyId}` : undefined,
    enabled: !!companyId && !isDemo,
    onChange: () => load(),
  });

  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.current_title || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = stageFilter === "all" || c.status === stageFilter;
    const matchesJob = !jobFilter || c.job_id === jobFilter;
    return matchesSearch && matchesStage && matchesJob;
  });

  const stats = {
    total: candidates.length,
    new: candidates.filter((c) => c.status === "applied").length,
    screening: candidates.filter((c) => c.status === "screening").length,
    interviews: candidates.filter((c) => c.status === "interview").length,
  };

  const topRated = useMemo(
    () => [...candidates].filter(c => c.rating).sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 5),
    [candidates]
  );

  const updateStatus = async (candidate: CandidateRow, status: string) => {
    const { error } = await supabase.from("candidates").update({ status }).eq("id", candidate.id);
    if (error) {
      toast({ title: "Failed to update status", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: status === "rejected" ? "Candidate rejected" : "Status updated" });
    load();
  };

  const openMoveDialog = (candidate: CandidateRow) => {
    setMoveCandidate(candidate);
    setMoveJobId(candidate.job_id || "");
  };

  const handleMove = async () => {
    if (!moveCandidate) return;
    const { error } = await supabase.from("candidates").update({ job_id: moveJobId || null }).eq("id", moveCandidate.id);
    if (error) {
      toast({ title: "Failed to move candidate", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Candidate moved" });
    setMoveCandidate(null);
    load();
  };

  const openInterviewDialog = (candidate: CandidateRow) => {
    setInterviewCandidate(candidate);
    setInterviewForm(emptyInterviewForm);
  };

  const handleScheduleInterview = async () => {
    if (!interviewCandidate || !interviewForm.scheduled_at) {
      toast({ title: "Pick a date & time", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("interviews").insert({
      candidate_id: interviewCandidate.id,
      job_id: interviewCandidate.job_id,
      interviewer_id: user?.id || null,
      title: `Interview — ${interviewCandidate.full_name}`,
      job_role: interviewCandidate.job_id ? jobTitleById.get(interviewCandidate.job_id) : interviewCandidate.current_title,
      scheduled_at: new Date(interviewForm.scheduled_at).toISOString(),
      duration_minutes: Number(interviewForm.duration_minutes) || 45,
      meeting_link: interviewForm.meeting_link.trim() || null,
      status: "scheduled",
    });
    setSaving(false);
    if (error) {
      toast({ title: "Failed to schedule interview", description: error.message, variant: "destructive" });
      return;
    }
    await updateStatus(interviewCandidate, "interview");
    toast({ title: "Interview scheduled" });
    setInterviewCandidate(null);
  };

  const handleAddCandidate = async () => {
    if (!addForm.full_name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    if (!companyId) return;
    setSaving(true);
    const { error } = await supabase.from("candidates").insert({
      company_id: companyId,
      job_id: addForm.job_id || null,
      full_name: addForm.full_name.trim(),
      email: addForm.email.trim() || null,
      phone: addForm.phone.trim() || null,
      current_title: addForm.current_title.trim() || null,
      source: addForm.source.trim() || null,
      status: "applied",
    });
    setSaving(false);
    if (error) {
      toast({ title: "Failed to add candidate", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Candidate added" });
    setAddOpen(false);
    setAddForm(emptyAddForm);
    load();
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
        <Users className="h-10 w-10 text-muted-foreground" />
        <p className="text-muted-foreground">No company workspace found for your account.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Candidates</h1>
          <p className="text-gray-500">Manage candidates across all positions</p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Candidate
        </Button>
      </div>

      {jobFilter && (
        <div className="flex items-center gap-2 text-sm bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg w-fit">
          <Briefcase className="w-4 h-4" />
          Filtered by job: {jobTitleById.get(jobFilter) || jobFilter}
          <button className="underline ml-2" onClick={() => setSearchParams({})}>Clear</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Candidates</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">New Applicants</p>
                <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
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
                <p className="text-sm text-gray-500">In Screening</p>
                <p className="text-2xl font-bold text-purple-600">{stats.screening}</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <Filter className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">In Interviews</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.interviews}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-lg font-semibold text-gray-900">All Candidates</h2>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search candidates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 pl-10"
                />
              </div>
              <select
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
              >
                <option value="all">All Stages</option>
                <option value="applied">Applied</option>
                <option value="screening">Screening</option>
                <option value="interview">Interview</option>
                <option value="offer">Offer</option>
                <option value="hired">Hired</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Applied</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCandidates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  No candidates yet.
                </TableCell>
              </TableRow>
            ) : (
              filteredCandidates.map((candidate) => (
                <TableRow key={candidate.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-indigo-600">
                          {candidate.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </span>
                      </div>
                      <span className="font-medium">{candidate.full_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{candidate.job_id ? jobTitleById.get(candidate.job_id) || "—" : (candidate.current_title || "—")}</p>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-500">{new Date(candidate.created_at).toLocaleDateString()}</span>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[candidate.status] || "bg-gray-100 text-gray-700"}>
                      {statusLabel(candidate.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {candidate.rating ? (
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="ml-1">{candidate.rating}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-500">{candidate.source || "—"}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setViewCandidate(candidate)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Profile
                        </DropdownMenuItem>
                        {candidate.email && (
                          <DropdownMenuItem onClick={() => { window.location.href = `mailto:${candidate.email}`; }}>
                            <Mail className="w-4 h-4 mr-2" />
                            Send Email
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => openInterviewDialog(candidate)}>
                          <Calendar className="w-4 h-4 mr-2" />
                          Schedule Interview
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openMoveDialog(candidate)}>
                          <Briefcase className="w-4 h-4 mr-2" />
                          Move to Job
                        </DropdownMenuItem>
                        {candidate.status !== "rejected" && (
                          <DropdownMenuItem className="text-red-600" onClick={() => updateStatus(candidate, "rejected")}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Reject
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
      </div>

      {topRated.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Top Rated Candidates</h3>
            <div className="space-y-3">
              {topRated.map((candidate) => (
                <div key={candidate.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-indigo-600">
                        {candidate.full_name.split(" ").map((n) => n[0]).join("")}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{candidate.full_name}</p>
                      <p className="text-xs text-gray-500">{candidate.current_title || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="ml-1 font-medium">{candidate.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* View profile */}
      <Dialog open={!!viewCandidate} onOpenChange={(open) => !open && setViewCandidate(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{viewCandidate?.full_name}</DialogTitle>
            <DialogDescription>{viewCandidate?.current_title || "Candidate profile"}</DialogDescription>
          </DialogHeader>
          {viewCandidate && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{viewCandidate.email || "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span>{viewCandidate.phone || "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Location</span><span>{viewCandidate.location || "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Source</span><span>{viewCandidate.source || "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Applied</span><span>{new Date(viewCandidate.created_at).toLocaleDateString()}</span></div>
              {viewCandidate.skills && viewCandidate.skills.length > 0 && (
                <div className="pt-2">
                  <span className="text-muted-foreground block mb-1">Skills</span>
                  <div className="flex flex-wrap gap-1">
                    {viewCandidate.skills.map((s) => <Badge key={s} variant="outline">{s}</Badge>)}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Move to job */}
      <Dialog open={!!moveCandidate} onOpenChange={(open) => !open && setMoveCandidate(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Move {moveCandidate?.full_name} to a job</DialogTitle>
          </DialogHeader>
          <Select value={moveJobId} onValueChange={setMoveJobId}>
            <SelectTrigger><SelectValue placeholder="Select job" /></SelectTrigger>
            <SelectContent>
              {jobs.map((j) => <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>)}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMoveCandidate(null)}>Cancel</Button>
            <Button onClick={handleMove}>Move</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule interview */}
      <Dialog open={!!interviewCandidate} onOpenChange={(open) => !open && setInterviewCandidate(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule interview with {interviewCandidate?.full_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="int-date">Date & Time</Label>
              <Input id="int-date" type="datetime-local" value={interviewForm.scheduled_at} onChange={(e) => setInterviewForm({ ...interviewForm, scheduled_at: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="int-duration">Duration (minutes)</Label>
              <Input id="int-duration" type="number" value={interviewForm.duration_minutes} onChange={(e) => setInterviewForm({ ...interviewForm, duration_minutes: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="int-link">Meeting Link (optional)</Label>
              <Input id="int-link" value={interviewForm.meeting_link} onChange={(e) => setInterviewForm({ ...interviewForm, meeting_link: e.target.value })} placeholder="https://meet.google.com/..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInterviewCandidate(null)}>Cancel</Button>
            <Button onClick={handleScheduleInterview} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add candidate */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Candidate</DialogTitle>
            <DialogDescription>Manually add a candidate to your pipeline.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="add-name">Full Name</Label>
              <Input id="add-name" value={addForm.full_name} onChange={(e) => setAddForm({ ...addForm, full_name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-email">Email</Label>
                <Input id="add-email" type="email" value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-phone">Phone</Label>
                <Input id="add-phone" value={addForm.phone} onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-title">Current Title</Label>
                <Input id="add-title" value={addForm.current_title} onChange={(e) => setAddForm({ ...addForm, current_title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-source">Source</Label>
                <Input id="add-source" value={addForm.source} onChange={(e) => setAddForm({ ...addForm, source: e.target.value })} placeholder="LinkedIn, Referral..." />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Job</Label>
              <Select value={addForm.job_id} onValueChange={(v) => setAddForm({ ...addForm, job_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select job (optional)" /></SelectTrigger>
                <SelectContent>
                  {jobs.map((j) => <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAddCandidate} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add Candidate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
