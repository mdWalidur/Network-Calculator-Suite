import React from "react";
import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { ToolNavigation } from "@/components/layout/ToolNavigation";
import { Footer } from "@/components/layout/Footer";
import { SupernetCalculator } from "@/components/calculators/SupernetCalculator";
import { TechnicalGuide } from "@/components/content/TechnicalGuide";

export const metadata: Metadata = {
  title: "CIDR Route Summarizer & Supernet Calculator",
  description:
    "Free CIDR route summarizer and supernetting tool. Consolidate multiple routing table entries into optimal summary routes to reduce BGP and OSPF routing table overhead.",
  alternates: {
    canonical: "/cidr-calculator",
  },
  openGraph: {
    title: "CIDR Route Summarizer & Supernet Tool | Network Calculator Suite",
    description:
      "Aggregate contiguous IP prefixes into the smallest encompassing CIDR supernet. Instant, browser-based evaluation.",
    url: "https://networkcalculatorsuite.com/cidr-calculator",
  },
};

const cidrFaqs = [
  {
    question: "What is CIDR Route Summarization (Supernetting)?",
    answer:
      "Route summarization, or supernetting, is the process of representing multiple contiguous network prefixes by a single summary route with a shorter prefix length. For example, four contiguous /24 networks (192.168.0.0/24 through 192.168.3.0/24) summarize into a single 192.168.0.0/22 route.",
  },
  {
    question: "Why is route summarization important in production networks?",
    answer:
      "Summarization reduces routing table size in routers (such as core enterprise routers and Internet BGP tables), conserves router memory, speeds up route convergence times, and isolates route flapping so local link failures do not destabilize the entire network core.",
  },
  {
    question: "What are the requirements for summarizing routes?",
    answer:
      "Routes must be numerically contiguous, share the same high-order network bits, and span an exact power-of-two number of blocks (e.g. 2, 4, 8, 16) aligning on their natural binary boundary.",
  },
];

const rfcStandards = [
  { name: "RFC 4632", url: "https://datatracker.ietf.org/doc/html/rfc4632", note: "CIDR: An Address Assignment and Aggregation Strategy" },
  { name: "RFC 1519", url: "https://datatracker.ietf.org/doc/html/rfc1519", note: "Classless Inter-Domain Routing Historical Definition" },
];

export default function CIDRPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: cidrFaqs.map((faq) => ({
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
      <ToolNavigation activeId="cidr" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 border-b border-workspace-200 pb-3">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            CIDR Route Summarizer & Supernet Aggregator
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Aggregate multiple routing table entries into optimal CIDR supernets to reduce router memory overhead and convergence latency.
          </p>
        </div>

        <SupernetCalculator />

        <TechnicalGuide
          toolName="CIDR Route Aggregation (Supernetting)"
          description="Without route summarization, global Internet routing tables and large enterprise WAN backbones would exceed router hardware capabilities. Aggregating contiguous blocks into shorter prefixes prevents routing table bloat and stabilizes network convergence."
          faqs={cidrFaqs}
          rfcReferences={rfcStandards}
        />
      </main>

      <Footer />
    </div>
  );
}

