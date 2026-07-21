// Recruiters and Company Admins share the same candidates data (company_members
// tenancy), so this route reuses the Company Portal's implementation rather
// than maintaining a second copy.
export { default } from "@/pages/company/CompanyCandidates";
