import React from "react";
import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { ToolNavigation } from "@/components/layout/ToolNavigation";
import { Footer } from "@/components/layout/Footer";
import { IPv4Calculator } from "@/components/calculators/IPv4Calculator";
import { TechnicalGuide } from "@/components/content/TechnicalGuide";

export const metadata: Metadata = {
  title: "IPv4 Subnet Calculator & CIDR Tool",
  description:
    "Free, precise IPv4 subnet calculator. Calculate subnet masks, usable host ranges, broadcast addresses, wildcard masks, and Cisco ACL helpers with instant client-side execution.",
  alternates: {
    canonical: "/ipv4-subnet-calculator",
  },
  openGraph: {
    title: "IPv4 Subnet Calculator & CIDR Division | Network Calculator Suite",
    description:
      "Calculate IPv4 subnet masks, usable host capacities, network boundaries, and Cisco/Juniper ACL wildcard masks instantly.",
    url: "https://networkcalculatorsuite.com/ipv4-subnet-calculator",
  },
};

const ipv4Faqs = [
  {
    question: "What is an IPv4 Subnet Calculator?",
    answer:
      "An IPv4 subnet calculator computes network boundaries, usable host ranges, broadcast addresses, wildcard masks, and CIDR subnet notation from an IP address and prefix length. It enables network engineers to divide IP address blocks efficiently without calculation errors.",
  },
  {
    question: "How does CIDR notation work?",
    answer:
      "Classless Inter-Domain Routing (CIDR) uses a slash followed by the prefix length (e.g., /24) to denote how many bits represent the network portion of the 32-bit IPv4 address. The remaining bits (32 - prefix) represent individual host addresses.",
  },
  {
    question: "How do I calculate usable host capacity?",
    answer:
      "For standard subnets (/1 to /30), the usable host capacity is calculated with the formula 2^(32 - prefix) - 2. Two addresses are reserved: the network ID (all host bits 0) and the directed broadcast address (all host bits 1). Under RFC 3021, /31 subnets permit 2 usable host addresses for point-to-point links.",
  },
  {
    question: "What are RFC 1918 private address ranges?",
    answer:
      "RFC 1918 designates three non-routable private IP address blocks for internal enterprise networks: 10.0.0.0/8 (10.0.0.0 – 10.255.255.255), 172.16.0.0/12 (172.16.0.0 – 172.31.255.255), and 192.168.0.0/16 (192.168.0.0 – 192.168.255.255).",
  },
];

const rfcStandards = [
  { name: "RFC 1918", url: "https://datatracker.ietf.org/doc/html/rfc1918", note: "Private Address Allocation" },
  { name: "RFC 4632", url: "https://datatracker.ietf.org/doc/html/rfc4632", note: "CIDR Address Assignment" },
  { name: "RFC 3021", url: "https://datatracker.ietf.org/doc/html/rfc3021", note: "31-Bit Prefixes on IPv4 P2P Links" },
];

export default function IPv4Page() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: ipv4Faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="min-h-screen flex flex-col bg-workspace-50 text-workspace-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Header />
      <ToolNavigation activeId="ipv4" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 border-b border-workspace-200 pb-3">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            IPv4 Subnet Calculator & CIDR Division
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Compute subnet masks, usable host ranges, broadcast addresses, and Cisco/Juniper ACL wildcard masks with RFC 1918 validation.
          </p>
        </div>

        <IPv4Calculator />

        <TechnicalGuide
          toolName="IPv4 Subnetting & CIDR Math"
          description="Subnetting is the practice of dividing a physical or virtual network into smaller, logical subnetworks (subnets). Masking bits designate which portion of the 32-bit address identifies the network routing prefix, and which portion designates specific host devices on that segment."
          cidrTable={true}
          faqs={ipv4Faqs}
          rfcReferences={rfcStandards}
        />
      </main>

      <Footer />
    </div>
  );
}

