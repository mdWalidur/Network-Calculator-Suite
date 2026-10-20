"use client";

import React from "react";
import { IPv4Calculator } from "../calculators/IPv4Calculator";
import { IPv6Calculator } from "../calculators/IPv6Calculator";
import { VLSMCalculator } from "../calculators/VLSMCalculator";
import { SupernetCalculator } from "../calculators/SupernetCalculator";
import { BinaryCalculator } from "../calculators/BinaryCalculator";
import { Network, Globe2, Split, GitMerge, Binary } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PlaygroundProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function InteractivePlayground({ activeTab, onTabChange }: PlaygroundProps) {
  const tabs = [
    {
      id: "ipv4",
      label: "IPv4 Subnetting",
      icon: Network,
      tag: "CIDR / DHCP",
      desc: "Classical subnet division, host ranges, and Cisco ACL wildcard helpers",
    },
    {
      id: "ipv6",
      label: "IPv6 Calculator",
      icon: Globe2,
      tag: "RFC 5952",
      desc: "Full 128-bit expansion, canonical compression, and network prefix masking",
    },
    {
      id: "vlsm",
      label: "VLSM Planning",
      icon: Split,
      tag: "Variable Length",
      desc: "Multi-network allocation based on custom host requirements with capacity checks",
    },
    {
      id: "supernet",
      label: "Route Aggregator",
      icon: GitMerge,
      tag: "Supernetting",
      desc: "Combine multiple contiguous subnets into optimal single routing table routes",
    },
    {
      id: "binary",
      label: "Binary Matrix",
      icon: Binary,
      tag: "Bit-Level",
      desc: "Octet-by-octet breakdown visually highlighting network vs host bits",
    },
  ];

  return (
    <section id="playground" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-card border border-brand-purple/30 text-xs font-semibold text-brand-purple mb-4">
            Interactive Calculators Suite
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Comprehensive Network Tooling
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-3">
            Select a specialized module below to execute instant calculations, preview routing allocations, and export production-ready CSV tables.
          </p>
        </div>

        {/* Tab Selection Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none justify-start lg:justify-center mb-10">
          <div className="p-1.5 rounded-2xl glass-card border border-white/10 flex items-center gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-brand-purple to-brand-indigo text-white shadow-glow-purple"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{tab.label}</span>
                  <span
                    className={`hidden sm:inline text-[10px] px-2 py-0.5 rounded-md font-mono ${
                      isActive ? "bg-white/20 text-white" : "bg-white/5 text-slate-500"
                    }`}
                  >
                    {tab.tag}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Calculator Content Container */}
        <div className="relative min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              {activeTab === "ipv4" && <IPv4Calculator />}
              {activeTab === "ipv6" && <IPv6Calculator />}
              {activeTab === "vlsm" && <VLSMCalculator />}
              {activeTab === "supernet" && <SupernetCalculator />}
              {activeTab === "binary" && <BinaryCalculator />}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}

