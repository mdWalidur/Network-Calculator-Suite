"use client";

import React, { useEffect, useRef } from "react";
import { X, ExternalLink, ShieldCheck, CheckCircle2 } from "lucide-react";

interface DocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DocsModal({ isOpen, onClose }: DocsModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="docs-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
    >
      <div
        ref={dialogRef}
        className="w-full max-w-2xl bg-white border border-slate-300 rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 id="docs-modal-title" className="text-base font-bold text-slate-900">
              Technical Standards & Architectural Specifications
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Network Calculator Suite — Implementation references and RFC standards.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 leading-relaxed">
          {/* Engineering Integrity */}
          <div className="p-4 rounded-md bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>100% Client-Side Evaluation</span>
            </div>
            <p>
              All IP mathematical operations, bitwise boundary evaluations, and VLSM allocations execute locally within your browser using synchronous JavaScript/WebAssembly routines. No IP addresses or topology configurations are ever transmitted to any remote servers.
            </p>
          </div>

          {/* RFC Compliance Standards */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              Governing Internet Engineering Standards
            </h3>
            <ul className="space-y-2.5">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 font-semibold">RFC 1918: </strong>
                  <span>Defines private address allocations (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16). Verified during subnet classification.</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 font-semibold">RFC 4632: </strong>
                  <span>Classless Inter-domain Routing (CIDR) architecture. Powers prefix masking, wildcard generation, and route summarization.</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 font-semibold">RFC 5952: </strong>
                  <span>Canonical text representation of IPv6 addresses. Enforces lowercase hexadecimal, suppression of leading zeros, and longest-zero-run compression.</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 font-semibold">RFC 3021: </strong>
                  <span>31-bit prefixes on IPv4 point-to-point links. Accurately handles 2-host subnets where traditional broadcast/network restrictions are relaxed.</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Developer Attribution */}
          <div className="pt-4 border-t border-slate-200">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2">
              Engineering Attribution
            </h3>
            <p>
              Developed by <strong className="text-slate-900">Md Walidur Rahman</strong>, dedicated to providing network engineers, cloud systems administrators, and IT students with high-speed, reliable, distraction-free calculation instruments.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="btn-primary text-xs"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

