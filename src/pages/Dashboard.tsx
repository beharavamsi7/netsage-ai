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

// ─── Placeholder data (replace with real Convex queries later) ───────────────

const STATS = [
  {
    label: "Total Cases",
    value: 147,
    icon: FolderOpen,
    change: "+12 this week",
  },
  {
    label: "AI Accepted",
    value: 89,
    icon: CheckCircle2,
    change: "60.5%",
    color: "text-emerald-600",
  },
  {
    label: "AI Edited",
    value: 31,
    icon: Pencil,
    change: "21.1%",
    color: "text-amber-600",
  },
  {
    label: "AI Rejected",
    value: 27,
    icon: XCircle,
    change: "18.4%",
    color: "text-rose-600",
  },
  {
    label: "Rule Violations",
    value: 18,
    icon: ShieldAlert,
    change: "12.2%",
    color: "text-orange-600",
  },
  {
    label: "AI–Human Agreement",
    value: "82%",
    icon: Handshake,
    change: "+3.2% from last month",
    color: "text-blue-600",
  },
];

const ISSUE_TYPES = [
  { type: "VLAN misconfiguration", count: 34, pct: "23%" },
  { type: "OSPF neighbor down", count: 28, pct: "19%" },
  { type: "ACL blocking traffic", count: 22, pct: "15%" },
  { type: "DHCP not assigning IP", count: 19, pct: "13%" },
  { type: "Spanning-tree convergence", count: 16, pct: "11%" },
  { type: "NAT translation failure", count: 14, pct: "10%" },
  { type: "Other", count: 14, pct: "10%" },
];

const RECENT_CASES = [
  {
    id: "CS-147",
    title: "VLAN 10 unreachable on Switch3",
    status: "Resolved",
    statusVariant: "default" as const,
    date: "2026-08-30",
    aiVerdict: "Accepted",
  },
  {
    id: "CS-146",
    title: "OSPF adjacency flapping between R1-R2",
    status: "In Review",
    statusVariant: "secondary" as const,
    date: "2026-08-30",
    aiVerdict: "Edited",
  },
  {
    id: "CS-145",
    title: "Hosts cannot reach DNS server 10.0.0.53",
    status: "Resolved",
    statusVariant: "default" as const,
    date: "2026-08-29",
    aiVerdict: "Accepted",
  },
  {
    id: "CS-144",
    title: "Inter-VLAN routing broken after config change",
    status: "Open",
    statusVariant: "outline" as const,
    date: "2026-08-29",
    aiVerdict: "Pending",
  },
  {
    id: "CS-143",
    title: "Port-channel not forming between switches",
    status: "Resolved",
    statusVariant: "default" as const,
    date: "2026-08-28",
    aiVerdict: "Accepted",
  },
];

const AI_HUMAN_COMPARE = [
  {
    id: "CS-146",
    aiOutput: "MTU mismatch on Gi0/1 — set to 1500 on both ends",
    humanVerdict: "Partially correct — also a Hello timer mismatch",
    agreement: "Edited",
  },
  {
    id: "CS-145",
    aiOutput: "Static route to 10.0.0.53 missing on default gateway",
    humanVerdict: "Agreed — root cause confirmed",
    agreement: "Accepted",
  },
  {
    id: "CS-143",
    aiOutput: "LACP mode mismatch: active vs passive",
    humanVerdict: "Agreed — corrective action applied",
    agreement: "Accepted",
  },
];

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
        {STATS.map((stat) => (
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Issue Types */}
        <Card className="border-border/50 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Issue Types</CardTitle>
            <CardDescription>Top network problem categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ISSUE_TYPES.map((issue) => (
                <div key={issue.type} className="flex items-center justify-between">
                  <span className="text-sm truncate flex-1 mr-3">{issue.type}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground tabular-nums">{issue.count}</span>
                    <span className="text-[10px] text-muted-foreground/60 tabular-nums w-7 text-right">
                      {issue.pct}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Cases */}
        <Card className="border-border/50 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Recent Troubleshooting Cases</CardTitle>
            <CardDescription>Latest cases processed through the system</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-[10px] uppercase tracking-wider">Case</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider">Issue</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider">Status</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider">AI Verdict</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {RECENT_CASES.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-xs font-medium">{c.id}</TableCell>
                    <TableCell className="text-sm max-w-[240px] truncate">{c.title}</TableCell>
                    <TableCell>
                      <Badge variant={c.statusVariant} className="text-[10px]">
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-xs ${
                          c.aiVerdict === "Accepted"
                            ? "text-emerald-600"
                            : c.aiVerdict === "Edited"
                              ? "text-amber-600"
                              : c.aiVerdict === "Rejected"
                                ? "text-rose-600"
                                : "text-muted-foreground"
                        }`}
                      >
                        {c.aiVerdict}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground text-right tabular-nums">
                      {c.date}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI vs Human Review */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium">AI vs Human Review</CardTitle>
            <CardDescription>How the AI diagnoses compare with human evaluation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {AI_HUMAN_COMPARE.map((item) => (
                <div key={item.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-medium">{item.id}</span>
                    <Badge
                      variant={item.agreement === "Accepted" ? "default" : "secondary"}
                      className="text-[10px]"
                    >
                      {item.agreement}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>
                      <span className="text-foreground font-medium">AI:</span>{" "}
                      {item.aiOutput}
                    </p>
                    <p>
                      <span className="text-foreground font-medium">Human:</span>{" "}
                      {item.humanVerdict}
                    </p>
                  </div>
                  <Separator className="last:hidden" />
                </div>
              ))}
            </div>
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

            <div className="text-[10px] text-muted-foreground/60 leading-relaxed">
              <p>
                <AlertTriangle className="inline size-3 mr-1" />
                Status indicators are placeholders. Live monitoring will be
                connected when the backend is integrated.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
