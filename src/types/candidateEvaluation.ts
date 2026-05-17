
export type CategoryType = 'technical' | 'communication' | 'problem_solving' | 'cultural_fit' | 'leadership' | 'other';

export interface Candidate {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  experience?: string;
  skills?: string[];
}

export interface EvaluationItem {
  id: string;
  category: CategoryType;
  criterion: string;
  rating: number;
  notes?: string;
  evaluatorId?: string;
}

export interface FinalDecision {
  decision: 'hire' | 'reject' | 'hold';
  reasoning: string;
  nextSteps?: string;
  decidedAt: string;
}

export interface CandidateEvaluation {
  id: string;
  candidate_name: string;
  role: string;
  overallScore: number;
  status: string;
  scores: Record<string, number>;
  skills: Array<{
    name: string;
    level: string;
    score: number;
  }>;
  aiRecommendation: {
    decision: string;
    reasoning: string;
  };
}

