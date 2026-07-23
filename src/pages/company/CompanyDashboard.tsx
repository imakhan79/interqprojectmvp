import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useCompanyId } from '@/hooks/useCompanyId';
import {
  Building2,
  Users,
  Briefcase,
  Plus,
  Search,
  MapPin,
  Globe,
  Calendar,
  Mail,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  UserPlus,
  FileText,
  BarChart3,
  Loader2,
  RefreshCw
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  Legend
} from 'recharts';

const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444'];

interface Company {
  id: string;
  name: string;
  email?: string;
  logo_url?: string;
  website?: string;
  industry?: string;
  company_size?: string;
  location?: string;
  description?: string;
  created_at: string;
}

interface Job {
  id: string;
  company_id: string;
  title: string;
  department?: string;
  location?: string;
  employment_type?: string;
  salary_min?: number;
  salary_max?: number;
  description?: string;
  status: 'open' | 'closed' | 'draft';
  created_at: string;
  created_by?: string;
}

interface Candidate {
  id: string;
  company_id: string;
  job_id?: string;
  full_name: string;
  email?: string;
  phone?: string;
  current_title?: string;
  location?: string;
  status: string;
  source?: string;
  skills?: string[];
  rating?: number;
  created_at: string;
}

interface DashboardStats {
  totalJobs: number;
  openJobs: number;
  closedJobs: number;
  totalCandidates: number;
  pendingReview: number;
  interviewsScheduled: number;
  offersSent: number;
  hiresCompleted: number;
}

export default function CompanyDashboard() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0,
    openJobs: 0,
    closedJobs: 0,
    totalCandidates: 0,
    pendingReview: 0,
    interviewsScheduled: 0,
    offersSent: 0,
    hiresCompleted: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    website: '',
    industry: '',
    company_size: '',
    location: '',
    description: ''
  });
  const [jobForm, setJobForm] = useState({
    title: '',
    department: '',
    location: '',
    employment_type: 'Full-time',
    salary_min: 0,
    salary_max: 0,
    description: '',
    status: 'open' as const
  });

  const { user } = useAuth();
  const { companyId: resolvedCompanyId, loading: companyIdLoading } = useCompanyId();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [noCompany, setNoCompany] = useState(false);

  const loadData = useCallback(async () => {
    if (companyIdLoading) return;
    setLoading(true);
    try {
      if (!resolvedCompanyId) {
        setNoCompany(true);
        setCompany(null);
        setJobs([]);
        setCandidates([]);
        return;
      }
      setNoCompany(false);
      setCompanyId(resolvedCompanyId);

      // Demo accounts have no real Supabase session (anon role), so the
      // companies/jobs/candidates RLS policies (scoped to `authenticated`)
      // reject these reads. Show the same zero-state a real new company
      // would see instead of a background fetch that's guaranteed to fail.
      if (user?.isDemo) {
        setCompany({
          id: resolvedCompanyId,
          name: user.companyName || 'TechCorp Solutions',
          created_at: new Date().toISOString(),
        });
        setJobs([]);
        setCandidates([]);
        setStats({
          totalJobs: 0,
          openJobs: 0,
          closedJobs: 0,
          totalCandidates: 0,
          pendingReview: 0,
          interviewsScheduled: 0,
          offersSent: 0,
          hiresCompleted: 0,
        });
        return;
      }

      // Fetch company
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', resolvedCompanyId)
        .single();

      if (companyError && companyError.code !== 'PGRST116') {
        console.error('Error fetching company:', companyError);
      } else if (companyData) {
        setCompany(companyData);
      }

      // Fetch jobs
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .eq('company_id', resolvedCompanyId)
        .order('created_at', { ascending: false });

      if (jobsError) {
        console.error('Error fetching jobs:', jobsError);
      } else {
        setJobs(jobsData || []);
      }

      // Fetch candidates
      const { data: candidatesData, error: candidatesError } = await supabase
        .from('candidates')
        .select('*')
        .eq('company_id', resolvedCompanyId)
        .order('created_at', { ascending: false });

      if (candidatesError) {
        console.error('Error fetching candidates:', candidatesError);
      } else {
        setCandidates(candidatesData || []);
      }

      // Calculate stats
      const jobsList = jobsData || [];
      const candidatesList = candidatesData || [];

      setStats({
        totalJobs: jobsList.length,
        openJobs: jobsList.filter(j => j.status === 'open').length,
        closedJobs: jobsList.filter(j => j.status === 'closed').length,
        totalCandidates: candidatesList.length,
        pendingReview: candidatesList.filter(c => c.status === 'applied' || c.status === 'screening').length,
        interviewsScheduled: candidatesList.filter(c => c.status === 'interview').length,
        offersSent: candidatesList.filter(c => c.status === 'offer').length,
        hiresCompleted: candidatesList.filter(c => c.status === 'hired').length
      });

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error loading data',
        description: 'Failed to fetch data from Supabase. Please check your connection.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [resolvedCompanyId, companyIdLoading, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    toast({ title: 'Data refreshed successfully' });
  };

  const handleUpdateCompany = async () => {
    if (!company) return;

    if (!editForm.name.trim()) {
      toast({ title: 'Company name is required', variant: 'destructive' });
      return;
    }

    if (editForm.website && !editForm.website.startsWith('http')) {
      toast({ title: 'Invalid website URL', description: 'Please start with http:// or https://', variant: 'destructive' });
      return;
    }

    try {
      const { error } = await supabase
        .from('companies')
        .update({
          name: editForm.name.trim(),
          email: editForm.email?.trim() || null,
          website: editForm.website?.trim() || null,
          industry: editForm.industry || null,
          company_size: editForm.company_size || null,
          location: editForm.location?.trim() || null,
          description: editForm.description?.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', company.id);

      if (error) throw error;

      await loadData();
      setEditModalOpen(false);
      toast({ title: 'Company updated successfully' });
    } catch (error) {
      console.error('Error updating company:', error);
      toast({ title: 'Failed to update company', variant: 'destructive' });
    }
  };

  const handleCreateJob = async () => {
    if (!jobForm.title.trim()) {
      toast({ title: 'Job title is required', variant: 'destructive' });
      return;
    }

    try {
      if (editingJob) {
        const { error } = await supabase
          .from('jobs')
          .update({
            title: jobForm.title.trim(),
            department: jobForm.department || null,
            location: jobForm.location?.trim() || null,
            employment_type: jobForm.employment_type,
            salary_min: jobForm.salary_min || null,
            salary_max: jobForm.salary_max || null,
            description: jobForm.description?.trim() || null,
            status: jobForm.status,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingJob.id);

        if (error) throw error;
        toast({ title: 'Job updated successfully' });
      } else {
        if (!companyId) {
          toast({ title: 'No company found for your account', variant: 'destructive' });
          return;
        }
        const { error } = await supabase
          .from('jobs')
          .insert({
            company_id: companyId,
            title: jobForm.title.trim(),
            department: jobForm.department || null,
            location: jobForm.location?.trim() || null,
            employment_type: jobForm.employment_type,
            salary_min: jobForm.salary_min || null,
            salary_max: jobForm.salary_max || null,
            description: jobForm.description?.trim() || null,
            status: jobForm.status
          });

        if (error) throw error;
        toast({ title: 'Job created successfully' });
      }

      await loadData();
      setJobModalOpen(false);
      setEditingJob(null);
      setJobForm({
        title: '',
        department: '',
        location: '',
        employment_type: 'Full-time',
        salary_min: 0,
        salary_max: 0,
        description: '',
        status: 'open'
      });
    } catch (error) {
      console.error('Error saving job:', error);
      toast({ title: 'Failed to save job', variant: 'destructive' });
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) throw error;

      await loadData();
      toast({ title: 'Job deleted successfully' });
    } catch (error) {
      console.error('Error deleting job:', error);
      toast({ title: 'Failed to delete job', variant: 'destructive' });
    }
  };

  const handleUpdateCandidateStatus = async (candidateId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('candidates')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', candidateId);

      if (error) throw error;

      await loadData();
      toast({ title: 'Candidate status updated' });
    } catch (error) {
      console.error('Error updating candidate:', error);
      toast({ title: 'Failed to update candidate', variant: 'destructive' });
    }
  };

  const openEditModal = () => {
    if (company) {
      setEditForm({
        name: company.name || '',
        email: company.email || '',
        website: company.website || '',
        industry: company.industry || '',
        company_size: company.company_size || '',
        location: company.location || '',
        description: company.description || ''
      });
      setEditModalOpen(true);
    }
  };

  const openJobModal = (job?: Job) => {
    if (job) {
      setEditingJob(job);
      setJobForm({
        title: job.title,
        department: job.department || '',
        location: job.location || '',
        employment_type: job.employment_type || 'Full-time',
        salary_min: job.salary_min || 0,
        salary_max: job.salary_max || 0,
        description: job.description || '',
        status: job.status
      });
    } else {
      setEditingJob(null);
      setJobForm({
        title: '',
        department: '',
        location: '',
        employment_type: 'Full-time',
        salary_min: 0,
        salary_max: 0,
        description: '',
        status: 'open'
      });
    }
    setJobModalOpen(true);
  };

  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = !searchQuery || 
      c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.current_title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open': return <Badge className="bg-green-100 text-green-800">Open</Badge>;
      case 'closed': return <Badge className="bg-gray-100 text-gray-800">Closed</Badge>;
      case 'draft': return <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>;
      case 'applied': return <Badge className="bg-blue-100 text-blue-800">Applied</Badge>;
      case 'screening': return <Badge className="bg-purple-100 text-purple-800">Screening</Badge>;
      case 'interview': return <Badge className="bg-indigo-100 text-indigo-800">Interview</Badge>;
      case 'offer': return <Badge className="bg-pink-100 text-pink-800">Offer</Badge>;
      case 'hired': return <Badge className="bg-green-100 text-green-800">Hired</Badge>;
      case 'rejected': return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pipeline = {
    applied: candidates.filter(c => c.status === 'applied').length,
    screening: candidates.filter(c => c.status === 'screening').length,
    interview: candidates.filter(c => c.status === 'interview').length,
    offer: candidates.filter(c => c.status === 'offer').length,
    hired: candidates.filter(c => c.status === 'hired').length
  };

  const pipelineChartData = [
    { name: 'Applied', value: pipeline.applied },
    { name: 'Screening', value: pipeline.screening },
    { name: 'Interview', value: pipeline.interview },
    { name: 'Offer', value: pipeline.offer },
    { name: 'Hired', value: pipeline.hired },
  ];

  const applicationsTrend = [
    { month: 'Jan', applications: 45, hires: 3 },
    { month: 'Feb', applications: 52, hires: 5 },
    { month: 'Mar', applications: 48, hires: 4 },
    { month: 'Apr', applications: 61, hires: 6 },
    { month: 'May', applications: 55, hires: 4 },
    { month: 'Jun', applications: 70, hires: 8 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading data from Supabase...</span>
      </div>
    );
  }

  if (noCompany) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center gap-4 px-4">
        <Building2 className="h-12 w-12 text-muted-foreground" />
        <div>
          <h2 className="text-xl font-semibold">No company workspace yet</h2>
          <p className="text-muted-foreground mt-1 max-w-md">
            Your account isn't linked to a company workspace. Create one to start posting jobs and managing candidates.
          </p>
        </div>
        <Button onClick={() => navigate('/company-signup')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Company Workspace
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-slate-100 dark:border-slate-800 shadow-md">
            {company?.logo_url ? (
              <AvatarImage src={company.logo_url} alt={company.name} />
            ) : (
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xl">
                {company?.name?.slice(0, 2).toUpperCase() || 'TC'}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{company?.name || 'Company Dashboard'}</h1>
            <p className="text-muted-foreground flex items-center gap-2 flex-wrap">
              {company?.industry && <span>{company.industry}</span>}
              {company?.location && (
                <>
                  {company.industry && <span>•</span>}
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{company.location}</span>
                </>
              )}
              {company?.website && (
                <>
                  {(company.industry || company.location) && <span>•</span>}
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                    <Globe className="h-3 w-3" />Website
                  </a>
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={openEditModal}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Jobs</p>
                <p className="text-2xl font-bold">{stats.totalJobs}</p>
              </div>
              <div className="p-2 bg-blue-500/10 rounded-lg"><Briefcase className="h-5 w-5 text-blue-600" /></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open Positions</p>
                <p className="text-2xl font-bold text-green-600">{stats.openJobs}</p>
              </div>
              <div className="p-2 bg-green-500/10 rounded-lg"><CheckCircle className="h-5 w-5 text-green-600" /></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Candidates</p>
                <p className="text-2xl font-bold">{stats.totalCandidates}</p>
              </div>
              <div className="p-2 bg-purple-500/10 rounded-lg"><Users className="h-5 w-5 text-purple-600" /></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Hires (This Month)</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.hiresCompleted}</p>
              </div>
              <div className="p-2 bg-emerald-500/10 rounded-lg"><UserPlus className="h-5 w-5 text-emerald-600" /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="candidates">Candidates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Hiring Pipeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: 'Applied', value: pipeline.applied, color: 'bg-blue-500' },
                    { label: 'Screening', value: pipeline.screening, color: 'bg-purple-500' },
                    { label: 'Interview', value: pipeline.interview, color: 'bg-indigo-500' },
                    { label: 'Offer', value: pipeline.offer, color: 'bg-pink-500' },
                    { label: 'Hired', value: pipeline.hired, color: 'bg-green-500' },
                  ].map((stage) => (
                    <div key={stage.label} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{stage.label}</span>
                        <span className="font-semibold">{stage.value}</span>
                      </div>
                      <Progress value={(stage.value / Math.max(stats.totalCandidates, 1)) * 100} className={`h-2 ${stage.color}`} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />Recent Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {candidates.slice(0, 5).map((candidate) => (
                    <div key={candidate.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">{candidate.full_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{candidate.full_name}</p>
                          <p className="text-xs text-muted-foreground">{candidate.current_title}</p>
                        </div>
                      </div>
                      {getStatusBadge(candidate.status)}
                    </div>
                  ))}
                  {candidates.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">No candidates yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Jobs Tab */}
        <TabsContent value="jobs">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle>Job Postings ({jobs.length})</CardTitle>
                <Button onClick={() => openJobModal()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Job
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div key={job.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{job.title}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          {job.department && <span>{job.department}</span>}
                          {job.department && job.location && <span>•</span>}
                          {job.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(job.status)}
                        <Button variant="ghost" size="sm" onClick={() => openJobModal(job)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteJob(job.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Users className="h-4 w-4" />{candidates.filter(c => c.job_id === job.id).length} applicants</span>
                      <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{new Date(job.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
                {jobs.length === 0 && (
                  <div className="text-center py-8">
                    <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No jobs posted yet</p>
                    <Button className="mt-4" onClick={() => openJobModal()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Job
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Candidates Tab */}
        <TabsContent value="candidates">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle>Candidates ({candidates.length})</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search candidates..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-[200px]"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="applied">Applied</SelectItem>
                      <SelectItem value="screening">Screening</SelectItem>
                      <SelectItem value="interview">Interview</SelectItem>
                      <SelectItem value="offer">Offer</SelectItem>
                      <SelectItem value="hired">Hired</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredCandidates.map((candidate) => (
                  <div key={candidate.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
                            {candidate.full_name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{candidate.full_name}</p>
                          <p className="text-sm text-muted-foreground">{candidate.current_title}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            {candidate.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{candidate.email}</span>}
                            {candidate.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{candidate.location}</span>}
                          </div>
                        </div>
                      </div>
                      <Select value={candidate.status} onValueChange={(v) => handleUpdateCandidateStatus(candidate.id, v)}>
                        <SelectTrigger className="w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="applied">Applied</SelectItem>
                          <SelectItem value="screening">Screening</SelectItem>
                          <SelectItem value="interview">Interview</SelectItem>
                          <SelectItem value="offer">Offer</SelectItem>
                          <SelectItem value="hired">Hired</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {candidate.skills && candidate.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {candidate.skills.map((skill, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">{skill}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {filteredCandidates.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No candidates found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Applications Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={applicationsTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="applications" stroke="#3b82f6" strokeWidth={2} name="Applications" />
                    <Line type="monotone" dataKey="hires" stroke="#10b981" strokeWidth={2} name="Hires" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pipeline Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPie>
                    <Pie
                      data={pipelineChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {CHART_COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPie>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Company Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Company Profile</DialogTitle>
            <DialogDescription>Update your company information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Company Name *</Label>
              <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} placeholder="Enter company name" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} placeholder="company@example.com" />
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input value={editForm.website} onChange={(e) => setEditForm({ ...editForm, website: e.target.value })} placeholder="https://example.com" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Industry</Label>
                <Select value={editForm.industry} onValueChange={(v) => setEditForm({ ...editForm, industry: v })}>
                  <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Retail">Retail</SelectItem>
                    <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Company Size</Label>
                <Select value={editForm.company_size} onValueChange={(v) => setEditForm({ ...editForm, company_size: v })}>
                  <SelectTrigger><SelectValue placeholder="Select size" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10</SelectItem>
                    <SelectItem value="11-50">11-50</SelectItem>
                    <SelectItem value="51-200">51-200</SelectItem>
                    <SelectItem value="201-500">201-500</SelectItem>
                    <SelectItem value="500-1000">500-1000</SelectItem>
                    <SelectItem value="1000+">1000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} placeholder="City, State" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} placeholder="Describe your company..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateCompany}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Job Modal */}
      <Dialog open={jobModalOpen} onOpenChange={setJobModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingJob ? 'Edit Job' : 'Create New Job'}</DialogTitle>
            <DialogDescription>Fill in the job details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Job Title *</Label>
              <Input value={jobForm.title} onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })} placeholder="e.g., Senior Frontend Developer" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Department</Label>
                <Input value={jobForm.department} onChange={(e) => setJobForm({ ...jobForm, department: e.target.value })} placeholder="e.g., Engineering" />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input value={jobForm.location} onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })} placeholder="e.g., San Francisco, CA" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Employment Type</Label>
                <Select value={jobForm.employment_type} onValueChange={(v) => setJobForm({ ...jobForm, employment_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={jobForm.status} onValueChange={(v) => setJobForm({ ...jobForm, status: v as any })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min Salary</Label>
                <Input type="number" value={jobForm.salary_min} onChange={(e) => setJobForm({ ...jobForm, salary_min: Number(e.target.value) })} placeholder="50000" />
              </div>
              <div className="space-y-2">
                <Label>Max Salary</Label>
                <Input type="number" value={jobForm.salary_max} onChange={(e) => setJobForm({ ...jobForm, salary_max: Number(e.target.value) })} placeholder="100000" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={jobForm.description} onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })} placeholder="Job description..." rows={4} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setJobModalOpen(false); setEditingJob(null); }}>Cancel</Button>
            <Button onClick={handleCreateJob}>{editingJob ? 'Update' : 'Create'} Job</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}