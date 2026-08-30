/**
 * Rule Checker — TypeScript Types
 *
 * Mirrors the Python rule_checker.py output structure so the frontend
 * can display results without importing Python directly. When the
 * backend is connected, the API will return this same shape.
 */

export type CheckStatus = "PASS" | "WARNING" | "ERROR";

export interface CheckResult {
  check_name: string;
  status: CheckStatus;
  evidence: string;
  explanation: string;
  recommended_action: string;
}

export interface RuleCheckerReport {
  total_checks: number;
  passed: number;
  warnings: number;
  errors: number;
  results: CheckResult[];
}

/** The input network data schema sent to the Python checker. */
export interface NetworkInterface {
  name: string;
  ip_address?: string;
  subnet_mask?: string;
  status: "up" | "down" | "admin-down";
  vlan?: number;
  description?: string;
}

export interface NetworkRoute {
  destination: string;
  mask: string;
  next_hop?: string;
  interface?: string;
  administrative_distance?: number;
  metric?: number;
}

export interface NetworkVlan {
  id: number;
  name: string;
}

export interface NetworkDevice {
  name: string;
  hostname: string;
  default_gateway?: string;
  interfaces: NetworkInterface[];
  routes: NetworkRoute[];
  vlans: NetworkVlan[];
}

export interface NetworkData {
  devices: NetworkDevice[];
}
