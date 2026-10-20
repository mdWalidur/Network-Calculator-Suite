import React from "react";
import Link from "next/link";
import { BookOpen, ExternalLink } from "lucide-react";

export interface FaqItem {
  question: string;
  answer: string;
}

interface TechnicalGuideProps {
  toolName: string;
  description: string;
  rfcReferences?: { name: string; url: string; note: string }[];
  faqs?: FaqItem[];
  cidrTable?: boolean;
}

export function TechnicalGuide({
  toolName,
  description,
  rfcReferences,
  faqs,
  cidrTable,
}: TechnicalGuideProps) {
  return (
    <section aria-labelledby="technical-guide-heading" className="panel p-6 sm:p-8 mt-10 space-y-8">
      {/* Overview */}
      <div>
        <div className="flex items-center gap-2 text-slate-700 font-semibold text-xs uppercase tracking-wider mb-2">
          <BookOpen className="w-4 h-4 text-blue-600" />
          <span>Technical Reference & Engineering Guide</span>
        </div>
        <h2 id="technical-guide-heading" className="text-xl font-bold text-slate-900">
          Understanding {toolName}
        </h2>
        <p className="text-slate-600 text-sm mt-2 leading-relaxed">
          {description}
        </p>
      </div>

      {/* CIDR Cheat Table if requested */}
      {cidrTable && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900">
            IPv4 CIDR Prefix, Subnet Mask & Host Capacity Table
          </h3>
          <div className="overflow-x-auto border border-slate-200 rounded-md">
            <table className="eng-table">
              <thead>
                <tr>
                  <th scope="col">Prefix</th>
                  <th scope="col">Subnet Mask</th>
                  <th scope="col">Wildcard Mask</th>
                  <th scope="col">Total Addresses</th>
                  <th scope="col">Usable Hosts</th>
                  <th scope="col">Typical Use Case</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-xs">
                <tr>
                  <td className="font-bold">/32</td>
                  <td>255.255.255.255</td>
                  <td>0.0.0.0</td>
                  <td>1</td>
                  <td>1</td>
                  <td className="font-sans">Host route / Loopback interface</td>
                </tr>
                <tr>
                  <td className="font-bold">/31</td>
                  <td>255.255.255.254</td>
                  <td>0.0.0.1</td>
                  <td>2</td>
                  <td>2</td>
                  <td className="font-sans">RFC 3021 Point-to-Point router link</td>
                </tr>
                <tr>
                  <td className="font-bold">/30</td>
                  <td>255.255.255.252</td>
                  <td>0.0.0.3</td>
                  <td>4</td>
                  <td>2</td>
                  <td className="font-sans">Legacy Point-to-Point inter-router link</td>
                </tr>
                <tr>
                  <td className="font-bold">/29</td>
                  <td>255.255.255.248</td>
                  <td>0.0.0.7</td>
                  <td>8</td>
                  <td>6</td>
                  <td className="font-sans">Small DMZ / public IP block</td>
                </tr>
                <tr>
                  <td className="font-bold">/28</td>
                  <td>255.255.255.240</td>
                  <td>0.0.0.15</td>
                  <td>16</td>
                  <td>14</td>
                  <td className="font-sans">Small office branch segment</td>
                </tr>
                <tr>
                  <td className="font-bold">/27</td>
                  <td>255.255.255.224</td>
                  <td>0.0.0.31</td>
                  <td>32</td>
                  <td>30</td>
                  <td className="font-sans">Departmental sub-network</td>
                </tr>
                <tr>
                  <td className="font-bold">/26</td>
                  <td>255.255.255.192</td>
                  <td>0.0.0.63</td>
                  <td>64</td>
                  <td>62</td>
                  <td className="font-sans">Standard medium enterprise sub-network</td>
                </tr>
                <tr>
                  <td className="font-bold">/24</td>
                  <td>255.255.255.0</td>
                  <td>0.0.0.255</td>
                  <td>256</td>
                  <td>254</td>
                  <td className="font-sans">Standard Class C LAN / WLAN subnet</td>
                </tr>
                <tr>
                  <td className="font-bold">/16</td>
                  <td>255.255.0.0</td>
                  <td>0.0.255.255</td>
                  <td>65,536</td>
                  <td>65,534</td>
                  <td className="font-sans">Corporate core network / VPC supernet</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FAQs */}
      {faqs && faqs.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            Frequently Asked Questions
          </h3>
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-md">
            {faqs.map((faq, idx) => (
              <div key={idx} className="p-4 space-y-1.5">
                <h4 className="text-sm font-semibold text-slate-900">
                  {faq.question}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RFC References */}
      {rfcReferences && rfcReferences.length > 0 && (
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Governing RFC Specifications
          </h4>
          <div className="flex flex-wrap gap-4 text-xs">
            {rfcReferences.map((rfc) => (
              <a
                key={rfc.name}
                href={rfc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-blue-700 hover:text-blue-900 font-medium"
              >
                <span>{rfc.name}: {rfc.note}</span>
                <ExternalLink className="w-3 h-3 text-blue-500" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Internal Navigation to other tools */}
      <div className="pt-4 border-t border-slate-100">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Related Network Engineering Calculators
        </h4>
        <div className="flex flex-wrap gap-2 text-xs">
          <Link href="/ipv4-subnet-calculator" className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors">
            IPv4 Subnet Calculator
          </Link>
          <Link href="/ipv6-calculator" className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors">
            IPv6 Address & Subnet Engine
          </Link>
          <Link href="/vlsm-calculator" className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors">
            VLSM Subnet Allocation Planner
          </Link>
          <Link href="/cidr-calculator" className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors">
            CIDR Route Summarizer
          </Link>
          <Link href="/binary-ip-calculator" className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors">
            Binary IP Bit Breakdown
          </Link>
        </div>
      </div>
    </section>
  );
}

