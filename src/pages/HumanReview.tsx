import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useReviews, type ReviewRecord } from "@/lib/reviews";
import {
  Eye,
  CheckCircle2,
  Pencil,
  XCircle,
  ChevronRight,
  Clock,
  Filter,
} from "lucide-react";

// ─── Decision styling ────────────────────────────────────────────────────────

const DECISION_CONFIG = {
  accepted: {
    icon: CheckCircle2,
    label: "Accepted",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  edited: {
    icon: Pencil,
    label: "Edited",
    color: "text-amber-500",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  rejected: {
    icon: XCircle,
    label: "Rejected",
    color: "text-rose-500",
    bg: "bg-rose-500/10 border-rose-500/20",
  },
} as const;

// ─── Review Detail ───────────────────────────────────────────────────────────

function ReviewDetail({ record }: { record: ReviewRecord }) {
  const cfg = DECISION_CONFIG[record.decision];
  const Icon = cfg.icon;

  return (
    <div className="space-y-4">
      {/* AI Diagnosis */}
      <div className="space-y-1.5">
        <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          AI Root Cause
        </h4>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {record.aiRootCause}
        </p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-[10px] text-muted-foreground/60">
            Confidence: {Math.round(record.aiConfidence * 100)}%
          </span>
        </div>
      </div>

      {/* AI Fix Steps */}
      <div className="space-y-1.5">
        <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          AI Recommended Steps
        </h4>
        <ol className="space-y-1">
          {record.aiFixSteps.map((step, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-[11px] text-muted-foreground leading-relaxed"
            >
              <span className="font-mono text-[9px] text-muted-foreground/50 mt-0.5 w-3 shrink-0 text-right">
                {i + 1}.
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      <Separator />

      {/* Review Decision */}
      <div className="space-y-2">
        <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          Review Decision
        </h4>
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium ${cfg.bg} ${cfg.color}`}>
          <Icon className="size-3" />
          {cfg.label}
        </div>
      </div>

      {/* Corrections (edited) */}
      {record.decision === "edited" && record.correctedRootCause && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              Corrected Root Cause
            </h4>
            <p className="text-xs leading-relaxed">
              {record.correctedRootCause}
            </p>
          </div>
          {record.correctionExplanation && (
            <div className="space-y-1.5">
              <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                Correction Explanation
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {record.correctionExplanation}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Rejection reason */}
      {record.decision === "rejected" && record.rejectionReason && (
        <div className="space-y-1.5">
          <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Rejection Reason
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {record.rejectionReason}
          </p>
        </div>
      )}

      {/* Reviewer note */}
      {record.reviewerNote && (
        <div className="space-y-1.5">
          <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Reviewer Note
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed italic">
            {record.reviewerNote}
          </p>
        </div>
      )}

      {/* Timestamp */}
      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/50">
        <Clock className="size-3" />
        {new Date(record.timestamp).toLocaleString()}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function HumanReview() {
  const { reviews, counts } = useReviews();
  const [filter, setFilter] = useState<"all" | "accepted" | "edited" | "rejected">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = filter === "all" ? reviews : reviews.filter((r) => r.decision === filter);

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Human Review</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Expert validation of AI-generated diagnoses
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-border/50 py-4">
          <CardContent className="pt-0 px-4">
            <p className="text-2xl font-semibold tracking-tight tabular-nums">
              {counts.total}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Total Reviews
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/50 py-4">
          <CardContent className="pt-0 px-4">
            <p className="text-2xl font-semibold tracking-tight text-emerald-500 tabular-nums">
              {counts.accepted}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Accepted</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 py-4">
          <CardContent className="pt-0 px-4">
            <p className="text-2xl font-semibold tracking-tight text-amber-500 tabular-nums">
              {counts.edited}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Edited</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 py-4">
          <CardContent className="pt-0 px-4">
            <p className="text-2xl font-semibold tracking-tight text-rose-500 tabular-nums">
              {counts.rejected}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Rejected</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="size-3.5 text-muted-foreground" />
        <div className="flex gap-1.5">
          {(["all", "accepted", "edited", "rejected"] as const).map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "default" : "ghost"}
              className="text-[10px] uppercase tracking-wider h-7 px-2.5"
              onClick={() => {
                setFilter(f);
                setExpandedId(null);
              }}
            >
              {f === "all" ? `All (${reviews.length})` : f}
            </Button>
          ))}
        </div>
      </div>

      {/* Review List */}
      {filtered.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted mb-4">
                <Eye className="size-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                No reviews match this filter.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((record) => {
            const cfg = DECISION_CONFIG[record.decision];
            const Icon = cfg.icon;
            const isExpanded = expandedId === record.id;

            return (
              <Card key={record.id} className="border-border/50">
                <button
                  className="w-full text-left px-6 py-4 hover:bg-muted/20 transition-colors cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : record.id)}
                >
                  <div className="flex items-center gap-3">
                    <ChevronRight
                      className={`size-3.5 text-muted-foreground/50 shrink-0 transition-transform ${
                        isExpanded ? "rotate-90" : ""
                      }`}
                    />
                    <span className="font-mono text-xs text-muted-foreground w-16 shrink-0">
                      {record.caseId}
                    </span>
                    <div
                      className={`flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-medium shrink-0 ${cfg.bg} ${cfg.color}`}
                    >
                      <Icon className="size-2.5" />
                      {cfg.label}
                    </div>
                    <p className="text-xs text-muted-foreground flex-1 truncate">
                      {record.aiRootCause.slice(0, 80)}…
                    </p>
                    <span className="text-[10px] text-muted-foreground/50 shrink-0 hidden sm:block">
                      {new Date(record.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-6 pb-5 pt-0">
                    <Separator className="mb-4" />
                    <ReviewDetail record={record} />
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Demo notice */}
      {reviews.some((r) =>
        ["REV-001", "REV-002", "REV-003", "REV-004", "REV-005"].includes(r.id)
      ) && (
        <p className="text-[10px] text-muted-foreground/50">
          Reviews labeled REV-001 through REV-005 are constructed demonstration
          records. They illustrate the review workflow and are not from real
          user sessions.
        </p>
      )}
    </div>
  );
}
