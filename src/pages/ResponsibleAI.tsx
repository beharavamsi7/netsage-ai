import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollText } from "lucide-react";

export default function ResponsibleAI() {
  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Responsible AI Log</h1>
          <Badge variant="secondary" className="text-[10px] font-medium uppercase tracking-wide">
            Placeholder
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Transparency and accountability logs for all AI decisions
        </p>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <ScrollText className="size-4 text-muted-foreground" />
            Audit Trail
          </CardTitle>
          <CardDescription>
            Complete log of AI actions, confidence scores, and human interventions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted mb-4">
              <ScrollText className="size-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              The Responsible AI module will log every AI action including input
              data, model version, confidence scores, rule checker results, and
              any human corrections. This provides a full audit trail for
              accountability and supports the responsible AI principles required
              for the project.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
