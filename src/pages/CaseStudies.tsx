import { useState } from "react";
import EnhancedNavigation from "@/components/EnhancedNavigation";
import EnhancedFooter from "@/components/EnhancedFooter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Building2,
  GraduationCap,
  Terminal,
  CheckCircle2,
  ArrowRight,
  BarChart3,
  Clock,
  Target
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
 

const cases = [
  {
    id: "org-hiring",
    title: "Organizational Hiring",
    desc: "Standardize hiring across regions with one unified platform.",
    icon: Building2,
    gradient: "from-blue-500 to-indigo-600",
    challenge: "Fragmented hiring processes across multiple geographic regions can lead to inconsistent candidate quality and inefficient resource allocation.",
    solution: "InterQ's unified assessment platform standardizes evaluation criteria and centralizes the hiring workflow for distributed teams.",
    capabilities: [
      "Unified evaluation criteria across every region",
      "Centralized hiring workflow and reporting",
      "Consistent, standardized scoring for every candidate"
    ],
  },
  {
    id: "campus-recruitment",
    title: "Campus Recruitment",
    desc: "Automate screening for high-volume applicant pools.",
    icon: GraduationCap,
    gradient: "from-purple-500 to-pink-600",
    challenge: "Handling a high volume of campus applications within a tight recruitment window strains manual screening processes.",
    solution: "InterQ's automated AI-powered MCQ assessments filter candidates on core competencies before the interview stage.",
    capabilities: [
      "Automated MCQ screening at scale",
      "Fast turnaround during high-volume application windows",
      "Consistent, bias-reduced grading for every applicant"
    ],
  },
  {
    id: "technical-interviews",
    title: "Technical Interviews",
    desc: "Bring consistency and AI-backed insight to every interview.",
    icon: Terminal,
    gradient: "from-emerald-500 to-teal-600",
    challenge: "Variance in technical interview quality and objectivity across different internal interview teams makes candidates hard to compare fairly.",
    solution: "InterQ's Pair Interviewing platform combines built-in coding environments with real-time AI performance signals.",
    capabilities: [
      "Built-in coding environment for live evaluation",
      "Real-time AI performance signals for interviewers",
      "Structured, comparable scoring across every interview"
    ],
  },
];

const CaseStudies = () => {
  const [selectedCase, setSelectedCase] = useState<typeof cases[0] | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <EnhancedNavigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden hero-blue">
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
        <div className="container mx-auto max-w-7xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-block px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
              Use Cases
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              Built for Every <span className="bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">Hiring Scenario</span>
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              See how InterQ's AI-driven platform adapts to different hiring needs, from organizational scale to technical depth.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cases.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="group h-full flex flex-col overflow-hidden border-border/50 hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-xl glass-card">
                  <div className={`h-2 bg-gradient-to-r ${c.gradient}`} />
                  <CardContent className="p-8 flex flex-col h-full">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <c.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-smooth">{c.title}</h3>
                    <p className="text-muted-foreground mb-8 flex-1 leading-relaxed">{c.desc}</p>

                    <Button
                      onClick={() => setSelectedCase(c)}
                      variant="outline"
                      className="group/btn border-primary/20 hover:border-primary hover:bg-primary/5 text-primary font-semibold transition-all duration-300"
                    >
                      View Full Details
                      <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Detail Dialog */}
      <Dialog open={!!selectedCase} onOpenChange={(open) => !open && setSelectedCase(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedCase && (
            <>
              <DialogHeader>
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${selectedCase.gradient} flex items-center justify-center mb-4`}>
                  <selectedCase.icon className="w-6 h-6 text-white" />
                </div>
                <DialogTitle className="text-3xl font-bold">{selectedCase.title}</DialogTitle>
                <DialogDescription className="text-lg">
                  How InterQ applies to this hiring scenario.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-8 py-6">
                <div>
                  <h4 className="flex items-center gap-2 text-lg font-semibold mb-3">
                    <Target className="w-5 h-5 text-primary" />
                    The Challenge
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {selectedCase.challenge}
                  </p>
                </div>

                <div>
                  <h4 className="flex items-center gap-2 text-lg font-semibold mb-3">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    The Solution
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {selectedCase.solution}
                  </p>
                </div>

                <div className="bg-muted/30 p-6 rounded-xl border border-border/50">
                  <h4 className="flex items-center gap-2 text-lg font-semibold mb-4 text-primary">
                    <BarChart3 className="w-5 h-5" />
                    What InterQ Provides
                  </h4>
                  <ul className="grid sm:grid-cols-2 gap-4">
                    {selectedCase.capabilities.map((capability, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-sm font-medium">{capability}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex justify-end pt-4 border-t border-border">
                  <Button onClick={() => setSelectedCase(null)} variant="default">
                    Close Details
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <EnhancedFooter />
    </div>
  );
};

export default CaseStudies;
