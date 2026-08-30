import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";

export default function HumanReview() {
  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Human Review</h1>
          <Badge variant="secondary" className="text-[10px] font-medium uppercase tracking-wide">
            Placeholder
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Expert review and validation of AI-generated diagnoses
        </p>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Eye className="size-4 text-muted-foreground" />
            Review Queue
          </CardTitle>
          <CardDescription>
            Cases awaiting human verification will appear here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted mb-4">
              <Eye className="size-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              The human review workflow will allow networking experts to review
              AI diagnoses, mark them as accepted, edited, or rejected, and
              provide feedback that improves future AI accuracy. This module
              tracks agreement rates between AI and human evaluators.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
