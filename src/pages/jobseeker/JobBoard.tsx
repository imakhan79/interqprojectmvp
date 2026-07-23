import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/SimpleAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Building2, MapPin, Briefcase, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";

interface JobRow {
  id: string;
  title: string;
  department: string | null;
  location: string | null;
  employment_type: string | null;
  description: string | null;
  company_id: string;
  companies: { name: string; industry: string | null } | null;
}

export default function JobBoard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("jobs")
        .select("id, title, department, location, employment_type, description, company_id, companies(name, industry, status)")
        .eq("status", "open")
        .order("created_at", { ascending: false });

      const openJobs = ((data as any[]) || []).filter(
        (j) => !j.companies || j.companies.status === "active" || j.companies.status == null
      );
      setJobs(openJobs);

      if (user?.id) {
        const { data: applied } = await supabase
          .from("candidates")
          .select("job_id")
          .eq("user_id", user.id);
        setAppliedJobIds(new Set((applied || []).map((a: { job_id: string | null }) => a.job_id).filter(Boolean) as string[]));
      }

      setLoading(false);
    };
    load();
  }, [user?.id]);

  const filtered = jobs.filter((j) => {
    const term = searchTerm.toLowerCase();
    return (
      !term ||
      j.title.toLowerCase().includes(term) ||
      (j.location || "").toLowerCase().includes(term) ||
      (j.companies?.name || "").toLowerCase().includes(term)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Browse Jobs</h1>
        <p className="text-muted-foreground">Find and apply to open roles from verified companies</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by title, company, or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Briefcase className="h-12 w-12 mx-auto text-muted-foreground opacity-30 mb-4" />
          <p className="text-muted-foreground">No open jobs match your search right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((job) => {
            const applied = appliedJobIds.has(job.id);
            return (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    {job.employment_type && (
                      <Badge variant="secondary" className="text-[10px]">{job.employment_type}</Badge>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold leading-tight">{job.title}</h3>
                    <p className="text-sm text-muted-foreground">{job.companies?.name || "Company"}</p>
                  </div>
                  {job.location && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {job.location}
                    </p>
                  )}
                  <Button
                    size="sm"
                    variant={applied ? "outline" : "default"}
                    className="w-full"
                    onClick={() => navigate(`/jobseeker/jobs/${job.id}`)}
                  >
                    {applied ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Applied — View
                      </>
                    ) : (
                      <>
                        View & Apply <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
