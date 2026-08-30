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
  getDiagnosisProvider,
  type DiagnosisResponse,
  type DiagnosisReview,
} from "@/lib/ai";
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
  const [diagnosis, setDiagnosis] = useState<DiagnosisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Review state
  const [review, setReview] = useState<DiagnosisReview | null>(null);

  const handleDiagnose = async () => {
    // Validate
    if (!symptoms.trim()) {
      setError("At least a symptom description is required.");
      return;
    }

    setError(null);
    setDiagnosis(null);
    setReview(null);
    setIsLoading(true);

    try {
      const result = await diagnose({
        symptoms: symptoms.trim(),
        packetTracerNotes: packetTracerNotes.trim(),
        showCommandOutput: showCommands.trim(),
      });
      setDiagnosis(result);
    } catch {
      setError("Diagnosis failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReview = (action: "accepted" | "edited" | "rejected") => {
    if (!diagnosis) return;
    setReview({
      diagnosis,
      action,
      timestamp: Date.now(),
    });
  };

  const handleReset = () => {
    setDiagnosis(null);
    setReview(null);
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
                  Using provider: {getDiagnosisProvider().name}
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

                  {review ? (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/40 border border-border/50">
                      {review.action === "accepted" && (
                        <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                      )}
                      {review.action === "edited" && (
                        <Pencil className="size-4 text-amber-500 shrink-0" />
                      )}
                      {review.action === "rejected" && (
                        <XCircle className="size-4 text-rose-500 shrink-0" />
                      )}
                      <div>
                        <p className="text-xs font-medium">
                          Diagnosis {review.action}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Recorded at{" "}
                          {new Date(review.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-xs"
                        onClick={() => handleReview("accepted")}
                      >
                        <CheckCircle2 className="size-3.5" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-xs"
                        onClick={() => handleReview("edited")}
                      >
                        <Pencil className="size-3.5" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-xs"
                        onClick={() => handleReview("rejected")}
                      >
                        <XCircle className="size-3.5" />
                        Reject
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
                  <span>Provider: {getDiagnosisProvider().name}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
