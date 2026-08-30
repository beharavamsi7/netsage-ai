#!/usr/bin/env python3
"""
NetSage Rule Checker — Deterministic Network Validation
========================================================

A standalone, transparent rule engine that validates network configurations
against common Cisco/networking best practices. No LLM or external API is
used — every check is deterministic and auditable.

Checks implemented:
  1. Duplicate IP addresses
  2. Incorrect subnet mask
  3. Default gateway mismatch
  4. Interface administratively down
  5. Missing VLAN
  6. Missing route

Usage:
    python rule_checker.py                         # Run with built-in sample
    python rule_checker.py network.json             # Run with custom input
    python rule_checker.py network.json output.json  # Run and write output
"""

from __future__ import annotations

import json
import sys
from dataclasses import dataclass, field, asdict
from enum import Enum
from pathlib import Path
from typing import Any


# ─── Data Types ──────────────────────────────────────────────────────────────


class Status(str, Enum):
    PASS = "PASS"
    WARNING = "WARNING"
    ERROR = "ERROR"


@dataclass
class CheckResult:
    """Single rule-check result."""
    check_name: str
    status: str  # "PASS" | "WARNING" | "ERROR"
    evidence: str
    explanation: str
    recommended_action: str


@dataclass
class RuleCheckerReport:
    """Full report from the rule checker."""
    total_checks: int = 0
    passed: int = 0
    warnings: int = 0
    errors: int = 0
    results: list[CheckResult] = field(default_factory=list)


# ─── Network Data Model ─────────────────────────────────────────────────────
# This mirrors the JSON structure the frontend will send.


@dataclass
class Interface:
    device: str
    name: str
    ip_address: str | None = None
    subnet_mask: str | None = None
    status: str = "up"  # "up" | "down" | "admin-down"
    vlan: int | None = None
    description: str = ""


@dataclass
class Route:
    device: str
    destination: str
    mask: str
    next_hop: str | None = None
    interface: str | None = None
    administrative_distance: int = 0
    metric: int = 0


@dataclass
class VLAN:
    id: int
    name: str
    device: str


@dataclass
class Device:
    name: str
    hostname: str = ""
    interfaces: list[Interface] = field(default_factory=list)
    routes: list[Route] = field(default_factory=list)
    vlans: list[VLAN] = field(default_factory=list)
    default_gateway: str | None = None


@dataclass
class NetworkData:
    devices: list[Device] = field(default_factory=list)


# ─── Parsing ─────────────────────────────────────────────────────────────────


def parse_network_data(raw: dict[str, Any]) -> NetworkData:
    """Parse a JSON dict into a NetworkData structure."""
    devices = []
    for d in raw.get("devices", []):
        interfaces = [
            Interface(
                device=d["name"],
                name=i["name"],
                ip_address=i.get("ip_address"),
                subnet_mask=i.get("subnet_mask"),
                status=i.get("status", "up"),
                vlan=i.get("vlan"),
                description=i.get("description", ""),
            )
            for i in d.get("interfaces", [])
        ]
        routes = [
            Route(
                device=d["name"],
                destination=r["destination"],
                mask=r["mask"],
                next_hop=r.get("next_hop"),
                interface=r.get("interface"),
                administrative_distance=r.get("administrative_distance", 0),
                metric=r.get("metric", 0),
            )
            for r in d.get("routes", [])
        ]
        vlans = [
            VLAN(id=v["id"], name=v["name"], device=d["name"])
            for v in d.get("vlans", [])
        ]
        devices.append(
            Device(
                name=d["name"],
                hostname=d.get("hostname", d["name"]),
                interfaces=interfaces,
                routes=routes,
                vlans=vlans,
                default_gateway=d.get("default_gateway"),
            )
        )
    return NetworkData(devices=devices)


# ─── Utility ─────────────────────────────────────────────────────────────────


def ip_to_int(ip: str) -> int:
    """Convert dotted-quad IP to integer."""
    parts = ip.strip().split(".")
    return (int(parts[0]) << 24) | (int(parts[1]) << 16) | (int(parts[2]) << 8) | int(parts[3])


def mask_to_prefix(mask: str) -> int:
    """Convert dotted-quad mask to CIDR prefix length."""
    return ip_to_int(mask).bit_count()


def networks_equal(ip1: str, mask1: str, ip2: str, mask2: str) -> bool:
    """Check if two IP/mask pairs are in the same subnet."""
    net1 = ip_to_int(ip1) & ip_to_int(mask1)
    net2 = ip_to_int(ip2) & ip_to_int(mask2)
    return net1 == net2


def is_in_subnet(ip: str, network_ip: str, mask: str) -> bool:
    """Check if an IP is within a given subnet."""
    return (ip_to_int(ip) & ip_to_int(mask)) == (ip_to_int(network_ip) & ip_to_int(mask))


def device_interface_map(net: NetworkData) -> dict[str, list[Interface]]:
    """Group interfaces by device name."""
    result: dict[str, list[Interface]] = {}
    for d in net.devices:
        result[d.name] = d.interfaces
    return result


# ─── Rule Checks ─────────────────────────────────────────────────────────────


def check_duplicate_ips(net: NetworkData) -> list[CheckResult]:
    """Check 1: Detect duplicate IP addresses across all interfaces."""
    results: list[CheckResult] = []
    ip_map: dict[str, list[str]] = {}  # ip -> [device:interface, ...]

    for d in net.devices:
        for iface in d.interfaces:
            if iface.ip_address and iface.ip_address != "0.0.0.0":
                key = iface.ip_address
                loc = f"{d.name}:{iface.name}"
                ip_map.setdefault(key, []).append(loc)

    duplicates = {ip: locs for ip, locs in ip_map.items() if len(locs) > 1}

    if duplicates:
        for ip, locs in duplicates.items():
            results.append(
                CheckResult(
                    check_name="Duplicate IP Address",
                    status=Status.ERROR,
                    evidence=f"IP {ip} is assigned to: {', '.join(locs)}",
                    explanation=(
                        f"Two or more interfaces share the same IP address ({ip}). "
                        "This causes ARP conflicts and unpredictable routing behavior."
                    ),
                    recommended_action=(
                        f"Assign a unique IP to one of: {', '.join(locs)}. "
                        "Verify with 'show ip arp' and 'show ip interface brief'."
                    ),
                )
            )
    else:
        results.append(
            CheckResult(
                check_name="Duplicate IP Address",
                status=Status.PASS,
                evidence="All assigned IP addresses are unique across the network.",
                explanation="No duplicate IP addresses were found.",
                recommended_action="No action required.",
            )
        )

    return results


def check_subnet_masks(net: NetworkData) -> list[CheckResult]:
    """Check 2: Detect incorrect or inconsistent subnet masks."""
    results: list[CheckResult] = []

    # Group interfaces by network prefix to find inconsistencies
    for d in net.devices:
        for iface in d.interfaces:
            if iface.ip_address and iface.subnet_mask:
                prefix = mask_to_prefix(iface.subnet_mask)

                # Flag common mistakes
                if prefix == 32:
                    results.append(
                        CheckResult(
                            check_name="Incorrect Subnet Mask",
                            status=Status.ERROR,
                            evidence=f"{d.name}:{iface.name} has /32 mask ({iface.subnet_mask})",
                            explanation=(
                                "A /32 mask (255.255.255.255) designates a host route, "
                                "not a network segment. This is almost certainly a "
                                "configuration error on an interface meant for LAN or WAN use."
                            ),
                            recommended_action=(
                                "Set the correct prefix for the network. Common values: "
                                "/24 (255.255.255.0) for LANs, /30 (255.255.255.252) for "
                                "point-to-point links."
                            ),
                        )
                    )
                elif prefix < 8:
                    results.append(
                        CheckResult(
                            check_name="Incorrect Subnet Mask",
                            status=Status.WARNING,
                            evidence=f"{d.name}:{iface.name} has unusually broad /{prefix} mask ({iface.subnet_mask})",
                            explanation=(
                                f"A /{prefix} mask is extremely broad. This may be "
                                "intentional for large aggregates, but is uncommon on "
                                "access interfaces."
                            ),
                            recommended_action=(
                                "Verify the mask is correct. For a standard LAN, "
                                "use /24 (255.255.255.0)."
                            ),
                        )
                    )

    # Check for masks that don't match their context
    # (e.g., a /24 mask on a point-to-point link)
    for d in net.devices:
        for iface in d.interfaces:
            if iface.ip_address and iface.subnet_mask:
                prefix = mask_to_prefix(iface.subnet_mask)
                # /31 and /32 on non-loopback interfaces are suspect
                if prefix in (31, 32) and "loopback" not in iface.name.lower():
                    results.append(
                        CheckResult(
                            check_name="Incorrect Subnet Mask",
                            status=Status.WARNING,
                            evidence=(
                                f"{d.name}:{iface.name} uses /{prefix} on a "
                                "non-loopback interface"
                            ),
                            explanation=(
                                f"Point-to-point links typically use /30 or /31. "
                                f"A /{prefix} mask on a physical interface may "
                                "prevent communication with the peer."
                            ),
                            recommended_action=(
                                "Use /30 (255.255.255.252) for point-to-point links, "
                                "or /24 (255.255.255.0) for LAN segments."
                            ),
                        )
                    )

    if not results:
        results.append(
            CheckResult(
                check_name="Incorrect Subnet Mask",
                status=Status.PASS,
                evidence="All subnet masks appear correctly configured.",
                explanation="No subnet mask anomalies detected.",
                recommended_action="No action required.",
            )
        )

    return results


def check_default_gateway(net: NetworkData) -> list[CheckResult]:
    """Check 3: Verify default gateways are reachable and in the correct subnet."""
    results: list[CheckResult] = []

    for d in net.devices:
        if not d.default_gateway:
            # Only flag if the device has routed interfaces (not a pure L2 switch)
            has_routed = any(
                i.ip_address and i.ip_address != "0.0.0.0"
                for i in d.interfaces
                if "vlan" not in i.name.lower() or i.vlan is not None
            )
            if has_routed and len(d.interfaces) > 2:
                results.append(
                    CheckResult(
                        check_name="Default Gateway Mismatch",
                        status=Status.WARNING,
                        evidence=f"Device '{d.name}' has no default gateway configured.",
                        explanation=(
                            "A device with multiple routed interfaces but no default "
                            "gateway cannot reach networks outside its directly "
                            "connected subnets."
                        ),
                        recommended_action=(
                            "Set a default gateway: 'ip default-gateway <ip>' for L2 "
                            "switches, or a default route 'ip route 0.0.0.0 0.0.0.0 "
                            "<next-hop>' for routers."
                        ),
                    )
                )
            continue

        gw = d.default_gateway
        gw_found = False

        # Check if the gateway is in the same subnet as any local interface
        for iface in d.interfaces:
            if iface.ip_address and iface.subnet_mask:
                if is_in_subnet(gw, iface.ip_address, iface.subnet_mask):
                    gw_found = True
                    break

        if not gw_found:
            # Check if the gateway IP exists as an interface on any device
            gw_on_network = False
            for d2 in net.devices:
                for iface in d2.interfaces:
                    if iface.ip_address == gw:
                        gw_on_network = True
                        break
                if gw_on_network:
                    break

            if gw_on_network:
                results.append(
                    CheckResult(
                        check_name="Default Gateway Mismatch",
                        status=Status.WARNING,
                        evidence=(
                            f"Device '{d.name}' has gateway {gw} configured, but "
                            f"no local interface is in the same subnet as the gateway."
                        ),
                        explanation=(
                            f"The default gateway {gw} is reachable on the network "
                            "but is not in any subnet belonging to this device. The "
                            "device may not be able to route to the gateway."
                        ),
                        recommended_action=(
                            f"Verify that an interface on '{d.name}' is in the "
                            f"same subnet as {gw}, or change the gateway address."
                        ),
                    )
                )
            else:
                results.append(
                    CheckResult(
                        check_name="Default Gateway Mismatch",
                        status=Status.ERROR,
                        evidence=(
                            f"Device '{d.name}' has gateway {gw} but no device "
                            "on the network has this IP."
                        ),
                        explanation=(
                            f"The default gateway {gw} does not exist on any "
                            "interface in the network topology. Traffic to "
                            "non-local destinations will be dropped."
                        ),
                        recommended_action=(
                            f"Assign {gw} to a router interface, or change the "
                            f"gateway on '{d.name}' to an existing router IP."
                        ),
                    )
                )
        else:
            results.append(
                CheckResult(
                    check_name="Default Gateway Mismatch",
                    status=Status.PASS,
                    evidence=(
                        f"Device '{d.name}' gateway {gw} is in the same subnet "
                        "as a local interface."
                    ),
                    explanation="Default gateway is correctly placed.",
                    recommended_action="No action required.",
                )
            )

    if not results:
        results.append(
            CheckResult(
                check_name="Default Gateway Mismatch",
                status=Status.PASS,
                evidence="All default gateways are correctly configured.",
                explanation="No default gateway issues detected.",
                recommended_action="No action required.",
            )
        )

    return results


def check_admin_down(net: NetworkData) -> list[CheckResult]:
    """Check 4: Detect interfaces that are administratively down."""
    results: list[CheckResult] = []

    for d in net.devices:
        for iface in d.interfaces:
            if iface.status == "admin-down":
                # Skip management interfaces that are intentionally off
                is_management = any(
                    kw in iface.name.lower()
                    for kw in ["console", "management", "mgmt"]
                )
                if is_management:
                    results.append(
                        CheckResult(
                            check_name="Interface Administratively Down",
                            status=Status.WARNING,
                            evidence=f"{d.name}:{iface.name} is administratively down.",
                            explanation=(
                                "This is a management interface that is normally "
                                "disabled. This may be intentional."
                            ),
                            recommended_action=(
                                "Verify this is intentional. If access is needed: "
                                f"'interface {iface.name}, no shutdown'."
                            ),
                        )
                    )
                else:
                    results.append(
                        CheckResult(
                            check_name="Interface Administratively Down",
                            status=Status.ERROR,
                            evidence=(
                                f"{d.name}:{iface.name} is administratively down"
                                + (
                                    f" (IP: {iface.ip_address})"
                                    if iface.ip_address
                                    else ""
                                )
                            ),
                            explanation=(
                                "The interface is in 'shutdown' state. Any device "
                                "connected to this port will have no network "
                                "connectivity."
                            ),
                            recommended_action=(
                                f"On {d.name}: 'interface {iface.name}, no shutdown'. "
                                "Verify the link comes up: 'show interfaces "
                                f"{iface.name}'."
                            ),
                        )
                    )

    if not results:
        results.append(
            CheckResult(
                check_name="Interface Administratively Down",
                status=Status.PASS,
                evidence="No interfaces are administratively down.",
                explanation="All checked interfaces are enabled.",
                recommended_action="No action required.",
            )
        )

    return results


def check_missing_vlan(net: NetworkData) -> list[CheckResult]:
    """Check 5: Detect VLANs referenced by interfaces but not defined on the device."""
    results: list[CheckResult] = []

    for d in net.devices:
        defined_vlans = {v.id for v in d.vlans}

        for iface in d.interfaces:
            if iface.vlan is not None and iface.vlan not in defined_vlans:
                results.append(
                    CheckResult(
                        check_name="Missing VLAN",
                        status=Status.ERROR,
                        evidence=(
                            f"{d.name}:{iface.name} is assigned to VLAN "
                            f"{iface.vlan}, but VLAN {iface.vlan} is not "
                            f"defined on {d.name}."
                        ),
                        explanation=(
                            f"An interface can only operate in a VLAN that "
                            f"exists on the switch. VLAN {iface.vlan} must be "
                            "created before the port can function."
                        ),
                        recommended_action=(
                            f"On {d.name}: 'vlan {iface.vlan}', then "
                            f"'name <vlan-name>'. Verify: 'show vlan brief'."
                        ),
                    )
                )

    if not results:
        results.append(
            CheckResult(
                check_name="Missing VLAN",
                status=Status.PASS,
                evidence="All VLANs referenced by interfaces are defined.",
                explanation="No missing VLAN configurations detected.",
                recommended_action="No action required.",
            )
        )

    return results


def check_missing_route(net: NetworkData) -> list[CheckResult]:
    """Check 6: Detect destination networks with no route on the device."""
    results: list[CheckResult] = []

    for d in net.devices:
        # Collect all directly connected subnets
        connected_subnets: list[tuple[str, str]] = []
        for iface in d.interfaces:
            if iface.ip_address and iface.subnet_mask:
                net_addr = ip_to_int(iface.ip_address) & ip_to_int(iface.subnet_mask)
                # Convert back to string
                net_str = f"{(net_addr >> 24) & 0xFF}.{(net_addr >> 16) & 0xFF}.{(net_addr >> 8) & 0xFF}.{net_addr & 0xFF}"
                connected_subnets.append((net_str, iface.subnet_mask))

        # Check if there's a default route
        has_default = any(
            r.destination == "0.0.0.0" and r.mask == "0.0.0.0"
            for r in d.routes
        )

        # Collect all destination networks from routes
        route_destinations = {(r.destination, r.mask) for r in d.routes}

        # Check each connected subnet's peer networks
        for net_ip, mask in connected_subnets:
            # The network itself is connected, so no route needed for it
            # But we should check if the device can reach OTHER subnets
            pass

        # For routers: check that every interface subnet on OTHER devices
        # has a route (either connected or via routing protocol)
        for d2 in net.devices:
            if d2.name == d.name:
                continue
            for iface in d2.interfaces:
                if iface.ip_address and iface.subnet_mask:
                    peer_net = (
                        ip_to_int(iface.ip_address) & ip_to_int(iface.subnet_mask),
                        iface.subnet_mask,
                    )
                    peer_net_str = f"{(peer_net[0] >> 24) & 0xFF}.{(peer_net[0] >> 16) & 0xFF}.{(peer_net[0] >> 8) & 0xFF}.{peer_net[0] & 0xFF}"

                    # Check if this subnet is in connected subnets
                    is_connected = any(
                        ip_to_int(net_ip) & ip_to_int(mask) == peer_net[0]
                        for net_ip, mask in connected_subnets
                    )

                    if not is_connected and not has_default:
                        route_key = (peer_net_str, peer_net[1])
                        if route_key not in route_destinations:
                            results.append(
                                CheckResult(
                                    check_name="Missing Route",
                                    status=Status.WARNING,
                                    evidence=(
                                        f"Device '{d.name}' has no route to "
                                        f"{peer_net_str}/{mask_to_prefix(peer_net[1])} "
                                        f"( subnet of {d2.name}:{iface.name} ) "
                                        "and no default route."
                                    ),
                                    explanation=(
                                        f"'{d.name}' cannot reach "
                                        f"{peer_net_str}/{mask_to_prefix(peer_net[1])} "
                                        "because it is not directly connected "
                                        "and no default route exists to forward "
                                        "unknown destinations."
                                    ),
                                    recommended_action=(
                                        f"Add a static route on '{d.name}': "
                                        f"'ip route {peer_net_str} {peer_net[1]} "
                                        "<next-hop>'. Or enable a dynamic routing "
                                        "protocol (OSPF, EIGRP, RIP)."
                                    ),
                                )
                            )

    if not results:
        results.append(
            CheckResult(
                check_name="Missing Route",
                status=Status.PASS,
                evidence="All reachable subnets have routes (or a default route exists).",
                explanation="No missing routes detected.",
                recommended_action="No action required.",
            )
        )

    return results


# ─── Main Runner ─────────────────────────────────────────────────────────────


def run_checks(net: NetworkData) -> RuleCheckerReport:
    """Run all checks and return a structured report."""
    all_results: list[CheckResult] = []

    all_results.extend(check_duplicate_ips(net))
    all_results.extend(check_subnet_masks(net))
    all_results.extend(check_default_gateway(net))
    all_results.extend(check_admin_down(net))
    all_results.extend(check_missing_vlan(net))
    all_results.extend(check_missing_route(net))

    passed = sum(1 for r in all_results if r.status == Status.PASS)
    warnings = sum(1 for r in all_results if r.status == Status.WARNING)
    errors = sum(1 for r in all_results if r.status == Status.ERROR)

    return RuleCheckerReport(
        total_checks=len(all_results),
        passed=passed,
        warnings=warnings,
        errors=errors,
        results=all_results,
    )


def report_to_dict(report: RuleCheckerReport) -> dict[str, Any]:
    """Convert a report to a JSON-serializable dict."""
    return {
        "total_checks": report.total_checks,
        "passed": report.passed,
        "warnings": report.warnings,
        "errors": report.errors,
        "results": [asdict(r) for r in report.results],
    }


# ─── CLI Entry Point ─────────────────────────────────────────────────────────


def main() -> None:
    # Determine input file
    if len(sys.argv) > 1:
        input_path = Path(sys.argv[1])
        with open(input_path) as f:
            raw = json.load(f)
    else:
        # Use built-in sample
        sample_path = Path(__file__).parent / "sample_network.json"
        with open(sample_path) as f:
            raw = json.load(f)

    net = parse_network_data(raw)
    report = run_checks(net)
    output = report_to_dict(report)

    # Write output
    if len(sys.argv) > 2:
        output_path = Path(sys.argv[2])
        with open(output_path, "w") as f:
            json.dump(output, f, indent=2)
        print(f"Report written to {output_path}")
    else:
        print(json.dumps(output, indent=2))

    # Summary
    print(f"\n{'='*60}")
    print(f"  NetSage Rule Checker — Summary")
    print(f"{'='*60}")
    print(f"  Total checks : {report.total_checks}")
    print(f"  Passed       : {report.passed}")
    print(f"  Warnings     : {report.warnings}")
    print(f"  Errors       : {report.errors}")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
