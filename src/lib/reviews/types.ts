/**
 * Human Review & Responsible AI — Type Definitions
 *
 * Review records track every AI diagnosis that has been evaluated by a
 * human reviewer. They feed the Dashboard metrics and the Responsible AI
 * audit log.
 */

export type ReviewDecision = "accepted" | "edited" | "rejected";

export interface ReviewRecord {
  /** Unique identifier for this review entry. */
  id: string;
  /** Reference to the case or diagnosis (e.g. "CS-001" or "DIAG-<uuid>"). */
  caseId: string;
  /** The AI's original root cause. */
  aiRootCause: string;
  /** The AI's confidence score (0–1). */
  aiConfidence: number;
  /** The AI's suggested fix steps. */
  aiFixSteps: string[];
  /** Human reviewer's decision. */
  decision: ReviewDecision;
  /** Corrected root cause (only when decision is "edited"). */
  correctedRootCause?: string;
  /** Explanation of the correction (only when decision is "edited"). */
  correctionExplanation?: string;
  /** Rejection reason (only when decision is "rejected"). */
  rejectionReason?: string;
  /** Free-text note from the reviewer (optional for any decision). */
  reviewerNote?: string;
  /** ISO timestamp of when the review was submitted. */
  timestamp: string;
}
