import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Building2, AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/SimpleAuthContext";
import interqLogo from "/interq-logo.png";

interface InviteInfo {
  id: string;
  company_id: string;
  company_name: string;
  email: string;
  role: string;
  status: string;
  expires_at: string;
}

const roleLabel = (role: string) => {
  if (role === "hiring_manager") return "Hiring Manager";
  if (role === "interviewer") return "Interviewer";
  if (role === "recruiter") return "Recruiter";
  return role;
};

export default function JoinCompany() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const token = searchParams.get("token") || "";

  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("This invite link is missing a token.");
      setChecking(false);
      return;
    }

    supabase.rpc("get_company_invite", { p_token: token }).then(({ data, error: rpcError }) => {
      if (rpcError || !data || data.length === 0) {
        setError("This invite link is invalid.");
      } else {
        const inv = data[0] as InviteInfo;
        if (inv.status === "accepted") setError("This invite has already been used.");
        else if (inv.status === "revoked") setError("This invite has been revoked.");
        else if (new Date(inv.expires_at) < new Date()) setError("This invite has expired.");
        else setInvite(inv);
      }
      setChecking(false);
    });
  }, [token]);

  const handleAccept = async () => {
    if (!user) return;
    setSubmitting(true);
    const { error: rpcError } = await supabase.rpc("accept_company_invite", { p_token: token, p_user_id: user.id });
    setSubmitting(false);
    if (rpcError) {
      setError(rpcError.message);
      return;
    }
    navigate("/company", { replace: true });
  };

  const handleSignupAndJoin = async () => {
    if (!invite) return;
    if (!name.trim() || password.length < 8) {
      setError("Enter your name and an 8+ character password.");
      return;
    }
    setSubmitting(true);
    setError("");

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: invite.email,
      password,
      options: { data: { full_name: name.trim(), role: "company" } },
    });

    if (signUpError) {
      setSubmitting(false);
      setError(signUpError.message);
      return;
    }

    if (!data.session) {
      setSubmitting(false);
      setNeedsConfirmation(true);
      return;
    }

    const { error: rpcError } = await supabase.rpc("accept_company_invite", { p_token: token, p_user_id: data.user!.id });
    setSubmitting(false);
    if (rpcError) {
      setError(rpcError.message);
      return;
    }
    navigate("/company", { replace: true });
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex justify-center mb-6">
          <img src={interqLogo} alt="InterQ" className="h-10" />
        </Link>

        <Card className="shadow-xl border-0">
          {error && !invite ? (
            <CardContent className="pt-6 text-center space-y-4">
              <AlertCircle className="h-12 w-12 mx-auto text-amber-500" />
              <p className="text-muted-foreground">{error}</p>
              <Button variant="outline" onClick={() => navigate("/")}>Back to Home</Button>
            </CardContent>
          ) : needsConfirmation ? (
            <CardContent className="pt-6 text-center space-y-4">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
              <div>
                <h2 className="text-xl font-bold mb-1">Check your email</h2>
                <p className="text-muted-foreground text-sm">
                  Confirm your address, then come back to this exact link to finish joining {invite?.company_name}.
                </p>
              </div>
            </CardContent>
          ) : invite && user ? (
            user.email.toLowerCase() === invite.email.toLowerCase() ? (
              <>
                <CardHeader className="text-center">
                  <Building2 className="h-10 w-10 mx-auto text-indigo-600 mb-2" />
                  <CardTitle>Join {invite.company_name}</CardTitle>
                  <CardDescription>You've been invited as {roleLabel(invite.role)}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                  <Button className="w-full" onClick={handleAccept} disabled={submitting}>
                    {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Join Company
                  </Button>
                </CardContent>
              </>
            ) : (
              <CardContent className="pt-6 text-center space-y-4">
                <AlertCircle className="h-12 w-12 mx-auto text-amber-500" />
                <p className="text-sm text-muted-foreground">
                  This invite is for <strong>{invite.email}</strong>, but you're signed in as <strong>{user.email}</strong>.
                </p>
                <Button variant="outline" onClick={async () => { await logout(); }}>Sign out and try again</Button>
              </CardContent>
            )
          ) : invite ? (
            <>
              <CardHeader className="text-center">
                <Building2 className="h-10 w-10 mx-auto text-indigo-600 mb-2" />
                <CardTitle>Join {invite.company_name}</CardTitle>
                <CardDescription>You've been invited as {roleLabel(invite.role)} — set up your account for {invite.email}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="join-name">Full Name</Label>
                  <Input id="join-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="join-password">Password</Label>
                  <Input id="join-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button className="w-full" onClick={handleSignupAndJoin} disabled={submitting}>
                  {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Create Account & Join
                </Button>
              </CardContent>
            </>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
