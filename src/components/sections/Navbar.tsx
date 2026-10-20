"use client";

import React, { useState } from "react";
import { Network, Sparkles, HelpCircle, Layers, ShieldCheck } from "lucide-react";

interface NavbarProps {
  onOpenAbout: () => void;
  onSelectTab: (tab: string) => void;
  activeTab: string;
}

export function Navbar({ onOpenAbout, onSelectTab, activeTab }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "ipv4", label: "IPv4 Subnetting" },
    { id: "ipv6", label: "IPv6 Engine" },
    { id: "vlsm", label: "VLSM Planner" },
    { id: "supernet", label: "Route Aggregator" },
    { id: "binary", label: "Binary View" },
  ];

  const handleNavClick = (id: string) => {
    onSelectTab(id);
    setMobileMenuOpen(false);
    const el = document.getElementById("playground");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-background/70 border-b border-white/10 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <a href="#hero" className="flex items-center gap-3.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-purple to-brand-cyan flex items-center justify-center shadow-glow-purple group-hover:scale-105 transition-transform">
            <Network className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-lg text-white tracking-tight flex items-center gap-1.5">
              Network Calculator
              <span className="text-xs px-2 py-0.5 rounded-full bg-brand-purple/20 text-brand-purple border border-brand-purple/30 font-mono font-medium">
                SUITE
              </span>
            </span>
            <p className="text-[11px] text-slate-400 font-medium tracking-wide">
              Enterprise Network Architecture
            </p>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-full bg-slate-900/60 border border-white/5">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === item.id
                  ? "bg-brand-purple text-white shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right CTA / About Trigger */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={onOpenAbout}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 border border-white/10 transition-all flex items-center gap-1.5"
            aria-label="Open About & Documentation Dialog"
          >
            <HelpCircle className="w-4 h-4 text-brand-purple" />
            <span>About / Docs</span>
          </button>

          <a
            href="#playground"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-purple to-brand-indigo hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs transition-all shadow-glow-purple flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Launch Suite</span>
          </a>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 border border-white/10"
          aria-label="Toggle navigation menu"
        >
          <Layers className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-3 pb-6 border-b border-white/10 bg-surface/95 backdrop-blur-2xl space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === item.id
                  ? "bg-brand-purple text-white"
                  : "text-slate-300 hover:bg-white/5"
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-2 border-t border-white/10 flex gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAbout();
              }}
              className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-slate-300 text-center"
            >
              About / Docs
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

