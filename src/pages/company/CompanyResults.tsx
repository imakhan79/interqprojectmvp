import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, Users, Award, Download, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useCompanyId } from "@/hooks/useCompanyId";
import { normalizeResult, NormalizedResult } from "@/lib/assessmentResults";

interface CompanyResultRow extends NormalizedResult {
  candidateName: string;
  jobTitle: string | null;
}

export default function CompanyResults() {
  const { companyId, loading: companyLoading } = useCompanyId();

  const { data: results = [], isLoading, isError } = useQuery({
    queryKey: ["company-results", companyId],
    enabled: !!companyId,
    queryFn: async (): Promise<CompanyResultRow[]> => {
      const [{ data: candidates, error: candidatesError }, { data: jobs }] = await Promise.all([
        supabase.from("candidates").select("id, full_name, job_id, user_id").eq("company_id", companyId!),
        supabase.from("jobs").select("id, title").eq("company_id", companyId!),
      ]);
      if (candidatesError) throw candidatesError;

      // Results are keyed by the candidate's auth user, so only candidates with an account can have scores.
      const byUser = new Map<string, { full_name: string; job_id: string | null }>();
      (candidates ?? []).forEach((c: any) => c.user_id && byUser.set(c.user_id, c));
      if (byUser.size === 0) return [];

      const { data, error } = await supabase
        .from("assessment_results")
        .select("*")
        .in("user_id", [...byUser.keys()])
        .order("completed_at", { ascending: false });
      if (error) throw error;

      const jobTitles = new Map((jobs ?? []).map((j: any) => [j.id, j.title]));
      return (data ?? []).map((row) => {
        const r = normalizeResult(row);
        const candidate = byUser.get(r.userId);
        return {
          ...r,
          candidateName: candidate?.full_name || "Candidate",
          jobTitle: (candidate?.job_id && jobTitles.get(candidate.job_id)) || null,
        };
      });
    },
  });

  const stats = useMemo(() => {
    if (!results.length) return { avg: 0, passRate: 0 };
    const avg = Math.round(results.reduce((s, r) => s + r.percent, 0) / results.length);
    const passRate = Math.round((results.filter((r) => r.passed).length / results.length) * 100);
    return { avg, passRate };
  }, [results]);

  const exportCSV = () => {
    const header = "Candidate,Job,Assessment,Score,Passed,Completed\n";
    const rows = results
      .map((r) => [r.candidateName, r.jobTitle ?? "", r.title, `${r.percent}%`, r.passed, r.completedAt ?? ""]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([header + rows], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "company-test-results.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const loading = companyLoading || (isLoading && !!companyId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading">Results & Reports</h1>
          <p className="text-sm text-muted-foreground">View candidate scores and export reports</p>
        </div>
        <Button variant="outline" onClick={exportCSV} disabled={!results.length}>
          <Download className="h-4 w-4 mr-2" /> Export All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-indigo-500 to-blue-600 text-white border-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Award className="h-8 w-8 opacity-80" />
              <Badge variant="secondary" className="bg-white/20 text-white border-none">Avg Score</Badge>
            </div>
            <p className="text-3xl font-bold">{results.length ? `${stats.avg}%` : "—"}</p>
            <p className="text-sm opacity-80 mt-1">Across all completed tests</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Tests Completed</p>
              <p className="text-2xl font-bold">{results.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Pass Rate</p>
              <p className="text-2xl font-bold">{results.length ? `${stats.passRate}%` : "—"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
          <CardDescription>Scores from candidates who applied to your jobs</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : isError ? (
            <p className="text-sm text-destructive text-center py-6">Couldn't load results. Please try again.</p>
          ) : !results.length ? (
            <p className="text-sm text-muted-foreground text-center py-6">No candidates have completed a test yet.</p>
          ) : (
            <div className="space-y-4">
              {results.map((r) => (
                <div key={r.id} className="flex items-center gap-4 p-4 border rounded-xl">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    {r.candidateName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="font-semibold text-sm truncate">{r.candidateName}</p>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {r.completedAt ? new Date(r.completedAt).toLocaleDateString() : "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                      <p className="text-xs text-muted-foreground truncate">{r.title}</p>
                      {r.jobTitle && (
                        <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded uppercase font-bold tracking-wider truncate">{r.jobTitle}</span>
                      )}
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <Progress value={r.percent} className="h-1.5 flex-1" />
                      <span className={`text-sm font-bold ${r.percent > 80 ? "text-green-600" : r.percent > 60 ? "text-amber-600" : "text-red-600"}`}>
                        {r.percent}%
                      </span>
                      <Badge variant={r.passed ? "default" : "destructive"} className="text-[10px]">
                        {r.passed ? "Pass" : "Fail"}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
