import type { ReviewRecord } from "./types";

/**
 * Sample Review Records — Demonstration Data
 *
 * These are constructed examples illustrating how the review workflow
 * functions. They are NOT derived from real user sessions or live AI
 * output. They are clearly labeled as demonstration data throughout
 * the UI.
 */

export const SAMPLE_REVIEWS: ReviewRecord[] = [
  // ── Example 1: Edited — AI missed a secondary cause ──────────────────────
  {
    id: "REV-001",
    caseId: "CS-007",
    aiRootCause:
      "PC1's default gateway is configured as 192.168.10.254 but the actual router subinterface IP is 192.168.10.1.",
    aiConfidence: 0.88,
    aiFixSteps: [
      "Verify the correct gateway IP from the router: show ip interface brief",
      "On PC1, change the default gateway to 192.168.10.1",
      "Verify connectivity: ping 192.168.10.1",
      "Test cross-VLAN reachability: ping 192.168.20.1",
    ],
    decision: "edited",
    correctedRootCause:
      "PC1's default gateway is configured as 192.168.10.254 but the actual router subinterface IP is 192.168.10.1. Additionally, the DNS server entry on PC1 points to a non-existent 10.0.0.99.",
    correctionExplanation:
      "The AI correctly identified the gateway mismatch but missed the secondary DNS misconfiguration. Both issues contribute to the reported symptoms. The DNS entry was found by running 'ipconfig /all' on the host.",
    reviewerNote:
      "Good primary diagnosis. The AI should also check DNS configuration when symptoms mention name resolution failures.",
    timestamp: "2026-08-29T14:23:00Z",
  },

  // ── Example 2: Edited — AI identified wrong OSI layer ────────────────────
  {
    id: "REV-002",
    caseId: "CS-022",
    aiRootCause:
      "The ACL has the correct deny and permit statements, but the permit statement is 'permit ip any any' — it should be working. However, the access-group is applied inbound, so the implicit deny at the end of the ACL is dropping traffic before the permit is reached.",
    aiConfidence: 0.65,
    aiFixSteps: [
      "Verify the full ACL: show access-lists 101",
      "Confirm the 'permit ip any any' is the last statement",
      "Check for any other ACLs applied on the interface",
      "Test: ping from 192.168.10.50 (should fail) and from .51 (should succeed)",
    ],
    decision: "edited",
    correctedRootCause:
      "ACL 101 has a conflicting duplicate entry. A second instance of ACL 101 was applied outbound on Gi0/0.10, overriding the inbound rule. The outbound ACL only has 'deny host 192.168.10.50' without a permit-all, so all outbound traffic is denied.",
    correctionExplanation:
      "The AI was partially correct about the ACL direction issue but did not check for duplicate ACL applications on the same interface. The outbound ACL was the real culprit — a 'show ip access-lists interface' on both directions revealed the conflict.",
    reviewerNote:
      "AI should check both inbound and outbound ACLs on the same interface. The root cause was the outbound application, not the inbound one.",
    timestamp: "2026-08-29T16:45:00Z",
  },

  // ── Example 3: Rejected — AI completely missed the root cause ────────────
  {
    id: "REV-003",
    caseId: "CS-019",
    aiRootCause:
      "R1 is not advertising the 10.0.0.0 network through RIP because it is not included in the 'network' statements.",
    aiConfidence: 0.72,
    aiFixSteps: [
      "On R1, add the missing network: router rip, network 10.0.0.0",
      "Verify: show ip route rip on R2",
      "Check RIP updates: debug ip rip (briefly)",
      "Confirm routes appear: show ip route",
    ],
    decision: "rejected",
    rejectionReason:
      "The actual problem is that R2 has a distribute-list filtering incoming RIP routes. The 'network' statements on R1 are correct. The issue is entirely on the receiving side — R2's distribute-list blocks 192.168.10.0 and 192.168.20.0. The AI focused on the wrong router.",
    reviewerNote:
      "The AI assumed the issue was on the advertising router without checking the receiving router's configuration. Always verify both sides of a routing adjacency.",
    timestamp: "2026-08-30T09:10:00Z",
  },

  // ── Example 4: Edited — AI diagnosis was correct but fix was incomplete ──
  {
    id: "REV-004",
    caseId: "CS-010",
    aiRootCause:
      "The /24 subnet provides 254 usable addresses but 252 are already leased. The pool is nearly exhausted and new clients cannot obtain an address.",
    aiConfidence: 0.91,
    aiFixSteps: [
      "Check pool utilization: show ip dhcp pool",
      "Release unused bindings: clear ip dhcp binding * (caution — disruptive)",
      "Or extend the subnet: change to a /23 to double available addresses",
      "Add an exclude range for static devices: ip dhcp excluded-address 192.168.10.1 192.168.10.20",
    ],
    decision: "edited",
    correctedRootCause:
      "The /24 subnet provides 254 usable addresses but 252 are already leased. Additionally, 18 leases are held by devices that have been disconnected for over 48 hours — these are stale bindings that should be cleared before expanding the pool.",
    correctionExplanation:
      "The AI's diagnosis was correct but its recommended fix was too aggressive. Expanding to a /23 is unnecessary when 18 stale bindings can be cleared. The correct first step is to reduce the lease time and clear expired entries, not re-address the entire subnet.",
    reviewerNote:
      "AI should check lease expiry times before recommending subnet expansion. A more conservative fix was appropriate here.",
    timestamp: "2026-08-30T10:30:00Z",
  },

  // ── Example 5: Rejected — AI misidentified the protocol ─────────────────
  {
    id: "REV-005",
    caseId: "CS-017",
    aiRootCause:
      "OSPF area mismatch — R1 is in area 0 and R2 is in area 1. OSPF neighbors must be in the same area to form a full adjacency.",
    aiConfidence: 0.78,
    aiFixSteps: [
      "Check areas: show ip ospf interface on both routers",
      "On R2, change to area 0: router ospf 1, network 10.0.0.0 0.0.0.3 area 0",
      "Verify adjacency: show ip ospf neighbor (should reach FULL)",
      "Check routes: show ip route ospf",
    ],
    decision: "rejected",
    rejectionReason:
      "The AI misread the show command output. Both routers are actually in area 0 — the real issue is a mismatched hello/dead timer. R1 has hello-interval 5 and dead-interval 20, while R2 has hello-interval 10 and dead-interval 40. The neighbor state stuck at INIT is caused by the timer mismatch, not an area mismatch.",
    reviewerNote:
      "The AI should parse show ip ospf interface more carefully. The area field clearly shows 'Area 0' on both routers. Timer values are in the same output and should be compared.",
    timestamp: "2026-08-30T11:15:00Z",
  },
];
