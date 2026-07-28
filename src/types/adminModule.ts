export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended';
export type CompanyStatus = 'active' | 'inactive' | 'suspended' | 'trial';
export type SubscriptionPlan = 'basic' | 'professional' | 'enterprise';
export type JobStatus = 'draft' | 'open' | 'closed' | 'pending_approval' | 'on_hold';
export type CandidateStage = 'applied' | 'screening' | 'shortlisted' | 'interview_r1' | 'interview_r2' | 'technical' | 'hr_interview' | 'offer' | 'hired' | 'rejected';
export type InterviewStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled' | 'pending_feedback';
export type InterviewMode = 'video' | 'phone' | 'in_person';
export type OfferStatus = 'draft' | 'pending_approval' | 'sent' | 'accepted' | 'declined' | 'expired';
export type IntegrationStatus = 'connected' | 'pending' | 'failed' | 'expired';
export type AuditAction = 'create' | 'update' | 'delete' | 'login' | 'logout' | 'export' | 'approve' | 'reject';
export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'export' | 'assign' | 'manage_settings';
export type ModuleType = 'dashboard' | 'companies' | 'jobs' | 'candidates' | 'interviews' | 'offers' | 'reports' | 'settings' | 'billing' | 'integrations' | 'audit_logs';

export interface Company {
  id: string;
  name: string;
  logo?: string;
  industry: string;
  size: string;
  contactPerson: string;
  contactEmail: string;
  phone: string;
  website: string;
  address: string;
  country: string;
  timezone: string;
  subscriptionPlan: SubscriptionPlan;
  status: CompanyStatus;
  recruiterCount: number;
  jobCount: number;
  candidateCount: number;
  createdAt: string;
  trialEndsAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: string;
  department: string;
  companyId: string;
  companyName: string;
  manager?: string;
  status: UserStatus;
  lastLogin?: string;
  createdAt: string;
}

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: string;
  workplaceType: string;
  salaryMin: number;
  salaryMax: number;
  experienceLevel: string;
  hiringManager: string;
  openings: number;
  description: string;
  skills: string[];
  companyId: string;
  companyName: string;
  status: JobStatus;
  recruiterId: string;
  recruiterName: string;
  createdAt: string;
  applications: number;
}

export interface Candidate {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  resume?: string;
  rating?: number;
  stage: CandidateStage;
  companyId: string;
  companyName: string;
  appliedRole: string;
  jobId: string;
  source: string;
  recruiterId: string;
  recruiterName: string;
  tags: string[];
  notes: string;
  status: UserStatus;
  appliedAt: string;
  lastActivity: string;
}

export interface Interview {
  id: string;
  candidateId: string;
  candidateName: string;
  jobId: string;
  jobTitle: string;
  companyId: string;
  companyName: string;
  interviewerId: string;
  interviewerName: string;
  scheduledAt: string;
  duration: number;
  mode: InterviewMode;
  status: InterviewStatus;
  notes?: string;
  scorecard?: {
    rating: number;
    recommendation: string;
    strengths: string;
    concerns: string;
  };
}

export interface Offer {
  id: string;
  candidateId: string;
  candidateName: string;
  jobId: string;
  jobTitle: string;
  companyId: string;
  companyName: string;
  salary: number;
  joiningDate: string;
  expiryDate: string;
  status: OfferStatus;
  createdAt: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  color: string;
  order: number;
  isDefault: boolean;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  companyId?: string;
  companyName?: string;
  action: AuditAction;
  module: string;
  entityType: string;
  entityId: string;
  entityName: string;
  changes: { field: string; oldValue: string; newValue: string }[];
  ipAddress: string;
  timestamp: string;
}

export interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  status: IntegrationStatus;
  lastSync?: string;
  connectedAt?: string;
  config?: Record<string, string>;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  link?: string;
}

export interface BillingInfo {
  companyId: string;
  plan: SubscriptionPlan;
  status: 'active' | 'past_due' | 'cancelled' | 'trial';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  usage: {
    activeJobs: number;
    recruiterSeats: number;
    candidateLimit: number;
    storageUsed: number;
  };
  limits: {
    maxJobs: number;
    maxRecruiters: number;
    maxCandidates: number;
    maxStorage: number;
  };
  invoices: {
    id: string;
    date: string;
    amount: number;
    status: string;
    pdfUrl: string;
  }[];
}

export interface Role {
  id: string;
  name: string;
  description: string;
  color: string;
  isSystem: boolean;
  permissions: Record<ModuleType, PermissionAction[]>;
  userCount: number;
  createdAt: string;
}

export interface ActivityFeed {
  id: string;
  type: 'company_created' | 'recruiter_added' | 'job_posted' | 'candidate_moved' | 'offer_sent' | 'role_changed' | 'user_invited' | 'subscription_changed';
  title: string;
  description: string;
  userId: string;
  userName: string;
  timestamp: string;
  metadata?: Record<string, string>;
}

export interface KPIData {
  totalCompanies: number;
  totalRecruiters: number;
  activeJobs: number;
  totalCandidates: number;
  interviewsScheduled: number;
  offersSent: number;
  hiresCompleted: number;
  pendingApprovals: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  fill?: string;
}

export interface Report {
  id: string;
  name: string;
  type: string;
  description: string;
  createdAt: string;
  lastRun?: string;
  schedule?: string;
}

export const PIPELINE_STAGES: PipelineStage[] = [
  { id: '1', name: 'Applied', color: '#3b82f6', order: 1, isDefault: true },
  { id: '2', name: 'Screening', color: '#8b5cf6', order: 2, isDefault: true },
  { id: '3', name: 'Shortlisted', color: '#06b6d4', order: 3, isDefault: true },
  { id: '4', name: 'Interview R1', color: '#f59e0b', order: 4, isDefault: true },
  { id: '5', name: 'Interview R2', color: '#f97316', order: 5, isDefault: true },
  { id: '6', name: 'Technical', color: '#84cc16', order: 6, isDefault: false },
  { id: '7', name: 'HR Interview', color: '#ec4899', order: 7, isDefault: false },
  { id: '8', name: 'Offer', color: '#22c55e', order: 8, isDefault: true },
  { id: '9', name: 'Hired', color: '#10b981', order: 9, isDefault: true },
  { id: '10', name: 'Rejected', color: '#ef4444', order: 10, isDefault: true },
];

export const MODULES: { key: ModuleType; label: string; icon: string }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { key: 'companies', label: 'Companies', icon: 'Building2' },
  { key: 'jobs', label: 'Jobs', icon: 'Briefcase' },
  { key: 'candidates', label: 'Candidates', icon: 'Users' },
  { key: 'interviews', label: 'Interviews', icon: 'Calendar' },
  { key: 'offers', label: 'Offers', icon: 'FileText' },
  { key: 'reports', label: 'Reports', icon: 'BarChart3' },
  { key: 'settings', label: 'Settings', icon: 'Settings' },
  { key: 'billing', label: 'Billing', icon: 'CreditCard' },
  { key: 'integrations', label: 'Integrations', icon: 'Plug' },
  { key: 'audit_logs', label: 'Audit Logs', icon: 'ScrollText' },
];

export const SUBSCRIPTION_PLANS = {
  basic: { name: 'Basic', price: 99, features: ['5 Active Jobs', '3 TAP Seats', '500 Candidates/mo', 'Email Support'] },
  professional: { name: 'Professional', price: 299, features: ['25 Active Jobs', '15 TAP Seats', '2000 Candidates/mo', 'Priority Support'] },
  enterprise: { name: 'Enterprise', price: 799, features: ['Unlimited Jobs', 'Unlimited Seats', 'Unlimited Candidates', '24/7 Support', 'Custom Integrations'] },
};

export const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing',
  'Retail', 'Media & Entertainment', 'Consulting', 'Real Estate', 'Transportation'
];

export const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany',
  'France', 'India', 'Singapore', 'Japan', 'Brazil'
];

export const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'];
export const WORKPLACE_TYPES = ['Remote', 'On-site', 'Hybrid'];
export const EXPERIENCE_LEVELS = ['Entry Level', 'Mid Level', 'Senior', 'Lead', 'Manager', 'Director', 'Executive'];
export const DEPARTMENTS = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations', 'Product', 'Design'];
export const SOURCES = ['LinkedIn', 'Indeed', 'Referral', 'Career Page', 'Job Board', 'Agency', 'Other'];
