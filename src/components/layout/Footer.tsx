import React from "react";
import Link from "next/link";
import { Network, ExternalLink, ShieldCheck } from "lucide-react";
import { TOOLS } from "@/lib/tools";

export function Footer() {
  const rfcStandards = [
    { code: "RFC 1918", title: "Address Allocation for Private Internets", url: "https://datatracker.ietf.org/doc/html/rfc1918" },
    { code: "RFC 4632", title: "Classless Inter-domain Routing (CIDR)", url: "https://datatracker.ietf.org/doc/html/rfc4632" },
    { code: "RFC 5952", title: "A Recommendation for IPv6 Text Representation", url: "https://datatracker.ietf.org/doc/html/rfc5952" },
    { code: "RFC 3021", title: "Using 31-Bit Prefixes on IPv4 Point-to-Point Links", url: "https://datatracker.ietf.org/doc/html/rfc3021" },
  ];

  return (
    <footer className="border-t border-workspace-200 bg-white mt-auto text-xs text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Identity & Mission */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                <Network className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <span className="font-bold text-slate-900 text-sm">
                Network Calculator Suite
              </span>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed max-w-md">
              A purpose-built engineering instrument for network engineers, IT professionals, cloud architects, and students. Provides instant, RFC-compliant subnetting, VLSM planning, and CIDR aggregation.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% Client-Side Engine • Zero Cloud Telemetry • No Cookies</span>
            </div>
          </div>

          {/* Calculators Navigation */}
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 mb-3">
              Calculators
            </h2>
            <ul className="space-y-2">
              {TOOLS.map((t) => (
                <li key={t.id}>
                  <Link
                    href={t.href}
                    className="text-slate-600 hover:text-blue-600 transition-colors"
                  >
                    {t.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* RFC Technical References */}
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 mb-3">
              Standards & RFCs
            </h2>
            <ul className="space-y-2">
              {rfcStandards.map((rfc) => (
                <li key={rfc.code}>
                  <a
                    href={rfc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-slate-600 hover:text-blue-600 transition-colors"
                  >
                    <span>{rfc.code}</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar & Attribution */}
        <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
          <div>
            &copy; {new Date().getFullYear()} Network Calculator Suite. Open-access engineering utility.
          </div>
          <div>
            Engineered with pride by{" "}
            <strong className="text-slate-700 font-medium">Md Walidur Rahman</strong> — IT Expert & Network Engineer.
          </div>
        </div>
      </div>
    </footer>
  );
}
