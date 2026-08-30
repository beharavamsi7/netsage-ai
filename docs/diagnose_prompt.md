# NetSage Dashboard — AI Diagnosis Prompt Library

> This document records the production prompt used by the Gemini-backed diagnosis
> provider in NetSage Dashboard. It serves as the authoritative reference for the
> prompt's purpose, structure, safety rules, and expected behavior. All examples
> are constructed documentation — they are not live user data.

---

## 1. Purpose

NetSage's AI diagnosis prompt instructs a large language model (Gemini 2.0 Flash)
to act as **NetSage**, an AI network troubleshooting assistant for Cisco Packet
Tracer and lab scenarios. Given a user's description of observed network symptoms,
Packet Tracer notes, and raw show-command output, the model produces a structured,
evidence-based diagnosis.

Every diagnosis is explicitly framed as a **recommendation requiring human review**.
The AI never executes commands, modifies configurations, or claims a fix has been
applied. The output feeds into NetSage's Accept / Edit / Reject human-review
workflow so that an expert can validate, correct, or override the AI's assessment
before any remediation is attempted.

---

## 2. Input Format

The prompt receives three inputs collected from the Troubleshooter UI:

| Input | Required | Description |
|---|---|---|
| **Network Symptom** | Yes | Free-text description of the observed problem (e.g. "PC1 cannot reach the gateway, other hosts on VLAN 10 work fine"). |
| **Packet Tracer Notes** | No | Topology notes, topology descriptions, or configuration observations the user recorded in Packet Tracer. |
| **Show-Command Output** | No | Raw output from one or more Cisco IOS `show` commands (e.g. `show ip interface brief`, `show vlan brief`). |

These are concatenated into a single user message before being sent to the model.
Optional fields are omitted if blank.

---

## 3. Structured Output

The model must return **only valid JSON** with these exact fields:

```json
{
  "root_cause": "string — concise description of the diagnosed problem",
  "confidence": "number between 0 and 1",
  "osi_layer": "string — e.g. Layer 1, Layer 2, Layer 3, Layer 4, Layer 7",
  "evidence": ["string array — each item is a piece of evidence from the input OR clearly marked as an assumption"],
  "next_command": "string — one Cisco IOS command to gather more information",
  "fix_steps": ["string array — ordered steps to remediate the issue"]
}
```

| Field | Type | Description |
|---|---|---|
| `root_cause` | `string` | A concise, plain-language description of the diagnosed problem. Should reference the specific fault, not a generic category. |
| `confidence` | `number` | A value between 0 and 1 reflecting how well the available evidence supports the diagnosis. 0.9+ indicates strong evidence; below 0.6 indicates significant uncertainty. |
| `osi_layer` | `string` | The primary OSI layer involved (e.g. "Layer 1", "Layer 2", "Layer 3"). |
| `evidence` | `string[]` | Bullet points drawn directly from the user's input. Each item should state whether it is **confirmed** (directly observable) or an **assumption** (inferred). |
| `next_command` | `string` | A single Cisco IOS command that would best narrow the diagnosis if evidence is insufficient. |
| `fix_steps` | `string[]` | An ordered list of remediation steps. Steps should reference specific commands or actions but must not imply the AI has executed them. |

### Convex Response Validation

After the model returns its JSON, the server-side Convex action (`src/convex/diagnose.ts`)
validates every required field and clamps the confidence value to the 0–1 range.
If any field is missing or the response cannot be parsed as JSON, the action throws
an error that the client catches and falls back to the mock provider.

---

## 4. Safety and Reliability Rules

The system prompt enforces these rules to keep diagnoses grounded and safe:

### 4.1 Evidence-only reasoning

The AI must use **only** the evidence provided in the user's input. It must not
invent symptoms, show-command output, or configuration details that are not present
in the supplied text.

### 4.2 No fabricated command output

The AI must never fabricate or quote Cisco IOS command output that the user did not
provide. If it references a command, it must recommend the user run it — not pretend
it has already seen the output.

### 4.3 Confirmed vs. assumed evidence

Each evidence item must be clearly labeled or written so the reader can tell whether
it is:

- **Confirmed** — directly observable from the provided symptoms, notes, or show-command output.
- **Assumed** — inferred from partial information but not directly observed.

### 4.4 Confidence calibration

The confidence score must honestly reflect the strength of the evidence:

| Range | Meaning |
|---|---|
| 0.9 – 1.0 | Strong, multi-source evidence directly supports the diagnosis |
| 0.7 – 0.9 | Evidence is consistent but incomplete; a few assumptions are involved |
| 0.5 – 0.7 | Significant uncertainty; more diagnostic data needed |
| 0 – 0.5 | Speculative; evidence is weak or contradictory |

### 4.5 Recommend further commands

When evidence is insufficient for a confident diagnosis, the `next_command` field
should contain the single most useful Cisco IOS command to narrow the problem.

### 4.6 No configuration changes

The AI must **never** claim that a network configuration was changed, a command was
executed, or a fix was applied. It is diagnosing, not executing.

### 4.7 Human review required

Every diagnosis is a **recommendation**. It is not authoritative and must go through
the Accept / Edit / Reject human-review workflow before any action is taken.

---

## 5. Full Diagnosis Prompt

The following is the exact system prompt currently used by the Gemini provider,
defined in `src/convex/diagnose.ts`:

```
You are NetSage, an AI network troubleshooting assistant for Cisco Packet Tracer and lab scenarios.

Your task is to diagnose the network problem described by the user and return a structured JSON response.

RULES:
1. Use ONLY the evidence provided in the user's input. Do not invent evidence that is not present in the symptoms, notes, or show-command output.
2. Clearly distinguish confirmed evidence (directly observable from the input) from assumptions (inferred but not directly observed).
3. Assign a confidence value between 0 and 1 based on how well the evidence supports your diagnosis.
4. If the evidence is insufficient, recommend the single most useful next diagnostic command.
5. Never claim that a network configuration was changed or that a fix was applied. You are diagnosing, not executing.
6. Treat every diagnosis as a recommendation that requires human review before action.

Return ONLY valid JSON with these exact fields:
{
  "root_cause": "string — concise description of the diagnosed problem",
  "confidence": number between 0 and 1,
  "osi_layer": "string — e.g. Layer 1, Layer 2, Layer 3, Layer 4, Layer 7",
  "evidence": ["string array — each item is a piece of evidence from the input OR clearly marked as an assumption"],
  "next_command": "string — one Cisco IOS command to gather more information",
  "fix_steps": ["string array — ordered steps to remediate the issue"]
}
```

### Model configuration

| Parameter | Value | Rationale |
|---|---|---|
| Model | `gemini-2.0-flash` | Fast response for interactive troubleshooting |
| Temperature | 0.3 | Low creativity, high factual grounding |
| Max output tokens | 1024 | Sufficient for structured JSON response |
| Response format | `application/json` with schema enforcement | Ensures parseable, valid output |

---

## 6. Worked Examples

> **Note:** The following examples are constructed for documentation purposes.
> They illustrate the expected input/output behavior of the diagnosis prompt and
> are not records of live troubleshooting sessions.

---

### Example 1: Administratively Down Interface

#### Input

```
Symptom:
PC1 on VLAN 10 cannot ping the default gateway 192.168.10.1. Other PCs on
the same VLAN are also unreachable.

Packet Tracer Notes:
- PC1 is connected to SW1 FastEthernet0/1
- SW1 is a 2960 switch, VLAN 10 is configured
- R1 GigabitEthernet0/0.10 is the gateway (sub-interface)

Show-Command Output:
SW1# show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
FastEthernet0/1        unassigned      YES unset  administratively down down
FastEthernet0/2        unassigned      YES unset  up                    up
Vlan10                 192.168.10.2    YES manual up                    up
```

#### Expected Diagnosis

```json
{
  "root_cause": "Interface Fa0/1 on SW1 is administratively down — the port has been shut down and is not forwarding traffic for VLAN 10",
  "confidence": 0.95,
  "osi_layer": "Layer 1",
  "evidence": [
    "Confirmed: SW1 show output shows FastEthernet0/1 status is 'administratively down'",
    "Confirmed: PC1 is connected to Fa0/1 and cannot reach the gateway",
    "Confirmed: Fa0/2 on the same switch is up/up, ruling out a switch-wide issue",
    "Assumed: The port was manually shut down or placed in a err-disabled recovery state"
  ],
  "next_command": "show interfaces FastEthernet0/1 | include err|down",
  "fix_steps": [
    "Enter interface configuration mode: configure terminal, interface FastEthernet0/1",
    "Re-enable the port: no shutdown",
    "Verify the status recovers: show ip interface brief FastEthernet0/1",
    "Confirm PC1 can now reach the gateway: ping 192.168.10.1 from PC1",
    "Investigate why the port was shut down (BPDU guard, port security, manual shutdown)"
  ]
}
```

#### Why this diagnosis is strong

The `show ip interface brief` output directly shows `administratively down` on the
exact port PC1 connects through. This is a textbook Layer 1 issue with very high
evidence confidence (0.95). The next command (`show interfaces ... | include err`)
helps identify whether the shutdown was caused by an error condition or was manual.

---

### Example 2: VLAN / Trunk Problem

#### Input

```
Symptom:
Servers in VLAN 30 on SW2 cannot communicate with clients in VLAN 10 on SW1.
VLAN 30 was recently added to the topology. PCs in VLAN 10 can ping each other
without issues.

Packet Tracer Notes:
- R1 connects to SW1 and SW2 via trunk links
- SW1 has VLANs 10 and 20
- SW2 has VLANs 30 and 40
- R1 has sub-interfaces for VLANs 10 and 30

Show-Command Output:
SW1# show interfaces trunk
Port        Mode         Encapsulation  Status        Native vlan
Gi0/1       on           802.1q         trunking      1

Port        Vlans allowed on trunk
Gi0/1       10,20

Port        Vlans allowed and active in management domain
Gi0/1       10,20

SW2# show vlan brief
VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Fa0/1, Fa0/2, Fa0/3
30   Servers                          active    Fa0/4, Fa0/5
40   Management                       active    Fa0/6
```

#### Expected Diagnosis

```json
{
  "root_cause": "Trunk link between SW1 and R1 is not allowing VLAN 30 — the allowed VLAN list on Gi0/1 only includes VLANs 10 and 20",
  "confidence": 0.91,
  "osi_layer": "Layer 2",
  "evidence": [
    "Confirmed: SW1 show interfaces trunk shows 'Vlans allowed on trunk' for Gi0/1 is '10,20' — VLAN 30 is absent",
    "Confirmed: SW2 has VLAN 30 active but traffic cannot cross to SW1/R1 because the trunk does not carry it",
    "Confirmed: VLAN 10 works because it is in the allowed list",
    "Assumed: The trunk was configured with 'switchport trunk allowed vlan 10,20' and VLAN 30 was not added after the new VLAN was created"
  ],
  "next_command": "show running-config interface GigabitEthernet0/1 | include trunk",
  "fix_steps": [
    "Enter interface configuration mode on SW1: configure terminal, interface GigabitEthernet0/1",
    "Add VLAN 30 to the allowed list: switchport trunk allowed vlan add 30",
    "Verify the change: show interfaces trunk",
    "Confirm VLAN 30 traffic now crosses the trunk: ping from a VLAN 30 host to a VLAN 10 host through R1",
    "Review whether a VLAN policy should be documented for future additions"
  ]
}
```

#### Why this diagnosis is strong

The `show interfaces trunk` output explicitly lists only VLANs 10 and 20 on the
trunk — VLAN 30 is absent. This directly explains why VLAN 30 traffic cannot
cross the link. The diagnosis is specific, cites the exact missing VLAN, and
provides a precise remediation command.

---

### Example 3: Routing Problem (OSPF Area Mismatch)

#### Input

```
Symptom:
R2 cannot reach the 10.0.30.0/24 network behind R3. R2 can ping R1
(10.0.10.1) but the route to 10.0.30.0 does not appear in R2's routing table.

Packet Tracer Notes:
- R1, R2, and R3 are connected in a chain: R2 — R1 — R3
- OSPF is configured on all three routers
- R1 is in area 0
- R2 is in area 0
- R3 was recently added and OSPF was configured with 'network 10.0.30.0 0.0.0.255 area 1'

Show-Command Output:
R2# show ip route ospf
O        10.0.10.0/24 [110/2] via 10.0.12.1, 00:15:32, GigabitEthernet0/0

R2# show ip ospf neighbor
Neighbor ID     Pri   State           Dead Time   Address         Interface
10.0.10.1         1   FULL/DR         00:00:30    10.0.12.1       GigabitEthernet0/0

R1# show ip ospf neighbor
Neighbor ID     Pri   State           Dead Time   Address         Interface
10.0.12.2         1   FULL/BDR        00:00:37    10.0.12.2       GigabitEthernet0/0
10.0.30.3         1   INIT/DROTHER    00:00:32    10.0.23.3       GigabitEthernet0/1
```

#### Expected Diagnosis

```json
{
  "root_cause": "OSPF adjacency between R1 and R3 is stuck in INIT state — R3 is configured in area 1 while R1 is in area 0, preventing full adjacency and blocking LSA exchange for 10.0.30.0/24",
  "confidence": 0.88,
  "osi_layer": "Layer 3",
  "evidence": [
    "Confirmed: R2's routing table shows no OSPF route to 10.0.30.0/24",
    "Confirmed: R2 has a valid OSPF route to 10.0.10.0/24 via R1, confirming R2-R1 adjacency works",
    "Confirmed: R1's show ip ospf neighbor shows R3 stuck in INIT/DROTHER state — full adjacency never formed",
    "Assumed: R3 is configured with OSPF in area 1 while R1's Gi0/1 is in area 0, causing the area mismatch",
    "Assumed: R3's network statement places 10.0.30.0 in area 1, which does not match R1's area 0 on the shared link"
  ],
  "next_command": "show ip ospf interface GigabitEthernet0/1 on R1 and R3",
  "fix_steps": [
    "Verify area configuration on both sides: show ip ospf interface GigabitEthernet0/1 on R1 and R3",
    "Reconfigure R3's OSPF to use area 0 on the link to R1: router ospf 1, network 10.0.23.0 0.0.0.255 area 0",
    "Keep area 1 for the 10.0.30.0/24 network: network 10.0.30.0 0.0.0.255 area 1",
    "Clear OSPF process on R1 and R3: clear ip ospf process",
    "Verify full adjacency: show ip ospf neighbor on R1 (should show FULL/BDR or FULL/DR for R3)",
    "Confirm R2 now has the route: show ip route ospf on R2"
  ]
}
```

#### Why this diagnosis is strong

The evidence clearly shows R1-R3 adjacency stuck in INIT, and R3 was "recently
added" with area 1 configuration. The combination of the neighbor state, the
missing route, and the topology notes strongly supports an area mismatch. The
confidence (0.88) is slightly below 0.9 because the area configuration on R3 is
inferred (not directly shown in the provided output), which is why the next
command recommends verifying it.

---

## 7. Human Review Workflow

After the AI produces a diagnosis, the result moves through NetSage's human-review
process:

### Step 1 — Review the diagnosis

The diagnosis is displayed in the Troubleshooter with:

- **Root cause** — what the AI believes the problem is
- **Confidence** — how certain the AI is (color-coded: green ≥ 75%, amber ≥ 55%, red below)
- **OSI layer** — the network layer involved
- **Evidence** — what the AI based its conclusion on (confirmed vs. assumed)
- **Next command** — what to run next if the evidence is insufficient
- **Fix steps** — ordered remediation steps

### Step 2 — Make a decision

The reviewer selects one of three actions:

| Action | When to use | Additional input required |
|---|---|---|
| **Accept** | The AI diagnosis is correct and the fix steps are appropriate | None |
| **Edit** | The AI is partially correct but the root cause or fix needs correction | Corrected root cause, correction explanation |
| **Reject** | The AI diagnosis is incorrect | Rejection reason |

An optional reviewer note can be added for any decision.

### Step 3 — Record the review

The review decision is stored with:

- Case reference (if linked to a dataset case)
- Original AI diagnosis
- Review decision (accepted / edited / rejected)
- Human correction (if edited or rejected)
- Reviewer note
- Timestamp

### Where reviews appear

- **Human Review page** — full list of all reviews with filtering and detail panels
- **Responsible AI Log page** — audit trail showing AI confidence, human decision, and whether corrections were made
- **Dashboard** — live metrics: AI Accepted / Edited / Rejected counts and agreement rate

### Constructed demonstration records

The Responsible AI Log includes five pre-built example review records (REV-001
through REV-005) showing realistic correction scenarios. These are clearly labeled
as constructed demonstration data, not live user reviews.

---

## 8. Provider Architecture

The diagnosis prompt is consumed through a pluggable provider architecture:

```
Troubleshooter UI
  → src/lib/ai/index.ts       (provider selection + fallback logic)
    → src/lib/ai/gemini-provider.ts  (calls Convex action)
      → src/convex/diagnose.ts       (runs server-side, holds API key, sends prompt)
        → Gemini 2.0 Flash API
    → src/lib/ai/mock-provider.ts    (fallback when no API key)
```

- The **Gemini provider** is preferred when `GEMINI_API_KEY` is set in the Convex
  dashboard environment variables.
- The **Mock provider** is used as a fallback when no key is configured or when the
  Gemini call fails.
- The Troubleshooter UI never changes based on which provider is active — it calls
  `diagnose()` and `getProviderName()` from `src/lib/ai/index.ts`.
- To add a new provider, implement the `DiagnosisProvider` interface in a new file
  and update the selection logic in `index.ts`.
