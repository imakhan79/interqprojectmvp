import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from "react";
import { Suspense, lazy } from "react";
import { SimpleAuthProvider } from "@/contexts/SimpleAuthContext";
import { JobSeekerDashboardProvider } from "@/contexts/JobSeekerDashboardContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ChatbotWidget } from "@/components/chatbot/ChatbotWidget";

const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const GetStarted = lazy(() => import("./pages/GetStarted"));
const DemoAccess = lazy(() => import("./pages/DemoAccess"));
const Product = lazy(() => import("./pages/Product"));
const Features = lazy(() => import("./pages/Features"));
const Integrations = lazy(() => import("./pages/Integrations"));
const Assessments = lazy(() => import("./pages/Assessments"));
const TakeAssessment = lazy(() => import("./pages/TakeAssessment"));
const Solutions = lazy(() => import("./pages/Solutions"));
const Pricing = lazy(() => import("./pages/Pricing"));
const About = lazy(() => import("./pages/About"));
const PressKit = lazy(() => import("./pages/PressKit"));
const Partners = lazy(() => import("./pages/Partners"));
const Contact = lazy(() => import("./pages/Contact"));
const Settings = lazy(() => import("./pages/Settings"));
const NotFound = lazy(() => import("./pages/NotFound"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const Blog = lazy(() => import("./pages/Blog"));
const Documentation = lazy(() => import("./pages/Documentation"));
const CaseStudies = lazy(() => import("./pages/CaseStudies"));
const HelpCenter = lazy(() => import("./pages/HelpCenter"));
const AdminJobs = lazy(() => import("./pages/admin/Jobs"));
const ApplyPage = lazy(() => import("./pages/candidate/Apply"));
const Careers = lazy(() => import("./pages/Careers"));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout").then(m => ({ default: m.AdminLayout })));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminResults = lazy(() => import("./pages/admin/AdminResults"));
const AdminResultDetail = lazy(() => import("./pages/admin/AdminResultDetail"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminReports = lazy(() => import("./pages/admin/Reports"));
const AssessmentPromptGenerator = lazy(() => import("./pages/admin/AssessmentPromptGenerator"));
const CreateAssessment = lazy(() => import("./pages/CreateAssessment"));
const AssessmentWorkflowPage = lazy(() => import("./pages/AssessmentWorkflowPage"));
const ATSScreening = lazy(() => import("./pages/admin/ATSScreening"));
const CollaborativeScoring = lazy(() => import("./pages/admin/CollaborativeScoring"));
const PipelineDashboard = lazy(() => import("./pages/admin/PipelineDashboard"));
const TestManagement = lazy(() => import("./pages/admin/TestManagement"));
const QuestionBank = lazy(() => import("./pages/admin/QuestionBank"));
const InterviewManagement = lazy(() => import("./pages/admin/InterviewManagement"));
const CompanyManagement = lazy(() => import("./pages/admin/CompanyManagement"));
const ApprovalsQueue = lazy(() => import("./pages/admin/ApprovalsQueue"));
const JobSeekerManagement = lazy(() => import("./pages/admin/JobSeekerManagement"));
const CertificateManagement = lazy(() => import("./pages/admin/CertificateManagement"));
const ActivityLogs = lazy(() => import("./pages/admin/ActivityLogs"));
const RoleManagement = lazy(() => import("./pages/admin/RoleManagement"));
const AdminOffersManagement = lazy(() => import("./pages/admin/OffersManagement"));
const AdminBillingPage = lazy(() => import("./pages/admin/AdminBilling"));
const AdminIntegrationsPage = lazy(() => import("./pages/admin/AdminIntegrations"));
const AdminSecurityPage = lazy(() => import("./pages/admin/AdminSecurity"));
const AdminAuditLogsPage = lazy(() => import("./pages/admin/AdminAuditLogs"));
const BookSession = lazy(() => import("./pages/BookSession"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const EvaluationReport = lazy(() => import("./pages/EvaluationReport"));
const ProfessionalEvaluationReport = lazy(() => import("./pages/ProfessionalEvaluationReport"));
const Guidelines = lazy(() => import("./pages/Guidelines"));
const ExpertPortal = lazy(() => import("./pages/ExpertPortal"));
const CandidatePortal = lazy(() => import("./pages/CandidatePortal"));
const CompanySignup = lazy(() => import("./pages/company/CompanySignup"));
const JoinCompany = lazy(() => import("./pages/JoinCompany"));
const CompanyTeam = lazy(() => import("./pages/company/CompanyTeam"));
const CompanyLayout = lazy(() => import("./components/company/CompanyLayout").then(m => ({ default: m.CompanyLayout })));
const CompanyDashboard = lazy(() => import("./pages/company/CompanyDashboard"));
const CompanyJobs = lazy(() => import("./pages/company/CompanyJobs"));
const CompanyCandidates = lazy(() => import("./pages/company/CompanyCandidates"));
const CompanyTests = lazy(() => import("./pages/company/CompanyTests"));
const CompanyInterviews = lazy(() => import("./pages/company/CompanyInterviews"));
const CompanyResults = lazy(() => import("./pages/company/CompanyResults"));
const CompanyNotifications = lazy(() => import("./pages/company/CompanyNotifications"));
const CompanyAuditLogs = lazy(() => import("./pages/company/CompanyAuditLogs"));
const CompanySettings = lazy(() => import("./pages/company/CompanySettings"));
import { RecruiterLayout } from "./components/recruiter/RecruiterLayout";
import UserTeamsDashboard from "./components/admin/UserTeamsDashboard";

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: string}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: '' };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="text-red-500">{this.state.error}</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
const RecruiterDashboard = lazy(() => import("./pages/recruiter/RecruiterDashboard"));
const RecruiterPipeline = lazy(() => import("./pages/recruiter/Pipeline"));
const RecruiterAssessments = lazy(() => import("./pages/recruiter/Assessments"));
const RecruiterInterviews = lazy(() => import("./pages/recruiter/Interviews"));
const RecruiterCandidates = lazy(() => import("./pages/recruiter/Candidates"));
const RecruiterJobOpenings = lazy(() => import("./pages/recruiter/JobOpenings"));
const RecruiterOffers = lazy(() => import("./pages/recruiter/Offers"));
const RecruiterReports = lazy(() => import("./pages/recruiter/RecruiterReports"));
const RecruiterSettings = lazy(() => import("./pages/recruiter/Settings"));
const EvaluationReports = lazy(() => import("./pages/recruiter/DynamicEvaluationReports"));
const JobSeekerLayout = lazy(() => import("./components/jobseeker/JobSeekerLayout").then(m => ({ default: m.JobSeekerLayout })));
const JobSeekerDashboard = lazy(() => import("./pages/jobseeker/JobSeekerDashboard"));
const JobBoard = lazy(() => import("./pages/jobseeker/JobBoard"));
const JobDetail = lazy(() => import("./pages/jobseeker/JobDetail"));
const JobSeekerAssessments = lazy(() => import("./pages/jobseeker/JobSeekerAssessments"));
const JobSeekerInterviews = lazy(() => import("./pages/jobseeker/Interviews"));
const InterviewSession = lazy(() => import("./pages/jobseeker/InterviewSession"));
const JobSeekerApplications = lazy(() => import("./pages/jobseeker/Applications"));
const JobSeekerResults = lazy(() => import("./pages/jobseeker/JobSeekerResults"));
const JobSeekerOffers = lazy(() => import("./pages/jobseeker/JobSeekerOffers"));
const JobSeekerCertificates = lazy(() => import("./pages/jobseeker/JobSeekerCertificates"));
const JobSeekerProfile = lazy(() => import("./pages/jobseeker/JobSeekerProfile"));
const JobSeekerPrivacy = lazy(() => import("./pages/jobseeker/JobSeekerPrivacy"));
const JobSeekerGuidelines = lazy(() => import("./pages/jobseeker/JobSeekerGuidelines"));
const JobSeekerNotifications = lazy(() => import("./pages/jobseeker/Notifications"));
const JobSeekerSettings = lazy(() => import("./pages/jobseeker/JobSeekerSettings"));
const LegalPage = ({ title, content }: { title: string; content: string }) => (
  <div className="min-h-screen bg-background">
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold mb-6">{title}</h1>
      <div className="prose prose-gray max-w-none">
        <p className="text-muted-foreground leading-relaxed text-lg">{content}</p>
      </div>
      <div className="mt-8 p-4 bg-muted rounded-lg text-sm text-muted-foreground">
        Last updated: March 2026 · Questions? Contact <a href="mailto:legal@interq.com" className="text-blue-600 hover:underline">legal@interq.com</a>
      </div>
    </div>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SimpleAuthProvider>
          <JobSeekerDashboardProvider>
            <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>


            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/get-started" element={<GetStarted />} />
              <Route path="/demo-access" element={<DemoAccess />} />
              <Route path="/product" element={<Product />} />
              <Route path="/features" element={<Features />} />
              <Route path="/assessments" element={<Assessments />} />
              <Route path="/assessment/:id" element={<TakeAssessment />} />
              <Route path="/assessment-workflow" element={<AssessmentWorkflowPage />} />
              <Route path="/create-assessment" element={<CreateAssessment />} />
              <Route path="/platform-integrations" element={<Integrations />} />
              <Route path="/solutions" element={<Solutions />} />
              <Route path="/solutions/recruiters" element={<Solutions />} />
              <Route path="/for-recruiters" element={<Solutions />} />
              <Route path="/solutions/enterprise" element={<Solutions />} />
              <Route path="/for-organizational-hiring" element={<Solutions />} />
              <Route path="/solutions/sme" element={<Solutions />} />
              <Route path="/for-smes" element={<Solutions />} />
              <Route path="/solutions/industry" element={<Solutions />} />
              <Route path="/industry-solutions" element={<Solutions />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/about" element={<About />} />
              <Route path="/press-kit" element={<PressKit />} />
              <Route path="/partners" element={<Partners />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/docs" element={<Documentation />} />
              <Route path="/case-studies" element={<CaseStudies />} />
              <Route path="/help-center" element={<HelpCenter />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/book-session" element={<BookSession />} />
              {/* /dashboard already defined above as unified dashboard */}
              <Route path="/evaluation-report" element={<EvaluationReport />} />
              <Route path="/professional-report" element={<ProfessionalEvaluationReport />} />
              <Route path="/guidelines" element={<Guidelines />} />
              <Route path="/expert-portal" element={<ExpertPortal />} />
              <Route path="/candidate-portal" element={<CandidatePortal />} />
              <Route path="/company-signup" element={<CompanySignup />} />
              <Route path="/join-company" element={<JoinCompany />} />
              <Route path="/company" element={<ProtectedRoute allowedRoles={["company"]}><CompanyLayout /></ProtectedRoute>}>
                <Route index element={<CompanyDashboard />} />
                <Route path="jobs" element={<CompanyJobs />} />
                <Route path="candidates" element={<CompanyCandidates />} />
                <Route path="tests" element={<CompanyTests />} />
                <Route path="interviews" element={<CompanyInterviews />} />
                <Route path="results" element={<CompanyResults />} />
                <Route path="team" element={<CompanyTeam />} />
                <Route path="notifications" element={<CompanyNotifications />} />
                <Route path="logs" element={<CompanyAuditLogs />} />
                <Route path="settings" element={<CompanySettings />} />
              </Route>
              <Route path="/jobseeker" element={<ProtectedRoute allowedRoles={["jobseeker"]}><JobSeekerLayout /></ProtectedRoute>}>
                <Route index element={<JobSeekerDashboard />} />
                <Route path="jobs" element={<JobBoard />} />
                <Route path="jobs/:id" element={<JobDetail />} />
                <Route path="applications" element={<JobSeekerApplications />} />
                <Route path="assessments" element={<JobSeekerAssessments />} />
                <Route path="interviews" element={<JobSeekerInterviews />} />
                <Route path="interview/:id" element={<InterviewSession />} />
                <Route path="results" element={<JobSeekerResults />} />
                <Route path="offers" element={<JobSeekerOffers />} />
                <Route path="certificates" element={<JobSeekerCertificates />} />
                <Route path="profile" element={<JobSeekerProfile />} />
                <Route path="privacy" element={<JobSeekerPrivacy />} />
                <Route path="guidelines" element={<JobSeekerGuidelines />} />
                <Route path="notifications" element={<JobSeekerNotifications />} />
                <Route path="settings" element={<JobSeekerSettings />} />
              </Route>
              <Route path="/privacy-policy" element={<LegalPage title="Privacy Policy" content="InterQ collects and processes personal data to provide recruitment services. We never sell your data to third parties. Data is stored securely and you may request deletion at any time by contacting privacy@interq.com. We use cookies for authentication and analytics only." />} />
              <Route path="/terms-of-service" element={<LegalPage title="Terms of Service" content="By using InterQ, you agree to use the platform lawfully and professionally. Companies agree not to discriminate in hiring. Job seekers agree to provide accurate information. InterQ reserves the right to terminate accounts that violate these terms. Full terms available on request." />} />
              <Route path="/cookie-policy" element={<LegalPage title="Cookie Policy" content="InterQ uses essential cookies for authentication, preference cookies for your settings, and analytics cookies to improve our service. You may disable non-essential cookies in your browser settings. We do not use advertising cookies." />} />
              <Route path="/gdpr" element={<LegalPage title="GDPR Compliance" content="InterQ is GDPR compliant. EU users have the right to access, rectify, erase, and port their data. You may withdraw consent at any time. Our Data Protection Officer can be reached at dpo@interq.com. Data is processed under legitimate interest for recruitment services." />} />
              <Route path="/api-docs" element={<LegalPage title="API Documentation" content="InterQ provides a RESTful API for enterprise integrations. Authentication uses JWT tokens. Key endpoints: POST /api/jobs, GET /api/candidates, POST /api/interviews. Rate limit: 1000 requests/hour. Contact api@interq.com for access keys and full documentation." />} />
              <Route path="/partner-application" element={<LegalPage title="Partner Application" content="Interested in becoming an InterQ partner? We work with HR consultancies, staffing agencies, and technology providers. Partners receive revenue sharing, co-marketing support, and dedicated account management. Email partners@interq.com with your company details to apply." />} />
              <Route path="/newsletter" element={<LegalPage title="Newsletter" content="Subscribe to the InterQ newsletter for hiring trends, platform updates, and best practices. We send 2-4 emails per month. Email newsletter@interq.com with 'Subscribe' in the subject line, or unsubscribe at any time using the link in any email." />} />
              <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><ErrorBoundary><AdminLayout /></ErrorBoundary></ProtectedRoute>}>
                <Route index element={<AdminDashboard />} />
                <Route path="tests" element={<TestManagement />} />
                <Route path="question-bank" element={<QuestionBank />} />
                <Route path="prompt-generator" element={<AssessmentPromptGenerator />} />
                <Route path="results" element={<AdminResults />} />
                <Route path="results/:id" element={<AdminResultDetail />} />
                <Route path="interviews" element={<InterviewManagement />} />
                <Route path="certificates" element={<CertificateManagement />} />
                <Route path="companies" element={<CompanyManagement />} />
                <Route path="approvals" element={<ApprovalsQueue />} />
                <Route path="job-seekers" element={<JobSeekerManagement />} />
                <Route path="logs" element={<ActivityLogs />} />
                <Route path="role-management" element={<RoleManagement />} />
                <Route path="pipeline" element={<PipelineDashboard />} />
                <Route path="jobs" element={<AdminJobs />} />
                <Route path="ats-screening" element={<ATSScreening />} />
                <Route path="scoring" element={<CollaborativeScoring />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="users" element={<UserTeamsDashboard />} />
                <Route path="offers" element={<AdminOffersManagement />} />
                <Route path="billing" element={<AdminBillingPage />} />
                <Route path="integrations" element={<AdminIntegrationsPage />} />
                <Route path="security" element={<AdminSecurityPage />} />
                <Route path="audit-logs" element={<AdminAuditLogsPage />} />
              </Route>
              <Route path="/recruiter" element={<ProtectedRoute allowedRoles={["recruiter"]}><ErrorBoundary><RecruiterLayout /></ErrorBoundary></ProtectedRoute>}>
                <Route index element={<RecruiterDashboard />} />
                <Route path="evaluation-reports" element={<EvaluationReports />} />
                <Route path="jobs" element={<RecruiterJobOpenings />} />
                <Route path="candidates" element={<RecruiterCandidates />} />
                <Route path="pipeline" element={<RecruiterPipeline />} />
                <Route path="interviews" element={<RecruiterInterviews />} />
                <Route path="assessments" element={<RecruiterAssessments />} />
                <Route path="offers" element={<RecruiterOffers />} />
                <Route path="reports" element={<RecruiterReports />} />
                <Route path="settings" element={<RecruiterSettings />} />
              </Route>
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />

            </Routes>
            <ChatbotWidget />
          </Suspense>
          </JobSeekerDashboardProvider>
        </SimpleAuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
