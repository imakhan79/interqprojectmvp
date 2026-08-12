import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import EnhancedNavigation from "@/components/EnhancedNavigation";
import EnhancedFooter from "@/components/EnhancedFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Search, Filter, Clock, FileQuestion, CheckCircle, Timer, Award, BarChart, User, Play, LogIn, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/SimpleAuthContext";
import { Label } from "@/components/ui/label";
import AssessmentLibrary from "@/components/assessment/AssessmentLibrary";
import { useAssessments } from "@/hooks/useAssessments";
import { Role } from "@/types/assessment";

interface Assessment {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration_minutes: number;
  is_published: boolean;
  questions_count?: number;
  passing_score?: number;
}

const Assessments = () => {
  const navigate = useNavigate();
const authUser = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const { data: assessmentsData = [] } = useAssessments();
  const assessments = assessmentsData.filter(a => 
    !["HR Manager - Generalist", "HR Executive - Recruitment"].includes(a.title)
  );

  const hiddenTitles = ["HR Manager - Generalist", "HR Executive - Recruitment"];

  const categories = ["All", ...Array.from(new Set(assessments.map(a => a.category))).sort()];

  const filteredAssessments = assessments.filter((assessment) =>
    !hiddenTitles.includes(assessment.title) &&
    (selectedCategory === "All" || assessment.category === selectedCategory) &&
    (assessment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assessment.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const role: Role = authUser.user ? 'jobseeker' : 'jobseeker'; // Default for public

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-50">
      <EnhancedNavigation />
      <div className="pt-32 pb-20">
        <div className="container mx-auto max-w-7xl">
          <AssessmentLibrary role={role} />
        </div>
      </div>


      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Header */}
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-slate-900">
                Skill <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Assessments</span>
              </h1>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Validate your expertise with our industry-standard assessments. Take them anytime, anywhere.
              </p>
            </div>

            {/* How It Works */}
            <div className="mb-20">
              <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">How It Works</h2>
              <div className="grid md:grid-cols-5 gap-8 relative">
                {[
                  { icon: Search, title: "1. Select", desc: "Choose an assessment", action: () => document.getElementById('assessment-list')?.scrollIntoView({ behavior: 'smooth' }) },
                  { icon: FileQuestion, title: "2. Instructions", desc: "Read guidelines", action: () => { const id = assessments[0]?.id || "1"; navigate(`/assessment/${id}`); } },
                  { icon: Play, title: "3. Start", desc: "Begin immediately", action: () => { const id = assessments[0]?.id || "1"; navigate(`/assessment/${id}`); } },
                  { icon: Clock, title: "4. Complete", desc: "Submit answers", action: () => { const id = assessments[0]?.id || "1"; navigate(`/assessment/${id}`); } },
                  { icon: Award, title: "5. Results", desc: "Get feedback", action: () => navigate('/admin/results') },
                ].map((step, index) => (
                  <div 
                    key={index} 
                    className="flex flex-col items-center text-center relative z-10 cursor-pointer group"
                    onClick={step.action}
                  >
                    <div className="w-16 h-16 rounded-2xl bg-cyan-100 flex items-center justify-center mb-4 text-cyan-600 shadow-sm group-hover:bg-cyan-500 group-hover:text-white transition-colors duration-200">
                      <step.icon className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-lg mb-2 text-slate-900 group-hover:text-cyan-600 transition-colors">{step.title}</h3>
                    <p className="text-sm text-slate-500">{step.desc}</p>
                    {index < 4 && (
                      <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-slate-200 -z-10" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-3 gap-12 mb-20 items-start">
              {/* Key Features */}
              <div className="lg:col-span-2 space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-slate-900">Key Assessment Features</h2>
                  <div className="grid sm:grid-cols-2 gap-6">
                    {[
                      { icon: FileQuestion, label: "Variety of Questions", desc: "Multiple-choice, coding, & video responses" },
                      { icon: Timer, label: "Timed Tests", desc: "Real-world pressure simulation" },
                      { icon: CheckCircle, label: "Instant Feedback", desc: "Immediate scoring on submission" },
                      { icon: BarChart, label: "Automatic Grading", desc: "AI-powered evaluation systems" },
                      { icon: User, label: "No Login Required", desc: "Start immediately as a guest" },
                      { icon: Award, label: "Certifications", desc: "Earn badges for passing scores" },
                    ].map((feature, i) => (
                      <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-200 hover:shadow-md transition-shadow">
                        <div className="p-2 rounded-lg bg-cyan-50 text-cyan-600 mt-1">
                          <feature.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1 text-slate-900">{feature.label}</h4>
                          <p className="text-sm text-slate-500">{feature.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Main Action Area */}
                <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-8 border border-cyan-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div>
                    <h3 className="text-2xl font-bold mb-2 text-slate-900">Ready to prove your skills?</h3>
                    <p className="text-slate-600">Select an assessment below and start immediately. No account needed.</p>
                  </div>
                  <Button size="lg" className="shrink-0 text-lg px-8 h-14 shadow-lg bg-cyan-500 hover:bg-cyan-600" onClick={() => {
                    const firstId = assessments[0]?.id || "1";
                    navigate(`/assessment/${firstId}`);
                  }}>
                    Start Assessment <Play className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Optional Login Card */}
{!authUser.user && (

                <Card className="p-6 bg-white border-slate-200 shadow-md sticky top-24">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                      <LogIn className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">Save Your Progress</h3>
                      <p className="text-xs text-slate-500">Optional: Login to track history</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-slate-700">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        className="bg-white border-slate-200 text-slate-900"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-slate-700">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        className="bg-white border-slate-200 text-slate-900"
                      />
                    </div>
                    <Button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-600">
                      Login & Track
                    </Button>
                  </div>
                  <p className="text-xs text-center mt-4 text-slate-500">
                    Don't have an account? <a href="/auth" className="text-cyan-600 hover:underline font-medium">Sign up</a>
                  </p>
                </Card>
              )}
            </div>

            {/* Assessment List */}
            <div id="assessment-list" className="space-y-6">
              <div className="flex flex-col gap-4 border-b border-slate-200 pb-4">
                <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                  <h3 className="text-2xl font-bold text-slate-900">
                    Available Assessments 
                    <span className="text-slate-400 text-lg font-normal ml-2">({filteredAssessments.length})</span>
                  </h3>
                  <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Search topics..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 bg-white border-slate-200 text-slate-900"
                    />
                  </div>
                </div>
                {/* Category Filter Pills */}
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        selectedCategory === cat
                          ? 'bg-cyan-500 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAssessments.map((assessment) => (
                    <Card key={assessment.id} className="group p-6 hover:shadow-lg transition-all duration-300 bg-white border-slate-200 hover:border-cyan-300 cursor-pointer" onClick={() => navigate(`/assessment/${assessment.id}`)}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <FileQuestion className="w-6 h-6 text-cyan-600" />
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${
                          assessment.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                          assessment.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {assessment.difficulty}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold mb-1 text-slate-900 group-hover:text-cyan-600 transition-colors">{assessment.title}</h3>
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 mb-2">{assessment.category}</span>
                      <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                        {assessment.description}
                      </p>
                      <div className="flex items-center justify-between text-sm mt-auto border-t border-slate-100 pt-4">
                        <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                          <Clock className="w-4 h-4" />
                          {assessment.duration_minutes} min
                        </span>
                        <span className="text-cyan-600 font-bold flex items-center gap-1">
                          Start <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
            </div>

            {/* Live Interview Section */}
            <div className="mt-20 pt-16 border-t border-slate-200">
              <div className="text-center mb-12">
                <span className="inline-block px-4 py-1.5 rounded-full bg-cyan-50 text-cyan-600 text-sm font-semibold mb-4 border border-cyan-100">Coming Next</span>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">
                  Live <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">Interview</span>
                </h2>
                <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                  After completing your assessment, take the next step with an AI-powered live interview session.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    icon: User,
                    title: "Face-to-Face with AI",
                    desc: "Engage in a realistic interview simulation powered by advanced AI that adapts to your responses in real-time.",
                  },
                  {
                    icon: Timer,
                    title: "Timed & Structured",
                    desc: "Experience structured interview rounds with time management, just like a real professional interview.",
                  },
                  {
                    icon: BarChart,
                    title: "Detailed Analytics",
                    desc: "Receive comprehensive feedback on communication, technical accuracy, and confidence scores.",
                  },
                ].map((item, i) => (
                  <Card key={i} className="p-6 text-center bg-white border-slate-200 hover:border-cyan-300 transition-all duration-300 group">
                    <div className="w-14 h-14 rounded-2xl bg-cyan-100 flex items-center justify-center mx-auto mb-5 group-hover:bg-cyan-500 transition-colors">
                      <item.icon className="w-7 h-7 text-cyan-600 group-hover:text-white" />
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-slate-900">{item.title}</h3>
                    <p className="text-sm text-slate-500">{item.desc}</p>
                  </Card>
                ))}
              </div>

              <div className="mt-10 text-center">
                <Button
                  size="lg"
                  className="text-lg px-10 h-14 shadow-lg bg-cyan-500 hover:bg-cyan-600"
                  onClick={() => navigate("/assessment-workflow")}
                >
                  Start Live Interview <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>

          </motion.div>
        </div>
      </section>

      <EnhancedFooter />
    </div>
  );
};

export default Assessments;
