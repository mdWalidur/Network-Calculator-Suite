import React from "react";
import { Network, Globe, Split, GitMerge, Binary } from "lucide-react";

export interface ToolItem {
  id: string;
  name: string;
  shortDesc: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const TOOLS: ToolItem[] = [
  {
    id: "ipv4",
    name: "IPv4 Subnet Calculator",
    shortDesc: "CIDR division, host ranges, masks & ACLs",
    href: "/ipv4-subnet-calculator",
    icon: Network,
  },
  {
    id: "ipv6",
    name: "IPv6 Calculator",
    shortDesc: "RFC 5952 compression & 128-bit expansion",
    href: "/ipv6-calculator",
    icon: Globe,
  },
  {
    id: "vlsm",
    name: "VLSM Planner",
    shortDesc: "Host capacity allocations & CSV export",
    href: "/vlsm-calculator",
    icon: Split,
  },
  {
    id: "cidr",
    name: "CIDR Route Summarizer",
    shortDesc: "Supernetting & route table aggregation",
    href: "/cidr-calculator",
    icon: GitMerge,
  },
  {
    id: "binary",
    name: "Binary Bit Breakdown",
    shortDesc: "Bit-level network vs host matrix",
    href: "/binary-ip-calculator",
    icon: Binary,
  },
];

