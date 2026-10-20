"use client";

import React from "react";
import { HeroCanvas } from "../canvas/HeroCanvas";
import { WebSearchWidget } from "../calculators/WebSearchWidget";
import { Sparkles, Shield, Zap, ArrowDown, Cpu, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

interface HeroSectionProps {
  onExploreClick: () => void;
}

export function HeroSection({ onExploreClick }: HeroSectionProps) {
  return (
    <section id="hero" className="relative min-h-[90vh] flex flex-col justify-center pt-8 pb-16 overflow-hidden">
      {/* Background ambient radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-brand-purple/20 via-brand-indigo/15 to-brand-cyan/20 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Hero Typography & CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 space-y-6 text-center lg:text-left pt-4 lg:pt-0"
          >
            {/* Version & Security Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card border-brand-purple/30 text-xs font-semibold text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>v1.0.0 Production Flagship Suite</span>
              <span className="text-slate-600">|</span>
              <span className="text-brand-purple font-mono">100% Client-Side Privacy</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
              Architect, Calculate, and Aggregate{" "}
              <span className="text-gradient-brand">Enterprise Networks</span> in Real Time.
            </h1>

            {/* Value Proposition */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              The next-generation network engineering platform. Instant IPv4/IPv6 subnetting, automated VLSM allocation, route aggregation, and bit-level binary visualization with zero latency.
            </p>

            {/* Primary & Secondary Call to Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onExploreClick}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-purple via-brand-indigo to-brand-cyan hover:opacity-95 text-white font-bold text-sm sm:text-base transition-all shadow-glow-purple flex items-center justify-center gap-2.5 group"
              >
                <Sparkles className="w-5 h-5 text-white group-hover:rotate-12 transition-transform" />
                <span>Launch Interactive Suite</span>
                <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
              </button>

              <a
                href="#features"
                className="w-full sm:w-auto px-7 py-4 rounded-2xl glass-card hover:bg-white/10 text-slate-200 font-semibold text-sm sm:text-base transition-all text-center flex items-center justify-center gap-2 border border-white/15"
              >
                <span>Explore Capabilities</span>
              </a>
            </div>

            {/* Technical Trust & Validation Badges */}
            <div className="pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-cyan flex-shrink-0" />
                <span>RFC 1918 & 5952 Validated</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Zero Cloud Telemetry</span>
              </div>
              <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                <Zap className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Sub-Millisecond Engine</span>
              </div>
            </div>
          </motion.div>

          {/* Right 3D Interactive WebGL Hero Canvas */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            {/* The 3D Scene */}
            <HeroCanvas />

            {/* Subtle floating spatial chip */}
            <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl glass-card border border-white/10 shadow-2xl backdrop-blur-2xl flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-brand-purple">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">
                    Interactive Quantum Topology
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    60fps WebGL &bull; Mouse Parallax Reactive
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-mono text-cyan-400 font-semibold px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                ACTIVE
              </span>
            </div>
          </motion.div>

        </div>

        {/* Quick Web Search Bar in Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-12 pt-6 border-t border-white/5"
        >
          <div className="text-center mb-4">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Instant Engineering Search
            </span>
          </div>
          <WebSearchWidget />
        </motion.div>
      </div>
    </section>
  );
}

