// Turns the candidate `status` column into an actual gated workflow instead of
// a freeform dropdown. Order matters: it's the sequence shown in the UI.
export const CANDIDATE_STAGES = ["applied", "screening", "interview", "offer", "hired"] as const;
export type CandidateStage = (typeof CANDIDATE_STAGES)[number] | "rejected";

export interface PipelineContext {
  /** Does this candidate have at least one `interviews` row? */
  hasInterview: boolean;
  /** Is the most recent interview marked `completed` with a score? */
  interviewCompleted: boolean;
  /** Does this candidate have a `job_offers` row with status `accepted`? */
  hasAcceptedOffer: boolean;
}

export interface StageAction {
  targetStatus: CandidateStage;
  label: string;
  /** Why the action is disabled, if it is. */
  disabledReason?: string;
}

/** Which stage-transition buttons should be enabled for this candidate right now. */
export function getAvailableActions(currentStatus: string, ctx: PipelineContext): StageAction[] {
  if (currentStatus === "rejected" || currentStatus === "hired") {
    return [];
  }

  const actions: StageAction[] = [];

  if (currentStatus === "applied") {
    actions.push({ targetStatus: "screening", label: "Move to Screening" });
  }

  if (currentStatus === "applied" || currentStatus === "screening") {
    actions.push(
      ctx.hasInterview
        ? { targetStatus: "interview", label: "Already Scheduled", disabledReason: "Interview already scheduled" }
        : { targetStatus: "interview", label: "Schedule Interview" }
    );
  }

  if (currentStatus === "interview") {
    actions.push(
      ctx.interviewCompleted
        ? { targetStatus: "offer", label: "Extend Offer" }
        : { targetStatus: "offer", label: "Extend Offer", disabledReason: "Complete the interview (with a score) first" }
    );
  }

  if (currentStatus === "offer") {
    actions.push(
      ctx.hasAcceptedOffer
        ? { targetStatus: "hired", label: "Mark Hired" }
        : { targetStatus: "hired", label: "Mark Hired", disabledReason: "Waiting on the candidate to accept the offer" }
    );
  }

  actions.push({ targetStatus: "rejected", label: "Reject" });

  return actions;
}
