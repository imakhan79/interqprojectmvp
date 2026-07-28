import React, { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart3,
  FileText,
  Download,
  Eye,
  Users,
  Filter,
  Search,
  Calendar,
  Plus,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  User,
  DownloadCloud
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

const CHART_COLORS = {
  advance: '#10b981',
  advance_reserve: '#f59e0b',
  reject: '#ef4444',
  pending: '#6b7280'
};

const ITEMS_PER_PAGE = 10;

export interface EvaluationReport {
  id: string;
  candidateId: string;
  candidateName?: string;
  candidateEmail?: string;
  jobId?: string;
  positionApplied: string;
  interviewerName: string;
  interviewDate: string;
  overallScore: number;
  overallScoreMax: number;
  status: 'pending' | 'advance' | 'advance_reserve' | 'reject';
  technicalScore: number;
  technicalMax: number;
  behavioralScore: number;
  behavioralMax: number;
  communicationScore: number;
  communicationMax: number;
  problemSolvingScore: number;
  problemSolvingMax: number;
  culturalFitScore: number;
  culturalFitMax: number;
  experienceScore: number;
  experienceMax: number;
  recommendation?: string;
  finalComments?: string;
  features?: Array<{name: string; score: number; maxScore: number; comments: string}>;
}

interface CreateReportData {
  candidateName: string;
  candidateEmail?: string;
  positionApplied: string;
  interviewerName: string;
  interviewDate: string;
  technicalScore: number;
  behavioralScore: number;
  communicationScore: number;
  problemSolvingScore: number;
  culturalFitScore?: number;
  experienceScore?: number;
  recommendation?: string;
}

const SCORE_WEIGHTS = {
  technical: 0.4,
  behavioral: 0.2,
  communication: 0.2,
  problemSolving: 0.2
};

function calculateOverallScore(
  technical: number,
  behavioral: number,
  communication: number,
  problemSolving: number,
  maxScore: number = 5
): number {
  const technicalNorm = (technical / maxScore) * 100;
  const behavioralNorm = (behavioral / maxScore) * 100;
  const communicationNorm = (communication / maxScore) * 100;
  const problemNorm = (problemSolving / maxScore) * 100;
  
  return Number((
    (technicalNorm * SCORE_WEIGHTS.technical) +
    (behavioralNorm * SCORE_WEIGHTS.behavioral) +
    (communicationNorm * SCORE_WEIGHTS.communication) +
    (problemNorm * SCORE_WEIGHTS.problemSolving)
  ).toFixed(2));
}

function determineStatus(score: number): 'pending' | 'advance' | 'advance_reserve' | 'reject' {
  if (score >= 80) return 'advance';
  if (score >= 60) return 'advance_reserve';
  return 'reject';
}

const mockReports: EvaluationReport[] = [
  {
    id: '1',
    candidateId: 'a1b2c3d4',
    candidateName: 'John Doe',
    candidateEmail: 'john.doe@tech.com',
    positionApplied: 'Senior Frontend Developer',
    interviewerName: 'Jane Smith',
    interviewDate: '2025-01-15',
    overallScore: 84,
    overallScoreMax: 100,
    status: 'advance',
    technicalScore: 5,
    technicalMax: 5,
    behavioralScore: 4,
    behavioralMax: 5,
    communicationScore: 4,
    communicationMax: 5,
    problemSolvingScore: 5,
    problemSolvingMax: 5,
    culturalFitScore: 4,
    culturalFitMax: 5,
    experienceScore: 4,
    experienceMax: 5,
    recommendation: 'Strong candidate with excellent technical skills',
    features: [
      { name: 'Technical Skills', score: 5, maxScore: 5, comments: 'React/Next.js expert' },
      { name: 'Problem Solving', score: 5, maxScore: 5, comments: 'Excellent algorithmic thinking' }
    ]
  },
  {
    id: '2',
    candidateId: 'b2c3d4e5',
    candidateName: 'Sarah Wilson',
    candidateEmail: 'sarah.wilson@cloud.com',
    positionApplied: 'DevOps Engineer',
    interviewerName: 'Bob Wilson',
    interviewDate: '2025-01-14',
    overallScore: 72,
    overallScoreMax: 100,
    status: 'advance_reserve',
    technicalScore: 5,
    technicalMax: 5,
    behavioralScore: 3,
    behavioralMax: 5,
    communicationScore: 3,
    communicationMax: 5,
    problemSolvingScore: 4,
    problemSolvingMax: 5,
    culturalFitScore: 3,
    culturalFitMax: 5,
    experienceScore: 4,
    experienceMax: 5,
    recommendation: 'Good technical skills but needs coaching on communication'
  },
  {
    id: '3',
    candidateId: 'c3d4e5f6',
    candidateName: 'Mike Johnson',
    candidateEmail: 'mike.j@startup.io',
    positionApplied: 'Backend Developer',
    interviewerName: 'Alice Brown',
    interviewDate: '2025-01-13',
    overallScore: 52,
    overallScoreMax: 100,
    status: 'reject',
    technicalScore: 3,
    technicalMax: 5,
    behavioralScore: 2,
    behavioralMax: 5,
    communicationScore: 3,
    communicationMax: 5,
    problemSolvingScore: 2,
    problemSolvingMax: 5,
    culturalFitScore: 4,
    culturalFitMax: 5,
    experienceScore: 2,
    experienceMax: 5,
    recommendation: 'Below requirements, consider for junior role'
  },
  {
    id: '4',
    candidateId: 'd4e5f6a7',
    candidateName: 'Emily Davis',
    candidateEmail: 'emily.d@enterprise.com',
    positionApplied: 'Data Analyst',
    interviewerName: 'Charlie Lee',
    interviewDate: '2025-01-12',
    overallScore: 88,
    overallScoreMax: 100,
    status: 'advance',
    technicalScore: 4,
    technicalMax: 5,
    behavioralScore: 5,
    behavioralMax: 5,
    communicationScore: 4,
    communicationMax: 5,
    problemSolvingScore: 5,
    problemSolvingMax: 5,
    culturalFitScore: 4,
    culturalFitMax: 5,
    experienceScore: 4,
    experienceMax: 5,
    recommendation: 'Excellent candidate, hire immediately'
  },
  {
    id: '5',
    candidateId: 'e5f6a7b8',
    candidateName: 'David Kim',
    candidateEmail: 'david.kim@tech.com',
    positionApplied: 'Cloud Architect',
    interviewerName: 'Michael Chen',
    interviewDate: '2025-01-11',
    overallScore: 94,
    overallScoreMax: 100,
    status: 'advance',
    technicalScore: 5,
    technicalMax: 5,
    behavioralScore: 5,
    behavioralMax: 5,
    communicationScore: 4,
    communicationMax: 5,
    problemSolvingScore: 5,
    problemSolvingMax: 5,
    culturalFitScore: 5,
    culturalFitMax: 5,
    experienceScore: 5,
    experienceMax: 5,
    recommendation: 'Exceptional candidate, top 5%'
  }
];

const DynamicEvaluationReports = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [reports, setReports] = useState<EvaluationReport[]>(mockReports);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    minScore: 0,
    sortBy: 'date' as 'score' | 'date' | 'name',
    sortOrder: 'desc' as 'asc' | 'desc'
  });
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<EvaluationReport | null>(null);
  const [viewModal, setViewModal] = useState(false);
  const [createModal, setCreateModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [newReport, setNewReport] = useState<CreateReportData>({
    candidateName: '',
    candidateEmail: '',
    positionApplied: '',
    interviewerName: '',
    interviewDate: new Date().toISOString().split('T')[0],
    technicalScore: 3,
    behavioralScore: 3,
    communicationScore: 3,
    problemSolvingScore: 3,
    culturalFitScore: 3,
    experienceScore: 3,
    recommendation: ''
  });

  const stats = useMemo(() => {
    const total = reports.length;
    const advance = reports.filter(r => r.status === 'advance').length;
    const hold = reports.filter(r => r.status === 'advance_reserve').length;
    const rejected = reports.filter(r => r.status === 'reject').length;
    const pending = reports.filter(r => r.status === 'pending').length;
    return { total, advance, hold, rejected, pending };
  }, [reports]);

  const previewScore = useMemo(() => {
    return calculateOverallScore(
      newReport.technicalScore,
      newReport.behavioralScore,
      newReport.communicationScore,
      newReport.problemSolvingScore
    );
  }, [newReport]);

  const previewStatus = useMemo(() => {
    return determineStatus(previewScore);
  }, [previewScore]);

  const filteredReports = useMemo(() => {
    let filtered = [...reports];

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(r => r.status === filters.status);
    }

    if (filters.minScore > 0) {
      filtered = filtered.filter(r => r.overallScore >= filters.minScore);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(r => 
        (r.candidateName?.toLowerCase().includes(searchLower) || '').includes(searchLower) ||
        r.positionApplied.toLowerCase().includes(searchLower)
      );
    }

    filtered.sort((a, b) => {
      let comparison = 0;
      switch (filters.sortBy) {
        case 'score':
          comparison = a.overallScore - b.overallScore;
          break;
        case 'date':
          comparison = new Date(a.interviewDate).getTime() - new Date(b.interviewDate).getTime();
          break;
        case 'name':
          comparison = (a.candidateName || '').localeCompare(b.candidateName || '');
          break;
      }
      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [reports, filters]);

  const totalPages = Math.ceil(filteredReports.length / ITEMS_PER_PAGE);
  const paginatedReports = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredReports.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredReports, currentPage]);

  const chartData = [
    { name: 'Advance', value: stats.advance, fill: CHART_COLORS.advance },
    { name: 'Hold', value: stats.hold, fill: CHART_COLORS.advance_reserve },
    { name: 'Rejected', value: stats.rejected, fill: CHART_COLORS.reject },
    { name: 'Pending', value: stats.pending, fill: CHART_COLORS.pending }
  ];

  const handleCreateReport = () => {
    if (!newReport.candidateName || !newReport.positionApplied || !newReport.interviewerName) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in candidate name, position, and interviewer name.",
        variant: "destructive"
      });
      return;
    }

    const overallScore = calculateOverallScore(
      newReport.technicalScore,
      newReport.behavioralScore,
      newReport.communicationScore,
      newReport.problemSolvingScore
    );

    const status = determineStatus(overallScore);

    const newReportEntry: EvaluationReport = {
      id: `local-${Date.now()}`,
      candidateId: `candidate-${Date.now()}`,
      candidateName: newReport.candidateName,
      candidateEmail: newReport.candidateEmail,
      positionApplied: newReport.positionApplied,
      interviewerName: newReport.interviewerName,
      interviewDate: newReport.interviewDate,
      overallScore,
      overallScoreMax: 100,
      status,
      technicalScore: newReport.technicalScore,
      technicalMax: 5,
      behavioralScore: newReport.behavioralScore,
      behavioralMax: 5,
      communicationScore: newReport.communicationScore,
      communicationMax: 5,
      problemSolvingScore: newReport.problemSolvingScore,
      problemSolvingMax: 5,
      culturalFitScore: newReport.culturalFitScore || 3,
      culturalFitMax: 5,
      experienceScore: newReport.experienceScore || 3,
      experienceMax: 5,
      recommendation: newReport.recommendation,
      features: [
        { name: 'Technical Skills', score: newReport.technicalScore, maxScore: 5, comments: '' },
        { name: 'Behavioral Fit', score: newReport.behavioralScore, maxScore: 5, comments: '' },
        { name: 'Communication', score: newReport.communicationScore, maxScore: 5, comments: '' },
        { name: 'Problem Solving', score: newReport.problemSolvingScore, maxScore: 5, comments: '' }
      ]
    };

    setReports([newReportEntry, ...reports]);
    setCreateModal(false);
    resetForm();
    
    toast({
      title: "Report Created",
      description: `${newReport.candidateName}'s evaluation report has been created successfully.`,
    });
  };

  const handleStatusChange = (reportId: string, newStatus: 'pending' | 'advance' | 'advance_reserve' | 'reject') => {
    setReports(reports.map(r => 
      r.id === reportId ? { ...r, status: newStatus } : r
    ));
    
    toast({
      title: "Status Updated",
      description: `Report status has been updated to ${newStatus.replace('_', ' ')}.`,
    });
  };

  const handleExportCSV = () => {
    const headers = [
      'Candidate Name',
      'Email',
      'Position',
      'Interview Date',
      'Technical Score',
      'Behavioral Score',
      'Communication Score',
      'Problem Solving',
      'Cultural Fit',
      'Experience',
      'Overall Score',
      'Status',
      'Recommendation'
    ];

    const rows = filteredReports.map(r => [
      r.candidateName || '',
      r.candidateEmail || '',
      r.positionApplied,
      r.interviewDate,
      `${r.technicalScore}/${r.technicalMax}`,
      `${r.behavioralScore}/${r.behavioralMax}`,
      `${r.communicationScore}/${r.communicationMax}`,
      `${r.problemSolvingScore}/${r.problemSolvingMax}`,
      `${r.culturalFitScore}/${r.culturalFitMax}`,
      `${r.experienceScore}/${r.experienceMax}`,
      `${r.overallScore}%`,
      r.status.replace('_', ' '),
      r.recommendation || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().split('T')[0];
    link.download = `evaluation_reports_${timestamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "CSV Exported",
      description: `${filteredReports.length} reports exported successfully.`,
    });
  };

  const handleExportSelectedCSV = () => {
    const selectedData = filteredReports.filter(r => selectedReports.includes(r.id));
    
    const headers = [
      'Candidate Name',
      'Email',
      'Position',
      'Overall Score',
      'Status',
      'Recommendation'
    ];

    const rows = selectedData.map(r => [
      r.candidateName || '',
      r.candidateEmail || '',
      r.positionApplied,
      `${r.overallScore}%`,
      r.status.replace('_', ' '),
      r.recommendation || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().split('T')[0];
    link.download = `selected_reports_${timestamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "CSV Exported",
      description: `${selectedData.length} selected reports exported successfully.`,
    });
  };

  const handleDownloadPDF = (report: EvaluationReport) => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.setTextColor(59, 130, 246);
    doc.text('Candidate Evaluation Report', 20, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Candidate: ${report.candidateName || 'N/A'}`, 20, 35);
    doc.text(`Email: ${report.candidateEmail || 'N/A'}`, 20, 42);
    doc.text(`Position: ${report.positionApplied}`, 20, 49);
    doc.text(`Interview Date: ${report.interviewDate}`, 20, 56);
    doc.text(`Interviewer: ${report.interviewerName}`, 20, 63);
    
    doc.setFontSize(14);
    doc.setTextColor(59, 130, 246);
    doc.text('Scores', 20, 77);
    
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Overall Score: ${report.overallScore}%`, 20, 87);
    doc.text(`Technical: ${report.technicalScore}/${report.technicalMax}`, 20, 94);
    doc.text(`Behavioral: ${report.behavioralScore}/${report.behavioralMax}`, 20, 101);
    doc.text(`Communication: ${report.communicationScore}/${report.communicationMax}`, 20, 108);
    doc.text(`Problem Solving: ${report.problemSolvingScore}/${report.problemSolvingMax}`, 20, 115);
    doc.text(`Cultural Fit: ${report.culturalFitScore}/${report.culturalFitMax}`, 20, 122);
    doc.text(`Experience: ${report.experienceScore}/${report.experienceMax}`, 20, 129);
    
    doc.setFontSize(14);
    doc.setTextColor(59, 130, 246);
    doc.text('Recommendation', 20, 145);
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Status: ${report.status.replace('_', ' ').toUpperCase()}`, 20, 155);
    
    if (report.recommendation) {
      const splitRecommendation = doc.splitTextToSize(report.recommendation, 170);
      doc.text(splitRecommendation, 20, 162);
    }
    
    doc.save(`${report.candidateName || 'candidate'}_evaluation_report.pdf`);

    toast({
      title: "PDF Downloaded",
      description: `${report.candidateName}'s report has been downloaded.`,
    });
  };

  const handleViewReport = (report: EvaluationReport) => {
    setSelectedCandidate(report);
    setViewModal(true);
  };

  const resetForm = () => {
    setNewReport({
      candidateName: '',
      candidateEmail: '',
      positionApplied: '',
      interviewerName: '',
      interviewDate: new Date().toISOString().split('T')[0],
      technicalScore: 3,
      behavioralScore: 3,
      communicationScore: 3,
      problemSolvingScore: 3,
      culturalFitScore: 3,
      experienceScore: 3,
      recommendation: ''
    });
  };

  const toggleSelectAll = () => {
    if (selectedReports.length === paginatedReports.length) {
      setSelectedReports([]);
    } else {
      setSelectedReports(paginatedReports.map(r => r.id));
    }
  };

  const toggleSelectReport = (reportId: string) => {
    if (selectedReports.includes(reportId)) {
      setSelectedReports(selectedReports.filter(id => id !== reportId));
    } else {
      setSelectedReports([...selectedReports, reportId]);
    }
  };

  const handleSort = (column: 'score' | 'date' | 'name') => {
    if (filters.sortBy === column) {
      setFilters({ ...filters, sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' });
    } else {
      setFilters({ ...filters, sortBy: column, sortOrder: 'desc' });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'advance': return <Badge className="bg-green-100 text-green-800 border-green-200">Advance</Badge>;
      case 'advance_reserve': return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Hold</Badge>;
      case 'reject': return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      case 'pending': return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Pending</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const SortIcon = ({ column }: { column: 'score' | 'date' | 'name' }) => {
    if (filters.sortBy !== column) return <ArrowUpDown className="h-3 w-3" />;
    return filters.sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />;
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">TAP Candidate Evaluation</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Manage candidate assessments ({filteredReports.length})
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportCSV}
            className="flex items-center gap-1"
          >
            <DownloadCloud className="h-4 w-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>
          <Dialog open={createModal} onOpenChange={setCreateModal}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                <span>New Report</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Evaluation Report</DialogTitle>
                <DialogDescription>Enter candidate information and scores.</DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Candidate Name *</Label>
                    <Input
                      placeholder="John Doe"
                      value={newReport.candidateName}
                      onChange={(e) => setNewReport({ ...newReport, candidateName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Email</Label>
                    <Input
                      placeholder="john@example.com"
                      type="email"
                      value={newReport.candidateEmail}
                      onChange={(e) => setNewReport({ ...newReport, candidateEmail: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Position Applied *</Label>
                    <Input
                      placeholder="Frontend Developer"
                      value={newReport.positionApplied}
                      onChange={(e) => setNewReport({ ...newReport, positionApplied: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Interviewer *</Label>
                    <Input
                      placeholder="Jane Smith"
                      value={newReport.interviewerName}
                      onChange={(e) => setNewReport({ ...newReport, interviewerName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Interview Date</Label>
                  <Input
                    type="date"
                    value={newReport.interviewDate}
                    onChange={(e) => setNewReport({ ...newReport, interviewDate: e.target.value })}
                  />
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Score Assessment</Label>
                  
                  {[
                    { key: 'technicalScore', label: 'Technical Skills' },
                    { key: 'behavioralScore', label: 'Behavioral Fit' },
                    { key: 'communicationScore', label: 'Communication' },
                    { key: 'problemSolvingScore', label: 'Problem Solving' }
                  ].map((item) => (
                    <div key={item.key} className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <Label className="text-xs">{item.label}</Label>
                        <span className="text-sm font-mono font-medium">
                          {newReport[item.key as keyof typeof newReport]}/5
                        </span>
                      </div>
                      <Slider
                        value={[newReport[item.key as keyof typeof newReport] as number]}
                        onValueChange={([v]) => setNewReport({ ...newReport, [item.key]: v })}
                        min={1}
                        max={5}
                        step={0.5}
                        className="py-1"
                      />
                    </div>
                  ))}
                </div>

                <Card className="bg-muted/50 border-0">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Preview Score</span>
                      <span className={`text-xl font-bold ${getScoreColor(previewScore)}`}>
                        {previewScore}%
                      </span>
                    </div>
                    <Progress value={previewScore} className="h-2 mb-2" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Status:</span>
                      {getStatusBadge(previewStatus)}
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-1.5">
                  <Label className="text-xs">Recommendation Notes</Label>
                  <Textarea
                    placeholder="Overall recommendation..."
                    value={newReport.recommendation}
                    onChange={(e) => setNewReport({ ...newReport, recommendation: e.target.value })}
                    className="min-h-[60px]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setCreateModal(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleCreateReport}>
                    Create Report
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 lg:grid-cols-5 gap-2 md:gap-4">
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow" 
          onClick={() => setFilters({ ...filters, status: 'all' })}
        >
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Total</p>
                <p className="text-xl md:text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow" 
          onClick={() => setFilters({ ...filters, status: 'advance' })}
        >
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Advance</p>
                <p className="text-xl md:text-2xl font-bold text-green-600">{stats.advance}</p>
              </div>
              <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow" 
          onClick={() => setFilters({ ...filters, status: 'advance_reserve' })}
        >
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Hold</p>
                <p className="text-xl md:text-2xl font-bold text-yellow-600">{stats.hold}</p>
              </div>
              <Clock className="h-5 w-5 md:h-6 md:w-6 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow" 
          onClick={() => setFilters({ ...filters, status: 'reject' })}
        >
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Reject</p>
                <p className="text-xl md:text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <XCircle className="h-5 w-5 md:h-6 md:w-6 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="col-span-3 lg:col-span-1 cursor-pointer hover:shadow-md transition-shadow" 
          onClick={() => setFilters({ ...filters, status: 'pending' })}
        >
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Pending</p>
                <p className="text-xl md:text-2xl font-bold text-gray-600">{stats.pending}</p>
              </div>
              <AlertCircle className="h-5 w-5 md:h-6 md:w-6 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-3 md:p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Search</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Name..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-8 h-9 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Status</Label>
              <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="advance">Advance</SelectItem>
                  <SelectItem value="advance_reserve">Hold</SelectItem>
                  <SelectItem value="reject">Rejected</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Min Score: {filters.minScore}%</Label>
              <Slider
                value={[filters.minScore]}
                onValueChange={([v]) => setFilters({ ...filters, minScore: v })}
                max={100}
                step={5}
                className="py-1"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Sort By</Label>
              <Select value={`${filters.sortBy}-${filters.sortOrder}`} onValueChange={(v) => {
                const [sortBy, sortOrder] = v.split('-') as ['score' | 'date' | 'name', 'asc' | 'desc'];
                setFilters({ ...filters, sortBy, sortOrder });
              }}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Newest</SelectItem>
                  <SelectItem value="date-asc">Oldest</SelectItem>
                  <SelectItem value="score-desc">Highest Score</SelectItem>
                  <SelectItem value="score-asc">Lowest Score</SelectItem>
                  <SelectItem value="name-asc">Name A-Z</SelectItem>
                  <SelectItem value="name-desc">Name Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <ResponsiveContainer width="60%" height={120}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={50}
                    dataKey="value"
                    strokeWidth={2}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 text-xs">
                {chartData.map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.fill }} />
                    <span className="text-muted-foreground">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedReports.length > 0 && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{selectedReports.length} selected</p>
                <p className="text-xs text-muted-foreground">Ready to export</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleExportSelectedCSV}>
                <DownloadCloud className="h-4 w-4 mr-1" />
                Export
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Reports List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            Reports ({filteredReports.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-4">
          {filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No reports found</h3>
              <p className="text-muted-foreground mb-4">Create your first evaluation report.</p>
              <Button onClick={() => setCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Report
              </Button>
            </div>
          ) : (
            <>
              {/* Desktop Table Header */}
              <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-2 bg-muted/50 rounded-lg text-xs font-semibold text-muted-foreground">
                <div className="col-span-1 flex items-center">
                  <Checkbox checked={selectedReports.length === paginatedReports.length} onCheckedChange={toggleSelectAll} />
                </div>
                <div className="col-span-4">Candidate</div>
                <div className="col-span-2 text-center">Score</div>
                <div className="col-span-2 text-center">Status</div>
                <div className="col-span-3 text-right">Actions</div>
              </div>

              {/* Report Rows */}
              <div className="divide-y">
                {paginatedReports.map((report) => (
                  <div
                    key={report.id}
                    className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-3 px-4 py-3 hover:bg-muted/50 transition-colors items-center"
                  >
                    {/* Mobile Layout */}
                    <div className="md:hidden col-span-1">
                      <Checkbox
                        checked={selectedReports.includes(report.id)}
                        onCheckedChange={() => toggleSelectReport(report.id)}
                      />
                    </div>
                    <div className="md:col-span-4 flex items-center gap-3 col-span-11 md:col-span-1">
                      <Avatar className="h-8 w-8 md:h-10 md:w-10">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white text-xs md:text-sm">
                          {report.candidateName?.slice(0, 2).toUpperCase() || '??'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm md:text-base truncate">{report.candidateName}</p>
                        <p className="text-xs text-muted-foreground truncate">{report.positionApplied}</p>
                      </div>
                    </div>

                    {/* Desktop fields */}
                    <div className="hidden md:flex col-span-2 items-center justify-center">
                      <div className="text-center">
                        <div className="text-lg font-bold text-primary">{report.overallScore}%</div>
                        <div className="flex gap-0.5 text-xs text-muted-foreground">
                          <span>{report.technicalScore}</span>
                          <span>·</span>
                          <span>{report.behavioralScore}</span>
                          <span>·</span>
                          <span>{report.communicationScore}</span>
                        </div>
                      </div>
                    </div>

                    <div className="hidden md:flex col-span-2 items-center justify-center">
                      <Select value={report.status} onValueChange={(v) => handleStatusChange(report.id, v as any)}>
                        <SelectTrigger className="w-[110px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="advance">Advance</SelectItem>
                          <SelectItem value="advance_reserve">Hold</SelectItem>
                          <SelectItem value="reject">Reject</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Mobile Score + Status */}
                    <div className="md:hidden col-span-11 pl-11 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${getScoreColor(report.overallScore)}`}>
                          {report.overallScore}%
                        </span>
                        {getStatusBadge(report.status)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="col-span-12 md:col-span-3 flex items-center justify-end gap-1 md:gap-2 pl-11 md:pl-0">
                      <Button variant="ghost" size="sm" onClick={() => handleViewReport(report)} className="h-8 px-2">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDownloadPDF(report)} className="h-8 px-2">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Select value={report.status} onValueChange={(v) => handleStatusChange(report.id, v as any)} className="md:hidden w-[100px]">
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="advance">Advance</SelectItem>
                          <SelectItem value="advance_reserve">Hold</SelectItem>
                          <SelectItem value="reject">Reject</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 px-4">
                  <p className="text-xs text-muted-foreground">
                    {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredReports.length)} of {filteredReports.length}
                  </p>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-xs px-2">
                      {currentPage}/{totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* View Report Modal */}
      <Dialog open={viewModal} onOpenChange={setViewModal}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          {selectedCandidate && (
            <>
              <DialogHeader>
                <DialogTitle>Evaluation Report Details</DialogTitle>
                <DialogDescription>Comprehensive view of candidate evaluation</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white text-lg">
                      {selectedCandidate.candidateName?.slice(0, 2).toUpperCase() || '??'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold">{selectedCandidate.candidateName}</h2>
                    <p className="text-muted-foreground">{selectedCandidate.positionApplied}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {selectedCandidate.interviewDate}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {selectedCandidate.interviewerName}
                      </span>
                    </div>
                  </div>
                  {getStatusBadge(selectedCandidate.status)}
                </div>

                <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-0">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">Overall Score</h3>
                      <span className={`text-2xl font-bold ${getScoreColor(selectedCandidate.overallScore)}`}>
                        {selectedCandidate.overallScore}%
                      </span>
                    </div>
                    <Progress value={selectedCandidate.overallScore} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                      Formula: (Technical × 40%) + (Behavioral × 20%) + (Communication × 20%) + (Problem Solving × 20%)
                    </p>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Technical', score: selectedCandidate.technicalScore, max: selectedCandidate.technicalMax },
                    { label: 'Behavioral', score: selectedCandidate.behavioralScore, max: selectedCandidate.behavioralMax },
                    { label: 'Communication', score: selectedCandidate.communicationScore, max: selectedCandidate.communicationMax },
                    { label: 'Problem Solving', score: selectedCandidate.problemSolvingScore, max: selectedCandidate.problemSolvingMax }
                  ].map((item) => (
                    <Card key={item.label} className="p-3">
                      <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                      <div className="text-lg font-bold">{Math.round((item.score / item.max) * 100)}%</div>
                      <p className="text-xs text-muted-foreground">({item.score}/{item.max})</p>
                    </Card>
                  ))}
                </div>

                {selectedCandidate.recommendation && (
                  <Card className="p-3">
                    <h4 className="font-semibold text-sm mb-1">Recommendation</h4>
                    <p className="text-sm">{selectedCandidate.recommendation}</p>
                  </Card>
                )}

                <div className="flex justify-between items-center pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadPDF(selectedCandidate)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download PDF
                  </Button>
                  <Button size="sm" onClick={() => setViewModal(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DynamicEvaluationReports;