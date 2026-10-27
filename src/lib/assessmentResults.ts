import { assessmentsData } from "@/data/assessments";

// assessment_results rows have used two shapes across migrations: the current one
// (score as a percentage + status) and an older one (percentage + passed + total_points).
// assessment_id is free text with no foreign key, so titles are resolved from the
// static assessment catalog rather than a PostgREST join.
export interface NormalizedResult {
  id: string;
  userId: string;
  assessmentId: string | null;
  title: string;
  category: string | null;
  percent: number;
  passed: boolean;
  correctAnswers: number | null;
  totalQuestions: number | null;
  completedAt: string | null;
}

export const PASS_MARK = 70;

export function normalizeResult(r: any): NormalizedResult {
  const meta = assessmentsData.find((a) => a.id === r.assessment_id);
  const percent = Math.round(Number(r.percentage ?? r.score ?? 0));
  return {
    id: r.id,
    userId: r.user_id,
    assessmentId: r.assessment_id ?? null,
    title: meta?.title ?? "Assessment",
    category: meta?.category ?? null,
    percent,
    passed: typeof r.passed === "boolean" ? r.passed : r.status ? r.status === "passed" : percent >= PASS_MARK,
    correctAnswers: r.correct_answers ?? null,
    totalQuestions: r.total_questions ?? null,
    completedAt: r.completed_at ?? null,
  };
}
