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
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronRight,
  Server,
  Play,
  RotateCcw,
} from "lucide-react";
import { SAMPLE_REPORT } from "@/lib/rule-checker/sample-output";
import type { CheckResult, CheckStatus } from "@/lib/rule-checker/types";

// ─── Status styling ──────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  CheckStatus,
  { icon: typeof CheckCircle2; color: string; bg: string }
> = {
  PASS: {
    icon: CheckCircle2,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  WARNING: {
    icon: AlertTriangle,
    color: "text-amber-500",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  ERROR: {
    icon: XCircle,
    color: "text-rose-500",
    bg: "bg-rose-500/10 border-rose-500/20",
  },
};

// ─── Sample network topology ─────────────────────────────────────────────────

const TOPOLOGY_DEVICES = [
  {
    name: "R1",
    role: "Router",
    interfaces: ["Gi0/0 (192.168.10.1)", "Gi0/1 (10.0.0.1)", "Gi0/2 (172.16.0.1) ↓"],
  },
  {
    name: "R2",
    role: "Router",
    interfaces: ["Gi0/0 (10.0.0.2)", "Gi0/1 (192.168.20.1)", "Gi0/2 (192.168.10.1) ⚠"],
  },
  {
    name: "SW1",
    role: "Switch",
    interfaces: ["Vlan10 (192.168.10.2)", "Vlan99 (192.168.99.2)", "Fa0/1 ↓", "Fa0/2 (/32) ⚠"],
  },
  {
    name: "SW2",
    role: "Switch",
    interfaces: ["Vlan20 (192.168.20.2)", "Fa0/1 (VLAN 30) ⚠", "Fa0/2 (VLAN 40) ⚠"],
  },
  {
    name: "PC1",
    role: "Host",
    interfaces: ["Nic0 (192.168.10.10)", "GW: 192.168.10.254"],
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function RuleChecker() {
  const [hasRun, setHasRun] = useState(false);
  const [filter, setFilter] = useState<CheckStatus | "ALL">("ALL");
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const report = useMemo(() => {
    if (!hasRun) return null;
    return SAMPLE_REPORT;
  }, [hasRun]);

  const filteredResults = useMemo(() => {
    if (!report) return [];
    if (filter === "ALL") return report.results;
    return report.results.filter((r) => r.status === filter);
  }, [report, filter]);

  // Group by check name for cleaner display
  const groupedResults = useMemo(() => {
    const groups: Record<string, CheckResult[]> = {};
    for (const r of filteredResults) {
      groups[r.check_name] = groups[r.check_name] ?? [];
      groups[r.check_name].push(r);
    }
    return groups;
  }, [filteredResults]);

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Rule Checker</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Deterministic network validation — no AI, no external APIs
        </p>
      </div>

      {/* Topology + Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Network Topology Summary */}
        <Card className="border-border/50 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Server className="size-4 text-muted-foreground" />
              Sample Network Topology
            </CardTitle>
            <CardDescription>
              5-device network with deliberate issues for rule validation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {TOPOLOGY_DEVICES.map((dev) => (
                <div
                  key={dev.name}
                  className="rounded-lg border border-border/50 p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium font-mono">
                      {dev.name}
                    </span>
                    <Badge variant="outline" className="text-[9px]">
                      {dev.role}
                    </Badge>
                  </div>
                  <div className="space-y-0.5">
                    {dev.interfaces.map((iface) => (
                      <p
                        key={iface}
                        className="text-[10px] text-muted-foreground font-mono"
                      >
                        {iface}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Run Controls */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ShieldCheck className="size-4 text-muted-foreground" />
              Run Checks
            </CardTitle>
            <CardDescription>
              Execute the Python rule engine against the sample topology
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full gap-2"
              onClick={() => setHasRun(true)}
              disabled={hasRun}
            >
              {hasRun ? (
                <>
                  <CheckCircle2 className="size-4" />
                  Checks Complete
                </>
              ) : (
                <>
                  <Play className="size-4" />
                  Run Rule Checker
                </>
              )}
            </Button>

            {hasRun && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full gap-2 text-muted-foreground"
                onClick={() => {
                  setHasRun(false);
                  setExpandedIdx(null);
                  setFilter("ALL");
                }}
              >
                <RotateCcw className="size-3.5" />
                Reset
              </Button>
            )}

            {report && (
              <>
                <Separator />
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-lg font-semibold text-emerald-500 tabular-nums">
                      {report.passed}
                    </p>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider">
                      Passed
                    </p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-amber-500 tabular-nums">
                      {report.warnings}
                    </p>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider">
                      Warnings
                    </p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-rose-500 tabular-nums">
                      {report.errors}
                    </p>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider">
                      Errors
                    </p>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground/50 text-center">
                  {report.total_checks} total checks across 6 rule categories
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      {report && (
        <>
          {/* Filter Chips */}
          <div className="flex gap-1.5">
            {(["ALL", "ERROR", "WARNING", "PASS"] as const).map((s) => (
              <Button
                key={s}
                size="sm"
                variant={filter === s ? "default" : "ghost"}
                className="text-[10px] uppercase tracking-wider h-7 px-2.5"
                onClick={() => {
                  setFilter(s);
                  setExpandedIdx(null);
                }}
              >
                {s === "ALL" ? `All (${report.total_checks})` : s}
              </Button>
            ))}
          </div>

          {/* Grouped Results */}
          <div className="space-y-4">
            {Object.entries(groupedResults).map(([checkName, results]) => (
              <Card key={checkName} className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    {checkName}
                  </CardTitle>
                  <CardDescription>
                    {results.length} result{results.length !== 1 ? "s" : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border/50">
                    {results.map((r, i) => {
                      const cfg = STATUS_CONFIG[r.status];
                      const Icon = cfg.icon;
                      const globalIdx = report.results.indexOf(r);
                      const isExpanded = expandedIdx === globalIdx;

                      return (
                        <div key={i}>
                          <button
                            className="w-full text-left px-6 py-3 hover:bg-muted/30 transition-colors flex items-start gap-3 cursor-pointer"
                            onClick={() =>
                              setExpandedIdx(isExpanded ? null : globalIdx)
                            }
                          >
                            <div
                              className={`flex size-5 shrink-0 items-center justify-center rounded border mt-0.5 ${cfg.bg}`}
                            >
                              <Icon className={`size-3 ${cfg.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs leading-relaxed">
                                {r.evidence}
                              </p>
                            </div>
                            <ChevronRight
                              className={`size-3.5 text-muted-foreground/50 shrink-0 mt-1 transition-transform ${
                                isExpanded ? "rotate-90" : ""
                              }`}
                            />
                          </button>

                          {isExpanded && (
                            <div className="px-6 pb-4 pt-1 ml-8 space-y-3">
                              <div className="space-y-1">
                                <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                                  Explanation
                                </h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  {r.explanation}
                                </p>
                              </div>
                              <div className="space-y-1">
                                <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                                  Recommended Action
                                </h4>
                                <p className="text-xs leading-relaxed">
                                  {r.recommended_action}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Architecture Note */}
          <Card className="border-border/50 border-dashed">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                <div className="text-xs text-muted-foreground leading-relaxed space-y-1">
                  <p className="font-medium text-foreground">
                    Architecture Note
                  </p>
                  <p>
                    The Python rule engine (<code className="font-mono text-[10px]">
                      src/lib/rule-checker/rule_checker.py
                    </code>) runs
                    independently of the frontend. This page displays
                    pre-computed sample output. When the backend is connected,
                    the API will execute the Python checker against live network
                    data and return results in the same format.
                  </p>
                  <p>
                    The checker is fully deterministic — no LLM, no randomness,
                    no external calls. Every result includes evidence and a
                    recommended action that can be audited.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Empty state before running */}
      {!hasRun && (
        <Card className="border-border/50">
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted mb-4">
                <ShieldCheck className="size-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground max-w-sm">
                Load the sample network topology and run deterministic rule
                checks to validate the configuration.
              </p>
              <p className="text-[10px] text-muted-foreground/50 mt-2 max-w-xs">
                Checks: Duplicate IP · Subnet Mask · Default Gateway · Admin
                Down · Missing VLAN · Missing Route
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
