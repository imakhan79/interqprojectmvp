import type { AccountRole } from "@/contexts/SimpleAuthContext";

export interface AccountType {
  id: AccountRole;
  title: string;
  description?: string;
  enabled: boolean;
}

// Only account types already supported by the existing authentication system
// (AccountRole + role-based dashboards in SimpleAuthContext) are listed here.
// Add a new entry only once the client confirms the account type — do not
// invent permissions or dashboards for anything not already wired up.
export const accountTypes: AccountType[] = [
  {
    id: "recruiter",
    title: "Talent Acquisition Partner",
    description: "Track candidates, manage pipeline, and schedule interviews",
    enabled: true,
  },
  {
    id: "company",
    title: "Company",
    description: "Manage jobs, candidates, interviews, and team",
    enabled: true,
  },
  {
    id: "jobseeker",
    title: "Job Seeker",
    description: "Browse jobs, track applications, and manage your profile",
    enabled: true,
  },
];
