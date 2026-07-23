import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

export interface NotificationInput {
  type: string;
  title: string;
  message?: string;
  link?: string;
}

/** A row from the `notifications` table, as read back from Supabase. */
export interface NotificationRow {
  id: string;
  user_id: string | null;
  company_id: string | null;
  role: string | null;
  type: string;
  title: string;
  message: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export type NotificationIcon = "job" | "candidate" | "interview" | "offer" | "alert";
export type NotificationSeverity = "info" | "success" | "warning" | "error";

/** Shape every notification UI (bell, full-page lists) renders from. */
export interface DisplayNotification {
  id: string;
  title: string;
  message: string | null;
  time: string;
  read: boolean;
  type: NotificationSeverity;
  icon: NotificationIcon;
  link: string | null;
}

/** The notifications table's `type` column is free-text (set by whatever inserted
 * the row), so map it onto our icon/severity vocabulary with simple keyword rules. */
export function mapDbNotification(row: NotificationRow): DisplayNotification {
  const t = row.type.toLowerCase();
  let icon: NotificationIcon = "alert";
  if (t.includes("offer")) icon = "offer";
  else if (t.includes("interview")) icon = "interview";
  else if (t.includes("candidate") || t.includes("application")) icon = "candidate";
  else if (t.includes("job") || t.includes("company")) icon = "job";

  let type: NotificationSeverity = "info";
  if (t.includes("success") || t.includes("accepted") || t.includes("hired") || t.includes("approved")) type = "success";
  else if (t.includes("warn") || t.includes("pending")) type = "warning";
  else if (t.includes("error") || t.includes("declined") || t.includes("reject")) type = "error";

  return {
    id: row.id,
    title: row.title,
    message: row.message,
    time: formatDistanceToNow(new Date(row.created_at), { addSuffix: true }),
    read: row.is_read,
    type,
    icon,
    link: row.link,
  };
}

/** Fixed example notifications shown to demo accounts, which never write real
 * rows to `notifications` (SimpleAuthContext keeps demo sessions local-only). */
export function getDemoNotifications(role: string): DisplayNotification[] {
  const base: DisplayNotification[] = [
    { id: "n1", title: "Alex Thompson advanced to Interview Round 2", message: null, time: "5 min ago", read: false, type: "info", icon: "candidate", link: null },
    { id: "n2", title: "New application received for Senior Engineer role", message: null, time: "23 min ago", read: false, type: "info", icon: "job", link: null },
    { id: "n3", title: "Interview with Sophie Chen at 3:00 PM today", message: null, time: "1 hour ago", read: false, type: "info", icon: "interview", link: null },
    { id: "n4", title: "Offer accepted by Michael Brown", message: null, time: "2 hours ago", read: true, type: "success", icon: "offer", link: null },
    { id: "n5", title: "Resume screening complete — 12 shortlisted", message: null, time: "4 hours ago", read: true, type: "success", icon: "candidate", link: null },
  ];

  const adminExtra: DisplayNotification[] = [
    { id: "n6", title: "EduLearn Platform completed onboarding", message: null, time: "1 day ago", read: true, type: "success", icon: "alert", link: null },
    { id: "n7", title: "MedHealth Inc subscription expires in 7 days", message: null, time: "1 day ago", read: false, type: "warning", icon: "alert", link: null },
  ];

  const jobseekerOnly: DisplayNotification[] = [
    { id: "n1", title: "Your application for Senior Engineer was reviewed", message: null, time: "1 hour ago", read: false, type: "info", icon: "job", link: null },
    { id: "n2", title: "Interview invitation from TechCorp Solutions", message: null, time: "3 hours ago", read: false, type: "success", icon: "interview", link: null },
    { id: "n3", title: "Your profile was viewed by 3 recruiters", message: null, time: "Today", read: true, type: "info", icon: "candidate", link: null },
  ];

  if (role === "jobseeker" || role === "job_seeker") return jobseekerOnly;
  if (role === "admin") return [...base, ...adminExtra];
  return base;
}

/** Insert a single notification for one user. NotificationBell only ever reads
 * by `user_id`, so this is the one primitive every other helper here fans out
 * through. */
export async function notifyUser(userId: string, input: NotificationInput) {
  if (!userId) return;
  await supabase.from("notifications").insert({
    user_id: userId,
    type: input.type,
    title: input.title,
    message: input.message || null,
    link: input.link || null,
  });
}

/** Notify every member of a company (recruiters and company admins share
 * `company_members` tenancy, so this reaches both). */
export async function notifyCompany(companyId: string, input: NotificationInput) {
  if (!companyId) return;
  const { data: members } = await supabase
    .from("company_members")
    .select("user_id")
    .eq("company_id", companyId);

  const rows = (members || [])
    .filter((m: { user_id: string | null }) => !!m.user_id)
    .map((m: { user_id: string }) => ({
      user_id: m.user_id,
      company_id: companyId,
      type: input.type,
      title: input.title,
      message: input.message || null,
      link: input.link || null,
    }));

  if (rows.length > 0) {
    await supabase.from("notifications").insert(rows);
  }
}

/** Notify every user with a given platform role (used to alert all admins
 * when something needs approval). */
export async function notifyRole(role: string, input: NotificationInput) {
  const { data: users } = await supabase
    .from("user_roles")
    .select("user_id")
    .eq("role", role);

  const rows = (users || [])
    .filter((u: { user_id: string | null }) => !!u.user_id)
    .map((u: { user_id: string }) => ({
      user_id: u.user_id,
      role,
      type: input.type,
      title: input.title,
      message: input.message || null,
      link: input.link || null,
    }));

  if (rows.length > 0) {
    await supabase.from("notifications").insert(rows);
  }
}
