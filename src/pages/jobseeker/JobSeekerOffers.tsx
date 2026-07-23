import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Briefcase, Building2, Calendar, DollarSign, Loader2, CheckCircle, XCircle, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/SimpleAuthContext";
import { useRealtimeTable } from "@/hooks/useRealtimeTable";
import { notifyCompany } from "@/lib/notifications";

interface OfferRow {
  id: string;
  company_id: string | null;
  job_id: string | null;
  position: string | null;
  salary: string | null;
  equity: string | null;
  bonus: string | null;
  start_date: string | null;
  notes: string | null;
  status: string;
  sent_at: string | null;
  response_at: string | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-blue-100 text-blue-700",
  accepted: "bg-green-100 text-green-700",
  declined: "bg-red-100 text-red-700",
};

export default function JobSeekerOffers() {
  const { toast } = useToast();
  const { user } = useAuth();
  const isRealUser = !!user && !user.isDemo;

  const [offers, setOffers] = useState<OfferRow[]>([]);
  const [companyNames, setCompanyNames] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [declineTarget, setDeclineTarget] = useState<OfferRow | null>(null);
  const [declineNote, setDeclineNote] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!isRealUser || !user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data: candidateRows } = await supabase.from("candidates").select("id").eq("user_id", user.id);
    const candidateIds = (candidateRows || []).map((c: { id: string }) => c.id);

    if (candidateIds.length === 0) {
      setOffers([]);
      setLoading(false);
      return;
    }

    const { data: offerRows } = await supabase
      .from("job_offers")
      .select("*")
      .in("candidate_id", candidateIds)
      .in("status", ["sent", "accepted", "declined"])
      .order("created_at", { ascending: false });

    const rows = (offerRows as OfferRow[]) || [];
    setOffers(rows);

    const companyIds = [...new Set(rows.map(r => r.company_id).filter(Boolean))] as string[];
    if (companyIds.length > 0) {
      const { data: companies } = await supabase.from("companies").select("id, name").in("id", companyIds);
      setCompanyNames(new Map((companies || []).map((c: { id: string; name: string }) => [c.id, c.name])));
    }
    setLoading(false);
  }, [isRealUser, user]);

  useEffect(() => {
    load();
  }, [load]);

  useRealtimeTable({
    table: "job_offers",
    enabled: isRealUser,
    onChange: () => load(),
  });

  const handleAccept = async (offer: OfferRow) => {
    setSaving(true);
    const { error } = await supabase
      .from("job_offers")
      .update({ status: "accepted", response_at: new Date().toISOString() })
      .eq("id", offer.id);
    setSaving(false);
    if (error) {
      toast({ title: "Failed to accept offer", description: error.message, variant: "destructive" });
      return;
    }
    if (offer.company_id) {
      await notifyCompany(offer.company_id, {
        type: "offer.accepted",
        title: "Offer accepted!",
        message: `${offer.position || "A candidate"} accepted the offer — time to mark them hired.`,
        link: "/company/candidates",
      });
    }
    toast({ title: "Offer accepted", description: "Congratulations! The company has been notified." });
    load();
  };

  const handleDecline = async () => {
    if (!declineTarget) return;
    setSaving(true);
    const notes = declineNote.trim()
      ? `${declineTarget.notes ? declineTarget.notes + "\n\n" : ""}Candidate's reason for declining: ${declineNote.trim()}`
      : declineTarget.notes;
    const { error } = await supabase
      .from("job_offers")
      .update({ status: "declined", response_at: new Date().toISOString(), notes })
      .eq("id", declineTarget.id);
    setSaving(false);
    if (error) {
      toast({ title: "Failed to decline offer", description: error.message, variant: "destructive" });
      return;
    }
    if (declineTarget.company_id) {
      await notifyCompany(declineTarget.company_id, {
        type: "offer.declined",
        title: "Offer declined",
        message: `${declineTarget.position || "A candidate"} declined the offer.`,
        link: "/company/candidates",
      });
    }
    toast({ title: "Offer declined" });
    setDeclineTarget(null);
    setDeclineNote("");
    load();
  };

  if (!isRealUser) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center gap-3">
        <FileText className="h-10 w-10 text-muted-foreground" />
        <p className="text-muted-foreground">Offers aren't available in demo mode.</p>
      </div>
    );
  }

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
        <h1 className="text-2xl font-bold text-gray-900">Offers</h1>
        <p className="text-gray-500">Review and respond to offers you've received</p>
      </div>

      {offers.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            <Briefcase className="h-10 w-10 mx-auto mb-3 opacity-40" />
            No offers yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {offers.map((offer) => (
            <Card key={offer.id}>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">{offer.position || "Offer"}</h2>
                    <p className="text-muted-foreground flex items-center gap-1 text-sm mt-1">
                      <Building2 className="h-4 w-4" />
                      {offer.company_id ? companyNames.get(offer.company_id) || "Company" : "Company"}
                    </p>
                  </div>
                  <Badge className={statusColors[offer.status] || "bg-gray-100 text-gray-700"}>
                    {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                  {offer.salary && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>{offer.salary}</span>
                    </div>
                  )}
                  {offer.start_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Starts {new Date(offer.start_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  {offer.equity && (
                    <div className="text-muted-foreground">Equity: {offer.equity}</div>
                  )}
                  {offer.bonus && (
                    <div className="text-muted-foreground">Bonus: {offer.bonus}</div>
                  )}
                </div>

                {offer.notes && (
                  <p className="text-sm text-muted-foreground whitespace-pre-line border-t pt-3">{offer.notes}</p>
                )}

                {offer.status === "sent" && (
                  <div className="flex gap-3 pt-2">
                    <Button onClick={() => handleAccept(offer)} disabled={saving}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Accept Offer
                    </Button>
                    <Button variant="outline" className="text-red-600 hover:text-red-700" onClick={() => setDeclineTarget(offer)} disabled={saving}>
                      <XCircle className="h-4 w-4 mr-2" />
                      Decline
                    </Button>
                  </div>
                )}

                {offer.status === "accepted" && offer.response_at && (
                  <p className="text-sm text-green-700 flex items-center gap-1 pt-1">
                    <CheckCircle className="h-4 w-4" /> Accepted on {new Date(offer.response_at).toLocaleDateString()}
                  </p>
                )}
                {offer.status === "declined" && offer.response_at && (
                  <p className="text-sm text-red-700 flex items-center gap-1 pt-1">
                    <XCircle className="h-4 w-4" /> Declined on {new Date(offer.response_at).toLocaleDateString()}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!declineTarget} onOpenChange={(open) => !open && setDeclineTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Decline this offer?</DialogTitle>
            <DialogDescription>You can leave a note for the company (optional).</DialogDescription>
          </DialogHeader>
          <Textarea rows={3} value={declineNote} onChange={(e) => setDeclineNote(e.target.value)} placeholder="Reason (optional)" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeclineTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDecline} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Decline Offer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
