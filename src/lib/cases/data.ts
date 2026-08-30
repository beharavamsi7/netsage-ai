import type { TroubleshootingCase } from "./types";

/**
 * NetSage Case Dataset — 30 Troubleshooting Scenarios
 *
 * Each case is a realistic Packet Tracer / lab scenario with technically
 * accurate show-command output. Cases are NOT claimed to have been tested
 * in a live lab — they are constructed from documented Cisco behavior and
 * common lab pitfalls.
 *
 * Categories: VLAN (5) · Default Gateway (4) · DHCP (4) · DNS (3)
 *             Routing (5) · ACL (4) · NAT (3) · Wireless (2)
 */

export const CASES: TroubleshootingCase[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  //  VLAN
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "CS-001",
    title: "Hosts in VLAN 10 cannot reach VLAN 20",
    category: "VLAN",
    severity: "Medium",
    symptom:
      "Two groups of hosts on separate VLANs (10 and 20) cannot communicate. Both VLANs are active on the switch but inter-VLAN traffic fails.",
    packetTracerNotes:
      "Topology: 1x Catalyst 2960 switch, 1x 2911 router with subinterfaces on Gi0/0. PC1 (VLAN 10, 192.168.10.10/24) and PC2 (VLAN 20, 192.168.20.10/24) connected to the switch. Router-on-a-stick configuration.",
    showCommandOutput: `SW1# show vlan brief

VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Fa0/3, Fa0/4, Fa0/5
10   VLAN10                           active    Fa0/1
20   VLAN20                           active    Fa0/2

SW1# show interfaces trunk

Port        Mode         Encapsulation  Status        Native vlan
Fa0/24      on           802.1q         trunking      1

Port        Vlans allowed on trunk
Fa0/24      1

Port        Vlans allowed and active in management domain
Fa0/24      1`,
    expectedRootCause:
      "Trunk link between the switch and router is not allowing VLANs 10 and 20. The allowed VLAN list on Fa0/24 only permits VLAN 1, so tagged frames for VLANs 10 and 20 are dropped.",
    osiLayer: "Layer 2",
    conceptTag: "Trunk configuration",
    expectedNextCommand: "show interfaces trunk",
    expectedFixSteps: [
      "Verify trunk allowed VLANs: show interfaces trunk",
      "Add VLANs 10 and 20 to the trunk: switchport trunk allowed vlan add 10,20",
      "Confirm the router subinterfaces use the correct encapsulation: show running-config interface Gi0/0.10",
      "Test inter-VLAN ping from PC1 to PC2",
    ],
  },

  {
    id: "CS-002",
    title: "New host not joining correct VLAN",
    category: "VLAN",
    severity: "Low",
    symptom:
      "A newly connected host receives an IP in the wrong subnet. The port should be in VLAN 30 but the host gets an address from VLAN 10.",
    packetTracerNotes:
      "Topology: 1x 2960 switch. New PC connected to Fa0/5. Fa0/5 should be in VLAN 30 (10.0.30.0/24) but the host receives 10.0.10.x from VLAN 10's pool.",
    showCommandOutput: `SW1# show interfaces FastEthernet0/5 switchport

Name: Fa0/5
Switchport: Enabled
Administrative Mode: dynamic desirable
Operational Mode: static access
Administrative Trunking Encapsulation: negotiate
Operational Trunking Encapsulation: native
Negotiation of Trunking: On
Access Mode VLAN: 1 (default)
Trunking Native Mode VLAN: 1 (default)

SW1# show vlan brief

VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Fa0/3, Fa0/4, Fa0/5
10   VLAN10                           active    Fa0/1, Fa0/2
30   VLAN30                           active    Fa0/6, Fa0/7`,
    expectedRootCause:
      "Port Fa0/5 is still assigned to the default VLAN 1 (which is in the same broadcast domain as VLAN 10 via the DHCP relay). It has not been assigned to VLAN 30.",
    osiLayer: "Layer 2",
    conceptTag: "Access port assignment",
    expectedNextCommand: "show running-config interface FastEthernet0/5",
    expectedFixSteps: [
      "Enter interface configuration: configure terminal, interface Fa0/5",
      "Set the port to access mode: switchport mode access",
      "Assign to VLAN 30: switchport access vlan 30",
      "Verify: show vlan brief",
      "Confirm the host receives an IP in the 10.0.30.0/24 range",
    ],
  },

  {
    id: "CS-003",
    title: "Trunk port not forming between switches",
    category: "VLAN",
    severity: "High",
    symptom:
      "Two switches are connected via Fa0/24 but the link does not come up as a trunk. VLAN traffic is not crossing between the switches.",
    packetTracerNotes:
      "Topology: 2x 2960 switches connected via Fa0/24 to Fa0/24. Both ports are configured with 'switchport mode trunk' but the link stays in access mode.",
    showCommandOutput: `SW1# show interfaces FastEthernet0/24 switchport

Name: Fa0/24
Switchport: Enabled
Administrative Mode: trunk
Operational Mode: static access
Administrative Trunking Encapsulation: negotiate
Operational Trunking Encapsulation: native
Negotiation of Trunking: On
Access Mode VLAN: 1 (default)

SW2# show interfaces FastEthernet0/24 switchport

Name: Fa0/24
Switchport: Enabled
Administrative Mode: dynamic auto
Operational Mode: static access
Administrative Trunking Encapsulation: negotiate
Operational Trunking Encapsulation: native
Negotiation of Trunking: On
Access Mode VLAN: 1 (default)`,
    expectedRootCause:
      "SW1 is configured as trunk (on) but SW2 is in dynamic auto mode. Two dynamic auto ports never form a trunk. A trunk requires at least one side to be 'trunk' or both sides to be 'dynamic desirable'.",
    osiLayer: "Layer 2",
    conceptTag: "DTP negotiation",
    expectedNextCommand: "show dtp interface FastEthernet0/24",
    expectedFixSteps: [
      "On SW2, set the port to trunk mode: switchport mode trunk",
      "Or set both ports to dynamic desirable: switchport mode dynamic desirable",
      "Verify trunk forms: show interfaces trunk",
      "Confirm VLANs are allowed on the trunk",
    ],
  },

  {
    id: "CS-004",
    title: "Native VLAN mismatch between switches",
    category: "VLAN",
    severity: "High",
    symptom:
      "Inter-VLAN routing works but untagged traffic between the switches is being placed in the wrong VLAN. Users on VLAN 10 intermittently see traffic from VLAN 99.",
    packetTracerNotes:
      "Topology: 2x 2960 switches connected via trunk Fa0/24. VLAN 99 is designated as the native VLAN on SW1 but SW2 still uses the default native VLAN 1.",
    showCommandOutput: `SW1# show interfaces trunk

Port        Mode         Encapsulation  Status        Native vlan
Fa0/24      on           802.1q         trunking      99

SW2# show interfaces trunk

Port        Mode         Encapsulation  Status        Native vlan
Fa0/24      on           802.1q         trunking      1`,
    expectedRootCause:
      "Native VLAN mismatch — SW1 uses native VLAN 99 while SW2 uses native VLAN 1. Untagged frames leaving SW1 on VLAN 99 arrive at SW2 and are placed into VLAN 1, causing a VLAN hopping / traffic leak.",
    osiLayer: "Layer 2",
    conceptTag: "Native VLAN",
    expectedNextCommand: "show interfaces trunk",
    expectedFixSteps: [
      "Confirm native VLANs: show interfaces trunk on both switches",
      "On SW2, set the native VLAN to match: switchport trunk native vlan 99",
      "Verify both sides match: show interfaces trunk",
      "Ensure VLAN 99 exists on both switches: show vlan brief",
    ],
  },

  {
    id: "CS-005",
    title: "VLAN not propagating to second switch",
    category: "VLAN",
    severity: "Medium",
    symptom:
      "VLAN 50 was created on SW1 but does not appear on SW2. Hosts connected to SW2 in what should be VLAN 50 are in the default VLAN.",
    packetTracerNotes:
      "Topology: 2x 2960 switches connected via trunk Fa0/24. VLAN 50 was created on SW1 but SW2 shows only VLANs 1, 10, and 20.",
    showCommandOutput: `SW1# show vlan brief

VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Fa0/3, Fa0/4
10   VLAN10                           active    Fa0/1
20   VLAN20                           active    Fa0/2
50   LAB                              active

SW2# show vlan brief

VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Fa0/1, Fa0/2, Fa0/3, Fa0/4
10   VLAN10                           active    Fa0/5
20   VLAN20                           active    Fa0/6`,
    expectedRootCause:
      "VLAN 50 was created locally on SW1 but not on SW2. VLANs are local to each switch unless VTP is configured or the VLAN is manually created on every switch in the domain.",
    osiLayer: "Layer 2",
    conceptTag: "VLAN database",
    expectedNextCommand: "show vtp status",
    expectedFixSteps: [
      "Check VTP status on both switches: show vtp status",
      "On SW2, create VLAN 50: vlan 50, name LAB",
      "Or configure VTP domain so VLANs propagate automatically",
      "Verify: show vlan brief on SW2",
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  //  DEFAULT GATEWAY
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "CS-006",
    title: "Host cannot ping outside its own subnet",
    category: "Default Gateway",
    severity: "High",
    symptom:
      "A host with IP 192.168.1.10/24 can ping other hosts in 192.168.1.0/24 but cannot reach anything outside the subnet. Default gateway is unreachable.",
    packetTracerNotes:
      "Topology: 1x 2960 switch, 1x 2911 router. Host is in VLAN 10 (192.168.1.0/24). Router Gi0/0.10 has IP 192.168.1.1. Host's default gateway is set to 192.168.1.1.",
    showCommandOutput: `Router# show ip interface brief

Interface                  IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0         unassigned      YES unset  up                    up
GigabitEthernet0/0.10      192.168.1.1     YES manual up                    up
GigabitEthernet0/0.20      192.168.2.1     YES manual up                    up
GigabitEthernet0/1         10.0.0.1        YES manual up                    up

Router# show ip route

Gateway of last resort is not set

      192.168.1.0/24 is directly connected, GigabitEthernet0/0.10
      192.168.2.0/24 is directly connected, GigabitEthernet0/0.20
      10.0.0.0/8 is directly connected, GigabitEthernet0/1`,
    expectedRootCause:
      "The router has no default route (gateway of last resort). Hosts can reach directly connected subnets via the router, but any traffic to unknown destinations (including the internet) is dropped because there is no 0.0.0.0/0 route.",
    osiLayer: "Layer 3",
    conceptTag: "Default route",
    expectedNextCommand: "show ip route",
    expectedFixSteps: [
      "Confirm no default route exists: show ip route",
      "Add a default route to the upstream router or ISP: ip route 0.0.0.0 0.0.0.0 <next-hop>",
      "Verify: show ip route",
      "Test from the host: ping 8.8.8.8",
    ],
  },

  {
    id: "CS-007",
    title: "PC gateway set to wrong IP",
    category: "Default Gateway",
    severity: "Medium",
    symptom:
      "PC1 (192.168.10.10) cannot reach any device outside its VLAN. The router subinterface for VLAN 10 is 192.168.10.1, but the PC's gateway shows 192.168.10.254.",
    packetTracerNotes:
      "Topology: 1x 2960, 1x 2911. PC1 in VLAN 10 with static IP 192.168.10.10/24. Router Gi0/0.10 = 192.168.10.1. PC1's configured default gateway is 192.168.10.254.",
    showCommandOutput: `PC1> ipconfig

IPv4 Address. . . . . . . . . . . : 192.168.10.10
Subnet Mask . . . . . . . . . . . : 255.255.255.0
Default Gateway . . . . . . . . . : 192.168.10.254

Router# show ip interface brief GigabitEthernet0/0.10

Interface                  IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0.10      192.168.10.1    YES manual up                    up`,
    expectedRootCause:
      "PC1's default gateway is configured as 192.168.10.254 but the actual router subinterface IP is 192.168.10.1. The gateway address is wrong, so the PC sends packets to a non-existent host.",
    osiLayer: "Layer 3",
    conceptTag: "Static IP configuration",
    expectedNextCommand: "ping 192.168.10.1",
    expectedFixSteps: [
      "Verify the correct gateway IP from the router: show ip interface brief",
      "On PC1, change the default gateway to 192.168.10.1",
      "Verify connectivity: ping 192.168.10.1",
      "Test cross-VLAN reachability: ping 192.168.20.1",
    ],
  },

  {
    id: "CS-008",
    title: "Router subinterface not encapsulating VLAN",
    category: "Default Gateway",
    severity: "Critical",
    symptom:
      "Router subinterface is up but hosts in the VLAN cannot use it as a gateway. Packets sent to the gateway are dropped silently.",
    packetTracerNotes:
      "Topology: 1x 2911 router with subinterface Gi0/0.10 configured with IP 192.168.10.1/24. The encapsulation dot1Q command was not entered.",
    showCommandOutput: `Router# show running-config interface GigabitEthernet0/0.10

interface GigabitEthernet0/0.10
 ip address 192.168.10.1 255.255.255.0
 no ip proxy-arp

Router# show ip interface brief GigabitEthernet0/0.10

Interface                  IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0.10      192.168.10.1    YES manual up                    up`,
    expectedRootCause:
      "The subinterface Gi0/0.10 is missing the 'encapsulation dot1Q 10' command. Without it, the subinterface cannot process 802.1Q-tagged frames from the switch, so VLAN 10 traffic is dropped.",
    osiLayer: "Layer 2",
    conceptTag: "Router-on-a-stick",
    expectedNextCommand: "show running-config interface GigabitEthernet0/0.10",
    expectedFixSteps: [
      "Enter subinterface config: configure terminal, interface Gi0/0.10",
      "Add encapsulation: encapsulation dot1Q 10",
      "Verify: show running-config interface Gi0/0.10",
      "Test from a host in VLAN 10: ping 192.168.10.1",
    ],
  },

  {
    id: "CS-009",
    title: "Redundant gateway without failover",
    category: "Default Gateway",
    severity: "Medium",
    symptom:
      "Primary router is down but hosts cannot reach the backup gateway. HSRP has not been configured, so there is no automatic failover.",
    packetTracerNotes:
      "Topology: 2x 2911 routers connected to the same VLAN 10 switch. R1 = 192.168.10.1, R2 = 192.168.10.2. Hosts use 192.168.10.1 as gateway. R1 fails; hosts lose connectivity.",
    showCommandOutput: `R1# show standby brief

                     P indicated configured-group
                     * indicated active
                     + indicated standby
                     X indicated peer frozen
                     A/M indicated state in which configure and mcr commands are inapplicable

                     Interface   Grp  Pri P State   Active          Standby         Virtual IP
R2# show standby brief

                     Interface   Grp  Pri P State   Active          Standby         Virtual IP`,
    expectedRootCause:
      "HSRP (Hot Standby Router Protocol) is not configured on either router. Without HSRP, there is no virtual IP or automatic failover — hosts are hard-coded to R1's physical IP and cannot reach R2 when R1 goes down.",
    osiLayer: "Layer 3",
    conceptTag: "HSRP / Gateway redundancy",
    expectedNextCommand: "show standby brief",
    expectedFixSteps: [
      "Configure HSRP on R1: standby 1 ip 192.168.10.254, standby 1 priority 110",
      "Configure HSRP on R2: standby 1 ip 192.168.10.254",
      "Set hosts' default gateway to the virtual IP 192.168.10.254",
      "Verify: show standby brief on both routers",
      "Test failover by shutting down R1's interface",
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  //  DHCP
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "CS-010",
    title: "DHCP pool exhaustion on small subnet",
    category: "DHCP",
    severity: "High",
    symptom:
      "New hosts on VLAN 10 receive APIPA addresses (169.254.x.x). The existing DHCP pool appears to be fully allocated.",
    packetTracerNotes:
      "Topology: 1x 2911 router acting as DHCP server for VLAN 10 (192.168.10.0/24). Pool defined with network 192.168.10.0/24, default-router 192.168.10.1. Over 250 clients have been added to the topology.",
    showCommandOutput: `Router# show ip dhcp pool

Pool VLAN10 :
 Utilization mark (high/low)    : 100 / 0
 Subnet size (high/low)         : 100 / 0
 Total addresses                : 254
 Leased addresses               : 252
 Pending event                  : none
 1 subnet is currently in the pool :
 Current index        IP address range        Leased addresses
 192.168.10.3         192.168.10.1 - 192.168.10.254   252

Router# show ip dhcp binding

Bindings from all pools not associated with VRF:
IP address          Client-ID/ Hardware address       Lease expiration        Type
192.168.10.10       0060.47a1.3b01                     Mar 30 2026 12:00 AM    Automatic
192.168.10.11       0060.47a1.3b02                     Mar 30 2026 12:00 AM    Automatic
... (250 additional bindings omitted)`,
    expectedRootCause:
      "The /24 subnet provides 254 usable addresses but 252 are already leased. The pool is nearly exhausted and new clients cannot obtain an address.",
    osiLayer: "Layer 3",
    conceptTag: "DHCP pool sizing",
    expectedNextCommand: "show ip dhcp binding",
    expectedFixSteps: [
      "Check pool utilization: show ip dhcp pool",
      "Release unused bindings: clear ip dhcp binding * (caution — disruptive)",
      "Or extend the subnet: change to a /23 to double available addresses",
      "Add an exclude range for static devices: ip dhcp excluded-address 192.168.10.1 192.168.10.20",
    ],
  },

  {
    id: "CS-011",
    title: "DHCP requests not reaching server",
    category: "DHCP",
    severity: "Critical",
    symptom:
      "Hosts on VLAN 20 receive APIPA addresses. The DHCP server is on VLAN 10. DHCP relay (ip helper-address) is not working.",
    packetTracerNotes:
      "Topology: 1x 2911 router with subinterfaces for VLAN 10 and VLAN 20. DHCP server is on VLAN 10 (192.168.10.5). VLAN 20 hosts (192.168.20.0/24) cannot get addresses.",
    showCommandOutput: `Router# show running-config interface GigabitEthernet0/0.20

interface GigabitEthernet0/0.20
 encapsulation dot1Q 20
 ip address 192.168.20.1 255.255.255.0

Router# show ip interface brief GigabitEthernet0/0.20

Interface                  IP-Address      OK? Method Status                Protocol
GigabitEthernet0/0.20      192.168.20.1    YES manual up                    up`,
    expectedRootCause:
      "The subinterface for VLAN 20 is missing 'ip helper-address 192.168.10.5'. Without it, DHCP broadcast requests from VLAN 20 are not forwarded to the DHCP server on VLAN 10.",
    osiLayer: "Layer 3",
    conceptTag: "DHCP relay",
    expectedNextCommand: "show ip interface brief",
    expectedFixSteps: [
      "Enter VLAN 20 subinterface: configure terminal, interface Gi0/0.20",
      "Add helper address: ip helper-address 192.168.10.5",
      "Verify: show running-config interface Gi0/0.20",
      "Test from a VLAN 20 host: ipconfig /release, ipconfig /renew",
    ],
  },

  {
    id: "CS-012",
    title: "DHCP pool missing default-router",
    category: "DHCP",
    severity: "Medium",
    symptom:
      "Hosts receive IP addresses from the DHCP server but cannot ping outside their subnet. The DHCP-assigned default gateway is blank.",
    packetTracerNotes:
      "Topology: 1x 2911 DHCP server. Pool 'LAB' assigns addresses in 192.168.50.0/24. Hosts get IPs but ipconfig shows no default gateway.",
    showCommandOutput: `Router# show ip dhcp pool LAB

Pool LAB :
 Utilization mark (high/low)    : 100 / 0
 Subnet size (high/low)         : 100 / 0
 Total addresses                : 254
 Leased addresses               : 12
 Pending event                  : none
 1 subnet is currently in the pool :
 Current index        IP address range        Leased addresses
 192.168.50.14        192.168.50.1 - 192.168.50.254   12

Router# show running-config | section ip dhcp pool
ip dhcp pool LAB
 network 192.168.50.0 255.255.255.0
 dns-server 8.8.8.8`,
    expectedRootCause:
      "The DHCP pool configuration is missing the 'default-router' directive. Clients receive an IP and DNS server but no default gateway, so they cannot route traffic outside their subnet.",
    osiLayer: "Layer 3",
    conceptTag: "DHCP pool options",
    expectedNextCommand: "show running-config | section ip dhcp pool",
    expectedFixSteps: [
      "Enter DHCP pool config: ip dhcp pool LAB",
      "Add default-router: default-router 192.168.50.1",
      "Release and renew on clients: ipconfig /release, ipconfig /renew",
      "Verify: show ip dhcp binding",
    ],
  },

  {
    id: "CS-013",
    title: "Static host excluded from DHCP but still getting addresses",
    category: "DHCP",
    severity: "Low",
    symptom:
      "A server that should have a static IP keeps receiving a DHCP address after a reboot. The exclusion range was configured on the wrong pool.",
    packetTracerNotes:
      "Topology: 1x 2911 DHCP server. Server at 192.168.10.5 should be static. Exclusion range was added to pool 'VLAN20' instead of 'VLAN10'.",
    showCommandOutput: `Router# show running-config | include ip dhcp excluded
ip dhcp excluded-address 192.168.20.1 192.168.20.10

Router# show ip dhcp binding | include 192.168.10.5
192.168.10.5       0001.42a3.b4c5                     Mar 30 2026 12:00 AM    Automatic`,
    expectedRootCause:
      "The ip dhcp excluded-address command was applied to the VLAN 20 range instead of VLAN 10. The server at 192.168.10.5 is not excluded and is receiving a DHCP lease.",
    osiLayer: "Layer 3",
    conceptTag: "DHCP exclusion",
    expectedNextCommand: "show running-config | include ip dhcp excluded",
    expectedFixSteps: [
      "Check the current exclusion: show running-config | include ip dhcp excluded",
      "Add the correct exclusion: ip dhcp excluded-address 192.168.10.5",
      "Clear the binding: clear ip dhcp binding 192.168.10.5",
      "Assign the static IP on the server manually",
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  //  DNS
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "CS-014",
    title: "DNS server unreachable from client VLAN",
    category: "DNS",
    severity: "High",
    symptom:
      "Users can ping the DNS server by IP (10.0.0.53) but DNS lookups time out. Name resolution fails for all hosts in VLAN 10.",
    packetTracerNotes:
      "Topology: 1x 2911 router, 1x DNS server (10.0.0.53) on the 10.0.0.0/8 network. VLAN 10 hosts (192.168.10.0/24) have DNS server set to 10.0.0.53. Ping to 10.0.0.53 works.",
    showCommandOutput: `Router# show access-lists

Extended IP access list 110
    10 permit ip 192.168.10.0 0.0.0.255 host 10.0.0.53 eq 53
    20 permit ip 192.168.10.0 0.0.0.255 any

Router# show ip interface GigabitEthernet0/1
GigabitEthernet0/1 is up, line protocol is up
  Outgoing access list is 110
  Inbound access list is not set`,
    expectedRootCause:
      "ACL 110 permits UDP port 53 (DNS query) but DNS responses return on ephemeral high ports. The ACL does not permit return traffic from the DNS server back to the clients, so responses are dropped.",
    osiLayer: "Layer 3",
    conceptTag: "ACL stateful return",
    expectedNextCommand: "show access-lists",
    expectedFixSteps: [
      "Review the ACL: show access-lists",
      "Add a rule to permit established or return traffic from the DNS server",
      "Or use a stateful approach: permit udp host 10.0.0.53 gt 1023 192.168.10.0 0.0.0.255 gt 1023",
      "Test: nslookup from a client in VLAN 10",
    ],
  },

  {
    id: "CS-015",
    title: "Local DNS records not resolving",
    category: "DNS",
    severity: "Medium",
    symptom:
      "Internal hostnames (e.g. server.lab.local) are not resolving. External DNS (google.com) works fine.",
    packetTracerNotes:
      "Topology: 1x DNS server (10.0.0.53) with records for internal hosts. Clients are configured to use 10.0.0.53 for DNS. External resolution via 8.8.8.8 works.",
    showCommandOutput: `DNS Server# show running-config | section ip host
ip host server.lab.local 10.0.0.10
ip host printer.lab.local 10.0.0.20
ip host gateway.lab.local 192.168.10.1

DNS Server# show running-config | section dns
ip name-server 8.8.8.8
ip domain-lookup

PC1> nslookup server.lab.local
** server can't find server.lab.local: NXDOMAIN`,
    expectedRootCause:
      "The DNS server has host records configured via 'ip host' on the router, but those are local to the router and not served by the DNS service. The DNS server process is not configured with zone records for the lab.local domain.",
    osiLayer: "Layer 7",
    conceptTag: "DNS zone records",
    expectedNextCommand: "show running-config | section ip host",
    expectedFixSteps: [
      "Understand that 'ip host' only populates the local router DNS cache",
      "Configure DNS zone records on the DNS server for lab.local",
      "Or configure a DNS forwarder on the DNS server",
      "Test: nslookup server.lab.local from a client",
    ],
  },

  {
    id: "CS-016",
    title: "DNS suffix not appended to queries",
    category: "DNS",
    severity: "Low",
    symptom:
      "Users must type the full FQDN (server.lab.local) to reach internal servers. Short names (server) do not resolve.",
    packetTracerNotes:
      "Topology: 1x 2911 router with DHCP pool. DNS server is 10.0.0.53. Clients are getting DHCP leases but no DNS suffix is being assigned.",
    showCommandOutput: `Router# show running-config | section ip dhcp pool
ip dhcp pool VLAN10
 network 192.168.10.0 255.255.255.0
 default-router 192.168.10.1
 dns-server 10.0.0.53

PC1> ipconfig

IPv4 Address. . . . . . . . . . . : 192.168.10.10
DNS Servers . . . . . . . . . . . : 10.0.0.53
DNS Suffix . . . . . . . . . . . :`,
    expectedRootCause:
      "The DHCP pool is missing the 'domain-name' option. Clients do not receive a DNS suffix, so short hostnames are not appended with 'lab.local' before being sent to the DNS server.",
    osiLayer: "Layer 7",
    conceptTag: "DHCP DNS suffix",
    expectedNextCommand: "show running-config | section ip dhcp pool",
    expectedFixSteps: [
      "Enter DHCP pool: ip dhcp pool VLAN10",
      "Add domain name: domain-name lab.local",
      "Release and renew on clients: ipconfig /release, ipconfig /renew",
      "Test: nslookup server (should resolve to server.lab.local)",
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  //  ROUTING
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "CS-017",
    title: "OSPF neighbors not forming adjacency",
    category: "Routing",
    severity: "High",
    symptom:
      "Two routers connected on the same subnet cannot form an OSPF adjacency. Both are configured with OSPF but the neighbor state stays stuck in 'INIT' or '2WAY'.",
    packetTracerNotes:
      "Topology: 2x 2911 routers connected via Gi0/1 (10.0.0.0/30). R1 has OSPF area 0, R2 has OSPF area 1.",
    showCommandOutput: `R1# show ip ospf neighbor

Neighbor ID     Pri State           Dead Time   Address         Interface
2.2.2.2           1 INIT/DROTHER    00:00:37    10.0.0.2        GigabitEthernet0/1

R2# show ip ospf neighbor

Neighbor ID     Pri State           Dead Time   Address         Interface
1.1.1.1           1 INIT/DROTHER    00:00:35    10.0.0.1        GigabitEthernet0/1

R1# show ip ospf interface GigabitEthernet0/1
GigabitEthernet0/1 is up, line protocol is up
  Internet Address 10.0.0.1/30, Area 0
  Process ID 1, Router ID 1.1.1.1, Network Type BROADCAST, Cost: 1

R2# show ip ospf interface GigabitEthernet0/1
GigabitEthernet0/1 is up, line protocol is up
  Internet Address 10.0.0.2/30, Area 1
  Process ID 1, Router ID 2.2.2.2, Network Type BROADCAST, Cost: 1`,
    expectedRootCause:
      "OSPF area mismatch — R1 is in area 0 and R2 is in area 1. OSPF neighbors must be in the same area to form a full adjacency. They reach 2WAY but cannot proceed to EXCHANGE/LOADING.",
    osiLayer: "Layer 3",
    conceptTag: "OSPF area mismatch",
    expectedNextCommand: "show ip ospf neighbor",
    expectedFixSteps: [
      "Check areas: show ip ospf interface on both routers",
      "On R2, change to area 0: router ospf 1, network 10.0.0.0 0.0.0.3 area 0",
      "Verify adjacency: show ip ospf neighbor (should reach FULL)",
      "Check routes: show ip route ospf",
    ],
  },

  {
    id: "CS-018",
    title: "Static route not appearing in routing table",
    category: "Routing",
    severity: "Medium",
    symptom:
      "A static route was configured but does not appear in the routing table. Traffic to the destination network is dropped.",
    packetTracerNotes:
      "Topology: 1x 2911 with two interfaces. Admin added 'ip route 172.16.0.0 255.255.0.0 10.0.0.2' but the route does not show up.",
    showCommandOutput: `Router# show ip route

Gateway of last resort is not set

      10.0.0.0/30 is subnetted, 1 subnets
C        10.0.0.0 is directly connected, GigabitEthernet0/1
      192.168.10.0/24 is directly connected, GigabitEthernet0/0.10
      192.168.20.0/24 is directly connected, GigabitEthernet0/0.20

Router# show running-config | include ip route
ip route 172.16.0.0 255.255.0.0 10.0.0.2`,
    expectedRootCause:
      "The next-hop address 10.0.0.2 is unreachable from the router — the directly connected network is 10.0.0.0/30, which includes only .1 and .2. If the interface toward 10.0.0.2 is down or the ARP entry is missing, the route will not install.",
    osiLayer: "Layer 3",
    conceptTag: "Static route reachability",
    expectedNextCommand: "show ip route 172.16.0.0",
    expectedFixSteps: [
      "Verify next-hop reachability: ping 10.0.0.2",
      "Check the interface toward the next-hop: show ip interface brief",
      "If the next-hop is directly connected, verify ARP: show arp",
      "Correct the next-hop or exit interface if needed",
    ],
  },

  {
    id: "CS-019",
    title: "RIP not advertising all connected networks",
    category: "Routing",
    severity: "Medium",
    symptom:
      "Router R2 is not learning routes to VLAN 10 and VLAN 20 networks from R1 via RIP. R1 is advertising, but R2 only sees the directly connected networks.",
    packetTracerNotes:
      "Topology: 2x 2911 routers. R1 has networks 192.168.10.0/24, 192.168.20.0/24, and 10.0.0.0/30. R2 has 172.16.0.0/16 and 10.0.0.0/30. RIP version 2 is enabled.",
    showCommandOutput: `R1# show running-config | section router rip
router rip
 version 2
 network 192.168.10.0
 network 192.168.20.0
 no auto-summary

R2# show ip route rip

R2# show running-config | section router rip
router rip
 version 2
 network 10.0.0.0
 network 172.16.0.0
 no auto-summary`,
    expectedRootCause:
      "R1 is not advertising the 10.0.0.0 network through RIP because it is not included in the 'network' statements. Only directly connected networks listed under 'router rip' are advertised. The 10.0.0.0/30 link is missing from R1's RIP configuration.",
    osiLayer: "Layer 3",
    conceptTag: "RIP network statement",
    expectedNextCommand: "show running-config | section router rip",
    expectedFixSteps: [
      "On R1, add the missing network: router rip, network 10.0.0.0",
      "Verify: show ip route rip on R2",
      "Check RIP updates: debug ip rip (briefly)",
      "Confirm routes appear: show ip route",
    ],
  },

  {
    id: "CS-020",
    title: "OSPF route redistribution missing",
    category: "Routing",
    severity: "High",
    symptom:
      "Routers running OSPF cannot reach networks advertised by a RIP-speaking router. Routes from RIP are not appearing in the OSPF routing table.",
    packetTracerNotes:
      "Topology: 3x 2911. R1 and R2 run OSPF in area 0. R3 runs RIP. R1 is the redistribution point between OSPF and RIP. R1 has not been configured to redistribute RIP into OSPF.",
    showCommandOutput: `R1# show ip route ospf

      10.0.0.0/30 is subnetted, 1 subnets
O        10.0.0.4 is directly connected, GigabitEthernet0/2
      192.168.10.0/24 [110/2] via 10.0.0.1, 00:05:23, GigabitEthernet0/1

R1# show running-config | section router ospf
router ospf 1
 log-adjacency-changes
 network 192.168.10.0 0.0.0.255 area 0
 network 10.0.0.0 0.0.0.3 area 0

R1# show running-config | section router rip
router rip
 version 2
 network 172.16.0.0
 no auto-summary`,
    expectedRootCause:
      "OSPF and RIP are both running on R1 but there is no redistribution configured. OSPF does not automatically learn RIP routes — the admin must explicitly redistribute one protocol into the other.",
    osiLayer: "Layer 3",
    conceptTag: "Route redistribution",
    expectedNextCommand: "show ip route ospf",
    expectedFixSteps: [
      "On R1, enter OSPF config: router ospf 1",
      "Redistribute RIP: redistribute rip subnets",
      "Verify: show ip route ospf on R2 (should now see 172.16.0.0)",
      "Test connectivity from an OSPF host to a RIP network",
    ],
  },

  {
    id: "CS-021",
    title: "Floating static route not failing over",
    category: "Routing",
    severity: "Medium",
    symptom:
      "A backup static route with a higher administrative distance was configured but does not take over when the primary link fails.",
    packetTracerNotes:
      "Topology: 1x 2911 with two WAN links. Primary: ip route 0.0.0.0 0.0.0.0 203.0.113.1 (AD 1). Backup: ip route 0.0.0.0 0.0.0.0 198.51.100.1 (AD 10). Primary link is down.",
    showCommandOutput: `Router# show ip route

Gateway of last resort is 203.0.113.1 to network 0.0.0.0

S*   0.0.0.0/0 [1/0] via 203.0.113.1

Router# show ip interface brief GigabitEthernet0/1

Interface                  IP-Address      OK? Method Status                Protocol
GigabitEthernet0/1         203.0.113.2     YES manual down                  down`,
    expectedRootCause:
      "The primary route (AD 1) is still in the routing table even though the exit interface is down. The floating route (AD 10) only installs when the primary route is removed. The issue is that the primary route uses a next-hop IP rather than an exit interface, so it stays in the table as long as the next-hop is reachable via another path.",
    osiLayer: "Layer 3",
    conceptTag: "Floating static route",
    expectedNextCommand: "show ip route 0.0.0.0",
    expectedFixSteps: [
      "Verify both routes are configured: show running-config | include ip route",
      "Check if the primary next-hop is still reachable: ping 203.0.113.1",
      "If reachable via another path, the floating route will not activate",
      "Consider using an exit interface instead of next-hop for faster failover",
      "Test by shutting down the primary interface",
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  //  ACL
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "CS-022",
    title: "ACL blocking all traffic instead of specific hosts",
    category: "ACL",
    severity: "Critical",
    symptom:
      "An ACL was applied to block one host (192.168.10.50) but all traffic from VLAN 10 is now blocked.",
    packetTracerNotes:
      "Topology: 1x 2911 router. An extended ACL was created to deny host 192.168.10.50 and applied inbound on Gi0/0.10. All VLAN 10 traffic stopped working.",
    showCommandOutput: `Router# show access-lists

Extended IP access list 101
    10 deny host 192.168.10.50
    20 permit ip any any

Router# show ip access-lists interface GigabitEthernet0/0.10
GigabitEthernet0/0.10
  inbound  access list is 101
  32 packets filtered

Router# show running-config interface GigabitEthernet0/0.10
interface GigabitEthernet0/0.10
 encapsulation dot1Q 10
 ip address 192.168.10.1 255.255.255.0
 ip access-group 101 in`,
    expectedRootCause:
      "The ACL has the correct deny and permit statements, but the permit statement is 'permit ip any any' — it should be working. However, the access-group is applied inbound, so the implicit deny at the end of the ACL is dropping traffic before the permit is reached. The issue is that there is an additional, unseen ACE or the ACL numbering is conflicting.",
    osiLayer: "Layer 3",
    conceptTag: "ACL implicit deny",
    expectedNextCommand: "show access-lists",
    expectedFixSteps: [
      "Verify the full ACL: show access-lists 101",
      "Confirm the 'permit ip any any' is the last statement",
      "Check for any other ACLs applied on the interface",
      "Test: ping from 192.168.10.50 (should fail) and from .51 (should succeed)",
    ],
  },

  {
    id: "CS-023",
    title: "Standard ACL applied in wrong direction",
    category: "ACL",
    severity: "High",
    symptom:
      "A standard ACL was applied to block host 192.168.10.20 from reaching the server at 10.0.0.10, but the server itself is now unreachable from all hosts.",
    packetTracerNotes:
      "Topology: 1x 2911. Standard ACL 10 applied outbound on Gi0/1 (toward the server). The intent was to block one host from reaching the server.",
    showCommandOutput: `Router# show access-lists

Standard IP access list 10
    10 deny host 192.168.10.20
    20 permit any

Router# show ip access-lists interface GigabitEthernet0/1
GigabitEthernet0/1
  outbound access list is 10

Router# show running-config interface GigabitEthernet0/1
interface GigabitEthernet0/1
 ip address 10.0.0.1 255.255.255.0
 ip access-group 10 out`,
    expectedRootCause:
      "Standard ACLs can only filter by source address. Applied outbound on Gi0/1, the ACL checks the source of every packet leaving that interface. Because the server's return traffic also passes through, the ACL interferes with bidirectional communication. Standard ACLs should be applied as close to the destination as possible.",
    osiLayer: "Layer 3",
    conceptTag: "ACL placement",
    expectedNextCommand: "show ip access-lists interface GigabitEthernet0/1",
    expectedFixSteps: [
      "Remove the ACL from Gi0/1: no ip access-group 10 out",
      "Apply it on the interface closest to the destination (inbound on the server-facing interface)",
      "Or switch to an extended ACL and apply it closer to the source",
      "Test: ping from 192.168.10.20 to 10.0.0.10 (should fail), from .21 (should succeed)",
    ],
  },

  {
    id: "CS-024",
    title: "ACL permitting ICMP but blocking HTTP",
    category: "ACL",
    severity: "Medium",
    symptom:
      "Hosts can ping the web server (10.0.0.100) but cannot access the HTTP service on port 80. The ACL was supposed to allow all traffic.",
    packetTracerNotes:
      "Topology: 1x 2911. Extended ACL 150 applied inbound on Gi0/0.10. Hosts in VLAN 10 can ping 10.0.0.100 but web browser shows connection timed out.",
    showCommandOutput: `Router# show access-lists 150

Extended IP access list 150
    10 permit icmp any any
    20 permit tcp any host 10.0.0.100 eq www
    30 deny ip any any log

Router# show running-config interface GigabitEthernet0/0.10
interface GigabitEthernet0/0.10
 encapsulation dot1Q 10
 ip address 192.168.10.1 255.255.255.0
 ip access-group 150 in`,
    expectedRootCause:
      "The ACL looks correct — permit ICMP and permit TCP port 80. However, HTTP traffic uses a dynamic high-port source. The return traffic from the server (from port 80 to the client's ephemeral port) needs to be allowed. The ACL applied inbound on the client-facing interface allows the initial SYN but the server's return SYN-ACK is sourced from port 80 to a high port, which the ACL may not handle correctly if stateful tracking is not configured.",
    osiLayer: "Layer 4",
    conceptTag: "ACL TCP established",
    expectedNextCommand: "show access-lists 150",
    expectedFixSteps: [
      "Verify hit counts: show access-lists 150",
      "Add an 'established' rule for return traffic if needed",
      "Check that the web server has the HTTP service enabled",
      "Test with: telnet 10.0.0.100 80 from a client",
    ],
  },

  {
    id: "CS-025",
    title: "Time-based ACL not activating at scheduled time",
    category: "ACL",
    severity: "Low",
    symptom:
      "A time-based ACL was configured to block internet access from 9 AM to 5 PM on weekdays, but traffic is still being permitted during the restricted window.",
    packetTracerNotes:
      "Topology: 1x 2911 with internet access via Gi0/1. ACL 180 uses a time range 'WORK-HOURS' that should block HTTP/HTTPS during business hours.",
    showCommandOutput: `Router# show time-range
time-range: WORK-HOURS
  active is currently FALSE
  periodic days Mon Tue Wed Thu Fri 09:00 to 17:00

Router# show clock
*14:32:15.234 UTC Wed Aug 30 2026

Router# show access-lists 180
Extended IP access list 180
    10 permit tcp any any eq 80 time-range WORK-HOURS
    20 permit tcp any any eq 443 time-range WORK-HOURS
    30 deny ip any any`,
    expectedRootCause:
      "The time range shows 'active is currently FALSE' even though the current time (14:32) falls within the configured window. This typically happens when the router's clock is not set correctly or NTP is not synchronized, causing the time-range evaluation to fail.",
    osiLayer: "Layer 3",
    conceptTag: "Time-based ACL",
    expectedNextCommand: "show time-range",
    expectedFixSteps: [
      "Check router clock: show clock",
      "Set the correct time: clock set 14:32:15 30 August 2026",
      "Or configure NTP: ntp server <ntp-server-ip>",
      "Verify time-range activates: show time-range (should show 'active is currently TRUE')",
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  //  NAT
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "CS-026",
    title: "NAT overload not translating internal hosts",
    category: "NAT",
    severity: "Critical",
    symptom:
      "Internal hosts (192.168.10.0/24) cannot reach the internet. NAT overload (PAT) was configured but translations are not appearing in the NAT table.",
    packetTracerNotes:
      "Topology: 1x 2911 with Gi0/0.10 (inside, 192.168.10.1) and Gi0/1 (outside, 203.0.113.2). PAT configured with 'ip nat inside source list 1 interface Gi0/1 overload'. ACL 1 permits 192.168.10.0/24.",
    showCommandOutput: `Router# show ip nat translations
Pro Inside global      Inside local       Outside local      Outside global

Router# show ip nat statistics
Total active translations: 0 (0 static, 0 dynamic, 0 extended)
Outside interfaces: GigabitEthernet0/1
Inside interfaces: GigabitEthernet0/0.10
Hits: 0  Misses: 0

Router# show running-config | section ip nat
ip nat inside source list 1 interface GigabitEthernet0/1 overload
access-list 1 permit 192.168.10.0 0.0.0.255

Router# show ip interface brief
GigabitEthernet0/0.10    192.168.10.1    YES manual up    up
GigabitEthernet0/1       203.0.113.2     YES manual up    up`,
    expectedRootCause:
      "The NAT statistics show 0 hits, meaning traffic is not reaching the NAT process. The inside/outside interface markings are configured, but the issue is likely that the interfaces are not marked with 'ip nat inside' and 'ip nat outside'. Without these commands, the router does not know which traffic to translate.",
    osiLayer: "Layer 3",
    conceptTag: "PAT / NAT overload",
    expectedNextCommand: "show ip nat statistics",
    expectedFixSteps: [
      "Verify interface NAT roles: show ip nat statistics",
      "Mark inside interface: interface Gi0/0.10, ip nat inside",
      "Mark outside interface: interface Gi0/1, ip nat outside",
      "Test: ping 8.8.8.8 from a host, then show ip nat translations",
    ],
  },

  {
    id: "CS-027",
    title: "Static NAT mapping not working for server",
    category: "NAT",
    severity: "High",
    symptom:
      "An external host cannot reach the internal web server (192.168.10.100) via the public IP (203.0.113.10). Static NAT was configured but the mapping does not function.",
    packetTracerNotes:
      "Topology: 1x 2911. Gi0/0.10 (inside, 192.168.10.1), Gi0/1 (outside, 203.0.113.2). Static NAT: ip nat inside source static 192.168.10.100 203.0.113.10.",
    showCommandOutput: `Router# show ip nat translations

Pro Inside global      Inside local       Outside local      Outside global
--- 203.0.113.10       192.168.10.100     ---                ---

Router# show ip interface brief
GigabitEthernet0/0.10    192.168.10.1    YES manual up    up
GigabitEthernet0/1       203.0.113.2     YES manual up    up

Router# show running-config | section ip nat
ip nat inside source static 192.168.10.100 203.0.113.10

Router# show ip route 203.0.113.10
% Network not in table`,
    expectedRootCause:
      "The static NAT mapping exists but the router has no route to advertise 203.0.113.10 on the outside network. The upstream router/ISP needs a route pointing 203.0.113.10/32 back to this router's outside IP (203.0.113.2). Without that, return traffic never arrives.",
    osiLayer: "Layer 3",
    conceptTag: "Static NAT routing",
    expectedNextCommand: "show ip nat translations",
    expectedFixSteps: [
      "Verify the static mapping: show ip nat translations",
      "Ensure the upstream router has a route: ip route 203.0.113.10 255.255.255.255 203.0.113.2",
      "Verify inside/outside marking on interfaces",
      "Test from an external host: ping 203.0.113.10",
    ],
  },

  {
    id: "CS-028",
    title: "NAT pool address range too small",
    category: "NAT",
    severity: "Medium",
    symptom:
      "Some internal hosts can access the internet but others cannot. NAT translations are failing for a portion of the internal network.",
    packetTracerNotes:
      "Topology: 1x 2911. NAT pool 'EXT' defined with addresses 203.0.113.10 to 203.0.113.14 (5 addresses). Over 30 internal hosts are trying to reach the internet simultaneously.",
    showCommandOutput: `Router# show ip nat translations total

Total active translations: 5 (0 static, 5 dynamic, 5 extended)
Outside interfaces: GigabitEthernet0/1
Inside interfaces: GigabitEthernet0/0.10

Router# show ip nat pool
Pool EXT start 203.0.113.10 end 203.0.113.14
  type generic, total addresses 5, elapsed 0

Router# show ip nat statistics
Total active translations: 5 (0 static, 5 dynamic, 5 extended)
  5 miss, 28 errors`,
    expectedRootCause:
      "The NAT pool only contains 5 public addresses but over 30 hosts need simultaneous translations. Once all pool addresses are exhausted, remaining hosts get translation errors. The pool is too small for the number of concurrent users.",
    osiLayer: "Layer 3",
    conceptTag: "NAT pool sizing",
    expectedNextCommand: "show ip nat statistics",
    expectedFixSteps: [
      "Check pool size: show ip nat pool",
      "Expand the pool: no ip nat pool EXT, ip nat pool EXT 203.0.113.10 203.0.113.50 netmask 255.255.255.0",
      "Or switch to PAT (overload) to use a single public IP: ip nat inside source list 1 interface Gi0/1 overload",
      "Verify: show ip nat statistics",
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  //  WIRELESS
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "CS-029",
    title: "Wireless client cannot associate with access point",
    category: "Wireless",
    severity: "High",
    symptom:
      "A wireless client scans for the SSID 'LAB-NET' but cannot connect. The client shows 'Association failed' and the AP logs show an authentication mismatch.",
    packetTracerNotes:
      "Topology: 1x Cisco WAP (Wireless Access Point) configured with SSID 'LAB-NET', WPA2-PSK, channel 6. Client is configured with WPA2-PSK and the correct passphrase but association fails.",
    showCommandOutput: `AP# show dot11 associations

Client List
-----------
No clients associated

AP# show dot11 bssids

BSSID          SSID             Ch  dBm  Clients
001a.2b3c.4d5e LAB-NET           6  -45      0

AP# show running-config | section dot11
interface Dot11Radio0
 ssid LAB-NET
 authentication open
 authentication key-management wpa2
 wpa-psk ascii NetLab2026!
 channel 6

PC-Wireless> show wireless
  SSID: LAB-NET
  Security: WPA2-PSK
  Status: Association Failed
  Auth Error: Invalid credentials`,
    expectedRootCause:
      "The client's passphrase does not match the AP configuration. The AP is configured with 'wpa-psk ascii NetLab2026!' but the client may have a different passphrase or the PSK has a hidden character mismatch. The 'Invalid credentials' error confirms the key mismatch.",
    osiLayer: "Layer 2",
    conceptTag: "WPA2 passphrase",
    expectedNextCommand: "show dot11 associations",
    expectedFixSteps: [
      "Verify the AP passphrase: show running-config | section wpa-psk",
      "Re-enter the exact passphrase on the client: NetLab2026!",
      "Check for trailing spaces or special character issues",
      "Test association: show dot11 associations (client should appear)",
    ],
  },

  {
    id: "CS-030",
    title: "Wireless clients get IP but cannot reach gateway",
    category: "Wireless",
    severity: "Medium",
    symptom:
      "Wireless clients successfully associate and receive DHCP addresses in the correct subnet but cannot ping the default gateway (192.168.30.1).",
    packetTracerNotes:
      "Topology: 1x WAP connected to a 2960 switch in VLAN 30. 1x 2911 router with Gi0/0.30 = 192.168.30.1. Wireless clients get IPs from the 192.168.30.0/24 pool but cannot reach the gateway.",
    showCommandOutput: `Router# show arp

Protocol  Address          Age (min)  Hardware Addr   Type   Interface
Internet  192.168.30.1            -   001a.2b3c.4d00  ARPA   GigabitEthernet0/0.30
Internet  192.168.30.10           2   0060.47a1.3b01  ARPA   GigabitEthernet0/0.30

Router# show mac address-table dynamic | include 0060.47a1

Mac Address Table
-------------------------------------------
Vlan    Mac Address       Type        Ports
  30    0060.47a1.3b01    DYNAMIC     Fa0/1

SW1# show interfaces FastEthernet0/1 switchport

Name: Fa0/1
Switchport: Enabled
Administrative Mode: dynamic desirable
Operational Mode: static access
Access Mode VLAN: 1 (default)
Trunking Native Mode VLAN: 1 (default)`,
    expectedRootCause:
      "The WAP is connected to switch port Fa0/1, which is still in VLAN 1 (default). The wireless clients receive DHCP addresses from VLAN 30's pool because the DHCP broadcast crosses via a different path, but their return traffic is placed in VLAN 1, preventing communication with the VLAN 30 gateway.",
    osiLayer: "Layer 2",
    conceptTag: "Wireless VLAN mapping",
    expectedNextCommand: "show interfaces FastEthernet0/1 switchport",
    expectedFixSteps: [
      "Check the WAP's switch port VLAN: show interfaces Fa0/1 switchport",
      "Assign the port to VLAN 30: switchport mode access, switchport access vlan 30",
      "Verify: show vlan brief (Fa0/1 should be in VLAN 30)",
      "Test: wireless client ping 192.168.30.1",
    ],
  },
];
