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
import { BrainCircuit, Terminal, Lightbulb, Clock, AlertTriangle } from "lucide-react";

export default function Troubleshooter() {
  const [symptoms, setSymptoms] = useState("");
  const [packetTracerNotes, setPacketTracerNotes] = useState("");
  const [showCommands, setShowCommands] = useState("");
  const [showPlaceholder, setShowPlaceholder] = useState(false);

  const handleDiagnose = () => {
    if (!symptoms.trim()) return;
    setShowPlaceholder(true);
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            AI Troubleshooter
          </h1>
          <Badge variant="secondary" className="text-[10px] font-medium uppercase tracking-wide">
            Placeholder
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Describe your network issue and receive AI-assisted diagnosis
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Terminal className="size-4 text-muted-foreground" />
              Input
            </CardTitle>
            <CardDescription>
              Provide details about the network problem
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Symptoms
              </label>
              <Textarea
                placeholder="e.g. Hosts on VLAN 10 cannot ping the default gateway. Switch interface shows 'up/up' but traffic is not passing."
                className="min-h-[120px] text-sm resize-none"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
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
                placeholder={`S1# show vlan brief\nVLAN Name                             Status    Ports\n---- -------------------------------- --------- ------------------\n10   USERS                            active    Gi0/1, Gi0/2, Gi0/3\n20   SERVERS                          active\n\nS1# show ip interface brief\nInterface                  IP-Address      OK? Method Status                Protocol\nGigabitEthernet0/1         unassigned      YES unset  up                    up\nGigabitEthernet0/24        unassigned      YES unset  up                    up`}
                className="min-h-[120px] text-sm font-mono text-xs resize-none"
                value={showCommands}
                onChange={(e) => setShowCommands(e.target.value)}
              />
            </div>

            <Button
              className="w-full gap-2"
              onClick={handleDiagnose}
              disabled={!symptoms.trim()}
            >
              <BrainCircuit className="size-4" />
              Diagnose
            </Button>
          </CardContent>
        </Card>

        {/* Output Panel */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Lightbulb className="size-4 text-muted-foreground" />
              AI Diagnosis
            </CardTitle>
            <CardDescription>
              AI-generated analysis and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!showPlaceholder ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-muted mb-4">
                  <BrainCircuit className="size-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Enter your symptoms and click Diagnose to receive an AI analysis.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Placeholder banner */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
                  <AlertTriangle className="size-4 text-amber-600 mt-0.5 shrink-0" />
                  <div className="text-xs text-muted-foreground leading-relaxed">
                    <p className="font-medium text-foreground mb-1">
                      Placeholder Response
                    </p>
                    <p>
                      This is a simulated output. The actual AI diagnosis engine
                      has not been implemented yet. Real implementation will
                      analyze symptoms, compare against the case dataset, and
                      apply the rule checker before producing a diagnosis.
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Simulated output structure */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Diagnosed Issue</h3>
                  <p className="text-sm text-muted-foreground">
                    {symptoms
                      ? `Based on the described symptoms, the issue appears to be
                        related to VLAN configuration or Layer 2 connectivity.
                        The AI would normally cross-reference this against
                        ${147} known troubleshooting cases.`
                      : "No symptoms provided."}
                  </p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Suggested Commands</h3>
                  <div className="rounded-lg bg-muted/30 border border-border/50 p-3">
                    <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {`S1# show vlan brief
S1# show interfaces trunk
S1# show ip route
S1# show running-config interface Gi0/1`}
                    </pre>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Confidence</h3>
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                      <div className="h-full w-[72%] rounded-full bg-foreground/20" />
                    </div>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      72%
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-muted-foreground/60">
                  <Clock className="size-3" />
                  Simulated processing time: 1.2s
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
