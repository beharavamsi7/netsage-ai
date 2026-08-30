import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  BrainCircuit,
  Network,
  ShieldCheck,
  Eye,
  ArrowRight,
  ChevronRight,
  Activity,
  Server,
  Wifi,
  FileDown,
} from "lucide-react";

const FEATURES = [
  {
    icon: BrainCircuit,
    title: "AI Troubleshooter",
    description:
      "Describe network symptoms, paste show commands, and receive AI-assisted diagnosis backed by a dataset of real Packet Tracer scenarios.",
  },
  {
    icon: ShieldCheck,
    title: "Rule Checker",
    description:
      "Automated validation of diagnoses against Cisco best practices and networking rules, catching errors before they reach the user.",
  },
  {
    icon: Eye,
    title: "Human Review",
    description:
      "Expert validation workflow with agreement tracking to measure and improve AI accuracy over time.",
  },
  {
    icon: Network,
    title: "Case Dataset",
    description:
      "30+ curated troubleshooting cases spanning VLAN, OSPF, ACL, DHCP, STP, and NAT scenarios in Packet Tracer labs.",
  },
];

const STATS = [
  { value: "30+", label: "Case Dataset" },
  { value: "6+", label: "Issue Categories" },
  { value: "7", label: "Platform Modules" },
  { value: "100%", label: "Transparent AI" },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/50">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-md bg-foreground text-background">
              <Network className="size-4" />
            </div>
            <div>
              <span className="text-sm font-semibold tracking-tight">
                NetSage Dashboard
              </span>
              <span className="hidden sm:inline text-[10px] text-muted-foreground ml-2 uppercase tracking-widest">
                Network Ops
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => navigate("/dashboard")}
          >
            Open Dashboard
            <ChevronRight className="size-3.5" />
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-24 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
              <Activity className="size-3" />
              AI-Assisted Network Troubleshooting
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.1]">
            AI-assisted network
            <br />
            <span className="text-muted-foreground">
              troubleshooting
            </span>
          </h1>
          <p className="mt-6 text-base text-muted-foreground leading-relaxed max-w-lg">
            NetSage Dashboard is the control center for AI-driven network
            diagnostics. It provides the structure, UI, and review workflow
            that the AI engine, rule checker, and case dataset plug into.
          </p>
          <div className="flex items-center gap-3 mt-8">
            <Button
              className="gap-1.5"
              onClick={() => navigate("/auth")}
            >
              Get Started
              <ArrowRight className="size-4" />
            </Button>
            <Button
              variant="ghost"
              className="gap-1.5 text-muted-foreground"
              onClick={() =>
                document
                  .getElementById("features")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Learn more
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-border/50 bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-semibold tracking-tight">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-12">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-3">
            Capabilities
          </p>
          <h2 className="text-2xl font-semibold tracking-tight">
            Built for learning
          </h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-lg">
            Every module is designed to support the educational workflow — from
            diagnosis to review to reporting.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FEATURES.map((f) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4 }}
            >
              <Card className="border-border/50 h-full py-5">
                <CardContent>
                  <div className="flex size-9 items-center justify-center rounded-md bg-muted mb-4">
                    <f.icon className="size-4 text-muted-foreground" />
                  </div>
                  <h3 className="text-sm font-medium mb-1">{f.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {f.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="mb-12">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-3">
            Workflow
          </p>
          <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: "01",
              title: "Describe the issue",
              desc: "Enter symptoms, paste Packet Tracer topology notes, and include relevant show-command output.",
              icon: Server,
            },
            {
              step: "02",
              title: "AI analyzes & diagnoses",
              desc: "The AI model cross-references your input against the case dataset and applies rule-based validation.",
              icon: BrainCircuit,
            },
            {
              step: "03",
              title: "Review & refine",
              desc: "A human expert reviews the diagnosis, marks it accepted or edited, and the system learns from feedback.",
              icon: Eye,
            },
          ].map((item) => (
            <div key={item.step} className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-muted-foreground">
                  {item.step}
                </span>
                <div className="h-px flex-1 bg-border/50" />
              </div>
              <div className="flex size-8 items-center justify-center rounded-md bg-muted">
                <item.icon className="size-4 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-medium">{item.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/50">
        <div className="mx-auto max-w-6xl px-6 py-16 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">
            Ready to start diagnosing?
          </h2>
          <p className="text-sm text-muted-foreground mt-2 mb-6 max-w-md mx-auto">
            Sign in to access the full dashboard, troubleshooter, and case
            dataset.
          </p>
          <Button className="gap-1.5" onClick={() => navigate("/auth")}>
            Open NetSage Dashboard
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50">
        <div className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between text-[10px] text-muted-foreground/60">
          <div className="flex items-center gap-4">
            <span>NetSage Dashboard</span>
            <a
              href="/NetSageAI_Project_Summary.pdf"
              download
              className="flex items-center gap-1 text-muted-foreground/80 hover:text-foreground transition-colors"
            >
              <FileDown className="size-3" />
              <span>Project Summary (PDF)</span>
            </a>
          </div>
          <div className="flex items-center gap-1">
            <Wifi className="size-3" />
            <span>AI + Human Expertise</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
