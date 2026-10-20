"use client";

import React, { useState } from "react";
import { parseCIDR, summarizeRoutes, SupernetResult } from "@/lib/calculator";
import { GitMerge, Copy, Check, AlertCircle, Sparkles } from "lucide-react";

export function SupernetCalculator() {
  const [routesInput, setRoutesInput] = useState(
    "192.168.0.0/24\n192.168.1.0/24\n192.168.2.0/24\n192.168.3.0/24"
  );
  const [result, setResult] = useState<SupernetResult | null>(() => {
    try {
      const parsed = [
        parseCIDR("192.168.0.0/24"),
        parseCIDR("192.168.1.0/24"),
        parseCIDR("192.168.2.0/24"),
        parseCIDR("192.168.3.0/24"),
      ];
      return summarizeRoutes(parsed);
    } catch {
      return null;
    }
  });
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSummarize = () => {
    setError(null);
    try {
      const lines = routesInput
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

      if (lines.length === 0) {
        throw new Error("Enter at least one CIDR network (e.g., 192.168.0.0/24)");
      }

      const parsedRoutes = lines.map(parseCIDR);
      const res = summarizeRoutes(parsedRoutes);
      setResult(res);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error calculating route summarization");
      }
      setResult(null);
    }
  };

  const handleLoadExample = () => {
    setRoutesInput("10.0.0.0/24\n10.0.1.0/24\n10.0.2.0/24\n10.0.3.0/24");
    setTimeout(handleSummarize, 0);
  };

  const handleCopy = () => {
    if (!result) return;
    const text = [
      "=== Supernet / Route Aggregation Summary ===",
      `Aggregated Route: ${result.summary}`,
      `Address Span: ${result.startIP} - ${result.endIP}`,
      `Total Spanning Addresses: ${result.spanningAddresses.toLocaleString()}`,
      `Input Networks Combined: ${result.inputCount}`,
    ].join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Route Inputs */}
      <div className="glass-card rounded-2xl p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <GitMerge className="w-5 h-5 text-brand-sky" />
              Route Aggregation & Supernetting
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Summarize multiple contiguous routing table entries into optimal CIDR supernets.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleLoadExample}
              className="px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
              Load Example
            </button>
            <button
              onClick={handleSummarize}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-sky to-brand-cyan hover:from-sky-400 hover:to-cyan-400 text-slate-950 font-bold text-sm transition-all shadow-glow-cyan"
            >
              Aggregate Routes
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Networks to Summarize (One CIDR route per line)
          </label>
          <textarea
            rows={5}
            value={routesInput}
            onChange={(e) => setRoutesInput(e.target.value)}
            placeholder="192.168.0.0/24&#10;192.168.1.0/24&#10;192.168.2.0/24"
            className="w-full px-4 py-3 rounded-xl glass-input font-mono text-sm leading-relaxed"
          />
        </div>
      </div>

      {/* Results Box */}
      {result && (
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 md:p-8 border-l-4 border-l-brand-sky space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">
                  Optimal Summary Route
                </span>
                <span className="text-3xl font-extrabold font-mono text-cyan-300 mt-1 block">
                  {result.summary}
                </span>
              </div>
              <button
                onClick={handleCopy}
                className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium text-xs transition-all flex items-center gap-2 self-start sm:self-auto"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Copied" : "Copy Route"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-sm">
              <div className="p-4 rounded-xl bg-slate-950/40 border border-white/5">
                <span className="text-xs text-slate-500 uppercase font-semibold block">
                  Address Range Covered
                </span>
                <span className="font-mono text-white font-semibold mt-1 block">
                  {result.startIP} – {result.endIP}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/40 border border-white/5">
                <span className="text-xs text-slate-500 uppercase font-semibold block">
                  Total Spanned Addresses
                </span>
                <span className="font-mono text-brand-purple font-semibold mt-1 block">
                  {result.spanningAddresses.toLocaleString()} IPs
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/40 border border-white/5">
                <span className="text-xs text-slate-500 uppercase font-semibold block">
                  Routing Table Entries Saved
                </span>
                <span className="font-mono text-emerald-400 font-semibold mt-1 block">
                  {result.inputCount} routes &rarr; 1 route
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

