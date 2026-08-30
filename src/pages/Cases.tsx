import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FolderOpen } from "lucide-react";

const PLACEHOLDER_CASES = [
  { id: "CS-147", title: "VLAN 10 unreachable on Switch3", status: "Resolved", date: "2026-08-30" },
  { id: "CS-146", title: "OSPF adjacency flapping between R1-R2", status: "In Review", date: "2026-08-30" },
  { id: "CS-145", title: "Hosts cannot reach DNS server 10.0.0.53", status: "Resolved", date: "2026-08-29" },
  { id: "CS-144", title: "Inter-VLAN routing broken after config change", status: "Open", date: "2026-08-29" },
  { id: "CS-143", title: "Port-channel not forming between switches", status: "Resolved", date: "2026-08-28" },
  { id: "CS-142", title: "STP loop detected on floor-2 switches", status: "Resolved", date: "2026-08-28" },
  { id: "CS-141", title: "NAT overload not working for internal subnet", status: "Open", date: "2026-08-27" },
  { id: "CS-140", title: "RADIUS authentication failing on WLC", status: "In Review", date: "2026-08-27" },
];

export default function Cases() {
  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Troubleshooting Cases</h1>
          <Badge variant="secondary" className="text-[10px] font-medium uppercase tracking-wide">
            Placeholder
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Full case history across all AI-assisted troubleshooting sessions
        </p>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <FolderOpen className="size-4 text-muted-foreground" />
            Case Registry
          </CardTitle>
          <CardDescription>
            The full case dataset will be loaded from the database once the backend is connected
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[10px] uppercase tracking-wider">Case ID</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider">Title</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PLACEHOLDER_CASES.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-xs font-medium">{c.id}</TableCell>
                  <TableCell className="text-sm">{c.title}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        c.status === "Resolved"
                          ? "default"
                          : c.status === "In Review"
                            ? "secondary"
                            : "outline"
                      }
                      className="text-[10px]"
                    >
                      {c.status}
                    </Badge>
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
  );
}
