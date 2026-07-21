import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Calendar,
  Clock,
  Users,
  ExternalLink,
  CheckCircle,
  XCircle,
  FileText,
  Edit,
  Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/SimpleAuthContext";
import { useCompanyId } from "@/hooks/useCompanyId";
import { useRealtimeTable } from "@/hooks/useRealtimeTable";

interface InterviewRow {
  id: string;
  title: string | null;
  job_role: string | null;
  duration_minutes: number | null;
  meeting_link: string | null;
  scheduled_at: string;
  status: string;
  candidate_id: string | null;
  job_id: string | null;
  interviewer_id: string | null;
  feedback: string | null;
  score: number | null;
}

interface CandidateOption {
  id: string;
  full_name: string;
  job_id: string | null;
}

const statusColors: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const emptyScheduleForm = { candidate_id: "", scheduled_at: "", duration_minutes: "45", meeting_link: "" };
const emptyFeedbackForm = { score: "3", feedback: "" };

export default function CompanyInterviews() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { companyId, loading: companyLoading, isDemo } = useCompanyId();

  const [interviews, setInterviews] = useState<InterviewRow[]>([]);
  const [candidates, setCandidates] = useState<CandidateOption[]>([]);
  const [jobTitles, setJobTitles] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState(emptyScheduleForm);
  const [feedbackTarget, setFeedbackTarget] = useState<InterviewRow | null>(null);
  const [feedbackForm, setFeedbackForm] = useState(emptyFeedbackForm);
  const [saving, setSaving] = useState(false);

  const candidateNameById = useMemo(() => new Map(candidates.map(c => [c.id, c.full_name])), [candidates]);

  const load = useCallback(async () => {
    if (!companyId) {
      setInterviews([]);
      setLoading(false);
      return;
    }
    setLoading(true);

    const [{ data: candidateRows }, { data: jobRows }] = await Promise.all([
      supabase.from("candidates").select("id, full_name, job_id").eq("company_id", companyId),
      supabase.from("jobs").select("id, title").eq("company_id", companyId),
    ]);

    const candidateList = (candidateRows as CandidateOption[]) || [];
    setCandidates(candidateList);
    setJobTitles(new Map((jobRows || []).map((j: { id: string; title: string }) => [j.id, j.title])));

    const candidateIds = candidateList.map(c => c.id);
    if (candidateIds.length === 0) {
      setInterviews([]);
      setLoading(false);
      return;
    }

    const { data: interviewRows } = await supabase
      .from("interviews")
      .select("*")
      .in("candidate_id", candidateIds)
      .order("scheduled_at", { ascending: false });

    setInterviews((interviewRows as InterviewRow[]) || []);
    setLoading(false);
  }, [companyId]);

  useEffect(() => {
    if (!companyLoading) load();
  }, [companyLoading, load]);

  useRealtimeTable({
    table: "interviews",
    enabled: !!companyId && !isDemo,
    onChange: () => load(),
  });

  const filteredInterviews = interviews.filter((i) => {
    const candidateName = i.candidate_id ? candidateNameById.get(i.candidate_id) || "" : "";
    const matchesSearch =
      candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (i.job_role || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || i.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const stats = {
    total: interviews.length,
    scheduled: interviews.filter((i) => i.status === "scheduled").length,
    completed: interviews.filter((i) => i.status === "completed").length,
    thisWeek: interviews.filter((i) => {
      const d = new Date(i.scheduled_at);
      return d >= now && d <= weekFromNow;
    }).length,
  };

  const upcoming = interviews
    .filter((i) => i.status === "scheduled" && new Date(i.scheduled_at) >= now)
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
    .slice(0, 3);

  const awaitingFeedback = interviews.filter((i) => i.status === "scheduled" && new Date(i.scheduled_at) < now);

  const handleSchedule = async () => {
    if (!scheduleForm.candidate_id || !scheduleForm.scheduled_at) {
      toast({ title: "Pick a candidate, date and time", variant: "destructive" });
      return;
    }
    setSaving(true);
    const candidate = candidates.find(c => c.id === scheduleForm.candidate_id);
    const { error } = await supabase.from("interviews").insert({
      candidate_id: scheduleForm.candidate_id,
      job_id: candidate?.job_id || null,
      interviewer_id: user?.id || null,
      title: candidate ? `Interview — ${candidate.full_name}` : "Interview",
      job_role: candidate?.job_id ? jobTitles.get(candidate.job_id) : null,
      scheduled_at: new Date(scheduleForm.scheduled_at).toISOString(),
      duration_minutes: Number(scheduleForm.duration_minutes) || 45,
      meeting_link: scheduleForm.meeting_link.trim() || null,
      status: "scheduled",
    });
    setSaving(false);
    if (error) {
      toast({ title: "Failed to schedule", description: error.message, variant: "destructive" });
      return;
    }
    if (candidate) {
      await supabase.from("candidates").update({ status: "interview" }).eq("id", candidate.id);
    }
    toast({ title: "Interview scheduled", description: "The candidate has been added to the schedule." });
    setScheduleOpen(false);
    setScheduleForm(emptyScheduleForm);
    load();
  };

  const handleCancel = async (interview: InterviewRow) => {
    const { error } = await supabase.from("interviews").update({ status: "cancelled" }).eq("id", interview.id);
    if (error) {
      toast({ title: "Failed to cancel", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Interview cancelled" });
    load();
  };

  const handleReschedule = async (interview: InterviewRow) => {
    const input = window.prompt("New date & time (YYYY-MM-DDTHH:mm)", interview.scheduled_at.slice(0, 16));
    if (!input) return;
    const date = new Date(input);
    if (isNaN(date.getTime())) {
      toast({ title: "Invalid date", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("interviews").update({ scheduled_at: date.toISOString() }).eq("id", interview.id);
    if (error) {
      toast({ title: "Failed to reschedule", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Interview rescheduled" });
    load();
  };

  const openFeedback = (interview: InterviewRow) => {
    setFeedbackTarget(interview);
    setFeedbackForm({ score: interview.score?.toString() || "3", feedback: interview.feedback || "" });
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackTarget) return;
    setSaving(true);
    const { error } = await supabase
      .from("interviews")
      .update({ status: "completed", score: Number(feedbackForm.score), feedback: feedbackForm.feedback.trim() || null })
      .eq("id", feedbackTarget.id);
    setSaving(false);
    if (error) {
      toast({ title: "Failed to save feedback", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Feedback saved" });
    setFeedbackTarget(null);
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
        <Calendar className="h-10 w-10 text-muted-foreground" />
        <p className="text-muted-foreground">No company workspace found for your account.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Interviews</h1>
          <p className="text-gray-500">Manage your candidate interviews</p>
        </div>
        <Button onClick={() => setScheduleOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Schedule Interview
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Total Interviews</p><p className="text-2xl font-bold text-gray-900">{stats.total}</p></div><div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center"><Users className="w-6 h-6 text-indigo-600" /></div></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Scheduled</p><p className="text-2xl font-bold text-blue-600">{stats.scheduled}</p></div><div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center"><Clock className="w-6 h-6 text-blue-600" /></div></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Completed</p><p className="text-2xl font-bold text-green-600">{stats.completed}</p></div><div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center"><CheckCircle className="w-6 h-6 text-green-600" /></div></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">This Week</p><p className="text-2xl font-bold text-purple-600">{stats.thisWeek}</p></div><div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center"><Calendar className="w-6 h-6 text-purple-600" /></div></div></CardContent></Card>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-lg font-semibold text-gray-900">All Interviews</h2>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Search interviews..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-64 pl-10" />
              </div>
              <select className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Score</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInterviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  No interviews scheduled yet.
                </TableCell>
              </TableRow>
            ) : (
              filteredInterviews.map((interview) => (
                <TableRow key={interview.id}>
                  <TableCell>
                    <span className="font-medium">{interview.candidate_id ? candidateNameById.get(interview.candidate_id) || "Unknown" : "Unknown"}</span>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{interview.job_role || "—"}</p>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p className="font-medium">{new Date(interview.scheduled_at).toLocaleDateString()}</p>
                      <p className="text-gray-500 flex items-center"><Clock className="w-3 h-3 mr-1" />{new Date(interview.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[interview.status] || "bg-gray-100 text-gray-700"}>
                      {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{interview.score ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreVertical className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {interview.meeting_link && (
                          <DropdownMenuItem onClick={() => window.open(interview.meeting_link!, "_blank", "noopener")}>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Join Meeting
                          </DropdownMenuItem>
                        )}
                        {interview.status !== "cancelled" && (
                          <DropdownMenuItem onClick={() => openFeedback(interview)}>
                            <FileText className="w-4 h-4 mr-2" />
                            {interview.status === "completed" ? "Edit Feedback" : "Submit Feedback"}
                          </DropdownMenuItem>
                        )}
                        {interview.status === "scheduled" && (
                          <>
                            <DropdownMenuItem onClick={() => handleReschedule(interview)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Reschedule
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => handleCancel(interview)}>
                              <XCircle className="w-4 h-4 mr-2" />
                              Cancel
                            </DropdownMenuItem>
                          </>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Upcoming Interviews</h3>
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing on the schedule.</p>
            ) : (
              <div className="space-y-3">
                {upcoming.map((interview) => (
                  <div key={interview.id} className="p-4 border border-blue-100 bg-blue-50/50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{interview.candidate_id ? candidateNameById.get(interview.candidate_id) : "Unknown"}</p>
                        <p className="text-sm text-gray-500">{interview.job_role || "—"}</p>
                      </div>
                    </div>
                    <div className="flex items-center mt-2 text-sm text-gray-500 space-x-4">
                      <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" />{new Date(interview.scheduled_at).toLocaleDateString()}</span>
                      <span className="flex items-center"><Clock className="w-4 h-4 mr-1" />{interview.duration_minutes || 45} min</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Awaiting Feedback</h3>
            {awaitingFeedback.length === 0 ? (
              <p className="text-sm text-muted-foreground">All caught up.</p>
            ) : (
              <div className="space-y-3">
                {awaitingFeedback.map((interview) => (
                  <div key={interview.id} className="p-4 border border-amber-100 bg-amber-50/50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{interview.candidate_id ? candidateNameById.get(interview.candidate_id) : "Unknown"}</p>
                        <p className="text-sm text-gray-500">{interview.job_role || "—"} · {new Date(interview.scheduled_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Button size="sm" className="mt-3" onClick={() => openFeedback(interview)}>
                      <FileText className="w-4 h-4 mr-2" />
                      Submit Feedback
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Schedule dialog */}
      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Schedule New Interview</DialogTitle>
            <DialogDescription>Set up a new interview with a candidate.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Candidate</Label>
              <Select value={scheduleForm.candidate_id} onValueChange={(v) => setScheduleForm({ ...scheduleForm, candidate_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select candidate" /></SelectTrigger>
                <SelectContent>
                  {candidates.map((c) => <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sched-date">Date & Time</Label>
              <Input id="sched-date" type="datetime-local" value={scheduleForm.scheduled_at} onChange={(e) => setScheduleForm({ ...scheduleForm, scheduled_at: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sched-duration">Duration (min)</Label>
                <Input id="sched-duration" type="number" value={scheduleForm.duration_minutes} onChange={(e) => setScheduleForm({ ...scheduleForm, duration_minutes: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sched-link">Meeting Link</Label>
                <Input id="sched-link" value={scheduleForm.meeting_link} onChange={(e) => setScheduleForm({ ...scheduleForm, meeting_link: e.target.value })} placeholder="https://..." />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleOpen(false)}>Cancel</Button>
            <Button onClick={handleSchedule} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirm Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Feedback dialog */}
      <Dialog open={!!feedbackTarget} onOpenChange={(open) => !open && setFeedbackTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Interview Feedback</DialogTitle>
            <DialogDescription>{feedbackTarget?.candidate_id ? candidateNameById.get(feedbackTarget.candidate_id) : ""}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fb-score">Score (1-5)</Label>
              <Input id="fb-score" type="number" min={1} max={5} value={feedbackForm.score} onChange={(e) => setFeedbackForm({ ...feedbackForm, score: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fb-notes">Feedback</Label>
              <Textarea id="fb-notes" rows={4} value={feedbackForm.feedback} onChange={(e) => setFeedbackForm({ ...feedbackForm, feedback: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeedbackTarget(null)}>Cancel</Button>
            <Button onClick={handleSubmitFeedback} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
