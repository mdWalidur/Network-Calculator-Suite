"use client";

import React, { useEffect } from "react";
import { X, Network, Globe2, Split, GitMerge, Binary, ExternalLink, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="about-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        >
          {/* Backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-xl transition-opacity"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto glass-card rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl space-y-6 z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-purple to-brand-cyan flex items-center justify-center text-white shadow-glow-purple">
                  <Network className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="about-modal-title" className="text-xl font-bold text-white">
                    Network Calculator Suite
                  </h3>
                  <span className="text-xs font-mono text-brand-purple font-medium">
                    v1.0.0 &bull; Architecture & Documentation
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close documentation modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Start Guide */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-white">
                Platform Architecture
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                Network Calculator Suite is a production-grade, zero-latency subnetting suite designed for network architects, sysadmins, DevOps engineers, and certification candidates. All computations are strictly processed inside the client WebAssembly / JS engine—no IP addresses, subnet schemas, or VLAN identifiers ever touch an external server.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Network className="w-4 h-4 text-brand-purple" />
                    IPv4 Subnetting & CIDR
                  </span>
                  <p className="text-xs text-slate-400">
                    Calculates mask, wildcard, usable hosts (2^n − 2), broadcasts, DHCP ranges, and Cisco ACL helpers.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Globe2 className="w-4 h-4 text-brand-cyan" />
                    IPv6 Engine
                  </span>
                  <p className="text-xs text-slate-400">
                    Expands addresses to 128-bit hexadecimal and generates RFC 5952 canonical compressed forms.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Split className="w-4 h-4 text-brand-sky" />
                    VLSM Allocation
                  </span>
                  <p className="text-xs text-slate-400">
                    Hierarchically plans subnets from largest to smallest with capacity warning heuristics.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <GitMerge className="w-4 h-4 text-amber-400" />
                    Route Aggregation
                  </span>
                  <p className="text-xs text-slate-400">
                    Finds the longest common prefix across routing table entries for BGP / OSPF route optimization.
                  </p>
                </div>
              </div>
            </div>

            {/* Developer Attribution Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-tr from-brand-purple/10 to-brand-cyan/10 border border-white/10 space-y-2">
              <span className="text-xs uppercase tracking-wider text-brand-cyan font-bold block">
                Developer & Architect
              </span>
              <h4 className="text-base font-bold text-white">
                Md Walidur Rahman
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                IT Expert, Network Engineer, AWS Cloud and Web tools developer. Focused on high-performance infrastructure, cloud networking, and modern developer utilities.
              </p>
            </div>

            {/* Footer Buttons */}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-mono">
                RFC 1918 &bull; RFC 5952 &bull; RFC 3021
              </span>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-all"
              >
                Close Documentation
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

