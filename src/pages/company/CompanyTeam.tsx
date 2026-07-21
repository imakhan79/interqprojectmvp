import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserPlus, Copy, Loader2, Trash2, Ban, Users, Link as LinkIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/SimpleAuthContext";
import { useCompanyId } from "@/hooks/useCompanyId";

interface MemberRow {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  full_name?: string;
  email?: string;
}

interface InviteRow {
  id: string;
  email: string;
  role: string;
  token: string;
  status: string;
  created_at: string;
  expires_at: string;
}

const roleOptions = [
  { value: "recruiter", label: "Recruiter" },
  { value: "hiring_manager", label: "Hiring Manager" },
  { value: "interviewer", label: "Interviewer" },
];

const roleLabel = (role: string) => {
  const match = roleOptions.find(r => r.value === role);
  if (match) return match.label;
  return role === "admin" ? "Company Admin" : role.charAt(0).toUpperCase() + role.slice(1);
};

export default function CompanyTeam() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { companyId, loading: companyLoading, isDemo } = useCompanyId();

  const [members, setMembers] = useState<MemberRow[]>([]);
  const [invites, setInvites] = useState<InviteRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("recruiter");
  const [inviting, setInviting] = useState(false);
  const [newInviteLink, setNewInviteLink] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!companyId) {
      setMembers([]);
      setInvites([]);
      setLoading(false);
      return;
    }
    setLoading(true);

    const [{ data: memberRows }, { data: inviteRows }] = await Promise.all([
      supabase.from("company_members").select("*").eq("company_id", companyId).order("joined_at", { ascending: true }),
      supabase.from("company_invites").select("*").eq("company_id", companyId).eq("status", "pending").order("created_at", { ascending: false }),
    ]);

    const memberList = (memberRows as MemberRow[]) || [];
    const userIds = memberList.map(m => m.user_id);
    let profileMap = new Map<string, { full_name: string; email: string }>();
    if (userIds.length > 0) {
      const { data: profiles } = await supabase.from("profiles").select("id, full_name, email").in("id", userIds);
      profileMap = new Map((profiles || []).map((p: { id: string; full_name: string; email: string }) => [p.id, { full_name: p.full_name, email: p.email }]));
    }

    setMembers(memberList.map(m => ({ ...m, full_name: profileMap.get(m.user_id)?.full_name, email: profileMap.get(m.user_id)?.email })));
    setInvites((inviteRows as InviteRow[]) || []);
    setLoading(false);
  }, [companyId]);

  useEffect(() => {
    if (!companyLoading) load();
  }, [companyLoading, load]);

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !companyId) {
      toast({ title: "Enter an email address", variant: "destructive" });
      return;
    }
    setInviting(true);
    const { data, error } = await supabase
      .from("company_invites")
      .insert({ company_id: companyId, email: inviteEmail.trim(), role: inviteRole, invited_by: user?.id || null })
      .select("token")
      .single();

    setInviting(false);
    if (error) {
      toast({ title: "Failed to create invite", description: error.message, variant: "destructive" });
      return;
    }

    const link = `${window.location.origin}/join-company?token=${data.token}`;
    setNewInviteLink(link);
    setInviteEmail("");
    load();
  };

  const handleCopy = (link: string) => {
    navigator.clipboard.writeText(link);
    toast({ title: "Link copied" });
  };

  const handleRevoke = async (invite: InviteRow) => {
    const { error } = await supabase.from("company_invites").update({ status: "revoked" }).eq("id", invite.id);
    if (error) {
      toast({ title: "Failed to revoke invite", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Invite revoked" });
    load();
  };

  const handleRemove = async (member: MemberRow) => {
    if (member.user_id === user?.id) {
      toast({ title: "You can't remove yourself", variant: "destructive" });
      return;
    }
    if (!window.confirm(`Remove ${member.full_name || member.email || "this person"} from the company?`)) return;
    const { error } = await supabase.from("company_members").delete().eq("id", member.id);
    if (error) {
      toast({ title: "Failed to remove member", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Member removed" });
    load();
  };

  if (isDemo) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center gap-3">
        <Users className="h-10 w-10 text-muted-foreground" />
        <p className="text-muted-foreground">Team management isn't available for the demo account.</p>
      </div>
    );
  }

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
        <Users className="h-10 w-10 text-muted-foreground" />
        <p className="text-muted-foreground">No company workspace found for your account.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team</h1>
          <p className="text-gray-500">Invite recruiters, hiring managers, and interviewers to your workspace</p>
        </div>
        <Button onClick={() => { setNewInviteLink(null); setInviteOpen(true); }}>
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Team Member
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Members</h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">No members yet.</TableCell>
                </TableRow>
              ) : (
                members.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.full_name || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{m.email || "—"}</TableCell>
                    <TableCell><Badge variant="outline">{roleLabel(m.role)}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(m.joined_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      {m.user_id !== user?.id && (
                        <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleRemove(m)}>
                          <Trash2 className="w-4 h-4 mr-1" />
                          Remove
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {invites.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">Pending Invites</h2>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invites.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">{inv.email}</TableCell>
                    <TableCell><Badge variant="outline">{roleLabel(inv.role)}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(inv.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(inv.expires_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleCopy(`${window.location.origin}/join-company?token=${inv.token}`)}>
                        <Copy className="w-4 h-4 mr-1" />
                        Copy Link
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleRevoke(inv)}>
                        <Ban className="w-4 h-4 mr-1" />
                        Revoke
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={inviteOpen} onOpenChange={(open) => { setInviteOpen(open); if (!open) setNewInviteLink(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              There's no automated email sending yet — you'll get a link to copy and send yourself.
            </DialogDescription>
          </DialogHeader>

          {newInviteLink ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg text-sm">
                <LinkIcon className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                <code className="truncate flex-1">{newInviteLink}</code>
              </div>
              <Button className="w-full" onClick={() => handleCopy(newInviteLink)}>
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invite-email">Email</Label>
                <Input id="invite-email" type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="teammate@company.com" />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {roleOptions.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            {newInviteLink ? (
              <Button variant="outline" onClick={() => setInviteOpen(false)}>Done</Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
                <Button onClick={handleInvite} disabled={inviting}>
                  {inviting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Create Invite Link
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
