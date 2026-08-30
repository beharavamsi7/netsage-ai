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
import { Input } from "@/components/ui/input";
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
  cases,
  ALL_CATEGORIES,
  ALL_SEVERITIES,
  countByCategory,
  type CaseCategory,
  type CaseSeverity,
  type TroubleshootingCase,
} from "@/lib/cases";
import {
  FolderOpen,
  Search,
  ChevronRight,
  ChevronDown,
  AlertTriangle,
} from "lucide-react";

// ─── Severity styling ────────────────────────────────────────────────────────

const SEVERITY_STYLES: Record<CaseSeverity, string> = {
  Critical: "text-rose-500 border-rose-500/30 bg-rose-500/10",
  High: "text-orange-500 border-orange-500/30 bg-orange-500/10",
  Medium: "text-amber-500 border-amber-500/30 bg-amber-500/10",
  Low: "text-emerald-500 border-emerald-500/30 bg-emerald-500/10",
};

const CATEGORY_COLORS: Record<CaseCategory, string> = {
  VLAN: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  "Default Gateway": "bg-purple-500/10 text-purple-500 border-purple-500/20",
  DHCP: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  DNS: "bg-teal-500/10 text-teal-500 border-teal-500/20",
  Routing: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  ACL: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  NAT: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  Wireless: "bg-green-500/10 text-green-500 border-green-500/20",
};

// ─── Detail Panel ────────────────────────────────────────────────────────────

function CaseDetail({ caseData }: { caseData: TroubleshootingCase }) {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-xs text-muted-foreground">
            {caseData.id}
          </span>
          <Badge
            variant="outline"
            className={`text-[10px] ${CATEGORY_COLORS[caseData.category]}`}
          >
            {caseData.category}
          </Badge>
          <Badge
            variant="outline"
            className={`text-[10px] ${SEVERITY_STYLES[caseData.severity]}`}
          >
            {caseData.severity}
          </Badge>
        </div>
        <h3 className="text-sm font-medium">{caseData.title}</h3>
      </div>

      <Separator />

      {/* Symptom */}
      <div className="space-y-1.5">
        <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          Symptom
        </h4>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {caseData.symptom}
        </p>
      </div>

      {/* PT Notes */}
      <div className="space-y-1.5">
        <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          Packet Tracer Notes
        </h4>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {caseData.packetTracerNotes}
        </p>
      </div>

      {/* Show Commands */}
      <div className="space-y-1.5">
        <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          Show-Command Output
        </h4>
        <div className="rounded-md bg-muted/30 border border-border/50 p-3 max-h-[200px] overflow-auto">
          <pre className="text-[11px] font-mono text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {caseData.showCommandOutput}
          </pre>
        </div>
      </div>

      <Separator />

      {/* Root Cause */}
      <div className="space-y-1.5">
        <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          Expected Root Cause
        </h4>
        <p className="text-xs leading-relaxed">
          {caseData.expectedRootCause}
        </p>
      </div>

      {/* Metadata row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1">
          <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            OSI Layer
          </h4>
          <Badge variant="outline" className="text-[10px] font-mono">
            {caseData.osiLayer}
          </Badge>
        </div>
        <div className="space-y-1">
          <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Concept
          </h4>
          <p className="text-xs">{caseData.conceptTag}</p>
        </div>
        <div className="space-y-1">
          <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Next Command
          </h4>
          <code className="text-[11px] font-mono">{caseData.expectedNextCommand}</code>
        </div>
      </div>

      {/* Fix Steps */}
      <div className="space-y-1.5">
        <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          Expected Fix Steps
        </h4>
        <ol className="space-y-1">
          {caseData.expectedFixSteps.map((step, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed"
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

      {/* Disclaimer */}
      <div className="flex items-start gap-2 text-[10px] text-muted-foreground/60">
        <AlertTriangle className="size-3 mt-0.5 shrink-0" />
        <span>
          Cases are constructed from documented Cisco behavior and common lab
          pitfalls. They have not been verified against live Packet Tracer
          sessions unless explicitly noted.
        </span>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function Cases() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<CaseCategory | "All">(
    "All"
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const categoryCounts = useMemo(() => countByCategory(), []);

  const filtered = useMemo(() => {
    let result = cases;
    if (activeCategory !== "All") {
      result = result.filter((c) => c.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q) ||
          c.symptom.toLowerCase().includes(q) ||
          c.conceptTag.toLowerCase().includes(q)
      );
    }
    return result;
  }, [activeCategory, search]);

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Troubleshooting Cases
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {cases.length} curated cases across{" "}
          {ALL_CATEGORIES.length} networking categories
        </p>
      </div>

      {/* Category Chips + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex flex-wrap gap-1.5 flex-1">
          <Button
            size="sm"
            variant={activeCategory === "All" ? "default" : "ghost"}
            className="text-[10px] uppercase tracking-wider h-7 px-2.5"
            onClick={() => setActiveCategory("All")}
          >
            All ({cases.length})
          </Button>
          {ALL_CATEGORIES.map((cat) => (
            <Button
              key={cat}
              size="sm"
              variant={activeCategory === cat ? "default" : "ghost"}
              className="text-[10px] uppercase tracking-wider h-7 px-2.5"
              onClick={() => setActiveCategory(cat)}
            >
              {cat} ({categoryCounts[cat] ?? 0})
            </Button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Search cases…"
            className="pl-8 h-7 text-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Cases Table */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <FolderOpen className="size-4 text-muted-foreground" />
            Case Registry
          </CardTitle>
          <CardDescription>
            {filtered.length} case{filtered.length !== 1 ? "s" : ""} displayed
            {activeCategory !== "All" ? ` in ${activeCategory}` : ""}
            {search ? ` matching "${search}"` : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-muted-foreground">
                No cases match your filters.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {filtered.map((c) => {
                const isExpanded = expandedId === c.id;
                return (
                  <div key={c.id}>
                    {/* Row */}
                    <button
                      className="w-full text-left px-6 py-3 hover:bg-muted/30 transition-colors flex items-center gap-3 cursor-pointer"
                      onClick={() =>
                        setExpandedId(isExpanded ? null : c.id)
                      }
                    >
                      <ChevronRight
                        className={`size-3.5 text-muted-foreground/50 shrink-0 transition-transform ${
                          isExpanded ? "rotate-90" : ""
                        }`}
                      />
                      <span className="font-mono text-xs text-muted-foreground w-14 shrink-0">
                        {c.id}
                      </span>
                      <span className="text-sm flex-1 truncate">
                        {c.title}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[9px] shrink-0 hidden sm:inline-flex ${CATEGORY_COLORS[c.category]}`}
                      >
                        {c.category}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-[9px] shrink-0 ${SEVERITY_STYLES[c.severity]}`}
                      >
                        {c.severity}
                      </Badge>
                    </button>

                    {/* Expanded Detail */}
                    {isExpanded && (
                      <div className="px-6 pb-5 pt-1 bg-muted/10">
                        <CaseDetail caseData={c} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer note */}
      <p className="text-[10px] text-muted-foreground/50">
        This dataset is structured for use by the AI diagnosis engine, rule
        checker, human review system, and dashboard analytics. Edit{" "}
        <code className="font-mono">src/lib/cases/data.ts</code> to add or
        modify cases.
      </p>
    </div>
  );
}
