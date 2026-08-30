import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useReviews, type ReviewRecord } from "@/lib/reviews";
import {
  ScrollText,
  CheckCircle2,
  Pencil,
  XCircle,
  ChevronRight,
  Clock,
  AlertTriangle,
  Filter,
} from "lucide-react";

// ─── Decision styling ────────────────────────────────────────────────────────

const DECISION_ICON = {
  accepted: { icon: CheckCircle2, color: "text-emerald-500" },
  edited: { icon: Pencil, color: "text-amber-500" },
  rejected: { icon: XCircle, color: "text-rose-500" },
} as const;

// ─── Audit Entry ─────────────────────────────────────────────────────────────

function AuditEntry({ record }: { record: ReviewRecord }) {
  const dec = DECISION_ICON[record.decision];
  const Icon = dec.icon;
  const wasCorrected =
    record.decision === "edited" || record.decision === "rejected";

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs text-muted-foreground w-16 shrink-0">
          {record.caseId}
        </span>
        <Icon className={`size-3.5 ${dec.color} shrink-0`} />
        <span className="text-xs font-medium capitalize">
          {record.decision}
        </span>
        {wasCorrected && (
          <Badge
            variant="outline"
            className="text-[9px] text-amber-500 border-amber-500/30"
          >
            AI Corrected
          </Badge>
        )}
        <span className="ml-auto text-[10px] text-muted-foreground/50 shrink-0 hidden sm:block">
          {new Date(record.timestamp).toLocaleString()}
        </span>
      </div>

      {/* AI Diagnosis */}
      <div className="ml-16 space-y-2">
        <div className="space-y-1">
          <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            AI Diagnosis
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {record.aiRootCause}
          </p>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-muted-foreground/60">
              Confidence: {Math.round(record.aiConfidence * 100)}%
            </span>
          </div>
        </div>

        {/* Human Decision Details */}
        {record.decision === "edited" && record.correctedRootCause && (
          <div className="space-y-1">
            <h4 className="text-[10px] font-medium text-amber-500 uppercase tracking-wider">
              Corrected Diagnosis
            </h4>
            <p className="text-xs leading-relaxed">
              {record.correctedRootCause}
            </p>
            {record.correctionExplanation && (
              <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">
                {record.correctionExplanation}
              </p>
            )}
          </div>
        )}

        {record.decision === "rejected" && record.rejectionReason && (
          <div className="space-y-1">
            <h4 className="text-[10px] font-medium text-rose-500 uppercase tracking-wider">
              Rejection Reason
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {record.rejectionReason}
            </p>
          </div>
        )}

        {record.reviewerNote && (
          <div className="space-y-1">
            <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              Reviewer Note
            </h4>
            <p className="text-[11px] text-muted-foreground italic leading-relaxed">
              {record.reviewerNote}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ResponsibleAI() {
  const { reviews, counts } = useReviews();
  const [filter, setFilter] = useState<"all" | "corrected" | "accepted">(
    "all"
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (filter === "all") return reviews;
    if (filter === "corrected")
      return reviews.filter(
        (r) => r.decision === "edited" || r.decision === "rejected"
      );
    return reviews.filter((r) => r.decision === "accepted");
  }, [reviews, filter]);

  const correctedCount = reviews.filter(
    (r) => r.decision === "edited" || r.decision === "rejected"
  ).length;

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Responsible AI Log
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Audit trail for every AI decision, confidence score, and human
          override
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-border/50 py-4">
          <CardContent className="pt-0 px-4">
            <p className="text-2xl font-semibold tracking-tight tabular-nums">
              {counts.total}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Total Diagnoses
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/50 py-4">
          <CardContent className="pt-0 px-4">
            <p className="text-2xl font-semibold tracking-tight text-emerald-500 tabular-nums">
              {counts.accepted}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              AI Accepted
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/50 py-4">
          <CardContent className="pt-0 px-4">
            <p className="text-2xl font-semibold tracking-tight text-amber-500 tabular-nums">
              {correctedCount}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              AI Corrected
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/50 py-4">
          <CardContent className="pt-0 px-4">
            <p className="text-2xl font-semibold tracking-tight tabular-nums">
              {counts.total > 0
                ? Math.round(
                    (counts.accepted / counts.total) * 100
                  )
                : 0}
              %
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Agreement Rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter + Disclaimer */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="size-3.5 text-muted-foreground" />
          <div className="flex gap-1.5">
            {(["all", "corrected", "accepted"] as const).map((f) => (
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
                {f === "all"
                  ? `All (${reviews.length})`
                  : f === "corrected"
                    ? `Corrected (${correctedCount})`
                    : `Accepted (${counts.accepted})`}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Demo Banner */}
      <div className="flex items-start gap-2.5 p-3 rounded-lg bg-muted/40 border border-border/50">
        <AlertTriangle className="size-3.5 text-amber-500 mt-0.5 shrink-0" />
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Reviews REV-001 through REV-005 are <strong>constructed demonstration
          records</strong> illustrating the audit workflow. They are not from
          real user sessions. New reviews submitted through the Troubleshooter
          will appear here alongside the examples.
        </p>
      </div>

      {/* Audit Log */}
      {filtered.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted mb-4">
                <ScrollText className="size-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                No audit entries match this filter.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ScrollText className="size-4 text-muted-foreground" />
              Audit Trail
            </CardTitle>
            <CardDescription>
              {filtered.length} record{filtered.length !== 1 ? "s" : ""} shown
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              {filtered.map((record) => {
                const isExpanded = expandedId === record.id;
                return (
                  <div key={record.id}>
                    <button
                      className="w-full text-left px-6 py-3.5 hover:bg-muted/20 transition-colors cursor-pointer"
                      onClick={() =>
                        setExpandedId(isExpanded ? null : record.id)
                      }
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
                        <span className="text-[10px] text-muted-foreground/50 shrink-0 hidden sm:block">
                          {new Date(record.timestamp).toLocaleDateString()}
                        </span>
                        <p className="text-xs text-muted-foreground flex-1 truncate">
                          {record.aiRootCause.slice(0, 90)}…
                        </p>
                        <span className="text-[10px] text-muted-foreground/50 shrink-0">
                          {Math.round(record.aiConfidence * 100)}%
                        </span>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-6 pb-5 pt-0">
                        <Separator className="mb-4" />
                        <AuditEntry record={record} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
