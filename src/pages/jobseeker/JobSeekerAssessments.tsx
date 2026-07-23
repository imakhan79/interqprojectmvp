import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  FileText, Search, Clock, ChevronRight, Filter, 
  CheckCircle, Award, BookOpen, BarChart, User, 
  FileCheck, Star
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/SimpleAuthContext";
import { useAssessments } from "@/hooks/useAssessments";
import { useCertificate } from "@/hooks/useCertificate";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const categories = ["All", "Python", "AWS", "SQL", "JavaScript", "Linux", "Docker", "React", "DevOps", "Security", "Node.js", "Go", "Kubernetes", "Azure", "GCP"];
const difficulties = ["All", "easy", "medium", "hard"];

const JobSeekerAssessments = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: assessments = [], isLoading, error } = useAssessments();
  const { generateCertificate } = useCertificate();
  const [completedAssessments, setCompletedAssessments] = useState<string[]>([]);
  const [certificateData, setCertificateData] = useState<Record<string, any>>({});



  const filtered = assessments.filter((a: any) => {
    const matchSearch = !search ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      (a.category && a.category.toLowerCase().includes(search.toLowerCase()));

    const matchCategory = category === "All" ||
      (a.category && a.category.toLowerCase() === category.toLowerCase());

    const matchDifficulty = difficulty === "All" ||
      (a.difficulty && a.difficulty.toLowerCase() === difficulty.toLowerCase());

    return matchSearch && matchCategory && matchDifficulty;
  });

  const getDifficultyColor = (d: string) => {
    switch (d?.toLowerCase()) {
      case "easy": return "bg-green-500/10 text-green-700";
      case "medium": return "bg-amber-500/10 text-amber-700";
      case "hard": return "bg-destructive/10 text-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getButtonVariant = (isCompleted: boolean, hasCertificate: boolean) => {
    if (isCompleted && hasCertificate) return "outline";
    if (isCompleted) return "secondary";
    return "default";
  };

  const getButtonLabel = (isCompleted: boolean, hasCertificate: boolean) => {
    if (isCompleted && hasCertificate) return "View Certificate";
    if (isCompleted) return "View Results";
    return "Start Assessment";
  };

  // Load completed assessments from API
  useEffect(() => {
    const fetchCompletedAssessments = async () => {
      if (!user) return;
      try {
        const { data: results } = await supabase
          .from('assessment_results')
          .select('assessment_id')
          .eq('user_id', user.id);
        
        const completedIds = results?.map(r => r.assessment_id) || [];
        setCompletedAssessments(completedIds);
        
        // Load cert data
        const certData: Record<string, any> = {};
        for (const id of completedIds) {
          const { data: cert } = await supabase
            .from('certificates')
            .select('*')
            .eq('assessment_id', id)
            .eq('user_id', user.id)
            .single();
          if (cert) certData[id] = cert;
        }
        setCertificateData(certData);
      } catch (err) {
        console.error("Failed to load completed assessments:", err);
      }
    };
    
    fetchCompletedAssessments();
  }, [user]);

  const handleGenerateCertificate = async (assessment: any) => {
    try {
      const certificate = await generateCertificate(assessment.id);
      if (certificate) {
        setCertificateData(prev => ({
          ...prev,
          [assessment.id]: certificate
        }));
      }
    } catch (err) {
      console.error("Failed to generate certificate:", err);
    }
  };

  const handleAction = (assessment: any) => {
    const isCompleted = completedAssessments.includes(assessment.id);
    const hasCertificate = certificateData[assessment.id];
    
    if (isCompleted && hasCertificate) {
      navigate(`/certificates/${certificateData[assessment.id].id}`);
    } else if (isCompleted) {
      navigate(`/results/${assessment.id}`);
    } else {
      navigate(`/assessment/${assessment.id}`);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive">
          <p>Failed to load assessments: {error.message}</p>
          <Button 
            variant="outline" 
            className="mt-2"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div>
          <h2 className="text-2xl font-bold">Assessment Library</h2>
          <p className="text-sm text-muted-foreground">{filtered.length} assessments available</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search assessments..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all",
              category === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Difficulty Filter */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Difficulty:</span>
        {difficulties.map((d) => (
          <button
            key={d}
            onClick={() => setDifficulty(d)}
            className={cn(
              "px-2.5 py-1 rounded-lg text-xs font-medium transition-all capitalize",
              difficulty === d ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {d === "All" ? "All" : d}
          </button>
        ))}
      </div>

      {/* Assessment Cards */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">No assessments match current filters</p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Try "CCNA", "AWS", "Python" domains</p>
            <p>• Reset difficulty to "All"</p>
            <p>• <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setCategory('All'); setDifficulty('All'); }}>Clear Filters</Button></p>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((a: any) => {
            const isCompleted = completedAssessments.includes(a.id);
            const hasCertificate = certificateData[a.id];
            return (
              <Card key={a.id} className="shadow-soft hover:shadow-elegant transition-all">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{a.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.description || "Skill assessment test"}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      {isCompleted && (
                        <Badge variant="default" className="mb-1 text-[10px] flex items-center">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                      {hasCertificate && (
                        <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700">
                          <Award className="w-3 h-3 mr-1" />
                          Certified
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <Badge variant="secondary" className="text-[10px]">{a.domain || a.category}</Badge>
                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium capitalize", getDifficultyColor(a.difficulty))}>
                      {a.difficulty}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" /> {a.duration} min
                    </span>
                  </div>
                    <div className="space-y-2">
                  <Button
                    variant={getButtonVariant(isCompleted, hasCertificate)}
                    className="gap-2"
                    disabled={isLoading}
                    onClick={() => {
                      if (isCompleted && hasCertificate) {
                        navigate(`/jobseeker/certificates`);
                      } else if (isCompleted) {
                        navigate(`/jobseeker/results`);
                      } else {
                        navigate(`/assessment/${a.id}`);
                      }
                    }}
                  >
                    {getButtonLabel(isCompleted, hasCertificate)}
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                      
                      {isCompleted && !hasCertificate && (
                        <Button
                          className="w-full"
                          variant="outline"
                          onClick={() => handleGenerateCertificate(a)}
                        >
                          <Award className="w-4 h-4 mr-2" />
                          Generate Certificate
                        </Button>
                      )}
                    </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default JobSeekerAssessments;

