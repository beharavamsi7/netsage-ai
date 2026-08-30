import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  diagnose,
  getProviderName,
  type DiagnosisResponse,
} from "@/lib/ai";
import { useReviews } from "@/lib/reviews";
import {
  BrainCircuit,
  Terminal,
  Lightbulb,
  Clock,
  CheckCircle2,
  Pencil,
  XCircle,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";

// ─── Confidence helpers ──────────────────────────────────────────────────────

function confidenceColor(score: number): string {
  if (score >= 0.75) return "text-emerald-500";
  if (score >= 0.55) return "text-amber-500";
  return "text-rose-500";
}

function confidenceBarColor(score: number): string {
  if (score >= 0.75) return "bg-emerald-500/40";
  if (score >= 0.55) return "bg-amber-500/40";
  return "bg-rose-500/40";
}

function confidenceLabel(score: number): string {
  if (score >= 0.75) return "High";
  if (score >= 0.55) return "Medium";
  return "Low";
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function Troubleshooter() {
  // Input state
  const [symptoms, setSymptoms] = useState("");
  const [packetTracerNotes, setPacketTracerNotes] = useState("");
  const [showCommands, setShowCommands] = useState("");

  // Diagnosis state
  const [diagnosis, setDiagnosis] = useState<(DiagnosisResponse & { provider_name: string }) | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Review state
  const { submitReview } = useReviews();
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewDecision, setReviewDecision] = useState<"accepted" | "edited" | "rejected" | null>(null);
  const [correctedRootCause, setCorrectedRootCause] = useState("");
  const [correctionExplanation, setCorrectionExplanation] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [reviewerNote, setReviewerNote] = useState("");

  const handleDiagnose = async () => {
    // Validate
    if (!symptoms.trim()) {
      setError("At least a symptom description is required.");
      return;
    }

    setError(null);
    setDiagnosis(null);
    setReviewSubmitted(false);
    setReviewDecision(null);
    setIsLoading(true);

    try {
      const result = await diagnose({
        symptoms: symptoms.trim(),
        packetTracerNotes: packetTracerNotes.trim(),
        showCommandOutput: showCommands.trim(),
      });
      setDiagnosis(result);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(`Diagnosis failed: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewSelect = (action: "accepted" | "edited" | "rejected") => {
    setReviewDecision(action);
    // Reset sub-fields
    setCorrectedRootCause("");
    setCorrectionExplanation("");
    setRejectionReason("");
  };

  const isSubmitDisabled =
    (reviewDecision === "edited" && !correctedRootCause.trim()) ||
    (reviewDecision === "rejected" && !rejectionReason.trim());

  const handleSubmitReview = () => {
    if (!diagnosis || !reviewDecision) return;

    submitReview({
      caseId: `DIAG-${Date.now().toString(36).toUpperCase()}`,
      aiRootCause: diagnosis.root_cause,
      aiConfidence: diagnosis.confidence,
      aiFixSteps: diagnosis.fix_steps,
      decision: reviewDecision,
      correctedRootCause: reviewDecision === "edited" ? correctedRootCause : undefined,
      correctionExplanation: reviewDecision === "edited" ? correctionExplanation : undefined,
      rejectionReason: reviewDecision === "rejected" ? rejectionReason : undefined,
      reviewerNote: reviewerNote || undefined,
    });

    setReviewSubmitted(true);
  };

  const handleReset = () => {
    setDiagnosis(null);
    setReviewSubmitted(false);
    setReviewDecision(null);
    setCorrectedRootCause("");
    setCorrectionExplanation("");
    setRejectionReason("");
    setReviewerNote("");
    setError(null);
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Troubleshooter
          </h1>
          <Badge
            variant="secondary"
            className="text-[10px] font-medium uppercase tracking-wide"
          >
            Mock Provider
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Submit a network symptom and receive an AI-generated diagnosis
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Input Panel ──────────────────────────────────────────────── */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Terminal className="size-4 text-muted-foreground" />
              Input
            </CardTitle>
            <CardDescription>
              Describe the problem and attach relevant context
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Network Symptom <span className="text-rose-500">*</span>
              </label>
              <Textarea
                placeholder="e.g. Hosts on VLAN 10 cannot ping the default gateway. Switch interface shows up/up but traffic is not passing."
                className="min-h-[120px] text-sm resize-none"
                value={symptoms}
                onChange={(e) => {
                  setSymptoms(e.target.value);
                  if (error) setError(null);
                }}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Packet Tracer Notes
              </label>
              <Textarea
                placeholder="e.g. Topology: 2 switches, 1 router. Router on subinterfaces for inter-VLAN routing. VLAN 10 on S1 Gi0/1-4."
                className="min-h-[100px] text-sm resize-none"
                value={packetTracerNotes}
                onChange={(e) => setPacketTracerNotes(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Show-Command Output
              </label>
              <Textarea
                placeholder={
                  "S1# show vlan brief\nVLAN Name                             Status    Ports\n---- -------------------------------- --------- ------------------\n10   USERS                            active    Gi0/1, Gi0/2, Gi0/3\n20   SERVERS                          active"
                }
                className="min-h-[120px] text-sm font-mono text-xs resize-none"
                value={showCommands}
                onChange={(e) => setShowCommands(e.target.value)}
              />
            </div>

            {/* Validation error */}
            {error && (
              <div className="flex items-center gap-2 text-xs text-rose-500">
                <AlertTriangle className="size-3.5 shrink-0" />
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                className="flex-1 gap-2"
                onClick={handleDiagnose}
                disabled={isLoading || !symptoms.trim()}
              >
                {isLoading ? (
                  <>
                    <span className="size-4 animate-spin rounded-full border-2 border-background border-t-foreground/40" />
                    Analyzing…
                  </>
                ) : (
                  <>
                    <BrainCircuit className="size-4" />
                    Diagnose
                  </>
                )}
              </Button>
              {diagnosis && (
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  Reset
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Output Panel ─────────────────────────────────────────────── */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Lightbulb className="size-4 text-muted-foreground" />
              AI Diagnosis
            </CardTitle>
            <CardDescription>
              AI-generated analysis — requires human review before action
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Empty state */}
            {!diagnosis && !isLoading && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-muted mb-4">
                  <BrainCircuit className="size-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Enter your symptoms and click Diagnose to receive an AI
                  analysis.
                </p>
                <p className="text-[10px] text-muted-foreground/50 mt-2 max-w-[260px]">
                  Provider: {getProviderName() === "gemini-flash" ? "Gemini (LLM)" : "Mock (keyword matching)"}
                </p>
              </div>
            )}

            {/* Loading state */}
            {isLoading && !diagnosis && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="size-8 animate-spin rounded-full border-2 border-border border-t-foreground/40 mb-4" />
                <p className="text-sm text-muted-foreground">
                  Running diagnosis…
                </p>
              </div>
            )}

            {/* Diagnosis result */}
            {diagnosis && (
              <div className="space-y-5">
                {/* Disclaimer */}
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-muted/40 border border-border/50">
                  <AlertTriangle className="size-3.5 text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    This is an AI-generated recommendation. Do not apply changes
                    without reviewing the evidence and confirming the diagnosis
                    matches your environment.
                  </p>
                </div>

                {/* Root Cause */}
                <div className="space-y-2">
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Root Cause
                  </h3>
                  <p className="text-sm leading-relaxed">
                    {diagnosis.root_cause}
                  </p>
                </div>

                <Separator />

                {/* Confidence + OSI Layer */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Confidence
                    </h3>
                    <div className="flex items-center gap-2.5">
                      <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${confidenceBarColor(diagnosis.confidence)}`}
                          style={{
                            width: `${Math.round(diagnosis.confidence * 100)}%`,
                          }}
                        />
                      </div>
                      <span
                        className={`text-xs font-medium tabular-nums ${confidenceColor(diagnosis.confidence)}`}
                      >
                        {Math.round(diagnosis.confidence * 100)}%
                      </span>
                    </div>
                    <p className={`text-[10px] ${confidenceColor(diagnosis.confidence)}`}>
                      {confidenceLabel(diagnosis.confidence)} confidence
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      OSI Layer
                    </h3>
                    <Badge variant="outline" className="text-xs font-mono">
                      {diagnosis.osi_layer}
                    </Badge>
                  </div>
                </div>

                <Separator />

                {/* Evidence */}
                <div className="space-y-2">
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Evidence
                  </h3>
                  <ul className="space-y-1.5">
                    {diagnosis.evidence.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed"
                      >
                        <ChevronRight className="size-3 mt-0.5 shrink-0 text-muted-foreground/50" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator />

                {/* Next Command */}
                <div className="space-y-2">
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Suggested Next Command
                  </h3>
                  <div className="rounded-md bg-muted/30 border border-border/50 px-3 py-2">
                    <code className="text-xs font-mono text-foreground">
                      {diagnosis.next_command}
                    </code>
                  </div>
                </div>

                <Separator />

                {/* Fix Steps */}
                <div className="space-y-2">
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Recommended Steps
                  </h3>
                  <ol className="space-y-1.5">
                    {diagnosis.fix_steps.map((step, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 text-xs text-muted-foreground leading-relaxed"
                      >
                        <span className="font-mono text-[10px] text-muted-foreground/50 mt-0.5 w-4 shrink-0 text-right">
                          {i + 1}.
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>

                <Separator />

                {/* Review Actions */}
                <div className="space-y-3">
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Human Review
                  </h3>

                  {reviewSubmitted ? (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/40 border border-border/50">
                      <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                      <div>
                        <p className="text-xs font-medium">
                          Review submitted
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          This diagnosis has been recorded in the review system.
                        </p>
                      </div>
                    </div>
                  ) : !reviewDecision ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-xs"
                        onClick={() => handleReviewSelect("accepted")}
                      >
                        <CheckCircle2 className="size-3.5" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-xs"
                        onClick={() => handleReviewSelect("edited")}
                      >
                        <Pencil className="size-3.5" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-xs"
                        onClick={() => handleReviewSelect("rejected")}
                      >
                        <XCircle className="size-3.5" />
                        Reject
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Decision selected — show details form */}
                      <div className="flex items-center gap-2">
                        {reviewDecision === "accepted" && (
                          <CheckCircle2 className="size-3.5 text-emerald-500" />
                        )}
                        {reviewDecision === "edited" && (
                          <Pencil className="size-3.5 text-amber-500" />
                        )}
                        {reviewDecision === "rejected" && (
                          <XCircle className="size-3.5 text-rose-500" />
                        )}
                        <span className="text-xs font-medium capitalize">
                          Marking as {reviewDecision}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="ml-auto text-[10px] h-6"
                          onClick={() => setReviewDecision(null)}
                        >
                          Change
                        </Button>
                      </div>

                      {reviewDecision === "edited" && (
                        <>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                              Corrected Root Cause
                            </label>
                            <Textarea
                              placeholder="What is the correct root cause?"
                              className="min-h-[80px] text-xs resize-none"
                              value={correctedRootCause}
                              onChange={(e) => setCorrectedRootCause(e.target.value)}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                              Correction Explanation
                            </label>
                            <Textarea
                              placeholder="Why was the AI diagnosis wrong or incomplete?"
                              className="min-h-[60px] text-xs resize-none"
                              value={correctionExplanation}
                              onChange={(e) => setCorrectionExplanation(e.target.value)}
                            />
                          </div>
                        </>
                      )}

                      {reviewDecision === "rejected" && (
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                            Rejection Reason
                          </label>
                          <Textarea
                            placeholder="Why is the AI diagnosis incorrect?"
                            className="min-h-[80px] text-xs resize-none"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                          />
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                          Reviewer Note (optional)
                        </label>
                        <Textarea
                          placeholder="Additional notes for the audit log…"
                          className="min-h-[50px] text-xs resize-none"
                          value={reviewerNote}
                          onChange={(e) => setReviewerNote(e.target.value)}
                        />
                      </div>

                      <Button
                        size="sm"
                        className="gap-1.5 text-xs"
                        onClick={handleSubmitReview}
                        disabled={isSubmitDisabled}
                      >
                        Submit Review
                      </Button>
                    </div>
                  )}
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground/50 pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" />
                    {diagnosis.processing_time_ms}ms
                  </span>
                  <span>•</span>
                  <span>Provider: {diagnosis.provider_name === "gemini-flash" ? "Gemini" : "Mock"}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
