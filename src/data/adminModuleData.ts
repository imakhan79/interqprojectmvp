import {
  Company, User, Job, Candidate, Interview, Offer, AuditLog,
  Integration, ActivityFeed, KPIData, Role, Report, BillingInfo,
  Notification, ChartDataPoint, PipelineStage, CandidateStage
} from '@/types/adminModule';

export const mockKPIs: KPIData = {
  totalCompanies: 48,
  totalRecruiters: 156,
  activeJobs: 234,
  totalCandidates: 4521,
  interviewsScheduled: 89,
  offersSent: 23,
  hiresCompleted: 67,
  pendingApprovals: 12,
};

export const mockCompanies: Company[] = [
  { id: '1', name: 'TechCorp Solutions', logo: '', industry: 'Technology', size: '500-1000', contactPerson: 'John Smith', contactEmail: 'john@techcorp.com', phone: '+1 555-0100', website: 'https://techcorp.com', address: '123 Tech Street', country: 'United States', timezone: 'America/New_York', subscriptionPlan: 'enterprise', status: 'active', recruiterCount: 25, jobCount: 18, candidateCount: 456, createdAt: '2024-01-15T10:00:00Z' },
  { id: '2', name: 'MedHealth Inc', logo: '', industry: 'Healthcare', size: '1000-5000', contactPerson: 'Sarah Johnson', contactEmail: 'sarah@medhealth.com', phone: '+1 555-0200', website: 'https://medhealth.com', address: '456 Health Ave', country: 'United States', timezone: 'America/Los_Angeles', subscriptionPlan: 'professional', status: 'active', recruiterCount: 15, jobCount: 12, candidateCount: 234, createdAt: '2024-02-20T09:00:00Z' },
  { id: '3', name: 'FinanceHub Global', logo: '', industry: 'Finance', size: '5000+', contactPerson: 'Michael Chen', contactEmail: 'michael@financehub.com', phone: '+1 555-0300', website: 'https://financehub.com', address: '789 Finance Blvd', country: 'United Kingdom', timezone: 'Europe/London', subscriptionPlan: 'enterprise', status: 'active', recruiterCount: 32, jobCount: 28, candidateCount: 678, createdAt: '2024-01-10T08:00:00Z' },
  { id: '4', name: 'EduLearn Platform', logo: '', industry: 'Education', size: '100-500', contactPerson: 'Emily Davis', contactEmail: 'emily@edulearn.com', phone: '+1 555-0400', website: 'https://edulearn.com', address: '321 Learn Lane', country: 'Canada', timezone: 'America/Toronto', subscriptionPlan: 'basic', status: 'active', recruiterCount: 5, jobCount: 8, candidateCount: 123, createdAt: '2024-03-05T14:00:00Z' },
  { id: '5', name: 'RetailMax Group', logo: '', industry: 'Retail', size: '5000+', contactPerson: 'James Wilson', contactEmail: 'james@retailmax.com', phone: '+1 555-0500', website: 'https://retailmax.com', address: '654 Retail Road', country: 'Australia', timezone: 'Australia/Sydney', subscriptionPlan: 'professional', status: 'trial', recruiterCount: 8, jobCount: 5, candidateCount: 89, createdAt: '2024-03-10T11:00:00Z', trialEndsAt: '2024-04-10' },
  { id: '6', name: 'GreenEnergy Corp', logo: '', industry: 'Manufacturing', size: '500-1000', contactPerson: 'Lisa Martinez', contactEmail: 'lisa@greenenergy.com', phone: '+1 555-0600', website: 'https://greenenergy.com', address: '987 Green Way', country: 'Germany', timezone: 'Europe/Berlin', subscriptionPlan: 'professional', status: 'inactive', recruiterCount: 0, jobCount: 0, candidateCount: 0, createdAt: '2024-02-01T10:00:00Z' },
];

export const mockUsers: User[] = [
  { id: '1', name: 'Sarah Johnson', email: 'sarah@techcorp.com', phone: '+1 555-1001', role: 'Admin', department: 'IT', companyId: '1', companyName: 'TechCorp Solutions', status: 'active', lastLogin: '2024-03-18T09:30:00Z', createdAt: '2024-01-15T10:00:00Z' },
  { id: '2', name: 'Michael Chen', email: 'michael@techcorp.com', phone: '+1 555-1002', role: 'Company Admin', department: 'HR', companyId: '1', companyName: 'TechCorp Solutions', status: 'active', lastLogin: '2024-03-18T08:45:00Z', createdAt: '2024-01-20T09:00:00Z' },
  { id: '3', name: 'Emily Davis', email: 'emily@techcorp.com', phone: '+1 555-1003', role: 'Recruiter', department: 'HR', companyId: '1', companyName: 'TechCorp Solutions', status: 'active', lastLogin: '2024-03-17T16:20:00Z', createdAt: '2024-02-01T08:00:00Z' },
  { id: '4', name: 'James Wilson', email: 'james@techcorp.com', phone: '+1 555-1004', role: 'Hiring Manager', department: 'Engineering', companyId: '1', companyName: 'TechCorp Solutions', status: 'active', lastLogin: '2024-03-18T10:15:00Z', createdAt: '2024-02-10T10:00:00Z' },
  { id: '5', name: 'Lisa Martinez', email: 'lisa@techcorp.com', phone: '+1 555-1005', role: 'Interviewer', department: 'Engineering', companyId: '1', companyName: 'TechCorp Solutions', status: 'active', lastLogin: '2024-03-17T14:30:00Z', createdAt: '2024-02-15T11:00:00Z' },
  { id: '6', name: 'David Kim', email: 'david@medhealth.com', phone: '+1 555-2001', role: 'HR Executive', department: 'HR', companyId: '2', companyName: 'MedHealth Inc', status: 'active', lastLogin: '2024-03-18T07:00:00Z', createdAt: '2024-02-20T09:00:00Z' },
  { id: '7', name: 'Anna Brown', email: 'anna@medhealth.com', phone: '+1 555-2002', role: 'Recruiter', department: 'HR', companyId: '2', companyName: 'MedHealth Inc', status: 'inactive', lastLogin: '2024-03-10T09:00:00Z', createdAt: '2024-02-25T10:00:00Z' },
  { id: '8', name: 'Robert Taylor', email: 'robert@financehub.com', phone: '+1 555-3001', role: 'Department Head', department: 'Finance', companyId: '3', companyName: 'FinanceHub Global', status: 'active', lastLogin: '2024-03-18T06:00:00Z', createdAt: '2024-01-10T08:00:00Z' },
  { id: '9', name: 'Jennifer Lee', email: 'jennifer@financehub.com', phone: '+1 555-3002', role: 'Recruiter', department: 'HR', companyId: '3', companyName: 'FinanceHub Global', status: 'active', lastLogin: '2024-03-18T12:00:00Z', createdAt: '2024-01-15T09:00:00Z' },
  { id: '10', name: 'Chris Anderson', email: 'chris@edulearn.com', phone: '+1 555-4001', role: 'Company Admin', department: 'Admin', companyId: '4', companyName: 'EduLearn Platform', status: 'pending', createdAt: '2024-03-05T14:00:00Z' },
];

export const mockJobs: Job[] = [
  { id: '1', title: 'Senior Software Engineer', department: 'Engineering', location: 'San Francisco, CA', employmentType: 'Full-time', workplaceType: 'Hybrid', salaryMin: 150000, salaryMax: 200000, experienceLevel: 'Senior', hiringManager: 'James Wilson', openings: 3, description: 'We are looking for a senior software engineer...', skills: ['React', 'Node.js', 'Python', 'AWS'], companyId: '1', companyName: 'TechCorp Solutions', status: 'open', recruiterId: '3', recruiterName: 'Emily Davis', createdAt: '2024-03-01T10:00:00Z', applications: 45 },
  { id: '2', title: 'Product Manager', department: 'Product', location: 'New York, NY', employmentType: 'Full-time', workplaceType: 'Remote', salaryMin: 130000, salaryMax: 170000, experienceLevel: 'Lead', hiringManager: 'James Wilson', openings: 2, description: 'Lead product strategy and development...', skills: ['Product Management', 'Agile', 'Analytics'], companyId: '1', companyName: 'TechCorp Solutions', status: 'open', recruiterId: '3', recruiterName: 'Emily Davis', createdAt: '2024-03-05T11:00:00Z', applications: 32 },
  { id: '3', title: 'UX Designer', department: 'Design', location: 'Austin, TX', employmentType: 'Full-time', workplaceType: 'On-site', salaryMin: 100000, salaryMax: 140000, experienceLevel: 'Mid Level', hiringManager: 'James Wilson', openings: 1, description: 'Create beautiful user experiences...', skills: ['Figma', 'User Research', 'Prototyping'], companyId: '1', companyName: 'TechCorp Solutions', status: 'pending_approval', recruiterId: '3', recruiterName: 'Emily Davis', createdAt: '2024-03-10T09:00:00Z', applications: 28 },
  { id: '4', title: 'DevOps Engineer', department: 'Engineering', location: 'Seattle, WA', employmentType: 'Full-time', workplaceType: 'Remote', salaryMin: 140000, salaryMax: 180000, experienceLevel: 'Senior', hiringManager: 'James Wilson', openings: 2, description: 'Build and maintain CI/CD pipelines...', skills: ['Docker', 'Kubernetes', 'AWS', 'Terraform'], companyId: '2', companyName: 'MedHealth Inc', status: 'open', recruiterId: '6', recruiterName: 'David Kim', createdAt: '2024-03-08T14:00:00Z', applications: 19 },
  { id: '5', title: 'Financial Analyst', department: 'Finance', location: 'London, UK', employmentType: 'Full-time', workplaceType: 'On-site', salaryMin: 70000, salaryMax: 90000, experienceLevel: 'Mid Level', hiringManager: 'Robert Taylor', openings: 1, description: 'Analyze financial data and trends...', skills: ['Excel', 'Financial Modeling', 'SAP'], companyId: '3', companyName: 'FinanceHub Global', status: 'closed', recruiterId: '9', recruiterName: 'Jennifer Lee', createdAt: '2024-02-20T08:00:00Z', applications: 56 },
];

export const mockCandidates: Candidate[] = [
  { id: '1', fullName: 'Alex Thompson', email: 'alex.t@email.com', phone: '+1 555-5001', rating: 4.5, stage: 'interview_r1', companyId: '1', companyName: 'TechCorp Solutions', appliedRole: 'Senior Software Engineer', jobId: '1', source: 'LinkedIn', recruiterId: '3', recruiterName: 'Emily Davis', tags: ['Strong Technical', 'Leadership'], notes: 'Great communication skills', status: 'active', appliedAt: '2024-03-01T10:30:00Z', lastActivity: '2024-03-15T14:00:00Z' },
  { id: '2', fullName: 'Maria Garcia', email: 'maria.g@email.com', phone: '+1 555-5002', rating: 4.0, stage: 'screening', companyId: '1', companyName: 'TechCorp Solutions', appliedRole: 'Senior Software Engineer', jobId: '1', source: 'Indeed', recruiterId: '3', recruiterName: 'Emily Davis', tags: ['React Expert'], notes: 'Strong portfolio', status: 'active', appliedAt: '2024-03-02T11:00:00Z', lastActivity: '2024-03-14T09:30:00Z' },
  { id: '3', fullName: 'John Lee', email: 'john.l@email.com', phone: '+1 555-5003', rating: 3.5, stage: 'shortlisted', companyId: '1', companyName: 'TechCorp Solutions', appliedRole: 'Product Manager', jobId: '2', source: 'Referral', recruiterId: '3', recruiterName: 'Emily Davis', tags: ['MBA'], notes: 'Good leadership experience', status: 'active', appliedAt: '2024-03-05T09:00:00Z', lastActivity: '2024-03-16T11:00:00Z' },
  { id: '4', fullName: 'Sophie Chen', email: 'sophie.c@email.com', phone: '+1 555-5004', rating: 5.0, stage: 'offer', companyId: '1', companyName: 'TechCorp Solutions', appliedRole: 'Senior Software Engineer', jobId: '1', source: 'Career Page', recruiterId: '3', recruiterName: 'Emily Davis', tags: ['Top Candidate', 'AWS Certified'], notes: 'Exceptional technical skills', status: 'active', appliedAt: '2024-02-28T08:00:00Z', lastActivity: '2024-03-17T16:00:00Z' },
  { id: '5', fullName: 'Ryan Patel', email: 'ryan.p@email.com', phone: '+1 555-5005', stage: 'applied', companyId: '2', companyName: 'MedHealth Inc', appliedRole: 'DevOps Engineer', jobId: '4', source: 'LinkedIn', recruiterId: '6', recruiterName: 'David Kim', tags: [], notes: '', status: 'active', appliedAt: '2024-03-10T15:00:00Z', lastActivity: '2024-03-10T15:00:00Z' },
  { id: '6', fullName: 'Emma Wilson', email: 'emma.w@email.com', phone: '+1 555-5006', rating: 4.2, stage: 'hr_interview', companyId: '3', companyName: 'FinanceHub Global', appliedRole: 'Financial Analyst', jobId: '5', source: 'Job Board', recruiterId: '9', recruiterName: 'Jennifer Lee', tags: ['CFA Level 2'], notes: 'Strong analytical background', status: 'active', appliedAt: '2024-02-25T10:00:00Z', lastActivity: '2024-03-15T14:30:00Z' },
];

export const mockInterviews: Interview[] = [
  { id: '1', candidateId: '1', candidateName: 'Alex Thompson', jobId: '1', jobTitle: 'Senior Software Engineer', companyId: '1', companyName: 'TechCorp Solutions', interviewerId: '5', interviewerName: 'Lisa Martinez', scheduledAt: '2024-03-20T10:00:00Z', duration: 60, mode: 'video', status: 'scheduled', notes: 'Technical interview round 1' },
  { id: '2', candidateId: '3', candidateName: 'John Lee', jobId: '2', jobTitle: 'Product Manager', companyId: '1', companyName: 'TechCorp Solutions', interviewerId: '4', interviewerName: 'James Wilson', scheduledAt: '2024-03-19T14:00:00Z', duration: 45, mode: 'in_person', status: 'scheduled', notes: 'Case study presentation' },
  { id: '3', candidateId: '4', candidateName: 'Sophie Chen', jobId: '1', jobTitle: 'Senior Software Engineer', companyId: '1', companyName: 'TechCorp Solutions', interviewerId: '5', interviewerName: 'Lisa Martinez', scheduledAt: '2024-03-15T11:00:00Z', duration: 60, mode: 'video', status: 'completed', scorecard: { rating: 5, recommendation: 'Strong Hire', strengths: 'Excellent technical skills, great communication', concerns: 'None significant' } },
  { id: '4', candidateId: '6', candidateName: 'Emma Wilson', jobId: '5', jobTitle: 'Financial Analyst', companyId: '3', companyName: 'FinanceHub Global', interviewerId: '8', interviewerName: 'Robert Taylor', scheduledAt: '2024-03-21T09:00:00Z', duration: 30, mode: 'phone', status: 'scheduled', notes: 'HR interview' },
];

export const mockOffers: Offer[] = [
  { id: '1', candidateId: '4', candidateName: 'Sophie Chen', jobId: '1', jobTitle: 'Senior Software Engineer', companyId: '1', companyName: 'TechCorp Solutions', salary: 180000, joiningDate: '2024-04-15', expiryDate: '2024-03-25', status: 'sent', createdAt: '2024-03-15T16:00:00Z' },
  { id: '2', candidateId: '7', candidateName: 'Michael Brown', jobId: '10', jobTitle: 'Marketing Manager', companyId: '2', companyName: 'MedHealth Inc', salary: 95000, joiningDate: '2024-04-01', expiryDate: '2024-03-20', status: 'accepted', createdAt: '2024-03-10T10:00:00Z' },
  { id: '3', candidateId: '8', candidateName: 'Jennifer Smith', jobId: '5', jobTitle: 'Financial Analyst', companyId: '3', companyName: 'FinanceHub Global', salary: 85000, joiningDate: '2024-03-25', expiryDate: '2024-03-15', status: 'declined', createdAt: '2024-03-08T14:00:00Z' },
];

export const mockAuditLogs: AuditLog[] = [
  { id: '1', userId: '1', userName: 'Sarah Johnson', userEmail: 'sarah@techcorp.com', companyId: '1', companyName: 'TechCorp Solutions', action: 'create', module: 'jobs', entityType: 'job', entityId: '1', entityName: 'Senior Software Engineer', changes: [], ipAddress: '192.168.1.100', timestamp: '2024-03-18T10:00:00Z' },
  { id: '2', userId: '2', userName: 'Michael Chen', userEmail: 'michael@techcorp.com', companyId: '1', companyName: 'TechCorp Solutions', action: 'update', module: 'companies', entityType: 'company', entityId: '1', entityName: 'TechCorp Solutions', changes: [{ field: 'status', oldValue: 'trial', newValue: 'active' }], ipAddress: '192.168.1.101', timestamp: '2024-03-17T14:30:00Z' },
  { id: '3', userId: '3', userName: 'Emily Davis', userEmail: 'emily@techcorp.com', companyId: '1', companyName: 'TechCorp Solutions', action: 'update', module: 'candidates', entityType: 'candidate', entityId: '1', entityName: 'Alex Thompson', changes: [{ field: 'stage', oldValue: 'screening', newValue: 'interview_r1' }], ipAddress: '192.168.1.102', timestamp: '2024-03-17T11:15:00Z' },
  { id: '4', userId: '1', userName: 'Sarah Johnson', userEmail: 'sarah@techcorp.com', action: 'login', module: 'auth', entityType: 'session', entityId: 'sess_123', entityName: 'User Login', changes: [], ipAddress: '192.168.1.100', timestamp: '2024-03-18T09:00:00Z' },
  { id: '5', userId: '2', userName: 'Michael Chen', userEmail: 'michael@techcorp.com', companyId: '1', companyName: 'TechCorp Solutions', action: 'approve', module: 'offers', entityType: 'offer', entityId: '1', entityName: 'Sophie Chen Offer', changes: [], ipAddress: '192.168.1.101', timestamp: '2024-03-15T16:30:00Z' },
  { id: '6', userId: '9', userName: 'Jennifer Lee', userEmail: 'jennifer@financehub.com', companyId: '3', companyName: 'FinanceHub Global', action: 'export', module: 'reports', entityType: 'report', entityId: 'rep_001', entityName: 'Monthly Hiring Report', changes: [], ipAddress: '192.168.1.105', timestamp: '2024-03-14T15:00:00Z' },
];

export const mockIntegrations: Integration[] = [
  { id: '1', name: 'Google Calendar', description: 'Sync interviews with Google Calendar', icon: 'calendar', category: 'Calendar', status: 'connected', lastSync: '2024-03-18T08:00:00Z', connectedAt: '2024-01-15T10:00:00Z' },
  { id: '2', name: 'Slack', description: 'Receive notifications in Slack', icon: 'message-square', category: 'Communication', status: 'connected', lastSync: '2024-03-18T09:00:00Z', connectedAt: '2024-01-20T14:00:00Z' },
  { id: '3', name: 'LinkedIn', description: 'Import candidate profiles from LinkedIn', icon: 'linkedin', category: 'Job Boards', status: 'expired', lastSync: '2024-02-01T10:00:00Z', connectedAt: '2023-12-01T09:00:00Z' },
  { id: '4', name: 'Zoom', description: 'Host video interviews via Zoom', icon: 'video', category: 'Video', status: 'connected', lastSync: '2024-03-18T07:30:00Z', connectedAt: '2024-02-10T11:00:00Z' },
  { id: '5', name: 'Outlook Calendar', description: 'Sync with Microsoft Outlook', icon: 'calendar-check', category: 'Calendar', status: 'pending', connectedAt: '2024-03-15T16:00:00Z' },
  { id: '6', name: 'Indeed', description: 'Publish jobs to Indeed', icon: 'globe', category: 'Job Boards', status: 'failed', lastSync: '2024-03-10T12:00:00Z', connectedAt: '2024-01-05T08:00:00Z' },
  { id: '7', name: 'Microsoft Teams', description: 'Integration with Microsoft Teams', icon: 'users', category: 'Communication', status: 'connected', lastSync: '2024-03-18T08:30:00Z', connectedAt: '2024-02-20T10:00:00Z' },
  { id: '8', name: 'Workday', description: 'HRMS integration with Workday', icon: 'briefcase', category: 'HRMS', status: 'connected', lastSync: '2024-03-17T18:00:00Z', connectedAt: '2024-01-25T15:00:00Z' },
];

export const mockActivityFeed: ActivityFeed[] = [
  { id: '1', type: 'company_created', title: 'New Company', description: 'EduLearn Platform was added to the system', userId: '1', userName: 'Sarah Johnson', timestamp: '2024-03-18T10:00:00Z' },
  { id: '2', type: 'recruiter_added', title: 'New Recruiter', description: 'Chris Anderson was added to EduLearn Platform', userId: '1', userName: 'Sarah Johnson', timestamp: '2024-03-18T09:30:00Z' },
  { id: '3', type: 'job_posted', title: 'Job Posted', description: 'Senior Software Engineer was posted by TechCorp Solutions', userId: '3', userName: 'Emily Davis', timestamp: '2024-03-18T08:00:00Z' },
  { id: '4', type: 'candidate_moved', title: 'Candidate Advanced', description: 'Alex Thompson moved to Interview R1 stage', userId: '3', userName: 'Emily Davis', timestamp: '2024-03-17T16:00:00Z' },
  { id: '5', type: 'offer_sent', title: 'Offer Sent', description: 'Offer letter sent to Sophie Chen', userId: '2', userName: 'Michael Chen', timestamp: '2024-03-17T15:00:00Z' },
  { id: '6', type: 'role_changed', title: 'Role Updated', description: 'Recruiter permissions were modified', userId: '1', userName: 'Sarah Johnson', timestamp: '2024-03-17T14:00:00Z' },
  { id: '7', type: 'user_invited', title: 'User Invited', description: 'Invitation sent to newuser@email.com', userId: '2', userName: 'Michael Chen', timestamp: '2024-03-17T11:00:00Z' },
  { id: '8', type: 'subscription_changed', title: 'Plan Upgraded', description: 'MedHealth Inc upgraded to Professional plan', userId: '1', userName: 'Sarah Johnson', timestamp: '2024-03-15T10:00:00Z' },
];

export const mockRoles: Role[] = [
  { id: '1', name: 'Admin', description: 'Full system access with all permissions', color: 'bg-red-500', isSystem: true, permissions: { dashboard: ['view'], companies: ['view', 'create', 'edit', 'delete'], jobs: ['view', 'create', 'edit', 'delete'], candidates: ['view', 'create', 'edit', 'delete'], interviews: ['view', 'create', 'edit', 'delete'], offers: ['view', 'create', 'edit', 'delete'], reports: ['view', 'export'], settings: ['view', 'manage_settings'], billing: ['view', 'manage_settings'], integrations: ['view', 'manage_settings'], audit_logs: ['view', 'export'] }, userCount: 3, createdAt: '2024-01-01T00:00:00Z' },
  { id: '2', name: 'Company Admin', description: 'Full access to company resources', color: 'bg-blue-500', isSystem: true, permissions: { dashboard: ['view'], companies: ['view'], jobs: ['view', 'create', 'edit'], candidates: ['view', 'create', 'edit'], interviews: ['view', 'create', 'edit'], offers: ['view', 'create', 'edit'], reports: ['view', 'export'], settings: ['view', 'manage_settings'], billing: ['view'], integrations: ['view'], audit_logs: ['view'] }, userCount: 8, createdAt: '2024-01-01T00:00:00Z' },
  { id: '3', name: 'Recruiter', description: 'Can manage jobs and candidates', color: 'bg-green-500', isSystem: true, permissions: { dashboard: ['view'], companies: ['view'], jobs: ['view', 'create', 'edit'], candidates: ['view', 'create', 'edit', 'assign'], interviews: ['view', 'create'], offers: ['view'], reports: ['view'], settings: ['view'], billing: [], integrations: [], audit_logs: [] }, userCount: 45, createdAt: '2024-01-01T00:00:00Z' },
  { id: '4', name: 'Hiring Manager', description: 'Can review candidates and conduct interviews', color: 'bg-yellow-500', isSystem: true, permissions: { dashboard: ['view'], companies: ['view'], jobs: ['view'], candidates: ['view', 'edit'], interviews: ['view', 'create', 'edit'], offers: ['view', 'create'], reports: ['view'], settings: [], billing: [], integrations: [], audit_logs: [] }, userCount: 23, createdAt: '2024-01-01T00:00:00Z' },
  { id: '5', name: 'Interviewer', description: 'Can view candidates and submit interview feedback', color: 'bg-purple-500', isSystem: true, permissions: { dashboard: ['view'], companies: ['view'], jobs: ['view'], candidates: ['view'], interviews: ['view', 'edit'], offers: [], reports: [], settings: [], billing: [], integrations: [], audit_logs: [] }, userCount: 67, createdAt: '2024-01-01T00:00:00Z' },
  { id: '6', name: 'HR Executive', description: 'Can manage recruitment operations', color: 'bg-indigo-500', isSystem: false, permissions: { dashboard: ['view'], companies: ['view'], jobs: ['view', 'create', 'edit'], candidates: ['view', 'create', 'edit', 'assign'], interviews: ['view', 'create'], offers: ['view', 'create'], reports: ['view', 'export'], settings: ['view'], billing: [], integrations: [], audit_logs: [] }, userCount: 12, createdAt: '2024-02-15T10:00:00Z' },
];

export const mockReports: Report[] = [
  { id: '1', name: 'Hiring Performance Report', type: 'hiring', description: 'Comprehensive hiring metrics and KPIs', createdAt: '2024-01-15T10:00:00Z', lastRun: '2024-03-15T09:00:00Z', schedule: 'monthly' },
  { id: '2', name: 'Recruiter Productivity', type: 'productivity', description: 'Track recruiter performance metrics', createdAt: '2024-01-20T14:00:00Z', lastRun: '2024-03-10T10:00:00Z' },
  { id: '3', name: 'Candidate Conversion Funnel', type: 'conversion', description: 'Analyze candidate journey conversion rates', createdAt: '2024-02-01T08:00:00Z', lastRun: '2024-03-05T11:00:00Z' },
  { id: '4', name: 'Source Effectiveness', type: 'sources', description: 'Evaluate recruitment source performance', createdAt: '2024-02-10T09:00:00Z', lastRun: '2024-03-01T14:00:00Z' },
  { id: '5', name: 'Time to Hire Analysis', type: 'analytics', description: 'Analyze hiring timeline metrics', createdAt: '2024-02-15T11:00:00Z', lastRun: '2024-03-08T08:00:00Z', schedule: 'weekly' },
];

export const mockBillingInfo: BillingInfo = {
  companyId: '1',
  plan: 'enterprise',
  status: 'active',
  currentPeriodStart: '2024-03-01',
  currentPeriodEnd: '2024-04-01',
  usage: { activeJobs: 18, recruiterSeats: 25, candidateLimit: 234, storageUsed: 5.2 },
  limits: { maxJobs: -1, maxRecruiters: -1, maxCandidates: -1, maxStorage: 50 },
  invoices: [
    { id: 'INV-2024-001', date: '2024-03-01', amount: 799, status: 'paid', pdfUrl: '#' },
    { id: 'INV-2024-002', date: '2024-02-01', amount: 799, status: 'paid', pdfUrl: '#' },
    { id: 'INV-2024-003', date: '2024-01-01', amount: 799, status: 'paid', pdfUrl: '#' },
  ],
};

export const mockNotifications: Notification[] = [
   { id: '1', type: 'application', title: 'New Application', message: 'Alex Thompson applied for Senior Software Engineer', read: false, timestamp: '2024-03-18T09:00:00Z', link: '/candidates/1' },
   { id: '2', type: 'interview', title: 'Interview Scheduled', message: 'Interview with Alex Thompson scheduled for tomorrow', read: false, timestamp: '2024-03-17T16:00:00Z', link: '/interviews/1' },
   { id: '3', type: 'offer', title: 'Offer Accepted', message: 'Sophie Chen accepted the offer for Senior Software Engineer', read: true, timestamp: '2024-03-17T14:30:00Z', link: '/offers/1' },
   { id: '4', type: 'approval', title: 'Approval Required', message: 'Job posting "UX Designer" needs approval', read: false, timestamp: '2024-03-17T11:00:00Z', link: '/jobs/3' },
   { id: '5', type: 'security', title: 'Security Alert', message: 'New login detected from unrecognized device', read: true, timestamp: '2024-03-16T08:00:00Z', link: '/settings/security' },
];

export const hiringTrendData: ChartDataPoint[] = [
   { name: 'Jan', value: 45 },
   { name: 'Feb', value: 52 },
   { name: 'Mar', value: 67 },
   { name: 'Apr', value: 58 },
   { name: 'May', value: 71 },
   { name: 'Jun', value: 63 },
   { name: 'Jul', value: 78 },
   { name: 'Aug', value: 82 },
   { name: 'Sep', value: 75 },
   { name: 'Oct', value: 88 },
   { name: 'Nov', value: 92 },
   { name: 'Dec', value: 95 },
];

export const jobsByDepartmentData: ChartDataPoint[] = [
   { name: 'Engineering', value: 45, fill: '#3b82f6' },
   { name: 'Sales', value: 28, fill: '#22c55e' },
   { name: 'Marketing', value: 18, fill: '#f59e0b' },
   { name: 'HR', value: 12, fill: '#ec4899' },
   { name: 'Finance', value: 15, fill: '#8b5cf6' },
   { name: 'Operations', value: 8, fill: '#06b6d4' },
];

export const candidateFunnelData: ChartDataPoint[] = [
   { name: 'Applied', value: 1000 },
   { name: 'Screening', value: 650 },
   { name: 'Shortlisted', value: 350 },
   { name: 'Interview', value: 180 },
   { name: 'Offer', value: 45 },
   { name: 'Hired', value: 35 },
];

export const sourceEffectivenessData: ChartDataPoint[] = [
   { name: 'LinkedIn', value: 35 },
   { name: 'Indeed', value: 25 },
   { name: 'Referral', value: 20 },
   { name: 'Career Page', value: 12 },
   { name: 'Job Board', value: 8 },
];

export const recruiterPerformanceData = [
   { name: 'Emily Davis', hired: 15, interviews: 42, offers: 18 },
   { name: 'Michael Chen', hired: 12, interviews: 38, offers: 14 },
   { name: 'Jennifer Lee', hired: 10, interviews: 35, offers: 12 },
   { name: 'David Kim', hired: 8, interviews: 28, offers: 10 },
   { name: 'Anna Brown', hired: 6, interviews: 22, offers: 8 },
];

export const timeToHireData = [
   { stage: 'Applied to Screening', days: 3 },
   { stage: 'Screening to Shortlist', days: 5 },
   { stage: 'Shortlist to Interview', days: 7 },
   { stage: 'Interview to Offer', days: 10 },
   { stage: 'Offer to Hire', days: 5 },
];

// Additional exports for compatibility
export const mockJobSeekerStats = {
   totalApplications: 12,
   pendingApplications: 5,
   interviewsScheduled: 3,
   offersReceived: 1,
   profileViews: 48,
   profileStrength: 85,
   savedJobs: 8,
   assessmentsCompleted: 4,
};

export const mockAssessmentAssignments = mockCandidates.map((c, i) => ({
   id: `assign_${i + 1}`,
   candidateId: c.id,
   candidateName: c.fullName,
   jobId: c.jobId,
   jobTitle: c.appliedRole,
   assessmentId: `assess_${i + 1}`,
   assessmentTitle: ["React Skills Test", "JavaScript Fundamentals", "System Design", "SQL Assessment"][i % 4],
   status: ["pending", "in_progress", "completed", "pending"][i % 4] as "pending" | "in_progress" | "completed",
   score: i % 2 === 0 ? Math.floor(Math.random() * 40 + 60) : undefined,
   assignedAt: new Date(Date.now() - i * 86400000).toISOString(),
   deadline: new Date(Date.now() + (7 - i) * 86400000).toISOString(),
}));

export const mockAssessments = [
   { id: "assess_1", title: "React Skills Test", category: "Technical", duration: 60, questions: 30, difficulty: "Intermediate" },
   { id: "assess_2", title: "JavaScript Fundamentals", category: "Technical", duration: 45, questions: 25, difficulty: "Basic" },
   { id: "assess_3", title: "System Design", category: "Technical", duration: 90, questions: 10, difficulty: "Advanced" },
   { id: "assess_4", title: "SQL Assessment", category: "Technical", duration: 30, questions: 20, difficulty: "Intermediate" },
];

export const pipelineStages = [
   { id: "applied", name: "Applied", color: "#6B7280" },
   { id: "screening", name: "Screening", color: "#3B82F6" },
   { id: "shortlisted", name: "Shortlisted", color: "#8B5CF6" },
   { id: "interview_r1", name: "Interview R1", color: "#F59E0B" },
   { id: "hr_interview", name: "HR Interview", color: "#06B6D4" },
   { id: "offer", name: "Offer", color: "#10B981" },
   { id: "hired", name: "Hired", color: "#059669" },
];
