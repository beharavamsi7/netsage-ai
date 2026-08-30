/**
 * Troubleshooting Case Dataset — Type Definitions
 *
 * Each case represents a realistic Packet Tracer / lab scenario.
 * The structure is designed so the same data can feed the AI diagnosis
 * engine, the Python rule checker, human review workflow, and dashboard
 * statistics.
 */

export type CaseCategory =
  | "VLAN"
  | "Default Gateway"
  | "DHCP"
  | "DNS"
  | "Routing"
  | "ACL"
  | "NAT"
  | "Wireless";

export type CaseSeverity = "Low" | "Medium" | "High" | "Critical";

export interface TroubleshootingCase {
  /** Unique identifier, e.g. "CS-001". */
  id: string;
  /** Short problem title. */
  title: string;
  /** Category this case belongs to. */
  category: CaseCategory;
  /** Severity level. */
  severity: CaseSeverity;
  /** Free-text description of what the user observes. */
  symptom: string;
  /** Topology and environment notes (Packet Tracer context). */
  packetTracerNotes: string;
  /** Raw output from relevant Cisco IOS show commands. */
  showCommandOutput: string;
  /** The correct root cause. */
  expectedRootCause: string;
  /** OSI layer where the fault primarily resides. */
  osiLayer: string;
  /** Concept tag for filtering and grouping. */
  conceptTag: string;
  /** One command the user should run next. */
  expectedNextCommand: string;
  /** Ordered steps to resolve the issue. */
  expectedFixSteps: string[];
}
