import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/SimpleAuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { notifyCompany } from "@/lib/notifications";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WorkflowStepper, type Step } from "@/components/assessment/WorkflowStepper";
import { Search, User as UserIcon, Send, Building2, MapPin, Loader2, CheckCircle2, ArrowLeft, ArrowRight } from "lucide-react";

const APPLY_STEPS: Step[] = [
  { id: 1, title: "Review", subtitle: "Read the job details", icon: Search },
  { id: 2, title: "Profile", subtitle: "Confirm your info", icon: UserIcon },
  { id: 3, title: "Submit", subtitle: "Send your application", icon: Send },
];

interface JobRow {
  id: string;
  title: string;
  department: string | null;
  location: string | null;
  employment_type: string | null;
  description: string | null;
  company_id: string;
  companies: { name: string; industry: string | null; description: string | null } | null;
}

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [job, setJob] = useState<JobRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [alreadyApplied, setAlreadyApplied] = useState<{ status: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);

      const [{ data: jobData }, { data: profileData }, { data: existing }] = await Promise.all([
        supabase.from("jobs").select("*, companies(name, industry, description)").eq("id", id).maybeSingle(),
        user?.id ? supabase.from("profiles").select("*").eq("id", user.id).maybeSingle() : Promise.resolve({ data: null }),
        user?.id ? supabase.from("candidates").select("status").eq("job_id", id).eq("user_id", user.id).maybeSingle() : Promise.resolve({ data: null }),
      ]);

      setJob(jobData as JobRow | null);
      if (profileData) {
        setFullName((profileData as any).full_name || user?.name || "");
        setEmail((profileData as any).email || user?.email || "");
        setPhone((profileData as any).phone || "");
      } else {
        setFullName(user?.name || "");
        setEmail(user?.email || "");
      }
      if (existing) setAlreadyApplied(existing as { status: string });

      setLoading(false);
    };
    load();
  }, [id, user?.id]);

  const canProceedToStep = (target: number) => target <= step + 1;

  const handleSubmitApplication = async () => {
    if (!job || !user?.id) return;
    if (!fullName.trim() || !email.trim()) {
      toast({ title: "Missing information", description: "Full name and email are required.", variant: "destructive" });
      return;
    }
    setSubmitting(true);

    const { data: dup } = await supabase
      .from("candidates")
      .select("id")
      .eq("job_id", job.id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (dup) {
      toast({ title: "Already applied", description: "You've already applied to this job." });
      setAlreadyApplied({ status: "applied" });
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.from("candidates").insert({
      company_id: job.company_id,
      job_id: job.id,
      user_id: user.id,
      full_name: fullName.trim(),
      email: email.trim(),
      phone: phone.trim() || null,
      status: "applied",
      source: "platform",
    });

    setSubmitting(false);
    if (error) {
      toast({ title: "Failed to submit application", description: error.message, variant: "destructive" });
      return;
    }

    await notifyCompany(job.company_id, {
      type: "candidate.applied",
      title: "New application received",
      message: `${fullName.trim()} applied for ${job.title}`,
      link: `/company/candidates?job=${job.id}`,
    });

    toast({ title: "Application submitted!", description: "Next, complete a skills assessment to stand out." });
    navigate("/jobseeker/assessments");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Job not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/jobseeker/jobs")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Job Board
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Button variant="ghost" size="sm" onClick={() => navigate("/jobseeker/jobs")}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Job Board
      </Button>

      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Building2 className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{job.title}</h1>
          <p className="text-muted-foreground">{job.companies?.name || "Company"}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {job.location && (
              <Badge variant="outline" className="text-xs"><MapPin className="w-3 h-3 mr-1" />{job.location}</Badge>
            )}
            {job.employment_type && <Badge variant="secondary" className="text-xs">{job.employment_type}</Badge>}
          </div>
        </div>
      </div>

      {alreadyApplied ? (
        <Card>
          <CardContent className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 mx-auto text-green-600" />
            <h3 className="font-semibold text-lg">You've already applied</h3>
            <p className="text-muted-foreground text-sm">Current status: <Badge variant="secondary">{alreadyApplied.status}</Badge></p>
            <Button variant="outline" onClick={() => navigate("/jobseeker/applications")}>View My Applications</Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="p-6">
            <WorkflowStepper currentStep={step} onStepClick={setStep} canProceedToStep={canProceedToStep} steps={APPLY_STEPS} />
          </Card>

          <Card>
            <CardContent className="p-6 space-y-6">
              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="font-semibold">About this role</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {job.description || "No description provided."}
                  </p>
                  {job.companies?.description && (
                    <>
                      <h3 className="font-semibold pt-2">About {job.companies.name}</h3>
                      <p className="text-sm text-muted-foreground">{job.companies.description}</p>
                    </>
                  )}
                  <div className="flex justify-end pt-2">
                    <Button onClick={() => setStep(2)}>Continue <ArrowRight className="w-4 h-4 ml-2" /></Button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Confirm your details</h3>
                  <p className="text-sm text-muted-foreground">This is what the hiring team will see.</p>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="apply-name">Full Name</Label>
                      <Input id="apply-name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apply-email">Email</Label>
                      <Input id="apply-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apply-phone">Phone (optional)</Label>
                      <Input id="apply-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                  </div>
                  <div className="flex justify-between pt-2">
                    <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
                    <Button onClick={() => setStep(3)}>Continue <ArrowRight className="w-4 h-4 ml-2" /></Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Review & submit</h3>
                  <div className="rounded-lg border p-4 space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Applying as</span><span>{fullName}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{email}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Role</span><span>{job.title}</span></div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    After submitting, you'll be prompted to take a skills assessment for this role.
                  </p>
                  <div className="flex justify-between pt-2">
                    <Button variant="outline" onClick={() => setStep(2)} disabled={submitting}>
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <Button onClick={handleSubmitApplication} disabled={submitting}>
                      {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Submit Application
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
