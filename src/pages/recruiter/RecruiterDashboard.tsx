import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Briefcase, Users, CheckCircle, Clock, ClipboardList, Plus, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCompanyId } from "@/hooks/useCompanyId";

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: "blue" | "green" | "purple" | "orange" | "emerald";
  path: string;
}

const colorClasses: Record<StatCardProps["color"], { text: string; bg: string }> = {
  blue: { text: "text-blue-600", bg: "bg-blue-500/10" },
  green: { text: "text-green-600", bg: "bg-green-500/10" },
  purple: { text: "text-purple-600", bg: "bg-purple-500/10" },
  orange: { text: "text-orange-600", bg: "bg-orange-500/10" },
  emerald: { text: "text-emerald-600", bg: "bg-emerald-500/10" },
};

function StatCard({ title, value, icon, color, path, navigate }: StatCardProps & { navigate: (p: string) => void }) {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(path)}>
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color].bg}`}>{icon}</div>
      </CardContent>
    </Card>
  );
}

interface Stats {
  activeJobs: number;
  totalCandidates: number;
  awaitingReview: number;
  interviewsScheduled: number;
  offersSent: number;
  hired: number;
}

export default function RecruiterDashboard() {
  const navigate = useNavigate();
  const { companyId, loading: companyLoading } = useCompanyId();
  const [stats, setStats] = useState<Stats>({ activeJobs: 0, totalCandidates: 0, awaitingReview: 0, interviewsScheduled: 0, offersSent: 0, hired: 0 });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!companyId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const [{ data: jobs }, { data: candidates }, { data: offers }] = await Promise.all([
      supabase.from("jobs").select("status").eq("company_id", companyId),
      supabase.from("candidates").select("status").eq("company_id", companyId),
      supabase.from("job_offers").select("status").eq("company_id", companyId),
    ]);

    setStats({
      activeJobs: (jobs || []).filter(j => j.status === "open").length,
      totalCandidates: (candidates || []).length,
      awaitingReview: (candidates || []).filter(c => c.status === "applied" || c.status === "screening").length,
      interviewsScheduled: (candidates || []).filter(c => c.status === "interview").length,
      offersSent: (offers || []).filter(o => o.status === "sent").length,
      hired: (candidates || []).filter(c => c.status === "hired").length,
    });
    setLoading(false);
  }, [companyId]);

  useEffect(() => {
    if (!companyLoading) load();
  }, [companyLoading, load]);

  if (companyLoading || loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!companyId) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">No company workspace found for your account.</div>;
  }

  const statCards: (StatCardProps)[] = [
    { title: "Active Jobs", value: stats.activeJobs, icon: <Briefcase className="h-8 w-8 text-blue-600" />, color: "blue", path: "/recruiter/jobs" },
    { title: "Total Candidates", value: stats.totalCandidates, icon: <Users className="h-8 w-8 text-green-600" />, color: "green", path: "/recruiter/candidates" },
    { title: "Awaiting Review", value: stats.awaitingReview, icon: <ClipboardList className="h-8 w-8 text-purple-600" />, color: "purple", path: "/recruiter/pipeline" },
    { title: "Interviews Scheduled", value: stats.interviewsScheduled, icon: <Clock className="h-8 w-8 text-orange-600" />, color: "orange", path: "/recruiter/interviews" },
    { title: "Offers Sent", value: stats.offersSent, icon: <CheckCircle className="h-8 w-8 text-emerald-600" />, color: "emerald", path: "/recruiter/offers" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recruiter Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your hiring pipeline and candidates</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Button onClick={() => navigate("/recruiter/jobs")} className="gap-2">
            <Plus className="h-4 w-4" /> New Job
          </Button>
          <Button variant="outline" onClick={() => navigate("/recruiter/pipeline")} className="gap-2">
            View Pipeline <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} navigate={navigate} />
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">
            {stats.hired} hired so far · {stats.totalCandidates - stats.hired} candidates still in progress
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
