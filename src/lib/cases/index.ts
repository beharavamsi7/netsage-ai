import { CASES } from "./data";
import type { CaseCategory, CaseSeverity, TroubleshootingCase } from "./types";

// ─── Re-export types ─────────────────────────────────────────────────────────

export type { TroubleshootingCase, CaseCategory, CaseSeverity } from "./types";

// ─── Data ────────────────────────────────────────────────────────────────────

/** The full dataset of troubleshooting cases. */
export const cases: TroubleshootingCase[] = CASES;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** All unique categories present in the dataset. */
export const ALL_CATEGORIES: CaseCategory[] = [
  "VLAN",
  "Default Gateway",
  "DHCP",
  "DNS",
  "Routing",
  "ACL",
  "NAT",
  "Wireless",
];

/** All severity levels. */
export const ALL_SEVERITIES: CaseSeverity[] = [
  "Critical",
  "High",
  "Medium",
  "Low",
];

/** Count cases in each category. */
export function countByCategory(): Record<CaseCategory, number> {
  const counts = {} as Record<CaseCategory, number>;
  for (const c of cases) {
    counts[c.category] = (counts[c.category] ?? 0) + 1;
  }
  return counts;
}

/** Count cases at each severity level. */
export function countBySeverity(): Record<CaseSeverity, number> {
  const counts = {} as Record<CaseSeverity, number>;
  for (const c of cases) {
    counts[c.severity] = (counts[c.severity] ?? 0) + 1;
  }
  return counts;
}

/** Find a case by its ID. */
export function findCase(id: string): TroubleshootingCase | undefined {
  return cases.find((c) => c.id === id);
}

/** Filter cases by category. */
export function filterByCategory(category: CaseCategory): TroubleshootingCase[] {
  return cases.filter((c) => c.category === category);
}

/** Filter cases by severity. */
export function filterBySeverity(severity: CaseSeverity): TroubleshootingCase[] {
  return cases.filter((c) => c.severity === severity);
}
