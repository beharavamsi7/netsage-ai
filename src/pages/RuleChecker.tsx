import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";

export default function RuleChecker() {
  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Rule Checker</h1>
          <Badge variant="secondary" className="text-[10px] font-medium uppercase tracking-wide">
            Placeholder
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Python-based rule engine for validating AI diagnoses against network best practices
        </p>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <ShieldCheck className="size-4 text-muted-foreground" />
            Rule Engine
          </CardTitle>
          <CardDescription>
            This module will enforce networking rules and Cisco best practices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted mb-4">
              <ShieldCheck className="size-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              The rule checker will validate AI-generated diagnoses against a set
              of predefined networking rules (VLAN standards, OSPF best practices,
              ACL logic, etc.). Implementation will include a Python backend
              module that scores each diagnosis for rule compliance.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
