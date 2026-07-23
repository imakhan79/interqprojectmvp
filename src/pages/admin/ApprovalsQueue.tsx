import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { notifyCompany, notifyUser } from "@/lib/notifications";
import { Building2, Briefcase, CheckCircle2, XCircle, Loader2, Clock } from "lucide-react";

interface PendingCompany {
  id: string;
  name: string;
  email: string | null;
  industry: string | null;
  company_size: string | null;
  location: string | null;
  created_at: string;
}

interface PendingJob {
  id: string;
  title: string;
  department: string | null;
  location: string | null;
  company_id: string;
  created_by: string | null;
  created_at: string;
  companies: { name: string } | null;
}

export default function ApprovalsQueue() {
  const { toast } = useToast();
  const [companies, setCompanies] = useState<PendingCompany[]>([]);
  const [jobs, setJobs] = useState<PendingJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectTarget, setRejectTarget] = useState<{ kind: "company" | "job"; id: string; label: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: companyRows }, { data: jobRows }] = await Promise.all([
      supabase.from("companies").select("id, name, email, industry, company_size, location, created_at").eq("status", "pending_approval").order("created_at", { ascending: false }),
      supabase.from("jobs").select("id, title, department, location, company_id, created_by, created_at, companies(name)").eq("status", "pending_approval").order("created_at", { ascending: false }),
    ]);
    setCompanies((companyRows as PendingCompany[]) || []);
    setJobs((jobRows as any[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const approveCompany = async (company: PendingCompany) => {
    setBusyId(company.id);
    const { error } = await supabase.from("companies").update({ status: "active" }).eq("id", company.id);
    setBusyId(null);
    if (error) {
      toast({ title: "Failed to approve", description: error.message, variant: "destructive" });
      return;
    }
    await notifyCompany(company.id, {
      type: "company.approved",
      title: "Your company is approved",
      message: `${company.name} is now live on InterQ.`,
      link: "/company",
    });
    toast({ title: "Company approved" });
    load();
  };

  const approveJob = async (job: PendingJob) => {
    setBusyId(job.id);
    const { error } = await supabase.from("jobs").update({ status: "open" }).eq("id", job.id);
    setBusyId(null);
    if (error) {
      toast({ title: "Failed to approve", description: error.message, variant: "destructive" });
      return;
    }
    if (job.created_by) {
      await notifyUser(job.created_by, {
        type: "job.approved",
        title: "Job approved",
        message: `${job.title} is now live for candidates to apply.`,
        link: "/company/jobs",
      });
    } else {
      await notifyCompany(job.company_id, {
        type: "job.approved",
        title: "Job approved",
        message: `${job.title} is now live for candidates to apply.`,
        link: "/company/jobs",
      });
    }
    toast({ title: "Job approved" });
    load();
  };

  const openReject = (kind: "company" | "job", id: string, label: string) => {
    setRejectTarget({ kind, id, label });
    setRejectReason("");
  };

  const confirmReject = async () => {
    if (!rejectTarget) return;
    setBusyId(rejectTarget.id);

    if (rejectTarget.kind === "company") {
      const { error } = await supabase.from("companies").update({ status: "rejected", rejection_reason: rejectReason.trim() || null }).eq("id", rejectTarget.id);
      setBusyId(null);
      if (error) {
        toast({ title: "Failed to reject", description: error.message, variant: "destructive" });
        return;
      }
      await notifyCompany(rejectTarget.id, {
        type: "company.rejected",
        title: "Company application rejected",
        message: rejectReason.trim() || "Please contact support for details.",
      });
    } else {
      const job = jobs.find((j) => j.id === rejectTarget.id);
      const { error } = await supabase.from("jobs").update({ status: "rejected", rejection_reason: rejectReason.trim() || null }).eq("id", rejectTarget.id);
      setBusyId(null);
      if (error) {
        toast({ title: "Failed to reject", description: error.message, variant: "destructive" });
        return;
      }
      if (job) {
        if (job.created_by) {
          await notifyUser(job.created_by, { type: "job.rejected", title: "Job rejected", message: rejectReason.trim() || "Please review and resubmit.", link: "/company/jobs" });
        } else {
          await notifyCompany(job.company_id, { type: "job.rejected", title: "Job rejected", message: rejectReason.trim() || "Please review and resubmit.", link: "/company/jobs" });
        }
      }
    }

    toast({ title: "Rejected" });
    setRejectTarget(null);
    load();
  };

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
        <h1 className="text-2xl font-bold">Approvals Queue</h1>
        <p className="text-muted-foreground">Review new companies and job postings before they go live</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="w-5 h-5" /> Pending Companies
            <Badge variant="secondary">{companies.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {companies.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No companies awaiting approval.</p>
          ) : (
            companies.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.email || "—"} · {c.industry || "—"} · {c.company_size || "—"} · {c.location || "—"}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" /> Applied {new Date(c.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="text-red-600" onClick={() => openReject("company", c.id, c.name)} disabled={busyId === c.id}>
                    <XCircle className="w-4 h-4 mr-1" /> Reject
                  </Button>
                  <Button size="sm" onClick={() => approveCompany(c)} disabled={busyId === c.id}>
                    {busyId === c.id ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-1" />}
                    Approve
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Briefcase className="w-5 h-5" /> Pending Jobs
            <Badge variant="secondary">{jobs.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {jobs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No jobs awaiting approval.</p>
          ) : (
            jobs.map((j) => (
              <div key={j.id} className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <p className="font-medium">{j.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {j.companies?.name || "—"} · {j.department || "—"} · {j.location || "—"}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" /> Submitted {new Date(j.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="text-red-600" onClick={() => openReject("job", j.id, j.title)} disabled={busyId === j.id}>
                    <XCircle className="w-4 h-4 mr-1" /> Reject
                  </Button>
                  <Button size="sm" onClick={() => approveJob(j)} disabled={busyId === j.id}>
                    {busyId === j.id ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-1" />}
                    Approve
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={!!rejectTarget} onOpenChange={(open) => !open && setRejectTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject {rejectTarget?.label}</DialogTitle>
            <DialogDescription>This reason will be shared with the applicant.</DialogDescription>
          </DialogHeader>
          <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Reason for rejection..." rows={4} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmReject} disabled={busyId === rejectTarget?.id}>
              {busyId === rejectTarget?.id && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirm Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
