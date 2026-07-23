import { createContext, useContext, useCallback, useState, ReactNode, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSupabaseClient } from "@/integrations/supabase/client";
import { useAuth } from "./SimpleAuthContext";

export interface JobSeekerProfile {
  id?: string;
  full_name?: string;
  resume_url?: string;
  skills?: string[];
  headline?: string;
  avatar_url?: string;
  email?: string;
  phone?: string;
  location?: string;
  bio?: string;
}

export interface JobSeekerAssessment {
  id?: string;
  title?: string;
  category?: string;
  difficulty?: string;
  duration?: number;
  questions_count?: number;
}

export interface JobSeekerResult {
  id?: string;
  score?: number;
  assessment_id?: string;
  assessments?: { title?: string; category?: string; difficulty?: string };
  completed_at?: string;
  time_taken?: number;
}

export interface JobSeekerInterview {
  id?: string;
  title?: string;
  job_role?: string;
  status?: string;
  scheduled_at?: string;
  created_at?: string;
  duration?: number;
}

export interface JobSeekerCertificate {
  id?: string;
  title?: string;
  assessment_id?: string;
  status?: string;
  issued_at?: string;
}

export interface JobSeekerApplication {
  id?: string;
  job?: { title?: string; company_id?: string };
  status?: string;
  created_at?: string;
}

export interface JobSeekerNotification {
  id?: string;
  title?: string;
  message?: string;
  is_read?: boolean;
  type?: string;
  created_at?: string;
}

export interface JobSeekerData {
  profile: JobSeekerProfile | null;
  assessments: JobSeekerAssessment[];
  assessmentResults: JobSeekerResult[];
  interviews: JobSeekerInterview[];
  certificates: JobSeekerCertificate[];
  applications: JobSeekerApplication[];
  notifications: JobSeekerNotification[];
  profileCompletion: number;
  isUsingMockData?: boolean;
}

interface DashboardContextType {
  data: JobSeekerData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  updateAssessmentResult: (result: JobSeekerResult) => Promise<void>;
  completeInterview: (interviewId: string) => Promise<void>;
  markNotificationRead: (notificationId: string) => Promise<void>;
  getCertificateEligibility: () => Array<{ assessmentId?: string; title?: string; score?: number; completedAt?: string }>;
  generateInterviews: () => Promise<void>;
}

const mockData: JobSeekerData = {
  profile: {
    id: "mock-1",
    full_name: "Alex Johnson",
    email: "alex.johnson@email.com",
    headline: "Full Stack Developer | React & Node.js",
    skills: ["JavaScript", "React", "Node.js", "TypeScript", "PostgreSQL"],
    location: "San Francisco, CA",
    bio: "Passionate developer with 5 years of experience building web applications."
  },
  assessments: [
    { id: "a1", title: "JavaScript Fundamentals", category: "Technical", difficulty: "Easy", duration: 30, questions_count: 25 },
    { id: "a2", title: "React Advanced", category: "Technical", difficulty: "Hard", duration: 60, questions_count: 30 },
    { id: "a3", title: "Node.js Basics", category: "Technical", difficulty: "Medium", duration: 45, questions_count: 20 },
    { id: "a4", title: "SQL & Databases", category: "Technical", difficulty: "Medium", duration: 40, questions_count: 25 },
  ],
  assessmentResults: [
    { id: "r1", score: 85, assessment_id: "a1", assessments: { title: "JavaScript Fundamentals", difficulty: "Easy" }, completed_at: "2024-01-15T10:00:00Z", time_taken: 25 },
    { id: "r2", score: 72, assessment_id: "a3", assessments: { title: "Node.js Basics", difficulty: "Medium" }, completed_at: "2024-01-18T14:30:00Z", time_taken: 38 },
    { id: "r3", score: 91, assessment_id: "a2", assessments: { title: "React Advanced", difficulty: "Hard" }, completed_at: "2024-01-20T09:00:00Z", time_taken: 52 },
  ],
  interviews: [
    { id: "i1", title: "Frontend Developer Interview", job_role: "Frontend Developer", status: "completed", scheduled_at: "2024-01-10T14:00:00Z", created_at: "2024-01-08T10:00:00Z", duration: 45 },
    { id: "i2", title: "Technical Round", job_role: "Full Stack Developer", status: "scheduled", scheduled_at: "2024-01-25T10:00:00Z", created_at: "2024-01-20T10:00:00Z", duration: 60 },
    { id: "i3", title: "HR Interview", job_role: "Senior Developer", status: "completed", scheduled_at: "2024-01-12T16:00:00Z", created_at: "2024-01-10T10:00:00Z", duration: 30 },
  ],
  certificates: [
    { id: "c1", title: "JavaScript Fundamentals", assessment_id: "a1", status: "issued", issued_at: "2024-01-15T12:00:00Z" },
    { id: "c2", title: "React Advanced", assessment_id: "a2", status: "issued", issued_at: "2024-01-20T12:00:00Z" },
  ],
  applications: [
    { id: "app1", job: { title: "Frontend Developer", company_id: "comp1" }, status: "pending", created_at: "2024-01-22T10:00:00Z" },
    { id: "app2", job: { title: "Full Stack Developer", company_id: "comp2" }, status: "interview", created_at: "2024-01-20T10:00:00Z" },
  ],
  notifications: [
    { id: "n1", title: "Assessment Completed", message: "You scored 85% in JavaScript Fundamentals", is_read: false, type: "assessment", created_at: "2024-01-15T10:30:00Z" },
    { id: "n2", title: "Interview Scheduled", message: "Technical interview on Jan 25", is_read: false, type: "interview", created_at: "2024-01-20T11:00:00Z" },
    { id: "n3", title: "Certificate Earned", message: "Congratulations! You earned React Advanced Certificate", is_read: true, type: "certificate", created_at: "2024-01-20T12:00:00Z" },
  ],
  profileCompletion: 80,
  isUsingMockData: true
};

const JobSeekerDashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function JobSeekerDashboardProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [error, setError] = useState<Error | null>(null);
  const [useMockData, setUseMockData] = useState(false);

  // Check if backend is available
  useEffect(() => {
    const checkBackend = async () => {
      if (!user?.id) {
        setUseMockData(true);
        return;
      }
      try {
        const supabaseClient = getSupabaseClient();
        await supabaseClient.from("profiles").select("id").limit(1);
      } catch (err) {
        setUseMockData(true);
      }
    };
    checkBackend();
  }, [user?.id]);

  // Use mock data if no user or backend unavailable
  if (useMockData || !user?.id) {
    return (
      <JobSeekerDashboardContext.Provider
        value={{
          data: mockData,
          isLoading: false,
          error: null,
          refetch: () => {},
          updateAssessmentResult: async () => {},
          completeInterview: async () => {},
          markNotificationRead: async () => {},
          getCertificateEligibility: () => [
            { assessmentId: "a3", title: "Node.js Basics", score: 72, completedAt: "2024-01-18T14:30:00Z" }
          ],
          generateInterviews: async () => {},
        }}
      >
        {children}
      </JobSeekerDashboardContext.Provider>
    );
  }

  // Fetch real data from backend
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["jobseeker-full-profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const supabaseClient = getSupabaseClient();
      const { data, error } = await supabaseClient
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
    retry: 1,
  });

  const { data: assessments = [], isLoading: assessmentsLoading } = useQuery({
    queryKey: ["jobseeker-assessments", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const supabaseClient = getSupabaseClient();
      const { data, error } = await supabaseClient
        .from("assessments")
        .select("*")
        .eq("status", "active")
        .limit(20);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    retry: 1,
  });

  const { data: assessmentResults = [], isLoading: resultsLoading } = useQuery({
    queryKey: ["jobseeker-results", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const supabaseClient = getSupabaseClient();
      const { data, error } = await supabaseClient
        .from("assessment_results")
        .select("*, assessments(title, category, difficulty)")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    retry: 1,
  });

  const { data: interviews = [], isLoading: interviewsLoading } = useQuery({
    queryKey: ["jobseeker-interviews", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const supabaseClient = getSupabaseClient();
      const { data, error } = await supabaseClient
        .from("ai_interviews")
        .select("*, interview_questions(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Error fetching interviews:", error);
        return [];
      }
      return data || [];
    },
    enabled: !!user?.id,
    retry: 1,
  });

  const generateInterviews = useCallback(async () => {
    if (!user?.id) return;
    const supabaseClient = getSupabaseClient();
    const domains = ["Web Development", "Data Structures", "Databases", "AI", "DevOps", "System Design"];
    for (const category of domains) {
      const title = `${category} Technical Interview`;
      const { data: interviewData, error: interviewError } = await supabaseClient
        .from("ai_interviews")
        .insert({
          user_id: user.id,
          title,
          category,
          description: `Technical interview covering ${category} topics. 20 questions.`,
          status: "upcoming",
          total_questions: 20,
        })
        .select()
        .single();
      if (interviewError) {
        console.error("Error creating interview:", interviewError);
        continue;
      }
      const { itInterviewDomains } = await import("@/data/itInterviewQuestions");
      const domain = itInterviewDomains.find(d => d.name === category);
      if (domain) {
        const questions = domain.questions.map((q, i) => ({
          interview_id: interviewData.id,
          question_text: q.question_text,
          question_type: q.question_type,
          difficulty: q.difficulty,
          category: q.category,
          order_index: i + 1,
          points: q.points,
        }));
        await supabaseClient.from("interview_questions").insert(questions);
      }
    }
    queryClient.invalidateQueries({ queryKey: ["jobseeker-interviews", user.id] });
  }, [user?.id, queryClient]);

  const { data: certificates = [], isLoading: certificatesLoading } = useQuery({
    queryKey: ["jobseeker-certificates", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const supabaseClient = getSupabaseClient();
      const { data, error } = await supabaseClient
        .from("certificates")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "issued");
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    retry: 1,
  });

  const { data: applications = [], isLoading: applicationsLoading } = useQuery({
    queryKey: ["jobseeker-applications", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const supabaseClient = getSupabaseClient();
      // Applications are tracked as rows in `candidates` (job_id + user_id),
      // not a separate applications table.
      const { data, error } = await supabaseClient
        .from("candidates")
        .select("*, jobs(title, company_id)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    retry: 1,
  });

  const { data: notifications = [], isLoading: notificationsLoading } = useQuery({
    queryKey: ["jobseeker-notifications", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const supabaseClient = getSupabaseClient();
      const { data, error } = await supabaseClient
        .from("job_seeker_notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    retry: 1,
    refetchInterval: 30000,
  });

  const profileCompletion = useCallback(() => {
    if (!profile) return 0;
    const items = [
      !!profile.full_name,
      !!profile.resume_url,
      (profile.skills?.length || 0) > 0,
      !!profile.headline,
      !!profile.avatar_url,
    ];
    return Math.round((items.filter(Boolean).length / items.length) * 100);
  }, [profile]);

  const updateAssessmentResult = useCallback(
    async (result: JobSeekerResult) => {
      if (!user?.id || !result.id) return;
      const supabaseClient = getSupabaseClient();
      const { error } = await supabaseClient
        .from("assessment_results")
        .update(result)
        .eq("id", result.id)
        .eq("user_id", user.id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["jobseeker-results", user.id] });
    },
    [user?.id, queryClient]
  );

  const completeInterview = useCallback(
    async (interviewId: string) => {
      if (!user?.id) return;
      const supabaseClient = getSupabaseClient();
      const { error } = await supabaseClient
        .from("ai_interviews")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", interviewId)
        .eq("user_id", user.id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["jobseeker-interviews", user.id] });
    },
    [user?.id, queryClient]
  );

  const markNotificationRead = useCallback(
    async (notificationId: string) => {
      if (!user?.id) return;
      const supabaseClient = getSupabaseClient();
      const { error } = await supabaseClient
        .from("job_seeker_notifications")
        .update({ is_read: true })
        .eq("id", notificationId)
        .eq("user_id", user.id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["jobseeker-notifications", user.id] });
    },
    [user?.id, queryClient]
  );

  const getCertificateEligibility = useCallback(() => {
    return assessmentResults
      .filter((result) => (result.score ?? 0) >= 70)
      .filter((result) => !certificates.some((cert) => cert.assessment_id === result.assessment_id))
      .map((result) => ({
        assessmentId: result.assessment_id,
        title: result.assessments?.title,
        score: result.score,
        completedAt: result.completed_at,
      }));
  }, [assessmentResults, certificates]);

  const isLoading =
    profileLoading ||
    assessmentsLoading ||
    resultsLoading ||
    interviewsLoading ||
    certificatesLoading ||
    applicationsLoading ||
    notificationsLoading;

  const data: JobSeekerData | null = {
    profile,
    assessments,
    assessmentResults,
    interviews,
    certificates,
    applications,
    notifications,
    profileCompletion: profileCompletion(),
    isUsingMockData: false
  };

  return (
    <JobSeekerDashboardContext.Provider
      value={{
        data,
        isLoading,
        error,
        refetch: () => {
          queryClient.invalidateQueries({ queryKey: ["jobseeker-full-profile"] });
          queryClient.invalidateQueries({ queryKey: ["jobseeker-assessments"] });
          queryClient.invalidateQueries({ queryKey: ["jobseeker-results"] });
          queryClient.invalidateQueries({ queryKey: ["jobseeker-interviews"] });
          queryClient.invalidateQueries({ queryKey: ["jobseeker-certificates"] });
          queryClient.invalidateQueries({ queryKey: ["jobseeker-applications"] });
        },
        updateAssessmentResult,
        completeInterview,
        markNotificationRead,
        getCertificateEligibility,
        generateInterviews,
      }}
    >
      {children}
    </JobSeekerDashboardContext.Provider>
  );
}

export const useJobSeekerDashboard = () => {
  const context = useContext(JobSeekerDashboardContext);
  if (!context) {
    throw new Error("useJobSeekerDashboard must be used within JobSeekerDashboardProvider");
  }
  return context;
};