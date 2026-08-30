import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { cases, ALL_CATEGORIES, ALL_SEVERITIES, countByCategory, countBySeverity } from "@/lib/cases";
import { useReviews } from "@/lib/reviews";
import { SAMPLE_REPORT } from "@/lib/rule-checker/sample-output";
import {
  BarChart3,
  FolderOpen,
  CheckCircle2,
  Pencil,
  XCircle,
  ShieldAlert,
  ScrollText,
} from "lucide-react";

// ─── Colors ──────────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  VLAN: "#6366f1",
  "Default Gateway": "#8b5cf6",
  DHCP: "#06b6d4",
  DNS: "#14b8a6",
  Routing: "#3b82f6",
  ACL: "#f43f5e",
  NAT: "#f97316",
  Wireless: "#22c55e",
};

const SEVERITY_COLORS: Record<string, string> = {
  Critical: "#f43f5e",
  High: "#f97316",
  Medium: "#eab308",
  Low: "#22c55e",
};

const REVIEW_COLORS: Record<string, string> = {
  accepted: "#22c55e",
  edited: "#eab308",
  rejected: "#f43f5e",
};

// ─── Chart configs ───────────────────────────────────────────────────────────

const categoryPieConfig = {
  value: { label: "Cases" },
  ...Object.fromEntries(
    ALL_CATEGORIES.map((cat) => [
      cat,
      { label: cat, color: CATEGORY_COLORS[cat] },
    ])
  ),
} satisfies ChartConfig;

const severityBarConfig = {
  count: { label: "Cases" },
  Critical: { label: "Critical", color: SEVERITY_COLORS.Critical },
  High: { label: "High", color: SEVERITY_COLORS.High },
  Medium: { label: "Medium", color: SEVERITY_COLORS.Medium },
  Low: { label: "Low", color: SEVERITY_COLORS.Low },
} satisfies ChartConfig;

const reviewPieConfig = {
  value: { label: "Reviews" },
  accepted: { label: "Accepted", color: REVIEW_COLORS.accepted },
  edited: { label: "Edited", color: REVIEW_COLORS.edited },
  rejected: { label: "Rejected", color: REVIEW_COLORS.rejected },
} satisfies ChartConfig;

const ruleBarConfig = {
  count: { label: "Results" },
  passed: { label: "Passed", color: "#22c55e" },
  warnings: { label: "Warnings", color: "#eab308" },
  errors: { label: "Errors", color: "#f43f5e" },
} satisfies ChartConfig;

// ─── Component ───────────────────────────────────────────────────────────────

export default function Reports() {
  const { counts, reviews } = useReviews();

  const categoryCounts = useMemo(() => countByCategory(), []);
  const severityCounts = useMemo(() => countBySeverity(), []);

  const agreementRate = useMemo(() => {
    if (counts.total === 0) return 0;
    return Math.round((counts.accepted / counts.total) * 100);
  }, [counts]);

  const correctedCount = useMemo(
    () => reviews.filter((r) => r.decision === "edited" || r.decision === "rejected").length,
    [reviews]
  );

  // Chart data
  const categoryPieData = useMemo(
    () =>
      ALL_CATEGORIES.map((cat) => ({
        name: cat,
        value: categoryCounts[cat] ?? 0,
        fill: CATEGORY_COLORS[cat],
      })),
    [categoryCounts]
  );

  const severityBarData = useMemo(
    () =>
      ALL_SEVERITIES.map((sev) => ({
        severity: sev,
        count: severityCounts[sev] ?? 0,
        fill: SEVERITY_COLORS[sev],
      })),
    [severityCounts]
  );

  const reviewPieData = useMemo(() => {
    const data = [
      { name: "accepted", value: counts.accepted, fill: REVIEW_COLORS.accepted },
      { name: "edited", value: counts.edited, fill: REVIEW_COLORS.edited },
      { name: "rejected", value: counts.rejected, fill: REVIEW_COLORS.rejected },
    ];
    return data.filter((d) => d.value > 0);
  }, [counts]);

  const ruleBarData = useMemo(
    () => [
      { name: "passed", count: SAMPLE_REPORT.passed, fill: "#22c55e" },
      { name: "warnings", count: SAMPLE_REPORT.warnings, fill: "#eab308" },
      { name: "errors", count: SAMPLE_REPORT.errors, fill: "#f43f5e" },
    ],
    []
  );

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Performance analytics for AI diagnoses, review outcomes, and rule compliance
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="border-border/50 py-4">
          <CardContent className="pt-0 px-4">
            <div className="flex items-center gap-2 mb-2">
              <FolderOpen className="size-3.5 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Total Cases
              </span>
            </div>
            <p className="text-2xl font-semibold tracking-tight tabular-nums">
              {cases.length}
            </p>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">
              Across {ALL_CATEGORIES.length} categories
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 py-4">
          <CardContent className="pt-0 px-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="size-3.5 text-emerald-500" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                AI Accepted
              </span>
            </div>
            <p className="text-2xl font-semibold tracking-tight text-emerald-500 tabular-nums">
              {counts.accepted}
            </p>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">
              {counts.total > 0
                ? `${Math.round((counts.accepted / counts.total) * 100)}% of reviews`
                : "No reviews yet"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 py-4">
          <CardContent className="pt-0 px-4">
            <div className="flex items-center gap-2 mb-2">
              <Pencil className="size-3.5 text-amber-500" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                AI Edited
              </span>
            </div>
            <p className="text-2xl font-semibold tracking-tight text-amber-500 tabular-nums">
              {counts.edited}
            </p>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">
              {counts.total > 0
                ? `${Math.round((counts.edited / counts.total) * 100)}% of reviews`
                : "—"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 py-4">
          <CardContent className="pt-0 px-4">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="size-3.5 text-rose-500" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                AI Rejected
              </span>
            </div>
            <p className="text-2xl font-semibold tracking-tight text-rose-500 tabular-nums">
              {counts.rejected}
            </p>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">
              {counts.total > 0
                ? `${Math.round((counts.rejected / counts.total) * 100)}% of reviews`
                : "—"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 py-4">
          <CardContent className="pt-0 px-4">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="size-3.5 text-orange-500" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Rule Errors
              </span>
            </div>
            <p className="text-2xl font-semibold tracking-tight text-orange-500 tabular-nums">
              {SAMPLE_REPORT.errors}
            </p>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">
              {SAMPLE_REPORT.warnings} warnings
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 py-4">
          <CardContent className="pt-0 px-4">
            <div className="flex items-center gap-2 mb-2">
              <ScrollText className="size-3.5 text-blue-500" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                AI Corrected
              </span>
            </div>
            <p className="text-2xl font-semibold tracking-tight text-blue-500 tabular-nums">
              {correctedCount}
            </p>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5">
              {counts.total > 0
                ? `${agreementRate}% agreement rate`
                : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution Pie */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Category Distribution</CardTitle>
            <CardDescription>Cases by networking topic</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <ChartContainer config={categoryPieConfig} className="h-[200px] w-[200px] shrink-0">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={categoryPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={80}
                    strokeWidth={2}
                  >
                    {categoryPieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
              <div className="space-y-2 flex-1">
                {categoryPieData.map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div
                        className="size-2 rounded-full shrink-0"
                        style={{ backgroundColor: cat.fill }}
                      />
                      <span className="text-muted-foreground">{cat.name}</span>
                    </div>
                    <span className="font-mono tabular-nums">{cat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Severity Bar Chart */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Severity Distribution</CardTitle>
            <CardDescription>Cases by severity level</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={severityBarConfig} className="h-[200px] w-full">
              <BarChart data={severityBarData} margin={{ left: 0, right: 8 }}>
                <XAxis
                  dataKey="severity"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {severityBarData.map((entry) => (
                    <Cell key={entry.severity} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Review Outcomes Pie */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium">AI Review Outcomes</CardTitle>
            <CardDescription>Human decisions on AI diagnoses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              {reviewPieData.length > 0 ? (
                <ChartContainer config={reviewPieConfig} className="h-[200px] w-[200px] shrink-0">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <Pie
                      data={reviewPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={80}
                      strokeWidth={2}
                    >
                      {reviewPieData.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
              ) : (
                <div className="h-[200px] w-[200px] shrink-0 flex items-center justify-center text-xs text-muted-foreground">
                  No data
                </div>
              )}
              <div className="space-y-3 flex-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-emerald-500" />
                    <span className="text-muted-foreground">Accepted</span>
                  </div>
                  <span className="font-mono tabular-nums">{counts.accepted}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-amber-500" />
                    <span className="text-muted-foreground">Edited</span>
                  </div>
                  <span className="font-mono tabular-nums">{counts.edited}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-rose-500" />
                    <span className="text-muted-foreground">Rejected</span>
                  </div>
                  <span className="font-mono tabular-nums">{counts.rejected}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-medium">Agreement Rate</span>
                  <span className="font-mono tabular-nums font-medium">
                    {agreementRate}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-medium">Total Reviews</span>
                  <span className="font-mono tabular-nums font-medium">{counts.total}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rule Checker Summary */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Rule Checker Results</CardTitle>
            <CardDescription>Sample topology validation output</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <ChartContainer config={ruleBarConfig} className="h-[200px] w-[200px] shrink-0">
                <BarChart data={ruleBarData} margin={{ left: 0, right: 8 }}>
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {ruleBarData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
              <div className="space-y-3 flex-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-emerald-500" />
                    <span className="text-muted-foreground">Passed</span>
                  </div>
                  <span className="font-mono tabular-nums">{SAMPLE_REPORT.passed}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-amber-500" />
                    <span className="text-muted-foreground">Warnings</span>
                  </div>
                  <span className="font-mono tabular-nums">{SAMPLE_REPORT.warnings}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full bg-rose-500" />
                    <span className="text-muted-foreground">Errors</span>
                  </div>
                  <span className="font-mono tabular-nums">{SAMPLE_REPORT.errors}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-medium">Total Checks</span>
                  <span className="font-mono tabular-nums font-medium">
                    {SAMPLE_REPORT.total_checks}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-medium">Devices Tested</span>
                  <span className="font-mono tabular-nums font-medium">5</span>
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="text-[10px] text-muted-foreground/60 leading-relaxed">
              <p>
                Rule checker results are from a sample 5-device topology. All 6
                check categories (duplicate IP, subnet mask, default gateway,
                admin-down, missing VLAN, missing route) were executed.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Category Breakdown */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Category Breakdown</CardTitle>
          <CardDescription>
            Case count, severity mix, and concept tags per category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {ALL_CATEGORIES.map((cat) => {
              const catCases = cases.filter((c) => c.category === cat);
              const sevBreakdown = countBySeverity();
              const catSeverities = catCases.reduce(
                (acc, c) => {
                  acc[c.severity] = (acc[c.severity] ?? 0) + 1;
                  return acc;
                },
                {} as Record<string, number>
              );

              return (
                <div key={cat} className="rounded-lg border border-border/50 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">{cat}</span>
                    <Badge variant="outline" className="text-[9px]">
                      {catCases.length}
                    </Badge>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {Object.entries(catSeverities).map(([sev, count]) => (
                      <span
                        key={sev}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground"
                      >
                        {sev}: {count}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {[...new Set(catCases.map((c) => c.conceptTag))].map((tag) => (
                      <span
                        key={tag}
                        className="text-[8px] px-1 py-0.5 rounded bg-muted/30 text-muted-foreground/70"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Data Source Note */}
      <Card className="border-border/50 border-dashed">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <BarChart3 className="size-4 text-muted-foreground shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground leading-relaxed space-y-1">
              <p className="font-medium text-foreground">Data Sources</p>
              <p>
                All statistics are calculated from real application data:
                the 30-case dataset (<code className="font-mono text-[10px]">src/lib/cases</code>),
                review records (<code className="font-mono text-[10px]">src/lib/reviews</code>),
                and rule checker output
                (<code className="font-mono text-[10px]">src/lib/rule-checker</code>).
              </p>
              <p>
                Reviews REV-001 through REV-005 are constructed demonstration
                records, clearly labeled in the Human Review and Responsible AI
                pages. Rule checker results are from a sample 5-device topology.
                No statistics are fabricated.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
