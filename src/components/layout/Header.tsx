"use client";

import React from "react";
import Link from "next/link";
import { Network, ShieldCheck, FileText } from "lucide-react";

interface HeaderProps {
  onOpenDocs?: () => void;
}

export function Header({ onOpenDocs }: HeaderProps) {
  return (
    <header className="border-b border-workspace-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Identity */}
          <Link href="/" className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded">
            <div className="w-8 h-8 rounded-md bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <Network className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-slate-900 tracking-tight">
                  Network Calculator
                </span>
                <span className="text-[11px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  Suite
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Professional IP Subnetting & Network Engineering Utilities
              </p>
            </div>
          </Link>

          {/* Quick Engineering Utilities & Metadata */}
          <div className="flex items-center gap-3 text-xs">
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-slate-600 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Client-Side Engine • Zero Telemetry</span>
            </div>

            {onOpenDocs && (
              <button
                onClick={onOpenDocs}
                className="btn-secondary text-xs"
                aria-label="Open Technical Standards & RFC Reference Guide"
              >
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>RFC Guide & Docs</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

