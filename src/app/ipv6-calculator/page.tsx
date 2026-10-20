import React from "react";
import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { ToolNavigation } from "@/components/layout/ToolNavigation";
import { Footer } from "@/components/layout/Footer";
import { IPv6Calculator } from "@/components/calculators/IPv6Calculator";
import { TechnicalGuide } from "@/components/content/TechnicalGuide";

export const metadata: Metadata = {
  title: "IPv6 Calculator & RFC 5952 Compression Tool",
  description:
    "Free, professional IPv6 subnet calculator and address analysis engine. Supports RFC 5952 canonical compression, full 128-bit expansion, and prefix masking.",
  alternates: {
    canonical: "/ipv6-calculator",
  },
  openGraph: {
    title: "IPv6 Subnet Calculator & Address Expander | Network Calculator Suite",
    description:
      "Compress, expand, and subnet IPv6 addresses using RFC 5952 standard notation. Zero latency, 100% client-side execution.",
    url: "https://networkcalculatorsuite.com/ipv6-calculator",
  },
};

const ipv6Faqs = [
  {
    question: "How does IPv6 address representation work?",
    answer:
      "IPv6 addresses are 128 bits in length, written as eight groups of four hexadecimal digits separated by colons (e.g. 2001:0db8:85a3:0000:0000:8a2e:0370:7334).",
  },
  {
    question: "What is RFC 5952 canonical compression?",
    answer:
      "RFC 5952 defines strict formatting rules to prevent ambiguous representations: leading zeros within each 16-bit hextet must be suppressed, the longest contiguous sequence of all-zero hextets must be replaced with '::' (done only once), and hexadecimal characters (a-f) must be lowercase.",
  },
  {
    question: "Why is /64 considered the standard IPv6 subnet size?",
    answer:
      "A /64 prefix length is required for IPv6 Stateless Address Autoconfiguration (SLAAC) and standard routing protocols. It splits the 128-bit address into a 64-bit routing prefix and a 64-bit interface identifier (EUI-64 or randomized).",
  },
];

const rfcStandards = [
  { name: "RFC 4291", url: "https://datatracker.ietf.org/doc/html/rfc4291", note: "IPv6 Addressing Architecture" },
  { name: "RFC 5952", url: "https://datatracker.ietf.org/doc/html/rfc5952", note: "Canonical Text Representation of IPv6" },
  { name: "RFC 6164", url: "https://datatracker.ietf.org/doc/html/rfc6164", note: "Using 127-Bit IPv6 Prefixes on Inter-Router Links" },
];

export default function IPv6Page() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: ipv6Faqs.map((faq) => ({
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
      <ToolNavigation activeId="ipv6" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 border-b border-workspace-200 pb-3">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            IPv6 Address & Subnet Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            RFC 5952 canonical compression, full 128-bit uncompressed expansion, and prefix boundary calculation.
          </p>
        </div>

        <IPv6Calculator />

        <TechnicalGuide
          toolName="IPv6 Addressing & Subnet Architecture"
          description="IPv6 expands the IP address space from 32 bits (4.29 billion addresses in IPv4) to 128 bits (approximately 3.4 x 10^38 addresses), completely eliminating the need for NAT in end-to-end communication while introducing simplified packet headers and built-in autoconfiguration."
          faqs={ipv6Faqs}
          rfcReferences={rfcStandards}
        />
      </main>

      <Footer />
    </div>
  );
}

