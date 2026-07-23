import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/SimpleAuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Clock, ChevronLeft, ChevronRight, CheckCircle, AlertCircle } from "lucide-react";
import { assessmentsData, Assessment } from "@/data/assessments";
import { getQuestionsForAssessment, AssessmentQuestion } from "@/data/assessmentQuestions";

export default function TakeAssessment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

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
  }, [isStarted, isSubmitted, timeRemaining]);

  const handleStart = () => {
    setIsStarted(true);
    toast({ title: "Assessment Started", description: "Good luck!" });
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = useCallback(() => {
    if (isSubmitted) return;

    setIsSubmitted(true);
    setIsStarted(false);

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
                <li>• You can navigate between questions</li>
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
  const answeredQuestions = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold">{assessment.title}</h1>
              <p className="text-sm text-muted-foreground">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="font-mono text-lg">
                  {formatTime(timeRemaining)}
                </span>
              </div>
              <Button
                variant="outline"
                onClick={handleSubmit}
                disabled={answeredQuestions === 0}
              >
                Submit Assessment
              </Button>
            </div>
          </div>
          <Progress
            value={(answeredQuestions / questions.length) * 100}
            className="mt-2"
          />
        </div>
      </div>

      {/* Question */}
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-8">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  {currentQuestion.question}
                </h2>

                <RadioGroup
                  value={answers[currentQuestion.id] || ""}
                  onValueChange={(value) => handleAnswerSelect(currentQuestion.id, value)}
                >
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="A" id="A" />
                      <Label htmlFor="A" className="flex-1 cursor-pointer">
                        A) {currentQuestion.option_a}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="B" id="B" />
                      <Label htmlFor="B" className="flex-1 cursor-pointer">
                        B) {currentQuestion.option_b}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="C" id="C" />
                      <Label htmlFor="C" className="flex-1 cursor-pointer">
                        C) {currentQuestion.option_c}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="D" id="D" />
                      <Label htmlFor="D" className="flex-1 cursor-pointer">
                        D) {currentQuestion.option_d}
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* Navigation */}
              <div className="pt-6 border-t space-y-4">
                <div className="flex flex-wrap justify-center gap-2">
                  {questions.map((_, index) => (
                    <button
                      key={index}
                      className={`w-8 h-8 flex-shrink-0 rounded-full text-xs font-medium ${
                        index === currentQuestionIndex
                          ? 'bg-primary text-primary-foreground'
                          : answers[questions[index].id]
                          ? 'bg-green-500 text-white'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                      onClick={() => setCurrentQuestionIndex(index)}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  {currentQuestionIndex === questions.length - 1 ? (
                    <Button
                      onClick={handleSubmit}
                      disabled={answeredQuestions === 0}
                    >
                      Submit Assessment
                    </Button>
                  ) : (
                    <Button onClick={handleNext}>
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}