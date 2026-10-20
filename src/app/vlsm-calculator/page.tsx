import React from "react";
import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { ToolNavigation } from "@/components/layout/ToolNavigation";
import { Footer } from "@/components/layout/Footer";
import { VLSMCalculator } from "@/components/calculators/VLSMCalculator";
import { TechnicalGuide } from "@/components/content/TechnicalGuide";

export const metadata: Metadata = {
  title: "VLSM Subnet Calculator & Multi-Subnet Planner",
  description:
    "Free VLSM (Variable-Length Subnet Masking) calculator. Allocate subnets based on custom host capacity requirements with automatic descending binary alignment and CSV export.",
  alternates: {
    canonical: "/vlsm-calculator",
  },
  openGraph: {
    title: "VLSM Subnet Calculator & Capacity Planner | Network Calculator Suite",
    description:
      "Design efficient variable-length subnet plans. Sorts host requirements, prevents address exhaustion, and exports directly to CSV.",
    url: "https://networkcalculatorsuite.com/vlsm-calculator",
  },
};

const vlsmFaqs = [
  {
    question: "What is Variable-Length Subnet Masking (VLSM)?",
    answer:
      "VLSM is a subnet design methodology that applies different subnet mask lengths across subnets within the same major network block. This allows engineers to allocate small subnets (such as /30 or /31) to point-to-point links while allocating larger subnets (such as /24 or /26) to user departments, preventing IPv4 address waste.",
  },
  {
    question: "Why must VLSM subnets be sorted by largest host requirement first?",
    answer:
      "Sorting required host counts in descending order ensures that large subnets align cleanly with binary power-of-two boundaries without fragmenting contiguous IP space or creating unassignable overlap voids.",
  },
  {
    question: "What routing protocols support VLSM?",
    answer:
      "Classless routing protocols support VLSM by transmitting subnet masks alongside route advertisements. Examples include OSPF, EIGRP, IS-IS, and BGP. Legacy classful protocols like RIPv1 and IGRP do not support VLSM.",
  },
];

const rfcStandards = [
  { name: "RFC 1878", url: "https://datatracker.ietf.org/doc/html/rfc1878", note: "Variable Length Subnet Table For IPv4" },
  { name: "RFC 4632", url: "https://datatracker.ietf.org/doc/html/rfc4632", note: "Classless Inter-domain Routing (CIDR)" },
];

export default function VLSMPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: vlsmFaqs.map((faq) => ({
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
      <ToolNavigation activeId="vlsm" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 border-b border-workspace-200 pb-3">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            VLSM Subnet Allocation Planner
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Variable-Length Subnet Masking generator with automated binary boundary alignment, capacity warnings, and CSV export.
          </p>
        </div>

        <VLSMCalculator />

        <TechnicalGuide
          toolName="Variable-Length Subnet Masking (VLSM)"
          description="Fixed-length subnet masking (FLSM) wastes substantial IP address space by forcing every subnetwork to accommodate the single largest department. VLSM eliminates this inefficiency by tailoring the prefix length to each individual segment's exact host requirement."
          faqs={vlsmFaqs}
          rfcReferences={rfcStandards}
        />
      </main>

      <Footer />
    </div>
  );
}

