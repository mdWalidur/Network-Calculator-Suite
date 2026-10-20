"use client";

import React from "react";
import { Network, Globe2, Split, GitMerge, Binary, Zap, Shield, FileSpreadsheet } from "lucide-react";
import { motion } from "framer-motion";

interface FeaturesGridProps {
  onSelectFeature: (tabId: string) => void;
}

export function FeaturesGrid({ onSelectFeature }: FeaturesGridProps) {
  const features = [
    {
      id: "ipv4",
      title: "IPv4 Subnet Division & DHCP",
      desc: "Subnet planning with automated calculation of usable ranges, network IDs, broadcasts, Cisco/Juniper ACL wildcards, and DHCP scope allocations.",
      icon: Network,
      color: "from-brand-purple to-brand-indigo",
      tag: "RFC 1918 Standard",
    },
    {
      id: "ipv6",
      title: "IPv6 Canonical Compression",
      desc: "Instant expansion to full 128-bit uncompressed notation and RFC 5952 canonical compression. Automated subnet prefix masking across all address tiers.",
      icon: Globe2,
      color: "from-brand-cyan to-brand-sky",
      tag: "RFC 5952 Validated",
    },
    {
      id: "vlsm",
      title: "VLSM Variable Subnetting",
      desc: "Allocate distinct subnets tailored to arbitrary host requirements. Prevents IP waste with automatic capacity exhaustion monitoring and warning heuristics.",
      icon: Split,
      color: "from-brand-purple to-purple-600",
      tag: "Optimal Efficiency",
    },
    {
      id: "supernet",
      title: "CIDR Route Summarization",
      desc: "Consolidate multiple routing table entries into optimal CIDR supernets with automated boundary scanning and contiguous subnet validation.",
      icon: GitMerge,
      color: "from-brand-sky to-cyan-500",
      tag: "Route Aggregator",
    },
    {
      id: "binary",
      title: "Binary Bit Matrix Visualizer",
      desc: "High-contrast visual bit breakdown distinguishing network prefix bits from host bits with interactive powers-of-two positional values.",
      icon: Binary,
      color: "from-amber-500 to-amber-600",
      tag: "Bit-Level Transparency",
    },
    {
      id: "ipv4",
      title: "CSV Export & Clipboard Portability",
      desc: "Seamless one-click export of subnet allocation plans to CSV format for direct integration into Excel, ServiceNow, NetBox, or Terraform configurations.",
      icon: FileSpreadsheet,
      color: "from-emerald-500 to-teal-600",
      tag: "Export Ready",
    },
  ];

  return (
    <section id="features" className="py-24 relative overflow-hidden">
      {/* Ambient background blur */}
      <div className="absolute bottom-10 right-10 w-[500px] h-[400px] bg-brand-cyan/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card border border-brand-cyan/30 text-xs font-semibold text-brand-cyan mb-4">
            Built for Network Engineers & Architects
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Engineered for Precision & Speed
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-3">
            Every calculator has been crafted to deliver mathematically verified calculations, zero latency, and production-grade export tools.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                onClick={() => {
                  onSelectFeature(feat.id);
                  const el = document.getElementById("playground");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="group p-8 rounded-3xl glass-card glass-card-hover cursor-pointer relative overflow-hidden flex flex-col justify-between"
              >
                {/* Ambient card corner glow */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform pointer-events-none" />

                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${feat.color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-mono font-medium px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400">
                      {feat.tag}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-brand-purple transition-colors">
                    {feat.title}
                  </h3>

                  <p className="text-slate-400 text-sm leading-relaxed">
                    {feat.desc}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-brand-purple group-hover:text-cyan-300 transition-colors">
                  <span>Open Interactive Tool &rarr;</span>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

