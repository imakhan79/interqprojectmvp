import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Star, User, Briefcase, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCompanyId } from "@/hooks/useCompanyId";
import { useRealtimeTable } from "@/hooks/useRealtimeTable";

interface CandidateRow {
  id: string;
  job_id: string | null;
  full_name: string;
  status: string;
  rating: number | null;
  created_at: string;
}

interface JobOption { id: string; title: string }

// Matches the real candidates.status vocabulary used across the Company Portal
// (see CompanyCandidates.tsx) rather than the old mock's 10-stage model, since
// recruiters and company admins work the same candidate rows.
const stages = [
  { id: "applied", name: "Applied", card: "bg-blue-50 border-blue-200", badge: "bg-blue-100 text-blue-700" },
  { id: "screening", name: "Screening", card: "bg-indigo-50 border-indigo-200", badge: "bg-indigo-100 text-indigo-700" },
  { id: "interview", name: "Interview", card: "bg-orange-50 border-orange-200", badge: "bg-orange-100 text-orange-700" },
  { id: "offer", name: "Offer", card: "bg-emerald-50 border-emerald-200", badge: "bg-emerald-100 text-emerald-700" },
  { id: "hired", name: "Hired", card: "bg-green-50 border-green-200", badge: "bg-green-100 text-green-700" },
  { id: "rejected", name: "Rejected", card: "bg-red-50 border-red-200", badge: "bg-red-100 text-red-700" },
];

export default function Pipeline() {
  const { toast } = useToast();
  const { companyId, loading: companyLoading, isDemo } = useCompanyId();

  const [candidates, setCandidates] = useState<CandidateRow[]>([]);
  const [jobs, setJobs] = useState<JobOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJob, setSelectedJob] = useState("all");

  const jobTitle = useMemo(() => new Map(jobs.map(j => [j.id, j.title])), [jobs]);

  const load = useCallback(async () => {
    if (!companyId) {
      setCandidates([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const [{ data: candidateRows }, { data: jobRows }] = await Promise.all([
      supabase.from("candidates").select("id, job_id, full_name, status, rating, created_at").eq("company_id", companyId).order("created_at", { ascending: false }),
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

  const filtered = candidates.filter((c) => {
    const matchesSearch = c.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesJob = selectedJob === "all" || c.job_id === selectedJob;
    return matchesSearch && matchesJob;
  });

  const byStage = (stageId: string) => filtered.filter((c) => c.status === stageId);

  const moveStage = async (candidate: CandidateRow, newStatus: string) => {
    const { error } = await supabase.from("candidates").update({ status: newStatus }).eq("id", candidate.id);
    if (error) {
      toast({ title: "Failed to update stage", description: error.message, variant: "destructive" });
      return;
    }
    load();
  };

  if (companyLoading || loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!companyId) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">No company workspace found for your account.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Candidate Pipeline</h1>
        <p className="text-gray-500">Track and manage candidates through hiring stages</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search candidates..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Select value={selectedJob} onValueChange={setSelectedJob}>
          <SelectTrigger className="w-[220px]"><SelectValue placeholder="All Jobs" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Jobs</SelectItem>
            {jobs.map(j => <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto">
        {stages.map((stage) => {
          const stageCandidates = byStage(stage.id);
          return (
            <Card key={stage.id} className={`min-w-[220px] ${stage.card}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  {stage.name}
                  <Badge variant="secondary">{stageCandidates.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {stageCandidates.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No candidates</p>
                  </div>
                ) : (
                  stageCandidates.map((c) => (
                    <div key={c.id} className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-indigo-600">
                              {c.full_name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{c.full_name}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Briefcase className="w-3 h-3" />
                              {c.job_id ? jobTitle.get(c.job_id) || "—" : "—"}
                            </p>
                          </div>
                        </div>
                        {c.rating && (
                          <div className="flex items-center">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            <span className="text-xs ml-1">{c.rating}</span>
                          </div>
                        )}
                      </div>
                      <Select value={c.status} onValueChange={(v) => moveStage(c, v)}>
                        <SelectTrigger className={`h-7 text-xs ${stage.badge}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {stages.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
