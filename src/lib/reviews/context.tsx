import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ReviewRecord, ReviewDecision } from "./types";
import { SAMPLE_REVIEWS } from "./sample-data";

// ─── Context shape ───────────────────────────────────────────────────────────

interface ReviewContextValue {
  /** All review records (sample + user-submitted). */
  reviews: ReviewRecord[];
  /** Submit a new review. */
  submitReview: (record: Omit<ReviewRecord, "id" | "timestamp">) => void;
  /** Count by decision type. */
  counts: { accepted: number; edited: number; rejected: number; total: number };
}

const ReviewContext = createContext<ReviewContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function ReviewProvider({ children }: { children: ReactNode }) {
  const [reviews, setReviews] = useState<ReviewRecord[]>(SAMPLE_REVIEWS);

  const submitReview = useCallback(
    (record: Omit<ReviewRecord, "id" | "timestamp">) => {
      const entry: ReviewRecord = {
        ...record,
        id: `REV-${String(reviews.length + 1).padStart(3, "0")}`,
        timestamp: new Date().toISOString(),
      };
      setReviews((prev) => [entry, ...prev]);
    },
    [reviews.length]
  );

  const counts = useMemo(() => {
    const accepted = reviews.filter((r) => r.decision === "accepted").length;
    const edited = reviews.filter((r) => r.decision === "edited").length;
    const rejected = reviews.filter((r) => r.decision === "rejected").length;
    return { accepted, edited, rejected, total: reviews.length };
  }, [reviews]);

  const value = useMemo(
    () => ({ reviews, submitReview, counts }),
    [reviews, submitReview, counts]
  );

  return (
    <ReviewContext.Provider value={value}>{children}</ReviewContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useReviews(): ReviewContextValue {
  const ctx = useContext(ReviewContext);
  if (!ctx) {
    throw new Error("useReviews must be used within a ReviewProvider");
  }
  return ctx;
}
