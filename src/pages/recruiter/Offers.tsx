import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, Calendar, Plus, Send, Loader2, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/SimpleAuthContext";
import { useCompanyId } from "@/hooks/useCompanyId";
import { useRealtimeTable } from "@/hooks/useRealtimeTable";

interface OfferRow {
  id: string;
  candidate_id: string | null;
  job_id: string | null;
  position: string | null;
  salary: string | null;
  equity: string | null;
  bonus: string | null;
  start_date: string | null;
  notes: string | null;
  status: string;
  created_at: string;
}

interface CandidateOption { id: string; full_name: string; job_id: string | null }
interface JobOption { id: string; title: string }

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-blue-100 text-blue-700",
  accepted: "bg-green-100 text-green-700",
  declined: "bg-red-100 text-red-700",
};

const emptyForm = { candidate_id: "", job_id: "", salary: "", equity: "", bonus: "", start_date: "", notes: "" };

export default function RecruiterOffers() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { companyId, loading: companyLoading, isDemo } = useCompanyId();

  const [offers, setOffers] = useState<OfferRow[]>([]);
  const [candidates, setCandidates] = useState<CandidateOption[]>([]);
  const [jobs, setJobs] = useState<JobOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const candidateName = useMemo(() => new Map(candidates.map(c => [c.id, c.full_name])), [candidates]);
  const jobTitle = useMemo(() => new Map(jobs.map(j => [j.id, j.title])), [jobs]);

  const load = useCallback(async () => {
    if (!companyId) {
      setOffers([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const [{ data: offerRows }, { data: candidateRows }, { data: jobRows }] = await Promise.all([
      supabase.from("job_offers").select("*").eq("company_id", companyId).order("created_at", { ascending: false }),
      supabase.from("candidates").select("id, full_name, job_id").eq("company_id", companyId),
      supabase.from("jobs").select("id, title").eq("company_id", companyId),
    ]);
    setOffers((offerRows as OfferRow[]) || []);
    setCandidates((candidateRows as CandidateOption[]) || []);
    setJobs((jobRows as JobOption[]) || []);
    setLoading(false);
  }, [companyId]);

  useEffect(() => {
    if (!companyLoading) load();
  }, [companyLoading, load]);

  useRealtimeTable({
    table: "job_offers",
    filter: companyId ? `company_id=eq.${companyId}` : undefined,
    enabled: !!companyId && !isDemo,
    onChange: () => load(),
  });

  const stats = {
    total: offers.length,
    sent: offers.filter(o => o.status === "sent").length,
    accepted: offers.filter(o => o.status === "accepted").length,
    declined: offers.filter(o => o.status === "declined").length,
  };

  const handleCreate = async () => {
    if (!form.candidate_id || !companyId) {
      toast({ title: "Select a candidate", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("job_offers").insert({
      company_id: companyId,
      candidate_id: form.candidate_id,
      job_id: form.job_id || null,
      position: form.job_id ? jobTitle.get(form.job_id) : null,
      salary: form.salary || null,
      equity: form.equity || null,
      bonus: form.bonus || null,
      start_date: form.start_date || null,
      notes: form.notes || null,
      created_by: user?.id || null,
      status: "draft",
    });
    setSaving(false);
    if (error) {
      toast({ title: "Failed to create offer", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Offer created as draft" });
    setDialogOpen(false);
    setForm(emptyForm);
    load();
  };

  const handleSend = async (offer: OfferRow) => {
    const { error } = await supabase.from("job_offers").update({ status: "sent", sent_at: new Date().toISOString() }).eq("id", offer.id);
    if (error) {
      toast({ title: "Failed to send offer", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Offer sent to candidate" });
    load();
  };

  if (companyLoading || loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!companyId) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">No company workspace found for your account.</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Job Offers</h2>
          <p className="text-gray-600">Track and manage candidate offers</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Offer
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card><CardContent className="p-6"><div className="text-3xl font-bold text-emerald-600">{stats.accepted}</div><p className="text-sm text-muted-foreground mt-1">Accepted</p></CardContent></Card>
        <Card><CardContent className="p-6"><div className="text-3xl font-bold text-destructive">{stats.declined}</div><p className="text-sm text-muted-foreground mt-1">Declined</p></CardContent></Card>
        <Card><CardContent className="p-6"><div className="text-3xl font-bold text-blue-600">{stats.sent}</div><p className="text-sm text-muted-foreground mt-1">Awaiting Response</p></CardContent></Card>
        <Card><CardContent className="p-6"><div className="text-3xl font-bold text-muted-foreground">{stats.total}</div><p className="text-sm text-muted-foreground mt-1">Total Offers</p></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offers.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No offers yet. Create your first one!</TableCell></TableRow>
              ) : (
                offers.map((offer) => (
                  <TableRow key={offer.id}>
                    <TableCell className="font-medium">{offer.candidate_id ? candidateName.get(offer.candidate_id) || "Unknown" : "Unknown"}</TableCell>
                    <TableCell>{offer.position || "—"}</TableCell>
                    <TableCell className="font-mono">{offer.salary || "—"}</TableCell>
                    <TableCell>{offer.start_date ? new Date(offer.start_date).toLocaleDateString() : "—"}</TableCell>
                    <TableCell><Badge className={statusColors[offer.status] || "bg-gray-100 text-gray-700"}>{offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}</Badge></TableCell>
                    <TableCell className="text-right">
                      {offer.status === "draft" && (
                        <Button variant="ghost" size="sm" onClick={() => handleSend(offer)}>
                          <Send className="h-4 w-4 mr-1" /> Send
                        </Button>
                      )}
                      {offer.status === "accepted" && <CheckCircle className="h-4 w-4 text-green-600 inline" />}
                      {offer.status === "declined" && <XCircle className="h-4 w-4 text-red-600 inline" />}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Offer</DialogTitle>
            <DialogDescription>Offers are created as drafts — send when ready.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Candidate</Label>
                <Select value={form.candidate_id} onValueChange={(v) => setForm({ ...form, candidate_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select candidate" /></SelectTrigger>
                  <SelectContent>{candidates.map(c => <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Job</Label>
                <Select value={form.job_id} onValueChange={(v) => setForm({ ...form, job_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select job (optional)" /></SelectTrigger>
                  <SelectContent>{jobs.map(j => <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="flex items-center gap-1"><DollarSign className="w-3 h-3" />Salary</Label>
                <Input value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} placeholder="$80,000 - $100,000" />
              </div>
              <div>
                <Label>Equity</Label>
                <Input value={form.equity} onChange={(e) => setForm({ ...form, equity: e.target.value })} placeholder="0.5%" />
              </div>
              <div>
                <Label>Bonus</Label>
                <Input value={form.bonus} onChange={(e) => setForm({ ...form, bonus: e.target.value })} placeholder="$10,000" />
              </div>
            </div>
            <div>
              <Label className="flex items-center gap-1"><Calendar className="w-3 h-3" />Start Date</Label>
              <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            </div>
            <div>
              <Label>Internal Notes</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} placeholder="Offer negotiation notes..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Offer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
