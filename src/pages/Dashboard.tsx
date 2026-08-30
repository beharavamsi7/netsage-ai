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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { cases, ALL_CATEGORIES, countByCategory, countBySeverity } from "@/lib/cases";
import { useReviews } from "@/lib/reviews";
import { SAMPLE_REPORT } from "@/lib/rule-checker/sample-output";
import {
  FolderOpen,
  CheckCircle2,
  Pencil,
  XCircle,
  ShieldAlert,
  Handshake,
  AlertTriangle,
  Activity,
  Wifi,
  Server,
} from "lucide-react";

// ─── Derived data ────────────────────────────────────────────────────────────

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

// ─── Charts config ───────────────────────────────────────────────────────────

const categoryChartConfig = {
  count: { label: "Cases" },
  ...Object.fromEntries(
    ALL_CATEGORIES.map((cat) => [
      cat,
      { label: cat, color: CATEGORY_COLORS[cat] },
    ])
  ),
} satisfies ChartConfig;

const severityChartConfig = {
  count: { label: "Cases" },
  Critical: { label: "Critical", color: SEVERITY_COLORS.Critical },
  High: { label: "High", color: SEVERITY_COLORS.High },
  Medium: { label: "Medium", color: SEVERITY_COLORS.Medium },
  Low: { label: "Low", color: SEVERITY_COLORS.Low },
} satisfies ChartConfig;

const reviewChartConfig = {
  value: { label: "Reviews" },
  accepted: { label: "Accepted", color: REVIEW_COLORS.accepted },
  edited: { label: "Edited", color: REVIEW_COLORS.edited },
  rejected: { label: "Rejected", color: REVIEW_COLORS.rejected },
} satisfies ChartConfig;

// ─── Live Review List ────────────────────────────────────────────────────────

function DashboardReviewList() {
  const { reviews } = useReviews();
  const recent = reviews.slice(0, 5);

  if (recent.length === 0) {
    return (
      <p className="text-xs text-muted-foreground py-4 text-center">
        No reviews recorded yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {recent.map((r) => (
        <div key={r.id} className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-medium">{r.caseId}</span>
            <Badge
              variant={
                r.decision === "accepted"
                  ? "default"
                  : r.decision === "edited"
                    ? "secondary"
                    : "outline"
              }
              className="text-[10px]"
            >
              {r.decision}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {r.aiRootCause}
          </p>
          <Separator className="last:hidden" />
        </div>
      ))}
    </div>
  );
}

// ─── System Status ───────────────────────────────────────────────────────────

const SYSTEM_STATUS = [
  { component: "AI Model", status: "Operational", icon: BrainIcon },
  { component: "Rule Engine", status: "Operational", icon: ShieldAlert },
  { component: "Case Database", status: "Operational", icon: Server },
  { component: "Network Monitor", status: "Degraded", icon: Wifi },
  { component: "Review Queue", status: "Operational", icon: Activity },
];

function BrainIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
      <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
      <path d="M12 5v14" />
    </svg>
  );
}

// ─── Dashboard Component ─────────────────────────────────────────────────────

export default function Dashboard() {
  const { counts } = useReviews();

  // Real data calculations
  const categoryCounts = useMemo(() => countByCategory(), []);
  const severityCounts = useMemo(() => countBySeverity(), []);
  const ruleCheckerErrors = SAMPLE_REPORT.errors;
  const ruleCheckerWarnings = SAMPLE_REPORT.warnings;

  const agreementRate = useMemo(() => {
    if (counts.total === 0) return 0;
    return Math.round((counts.accepted / counts.total) * 100);
  }, [counts]);

  const stats = useMemo(
    () => [
      {
        label: "Total Cases",
        value: cases.length,
        icon: FolderOpen,
        change: "Dataset size",
      },
      {
        label: "AI Accepted",
        value: counts.accepted,
        icon: CheckCircle2,
        change:
          counts.total > 0
            ? `${Math.round((counts.accepted / counts.total) * 100)}%`
            : "—",
        color: "text-emerald-600",
      },
      {
        label: "AI Edited",
        value: counts.edited,
        icon: Pencil,
        change:
          counts.total > 0
            ? `${Math.round((counts.edited / counts.total) * 100)}%`
            : "—",
        color: "text-amber-600",
      },
      {
        label: "AI Rejected",
        value: counts.rejected,
        icon: XCircle,
        change:
          counts.total > 0
            ? `${Math.round((counts.rejected / counts.total) * 100)}%`
            : "—",
        color: "text-rose-600",
      },
      {
        label: "Rule Violations",
        value: ruleCheckerErrors,
        icon: ShieldAlert,
        change: `${ruleCheckerWarnings} warnings`,
        color: "text-orange-600",
      },
      {
        label: "AI–Human Agreement",
        value: `${agreementRate}%`,
        icon: Handshake,
        change:
          counts.total > 0
            ? `${counts.accepted} of ${counts.total} reviewed`
            : "No reviews yet",
        color: "text-blue-600",
      },
    ],
    [counts, agreementRate, ruleCheckerErrors, ruleCheckerWarnings]
  );

  // Chart data
  const categoryChartData = useMemo(
    () =>
      ALL_CATEGORIES.map((cat) => ({
        category: cat,
        count: categoryCounts[cat] ?? 0,
        fill: CATEGORY_COLORS[cat],
      })),
    [categoryCounts]
  );

  const severityChartData = useMemo(
    () =>
      (["Critical", "High", "Medium", "Low"] as const).map((sev) => ({
        severity: sev,
        count: severityCounts[sev] ?? 0,
        fill: SEVERITY_COLORS[sev],
      })),
    [severityCounts]
  );

  const reviewChartData = useMemo(() => {
    const data = [
      { name: "accepted", value: counts.accepted, fill: REVIEW_COLORS.accepted },
      { name: "edited", value: counts.edited, fill: REVIEW_COLORS.edited },
      { name: "rejected", value: counts.rejected, fill: REVIEW_COLORS.rejected },
    ];
    return data.filter((d) => d.value > 0);
  }, [counts]);

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          System overview and AI troubleshooting metrics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border/50 py-4">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <stat.icon className={`size-4 text-muted-foreground ${stat.color || ""}`} />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-2xl font-semibold tracking-tight">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              <p className="text-[10px] text-muted-foreground/70 mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cases by Category */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Cases by Category</CardTitle>
            <CardDescription>Distribution across networking topics</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={categoryChartConfig} className="h-[220px] w-full">
              <BarChart
                data={categoryChartData}
                layout="vertical"
                margin={{ left: 0, right: 8 }}
              >
                <YAxis
                  dataKey="category"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  width={100}
                />
                <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {categoryChartData.map((entry) => (
                    <Cell key={entry.category} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Severity Distribution */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Severity Distribution</CardTitle>
            <CardDescription>Case severity breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={severityChartConfig} className="h-[220px] w-full">
              <BarChart data={severityChartData} margin={{ left: 0, right: 8 }}>
                <XAxis
                  dataKey="severity"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {severityChartData.map((entry) => (
                    <Cell key={entry.severity} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* AI vs Human Review */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium">AI vs Human Review</CardTitle>
            <CardDescription>Review outcomes on AI diagnoses</CardDescription>
          </CardHeader>
          <CardContent>
            {reviewChartData.length > 0 ? (
              <ChartContainer config={reviewChartConfig} className="h-[220px] w-full">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={reviewChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    strokeWidth={2}
                  >
                    {reviewChartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-[220px] text-xs text-muted-foreground">
                No review data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Cases */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Recent Cases</CardTitle>
            <CardDescription>Latest entries from the case dataset</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-[10px] uppercase tracking-wider">Case</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider">Title</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider">Category</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider">Severity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cases.slice(-5).reverse().map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-xs font-medium">{c.id}</TableCell>
                    <TableCell className="text-sm max-w-[200px] truncate">{c.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[9px]">
                        {c.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[9px] ${
                          c.severity === "Critical"
                            ? "text-rose-500 border-rose-500/30"
                            : c.severity === "High"
                              ? "text-orange-500 border-orange-500/30"
                              : c.severity === "Medium"
                                ? "text-amber-500 border-amber-500/30"
                                : "text-emerald-500 border-emerald-500/30"
                        }`}
                      >
                        {c.severity}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <CardDescription>Health of connected components</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {SYSTEM_STATUS.map((s) => (
                <div key={s.component} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <s.icon className="size-4 text-muted-foreground" />
                    <span className="text-sm">{s.component}</span>
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      s.status === "Operational"
                        ? "text-emerald-600"
                        : s.status === "Degraded"
                          ? "text-amber-600"
                          : "text-rose-600"
                    }`}
                  >
                    {s.status}
                  </span>
                </div>
              ))}
            </div>

            <Separator className="my-5" />

            {/* Rule Checker Summary */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Rule Checker (Sample Run)
              </h4>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-semibold text-emerald-500 tabular-nums">
                    {SAMPLE_REPORT.passed}
                  </p>
                  <p className="text-[9px] text-muted-foreground uppercase">Passed</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-amber-500 tabular-nums">
                    {SAMPLE_REPORT.warnings}
                  </p>
                  <p className="text-[9px] text-muted-foreground uppercase">Warnings</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-rose-500 tabular-nums">
                    {SAMPLE_REPORT.errors}
                  </p>
                  <p className="text-[9px] text-muted-foreground uppercase">Errors</p>
                </div>
              </div>
            </div>

            <Separator className="my-5" />

            <div className="text-[10px] text-muted-foreground/60 leading-relaxed">
              <p>
                <AlertTriangle className="inline size-3 mr-1" />
                Rule checker results are from a sample 5-device topology.
                Live monitoring will be connected when the backend is integrated.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
