import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/SimpleAuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Clock, ChevronLeft, ChevronRight, CheckCircle, AlertCircle, Flag,
  Check, ListChecks, ArrowLeft, Save,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { assessmentsData, Assessment } from "@/data/assessments";
import { getQuestionsForAssessment, AssessmentQuestion } from "@/data/assessmentQuestions";

type QuestionStatus = "current" | "answered" | "unanswered";

const AUTO_ADVANCE_DELAY_MS = 450;

export default function TakeAssessment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [reviewMode, setReviewMode] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const autoAdvanceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedIndicatorTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!id) return;

    const foundAssessment = assessmentsData.find(a => a.id === id);
    if (foundAssessment) {
      setAssessment(foundAssessment);
      setTimeRemaining(foundAssessment.duration * 60); // Convert to seconds

      const assessmentQuestions = getQuestionsForAssessment(id);
      if (assessmentQuestions.length > 0) {
        // Shuffle questions for randomization
        const shuffledQuestions = [...assessmentQuestions].sort(() => Math.random() - 0.5);
        setQuestions(shuffledQuestions);
      } else {
        // Generate questions if not found
        const generatedQuestions: AssessmentQuestion[] = Array.from({ length: foundAssessment.questions_count }, (_, i) => ({
          id: `${id}_q${i + 1}`,
          assessment_id: id,
          question: `Sample question ${i + 1} for ${foundAssessment.title}?`,
          option_a: "Option A",
          option_b: "Option B",
          option_c: "Option C",
          option_d: "Option D",
          correct_answer: ["A", "B", "C", "D"][i % 4],
          difficulty: foundAssessment.difficulty
        }));
        setQuestions(generatedQuestions);
      }
    }
  }, [id]);

  // Clean up any pending timers on unmount
  useEffect(() => {
    return () => {
      if (autoAdvanceTimeout.current) clearTimeout(autoAdvanceTimeout.current);
      if (savedIndicatorTimeout.current) clearTimeout(savedIndicatorTimeout.current);
    };
  }, []);

  const handleSubmit = useCallback(() => {
    if (isSubmitted) return;

    if (autoAdvanceTimeout.current) clearTimeout(autoAdvanceTimeout.current);
    setIsSubmitted(true);
    setIsStarted(false);
    setReviewMode(false);
    setShowSubmitConfirm(false);

    // Calculate score
    let correctAnswers = 0;
    questions.forEach(question => {
      if (answers[question.id] === question.correct_answer) {
        correctAnswers++;
      }
    });

    const finalScore = Math.round((correctAnswers / questions.length) * 100);
    setScore(finalScore);

    // Save result (mock)
    const result = {
      user_id: user?.id,
      assessment_id: id,
      score: finalScore,
      answers,
      completed_at: new Date().toISOString(),
      time_taken: assessment?.duration ? (assessment.duration * 60) - timeRemaining : 0
    };

    console.log("Assessment result:", result);

    toast({
      title: "Assessment Completed!",
      description: `You scored ${finalScore}%`,
    });
  }, [answers, questions, id, user, assessment, timeRemaining, isSubmitted]);

  // Timer effect
  useEffect(() => {
    if (!isStarted || isSubmitted || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isStarted, isSubmitted, timeRemaining, handleSubmit]);

  const handleStart = () => {
    setIsStarted(true);
    toast({ title: "Assessment Started", description: "Good luck!" });
  };

  const clearPendingAutoAdvance = () => {
    if (autoAdvanceTimeout.current) {
      clearTimeout(autoAdvanceTimeout.current);
      autoAdvanceTimeout.current = null;
    }
  };

  const pulseSaved = () => {
    setJustSaved(true);
    if (savedIndicatorTimeout.current) clearTimeout(savedIndicatorTimeout.current);
    savedIndicatorTimeout.current = setTimeout(() => setJustSaved(false), 1500);
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    pulseSaved();

    // Auto-advance to the next question so candidates don't have to click "Next".
    clearPendingAutoAdvance();
    autoAdvanceTimeout.current = setTimeout(() => {
      setCurrentQuestionIndex(prevIndex => {
        const isLast = prevIndex >= questions.length - 1;
        if (isLast) {
          setReviewMode(true);
          return prevIndex;
        }
        return prevIndex + 1;
      });
    }, AUTO_ADVANCE_DELAY_MS);
  };

  const toggleFlag = (questionId: string) => {
    setFlagged(prev => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const goToQuestion = (index: number) => {
    clearPendingAutoAdvance();
    setReviewMode(false);
    setCurrentQuestionIndex(index);
  };

  const handleNext = () => {
    clearPendingAutoAdvance();
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setReviewMode(true);
    }
  };

  const handlePrevious = () => {
    clearPendingAutoAdvance();
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!assessment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold">Assessment Not Found</h2>
          <p className="text-muted-foreground mt-2">The requested assessment could not be found.</p>
          <Button className="mt-4" onClick={() => navigate("/jobseeker/assessments")}>
            Back to Assessments
          </Button>
        </div>
      </div>
    );
  }

  if (!isStarted && !isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{assessment.title}</CardTitle>
            <p className="text-muted-foreground">{assessment.description}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">{assessment.questions_count}</p>
                <p className="text-sm text-muted-foreground">Questions</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{assessment.duration}</p>
                <p className="text-sm text-muted-foreground">Minutes</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Category:</span>
                <Badge>{assessment.category}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Difficulty:</span>
                <Badge variant={
                  assessment.difficulty === 'easy' ? 'default' :
                  assessment.difficulty === 'medium' ? 'secondary' : 'destructive'
                }>
                  {assessment.difficulty.toUpperCase()}
                </Badge>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Assessment Rules:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Answer all questions to the best of your ability</li>
                <li>• You have {assessment.duration} minutes to complete</li>
                <li>• Assessment will auto-submit when time expires</li>
                <li>• Your answers save automatically as you go — jump to any question anytime</li>
              </ul>
            </div>

            <Button
              size="lg"
              className="w-full"
              onClick={handleStart}
            >
              Start Assessment
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSubmitted) {
    const isPassed = score >= 70;
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {isPassed ? (
                <CheckCircle className="w-16 h-16 text-green-500" />
              ) : (
                <AlertCircle className="w-16 h-16 text-orange-500" />
              )}
            </div>
            <CardTitle className="text-2xl">Assessment Completed!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <div>
              <p className="text-4xl font-bold text-primary mb-2">{score}%</p>
              <p className="text-muted-foreground">
                {isPassed ? "Congratulations! You passed!" : "Keep practicing and try again!"}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{Object.keys(answers).length}</p>
                <p className="text-sm text-muted-foreground">Answered</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {questions.filter(q => answers[q.id] === q.correct_answer).length}
                </p>
                <p className="text-sm text-muted-foreground">Correct</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {questions.filter(q => answers[q.id] && answers[q.id] !== q.correct_answer).length}
                </p>
                <p className="text-sm text-muted-foreground">Incorrect</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate("/jobseeker/assessments")}
              >
                Back to Assessments
              </Button>
              <Button
                className="flex-1"
                onClick={() => navigate("/jobseeker/results")}
              >
                View Results
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;
  const flaggedCount = Object.values(flagged).filter(Boolean).length;
  const unansweredCount = questions.length - answeredCount;
  const completionPct = Math.round((answeredCount / questions.length) * 100);
  const timeLow = timeRemaining <= 60;

  const getStatus = (index: number): QuestionStatus => {
    if (!reviewMode && index === currentQuestionIndex) return "current";
    return answers[questions[index].id] ? "answered" : "unanswered";
  };

  const statusClasses: Record<QuestionStatus, string> = {
    current: "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background",
    answered: "bg-green-500 text-white hover:bg-green-600",
    unanswered: "bg-muted text-muted-foreground hover:bg-muted/80",
  };

  const QuestionNumberButton = ({ index, size = "grid" }: { index: number; size?: "grid" | "fixed" }) => {
    const status = getStatus(index);
    const isFlagged = !!flagged[questions[index].id];
    return (
      <button
        onClick={() => goToQuestion(index)}
        className={cn(
          "relative rounded-lg text-xs font-semibold transition-all",
          size === "grid" ? "w-full aspect-square" : "w-9 h-9 flex-shrink-0",
          statusClasses[status]
        )}
        aria-label={`Question ${index + 1}${isFlagged ? ", flagged" : ""}${status === "answered" ? ", answered" : ""}`}
      >
        {index + 1}
        {isFlagged && (
          <Flag className="w-3 h-3 absolute -top-1.5 -right-1.5 text-amber-500 fill-amber-400 drop-shadow" />
        )}
      </button>
    );
  };

  const SidePanel = (
    <aside className="hidden lg:flex lg:flex-col w-72 flex-shrink-0 border-l bg-card h-[calc(100vh-0px)] sticky top-0">
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <ListChecks className="w-4 h-4 text-primary" />
            Questions
          </h3>
          <span className="text-sm font-medium text-muted-foreground">{completionPct}%</span>
        </div>
        <Progress value={completionPct} className="h-2" />
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground pt-1">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" /> Current</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" /> Answered</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-muted border inline-block" /> Unanswered</span>
          <span className="flex items-center gap-1"><Flag className="w-2.5 h-2.5 text-amber-500 fill-amber-400" /> Flagged</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-5 gap-2">
          {questions.map((_, index) => (
            <QuestionNumberButton key={index} index={index} />
          ))}
        </div>
      </div>

      <div className="p-4 border-t space-y-3 bg-card">
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <p className="font-bold text-green-600">{answeredCount}</p>
            <p className="text-muted-foreground">Answered</p>
          </div>
          <div>
            <p className="font-bold text-muted-foreground">{unansweredCount}</p>
            <p className="text-muted-foreground">Left</p>
          </div>
          <div>
            <p className="font-bold text-amber-500">{flaggedCount}</p>
            <p className="text-muted-foreground">Flagged</p>
          </div>
        </div>
        <Button variant="outline" className="w-full" onClick={() => setReviewMode(true)}>
          Review Answers
        </Button>
        <Button className="w-full" onClick={() => setShowSubmitConfirm(true)} disabled={answeredCount === 0}>
          Submit Assessment
        </Button>
      </div>
    </aside>
  );

  const submitConfirmDialog = (
    <AlertDialog open={showSubmitConfirm} onOpenChange={setShowSubmitConfirm}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Submit assessment?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-3 gap-2 text-center pt-2">
                <div className="rounded-lg bg-muted p-2">
                  <p className="font-bold text-green-600">{answeredCount}</p>
                  <p className="text-xs text-muted-foreground">Answered</p>
                </div>
                <div className="rounded-lg bg-muted p-2">
                  <p className="font-bold">{unansweredCount}</p>
                  <p className="text-xs text-muted-foreground">Unanswered</p>
                </div>
                <div className="rounded-lg bg-muted p-2">
                  <p className="font-bold text-amber-500">{flaggedCount}</p>
                  <p className="text-xs text-muted-foreground">Flagged</p>
                </div>
              </div>
              {unansweredCount > 0 && (
                <p className="text-amber-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  You still have {unansweredCount} unanswered question{unansweredCount > 1 ? "s" : ""}. You won't be able to change answers after submitting.
                </p>
              )}
              {unansweredCount === 0 && (
                <p className="text-muted-foreground">Once submitted, you won't be able to change any answers.</p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep Reviewing</AlertDialogCancel>
          <AlertDialogAction onClick={handleSubmit}>Yes, Submit</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  const Header = (
    <div className="border-b bg-card sticky top-0 z-10">
      <div className="px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-bold truncate">{assessment.title}</h1>
            <p className="text-sm text-muted-foreground">
              {reviewMode ? "Reviewing your answers" : `Question ${currentQuestionIndex + 1} of ${questions.length}`}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {justSaved && (
              <span className="hidden sm:flex items-center gap-1 text-xs text-green-600 font-medium animate-in fade-in">
                <Save className="w-3.5 h-3.5" /> Saved
              </span>
            )}
            <div className={cn(
              "flex items-center gap-2 px-2.5 py-1 rounded-md font-mono text-sm sm:text-lg",
              timeLow ? "text-red-600 bg-red-50" : ""
            )}>
              <Clock className="w-4 h-4" />
              {formatTime(timeRemaining)}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSubmitConfirm(true)}
              disabled={answeredCount === 0}
              className="hidden sm:inline-flex"
            >
              Submit
            </Button>
          </div>
        </div>
        <Progress value={completionPct} className="mt-2" />
      </div>
    </div>
  );

  if (reviewMode) {
    return (
      <div className="min-h-screen bg-background flex">
        <div className="flex-1 min-w-0">
          {Header}
          <div className="px-4 sm:px-6 py-8 max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-primary" />
                Review Your Answers
              </h2>
              <Button variant="ghost" size="sm" onClick={() => goToQuestion(currentQuestionIndex)} className="gap-1.5">
                <ArrowLeft className="w-4 h-4" /> Back to Assessment
              </Button>
            </div>

            <div className="space-y-2">
              {questions.map((q, index) => {
                const status = getStatus(index);
                const isFlagged = !!flagged[q.id];
                return (
                  <button
                    key={q.id}
                    onClick={() => goToQuestion(index)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors text-left"
                  >
                    <span className={cn(
                      "w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-semibold",
                      status === "answered" ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
                    )}>
                      {index + 1}
                    </span>
                    <span className="flex-1 min-w-0 text-sm truncate">{q.question}</span>
                    {isFlagged && <Flag className="w-4 h-4 text-amber-500 fill-amber-400 flex-shrink-0" />}
                    <Badge variant={answers[q.id] ? "secondary" : "outline"} className="flex-shrink-0">
                      {answers[q.id] ? `Answered: ${answers[q.id]}` : "Not answered"}
                    </Badge>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3 mt-8">
              <Button variant="outline" className="flex-1" onClick={() => goToQuestion(currentQuestionIndex)}>
                Continue Answering
              </Button>
              <Button className="flex-1" onClick={() => setShowSubmitConfirm(true)}>
                Submit Assessment
              </Button>
            </div>
          </div>
        </div>
        {SidePanel}
        {submitConfirmDialog}
      </div>
    );
  }

  const options: { key: "A" | "B" | "C" | "D"; text: string }[] = [
    { key: "A", text: currentQuestion.option_a },
    { key: "B", text: currentQuestion.option_b },
    { key: "C", text: currentQuestion.option_c },
    { key: "D", text: currentQuestion.option_d },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      <div className="flex-1 min-w-0">
        {Header}

        {/* Question */}
        <div className="px-4 sm:px-6 py-8">
          <Card className="max-w-3xl mx-auto">
            <CardContent className="p-6 sm:p-8">
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-xl font-semibold leading-snug">
                    {currentQuestion.question}
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFlag(currentQuestion.id)}
                    className={cn(
                      "flex-shrink-0 gap-1.5",
                      flagged[currentQuestion.id] && "text-amber-600"
                    )}
                  >
                    <Flag className={cn("w-4 h-4", flagged[currentQuestion.id] && "fill-amber-400")} />
                    <span className="hidden sm:inline">{flagged[currentQuestion.id] ? "Flagged" : "Flag"}</span>
                  </Button>
                </div>

                <div className="space-y-3">
                  {options.map((option) => {
                    const isSelected = answers[currentQuestion.id] === option.key;
                    return (
                      <button
                        key={option.key}
                        onClick={() => handleAnswerSelect(currentQuestion.id, option.key)}
                        className={cn(
                          "w-full flex items-center gap-3 p-4 rounded-lg border-2 text-left transition-all",
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/40 hover:bg-muted/40"
                        )}
                      >
                        <span className={cn(
                          "w-7 h-7 flex-shrink-0 rounded-full border-2 flex items-center justify-center text-xs font-semibold",
                          isSelected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40 text-muted-foreground"
                        )}>
                          {isSelected ? <Check className="w-4 h-4" /> : option.key}
                        </span>
                        <span className="flex-1">{option.text}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Navigation */}
                <div className="pt-6 border-t flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  <Button variant="ghost" onClick={() => setReviewMode(true)} className="gap-1.5">
                    <ListChecks className="w-4 h-4" />
                    Review All
                  </Button>

                  {currentQuestionIndex === questions.length - 1 ? (
                    <Button onClick={() => setReviewMode(true)}>
                      Review & Submit
                    </Button>
                  ) : (
                    <Button onClick={handleNext}>
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mobile question navigator (panel is hidden below lg) */}
          <div className="lg:hidden max-w-3xl mx-auto mt-6">
            <div className="flex flex-wrap justify-center gap-2">
              {questions.map((_, index) => (
                <QuestionNumberButton key={index} index={index} size="fixed" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {SidePanel}
      {submitConfirmDialog}
    </div>
  );
}
