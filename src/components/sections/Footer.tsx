"use client";

import React from "react";
import { Network, ExternalLink, ShieldCheck, Heart } from "lucide-react";

interface FooterProps {
  onOpenAbout: () => void;
  onSelectTab: (tabId: string) => void;
}

export function Footer({ onOpenAbout, onSelectTab }: FooterProps) {
  return (
    <footer className="border-t border-white/10 bg-surface/80 backdrop-blur-xl pt-16 pb-12 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/5">
          
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-purple to-brand-cyan flex items-center justify-center shadow-glow-purple">
                <Network className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-lg text-white">
                Network Calculator Suite
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Professional, zero-latency subnetting and network architecture suite for network engineers, IT professionals, cloud architects, and students.
            </p>
            <div className="text-xs text-slate-400 pt-2">
              <p>
                Engineered with pride by{" "}
                <strong className="text-white">Md Walidur Rahman</strong> — IT Expert, Network Engineer, AWS Cloud and Web tools developer.
              </p>
            </div>
          </div>

          {/* Quick Calculators Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">
              Calculators
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <button
                  onClick={() => onSelectTab("ipv4")}
                  className="hover:text-white transition-colors"
                >
                  IPv4 Subnetting & CIDR
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab("ipv6")}
                  className="hover:text-white transition-colors"
                >
                  IPv6 RFC 5952 Calculator
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab("vlsm")}
                  className="hover:text-white transition-colors"
                >
                  VLSM Allocation Planner
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab("supernet")}
                  className="hover:text-white transition-colors"
                >
                  Route Aggregator
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab("binary")}
                  className="hover:text-white transition-colors"
                >
                  Binary Bit Visualizer
                </button>
              </li>
            </ul>
          </div>

          {/* Technical RFCs & Security Standards */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">
              Standards & RFCs
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <a
                  href="https://datatracker.ietf.org/doc/html/rfc1918"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-300 transition-colors inline-flex items-center gap-1.5"
                >
                  <span>RFC 1918 (Private IPv4)</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://datatracker.ietf.org/doc/html/rfc5952"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-300 transition-colors inline-flex items-center gap-1.5"
                >
                  <span>RFC 5952 (IPv6 Notation)</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://datatracker.ietf.org/doc/html/rfc3021"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-300 transition-colors inline-flex items-center gap-1.5"
                >
                  <span>RFC 3021 (/31 P2P Links)</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <button
                  onClick={onOpenAbout}
                  className="hover:text-white transition-colors inline-flex items-center gap-1.5 text-brand-purple"
                >
                  <span>About & Documentation</span>
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>
            &copy; {new Date().getFullYear()} Network Calculator Suite. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Client-Side Calculation Sandbox
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

