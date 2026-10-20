import React from "react";
import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { ToolNavigation } from "@/components/layout/ToolNavigation";
import { Footer } from "@/components/layout/Footer";
import { BinaryCalculator } from "@/components/calculators/BinaryCalculator";
import { TechnicalGuide } from "@/components/content/TechnicalGuide";

export const metadata: Metadata = {
  title: "Binary IP Calculator & 32-Bit Subnet Matrix",
  description:
    "Free binary IP calculator. Visualize 32-bit IPv4 addresses, network vs host bit distribution, bit weights (powers of 2), and octet conversions.",
  alternates: {
    canonical: "/binary-ip-calculator",
  },
  openGraph: {
    title: "Binary IP Calculator & Bit Matrix | Network Calculator Suite",
    description:
      "Inspect IPv4 bit boundaries in full binary notation. Clearly distinguishes network prefix bits from host bits.",
    url: "https://networkcalculatorsuite.com/binary-ip-calculator",
  },
};

const binaryFaqs = [
  {
    question: "Why is binary representation important in IP networking?",
    answer:
      "Computers and routers operate purely in binary (base-2). Subnet masks, network addresses, and wildcards are bitwise logical AND / OR / XOR operations on 32-bit values. Understanding binary reveals why subnet sizes always occur in powers of two.",
  },
  {
    question: "How do binary powers of two relate to an octet?",
    answer:
      "Each IPv4 octet contains 8 bits with positional values from right to left: 1, 2, 4, 8, 16, 32, 64, and 128. Summing the weights of all active '1' bits yields the decimal octet value between 0 and 255.",
  },
  {
    question: "What happens at non-octet subnet boundaries (/25, /26, /27, etc.)?",
    answer:
      "When a prefix length does not land on an octet boundary (multiples of 8 like /8, /16, /24), the 'interesting octet' borrows bits from the host portion. For example, a /26 borrows 2 host bits (weights 128 and 64) giving a mask of 128 + 64 = 192 and creating blocks in increments of 64.",
  },
];

const rfcStandards = [
  { name: "RFC 791", url: "https://datatracker.ietf.org/doc/html/rfc791", note: "Internet Protocol Specification" },
  { name: "RFC 4632", url: "https://datatracker.ietf.org/doc/html/rfc4632", note: "CIDR Prefix Bit Boundaries" },
];

export default function BinaryPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: binaryFaqs.map((faq) => ({
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
      <ToolNavigation activeId="binary" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 border-b border-workspace-200 pb-3">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Binary Bit Breakdown & Subnet Matrix
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Analyze exact 32-bit positional powers of 2, contrasting network prefix bits from host bits with high contrast clarity.
          </p>
        </div>

        <BinaryCalculator />

        <TechnicalGuide
          toolName="Binary IP Mathematics & Bit Boundaries"
          description="Every IPv4 address is an unsigned 32-bit binary integer. Dotted-decimal notation (e.g. 192.168.1.1) is merely human-readable formatting for four 8-bit octets. Examining the underlying bits makes subnet division and masking mathematically transparent."
          faqs={binaryFaqs}
          rfcReferences={rfcStandards}
        />
      </main>

      <Footer />
    </div>
  );
}

