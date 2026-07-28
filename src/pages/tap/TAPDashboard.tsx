import { useState } from "react";
import {
  Video, Calendar, Clock, User, Briefcase, ClipboardList, CheckCircle2,
  ExternalLink, Star, Send, FileText, GraduationCap, AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/SimpleAuthContext";

interface AssignedInterview {
  id: number;
  candidate: string;
  position: string;
  date: string;
  time: string;
  joinLink: string;
  status: "Scheduled" | "Completed" | "Feedback Submitted";
  experience: string;
  education: string;
  summary: string;
}

const initialInterviews: AssignedInterview[] = [
  {
    id: 1,
    candidate: "Sarah Johnson",
    position: "Senior Frontend Developer",
    date: "2026-08-02",
    time: "10:00 AM",
    joinLink: "https://interq.com/interview/join/sj-fe-01",
    status: "Scheduled",
    experience: "6 years — React, TypeScript, Design Systems",
    education: "B.S. Computer Science, NYU",
    summary: "Strong portfolio with 3 production design-system rollouts. Referred by LinkedIn sourcing.",
  },
  {
    id: 2,
    candidate: "Michael Chen",
    position: "Product Manager",
    date: "2026-08-02",
    time: "2:30 PM",
    joinLink: "https://interq.com/interview/join/mc-pm-02",
    status: "Scheduled",
    experience: "8 years — B2B SaaS product management",
    education: "MBA, Wharton",
    summary: "Led two 0-to-1 product launches. Looking to move into enterprise-scale orgs.",
  },
  {
    id: 3,
    candidate: "Emily Davis",
    position: "UX Designer",
    date: "2026-07-30",
    time: "11:00 AM",
    joinLink: "https://interq.com/interview/join/ed-ux-03",
    status: "Completed",
    experience: "4 years — Product design, Figma, user research",
    education: "B.F.A. Design, RISD",
    summary: "Well-rounded generalist with strong research chops; needs evaluation submitted.",
  },
];

const interviewQuestionsByPosition: Record<string, string[]> = {
  "Senior Frontend Developer": [
    "Walk me through how you'd architect a large-scale React design system.",
    "How do you approach performance profiling in a production SPA?",
    "Describe a time you had to refactor legacy frontend code under a deadline.",
  ],
  "Product Manager": [
    "How do you prioritize a roadmap when engineering capacity is fixed?",
    "Walk me through a product launch that didn't go as planned — what did you learn?",
    "How do you align stakeholders across sales, design, and engineering?",
  ],
  "UX Designer": [
    "Walk me through your end-to-end design process for a recent project.",
    "How do you validate design decisions with user research?",
    "Tell me about a time you disagreed with a product decision on UX grounds.",
  ],
};

const instructions = [
  "Verify the candidate's identity against the shared candidate profile before starting.",
  "Follow the structured interview questions for the assigned position — avoid improvising off-script questions.",
  "Keep each interview within the allotted 45-minute window.",
  "Submit your evaluation within 24 hours of completing the interview.",
  "Flag any concerns (no-shows, technical issues, candidate conduct) to InterQ support immediately.",
];

const criteriaList = [
  { key: "communication", label: "Communication" },
  { key: "technical", label: "Technical Skills" },
  { key: "problemSolving", label: "Problem Solving" },
  { key: "cultureFit", label: "Culture Fit" },
] as const;

type CriteriaKey = typeof criteriaList[number]["key"];

const statusColor: Record<AssignedInterview["status"], string> = {
  Scheduled: "bg-blue-100 text-blue-800",
  Completed: "bg-amber-100 text-amber-800",
  "Feedback Submitted": "bg-emerald-100 text-emerald-800",
};

export default function TAPDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [interviews, setInterviews] = useState(initialInterviews);
  const [evalTarget, setEvalTarget] = useState<AssignedInterview | null>(null);
  const [ratings, setRatings] = useState<Record<CriteriaKey, number>>({
    communication: 70,
    technical: 70,
    problemSolving: 70,
    cultureFit: 70,
  });
  const [overallStars, setOverallStars] = useState(0);
  const [comments, setComments] = useState("");

  const scheduledCount = interviews.filter(i => i.status === "Scheduled").length;
  const awaitingFeedback = interviews.filter(i => i.status === "Completed").length;
  const submittedCount = interviews.filter(i => i.status === "Feedback Submitted").length;

  const openEvaluation = (interview: AssignedInterview) => {
    setEvalTarget(interview);
    setRatings({ communication: 70, technical: 70, problemSolving: 70, cultureFit: 70 });
    setOverallStars(0);
    setComments("");
  };

  const submitFeedback = () => {
    if (!evalTarget) return;
    if (overallStars === 0) {
      toast({ title: "Please add an overall rating", variant: "destructive" });
      return;
    }
    setInterviews(prev => prev.map(i => i.id === evalTarget.id ? { ...i, status: "Feedback Submitted" } : i));
    toast({
      title: "Feedback submitted to InterQ",
      description: `Your evaluation for ${evalTarget.candidate} has been recorded.`,
    });
    setEvalTarget(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Welcome, {user?.name?.split(" ")[0] || "Partner"}</h1>
        <p className="text-slate-600 mt-1">Your assigned video interviews and evaluation tools</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Scheduled Interviews</p>
              <p className="text-3xl font-bold mt-1 text-slate-900">{scheduledCount}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10">
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Awaiting Your Feedback</p>
              <p className="text-3xl font-bold mt-1 text-slate-900">{awaitingFeedback}</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10">
              <ClipboardList className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Feedback Submitted</p>
              <p className="text-3xl font-bold mt-1 text-slate-900">{submittedCount}</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assigned interviews + candidate info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Video className="h-5 w-5 text-teal-600" />
              Assigned Video Interviews
            </CardTitle>
            <CardDescription>Candidate details and join links for your upcoming interviews</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {interviews.map((interview) => (
              <div key={interview.id} className="p-4 rounded-xl border hover:shadow-md transition-shadow bg-white">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <Avatar className="h-11 w-11 flex-shrink-0">
                      <AvatarFallback className="bg-gradient-to-r from-teal-500 to-purple-600 text-white">
                        {interview.candidate.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">{interview.candidate}</p>
                      <p className="text-sm text-slate-600 flex items-center gap-1">
                        <Briefcase className="h-3.5 w-3.5" /> {interview.position}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {interview.date}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {interview.time}</span>
                      </div>
                    </div>
                  </div>
                  <Badge className={statusColor[interview.status]}>{interview.status}</Badge>
                </div>

                <div className="mt-3 p-3 rounded-lg bg-slate-50 text-xs text-slate-600 space-y-1">
                  <p className="flex items-center gap-1.5"><User className="h-3.5 w-3.5 text-slate-400" /> {interview.experience}</p>
                  <p className="flex items-center gap-1.5"><GraduationCap className="h-3.5 w-3.5 text-slate-400" /> {interview.education}</p>
                  <p className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5 text-slate-400 flex-shrink-0 mt-0.5" /> {interview.summary}</p>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {interview.status !== "Feedback Submitted" && (
                    <Button size="sm" variant="outline" className="gap-2" asChild>
                      <a href={interview.joinLink} target="_blank" rel="noreferrer">
                        <ExternalLink className="h-3.5 w-3.5" /> Join Video Interview
                      </a>
                    </Button>
                  )}
                  {interview.status !== "Scheduled" && interview.status !== "Feedback Submitted" && (
                    <Button
                      size="sm"
                      className="gap-2 bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700"
                      onClick={() => openEvaluation(interview)}
                    >
                      <Star className="h-3.5 w-3.5" /> Evaluate Candidate
                    </Button>
                  )}
                  {interview.status === "Feedback Submitted" && (
                    <span className="text-xs text-emerald-700 flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Feedback sent to InterQ
                    </span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Instructions + Questions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <AlertCircle className="h-5 w-5 text-purple-600" />
                Interview Instructions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2.5 text-sm text-slate-700">
                {instructions.map((instr, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-teal-600 font-semibold">{i + 1}.</span>
                    <span>{instr}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <ClipboardList className="h-5 w-5 text-teal-600" />
                Interview Questions
              </CardTitle>
              <CardDescription>By position</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {Object.entries(interviewQuestionsByPosition).map(([position, questions]) => (
                  <AccordionItem key={position} value={position}>
                    <AccordionTrigger className="text-sm font-medium text-slate-900">{position}</AccordionTrigger>
                    <AccordionContent>
                      <ol className="space-y-2 text-sm text-slate-600 list-decimal list-inside">
                        {questions.map((q, i) => <li key={i}>{q}</li>)}
                      </ol>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Evaluation Dialog */}
      <Dialog open={!!evalTarget} onOpenChange={(open) => !open && setEvalTarget(null)}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Evaluate {evalTarget?.candidate}</DialogTitle>
            <DialogDescription>{evalTarget?.position} — submit your structured feedback to InterQ</DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setOverallStars(star)}>
                  <Star className={`h-8 w-8 transition-colors ${star <= overallStars ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
                </button>
              ))}
            </div>

            {criteriaList.map((criteria) => (
              <div key={criteria.key} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{criteria.label}</span>
                  <span className="text-slate-500">{ratings[criteria.key]}%</span>
                </div>
                <Slider
                  value={[ratings[criteria.key]]}
                  onValueChange={([v]) => setRatings(prev => ({ ...prev, [criteria.key]: v }))}
                  max={100}
                  step={5}
                />
              </div>
            ))}

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Feedback Notes</label>
              <Textarea
                placeholder="Summarize the candidate's performance, strengths, and any concerns..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEvalTarget(null)}>Cancel</Button>
            <Button className="gap-2 bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700" onClick={submitFeedback}>
              <Send className="h-4 w-4" /> Submit Feedback to InterQ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
