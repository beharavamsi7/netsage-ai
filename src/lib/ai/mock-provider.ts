import type {
  DiagnosisProvider,
  DiagnosisRequest,
  DiagnosisResponse,
} from "./types";

/**
 * Mock diagnosis provider.
 *
 * Returns a realistic-looking diagnosis derived from simple keyword matching
 * on the user's input. This lets the full UI workflow be tested end-to-end
 * without any external API. Replace with a real LLM-backed provider later
 * by implementing the same DiagnosisProvider interface.
 */

interface MockPattern {
  keywords: string[];
  response: Omit<DiagnosisResponse, "processing_time_ms">;
}

const PATTERNS: MockPattern[] = [
  {
    keywords: ["vlan", "vlans", "layer 2", "switchport", "trunk"],
    response: {
      root_cause: "VLAN misconfiguration — access port assigned to wrong VLAN or trunk not allowing the required VLAN",
      confidence: 0.82,
      osi_layer: "Layer 2",
      evidence: [
        "Symptoms reference VLAN or switchport behavior",
        "Traffic is not reaching the expected broadcast domain",
        "Interface may show up/up but the VLAN membership does not match the intended segment",
      ],
      next_command: "show vlan brief",
      fix_steps: [
        "Verify VLAN assignments: show vlan brief",
        "Check trunk allowed VLANs: show interfaces trunk",
        "Confirm the access port VLAN: show running-config interface <int>",
        "Reassign the port if needed: switchport access vlan <id>",
        "Test connectivity with ping from the affected host",
      ],
    },
  },
  {
    keywords: ["ospf", "neighbor", "adjacency", "routing protocol"],
    response: {
      root_cause: "OSPF adjacency failure — hello/dead timer mismatch or network type incompatibility between neighbors",
      confidence: 0.78,
      osi_layer: "Layer 3",
      evidence: [
        "OSPF neighbors are not forming or are flapping",
        "Possible mismatch in hello/dead intervals or area IDs",
        "Network type mismatch (e.g. broadcast vs point-to-point) can prevent adjacency",
      ],
      next_command: "show ip ospf neighbor",
      fix_steps: [
        "Check neighbor state: show ip ospf neighbor",
        "Verify hello/dead timers: show ip ospf interface <int>",
        "Confirm area IDs match on both ends",
        "Ensure network types are compatible",
        "Clear and re-establish: clear ip ospf process",
      ],
    },
  },
  {
    keywords: ["acl", "access list", "permit", "deny", "filter"],
    response: {
      root_cause: "ACL blocking legitimate traffic — implicit deny or incorrect ACE matching desired traffic",
      confidence: 0.75,
      osi_layer: "Layer 3",
      evidence: [
        "Traffic is being filtered when it should be allowed",
        "ACL may contain an implicit deny at the end",
        "ACE order or wildcard mask may be matching more broadly than intended",
      ],
      next_command: "show access-lists",
      fix_steps: [
        "Display active ACLs: show access-lists",
        "Check applied interfaces: show ip access-lists interface <int>",
        "Verify ACE order — ACLs are evaluated top-down",
        "Add a permit ACE before the implicit deny",
        "Test with extended ping from the source host",
      ],
    },
  },
  {
    keywords: ["dhcp", "ip address", "address assignment", "pool"],
    response: {
      root_cause: "DHCP pool exhaustion or helper-address misconfiguration preventing address assignment",
      confidence: 0.71,
      osi_layer: "Layer 3",
      evidence: [
        "Hosts are not receiving IP addresses via DHCP",
        "DHCP pool may be exhausted or the helper-address may not be set on the relay interface",
        "A missing ip helper-address on the router interface prevents DHCP requests from reaching the server",
      ],
      next_command: "show ip dhcp binding",
      fix_steps: [
        "Check DHCP bindings: show ip dhcp binding",
        "Verify pool status: show ip dhcp pool",
        "Confirm ip helper-address on the relay interface",
        "Test DHCP from a client: ipconfig /release then /renew",
        "Increase pool size if exhausted",
      ],
    },
  },
  {
    keywords: ["spanning tree", "stp", "loop", "broadcast storm"],
    response: {
      root_cause: "Spanning Tree topology change or loop — blocked port not isolating traffic as expected",
      confidence: 0.74,
      osi_layer: "Layer 2",
      evidence: [
        "STP may have converged to a suboptimal topology",
        "A loop could be present if redundant links are not properly blocked",
        "Root bridge election may have shifted due to a misconfigured bridge priority",
      ],
      next_command: "show spanning-tree",
      fix_steps: [
        "Check STP status: show spanning-tree",
        "Verify root bridge: show spanning-tree root",
        "Confirm port roles (root/alternate/designated)",
        "Set bridge priority to control root election",
        "Enable PortFast on access ports to prevent unnecessary transitions",
      ],
    },
  },
  {
    keywords: ["nat", "translation", "pat", "overload", "outside"],
    response: {
      root_cause: "NAT translation failure — overload statement missing or inside/outside interface marking incorrect",
      confidence: 0.73,
      osi_layer: "Layer 3",
      evidence: [
        "Internal hosts cannot reach external networks",
        "NAT translation table may not be populating",
        "Interfaces may not be marked correctly as inside or outside",
      ],
      next_command: "show ip nat translations",
      fix_steps: [
        "Check NAT table: show ip nat translations",
        "Verify inside/outside marking: show ip nat statistics",
        "Confirm the NAT overload (PAT) statement is applied",
        "Test with extended ping from an inside host",
        "Review access-list used by the NAT rule",
      ],
    },
  },
  {
    keywords: ["interface", "down", "err-disabled", "physical", "cable"],
    response: {
      root_cause: "Physical or Layer 1 issue — interface in err-disabled state or cabling problem",
      confidence: 0.68,
      osi_layer: "Layer 1",
      evidence: [
        "Interface is showing err-disabled or down/down status",
        "Could be caused by BPDU guard, port security violation, or a bad cable",
        "Physical layer must be resolved before higher-layer troubleshooting",
      ],
      next_command: "show interfaces status err-disabled",
      fix_steps: [
        "Check interface status: show interfaces status",
        "Identify err-disabled reason: show interfaces <int> | include err",
        "Re-enable the interface: shutdown then no shutdown",
        "Address root cause (BPDU guard, port security, etc.)",
        "Verify physical cabling and link LEDs",
      ],
    },
  },
];

/** Default fallback when no keyword pattern matches. */
const DEFAULT_RESPONSE: Omit<DiagnosisResponse, "processing_time_ms"> = {
  root_cause: "Unable to determine root cause from provided input — more diagnostic data needed",
  confidence: 0.45,
  osi_layer: "Unknown",
  evidence: [
    "The submitted symptoms and command output did not match a known pattern",
    "Additional show commands would help narrow the diagnosis",
  ],
  next_command: "show ip interface brief",
  fix_steps: [
    "Gather baseline status: show ip interface brief",
    "Check routing table: show ip route",
    "Review running configuration: show running-config",
    "Test connectivity: ping <destination>",
    "Re-submit with expanded show-command output",
  ],
};

function findMatchingPattern(input: string): MockPattern | undefined {
  const lower = input.toLowerCase();
  return PATTERNS.find((p) => p.keywords.some((kw) => lower.includes(kw)));
}

export const mockProvider: DiagnosisProvider = {
  name: "mock-v1",

  async diagnose(request: DiagnosisRequest): Promise<DiagnosisResponse> {
    // Simulate network latency
    const delay = 800 + Math.random() * 600;
    await new Promise((r) => setTimeout(r, delay));

    const combined = `${request.symptoms} ${request.packetTracerNotes} ${request.showCommandOutput}`;
    const pattern = findMatchingPattern(combined);
    const base = pattern?.response ?? DEFAULT_RESPONSE;

    return {
      ...base,
      processing_time_ms: Math.round(delay),
    };
  },
};
