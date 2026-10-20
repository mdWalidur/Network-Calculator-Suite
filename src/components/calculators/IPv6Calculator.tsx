"use client";

import React, { useState } from "react";
import { calculateIPv6, IPv6CalculationResult } from "@/lib/calculator";
import { Globe2, Copy, Check, AlertCircle, Cpu } from "lucide-react";

export function IPv6Calculator() {
  const [ipv6Input, setIpv6Input] = useState("2001:db8::");
  const [prefix, setPrefix] = useState(64);
  const [result, setResult] = useState<IPv6CalculationResult | null>(() => {
    try {
      return calculateIPv6("2001:db8::", 64);
    } catch {
      return null;
    }
  });
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCalculate = () => {
    setError(null);
    try {
      const res = calculateIPv6(ipv6Input, prefix);
      setResult(res);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Invalid IPv6 address");
      }
      setResult(null);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const text = [
      "=== IPv6 Calculation Summary ===",
      `Network: ${result.network}`,
      `RFC 5952 Compressed: ${result.compressed}`,
      `Full Expanded: ${result.fullExpanded}`,
      `Prefix Length: /${result.prefix}`,
    ].join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Input Configuration */}
      <div className="glass-card rounded-2xl p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-brand-cyan" />
              IPv6 Subnetting & Address Analysis
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              RFC 5952 compliant compression, full 128-bit expansion, and prefix masking.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCalculate}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-sky hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-bold text-sm transition-all shadow-glow-cyan"
            >
              Calculate
            </button>
            <button
              onClick={handleCopy}
              disabled={!result}
              className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 font-medium text-sm transition-all disabled:opacity-40 flex items-center gap-2"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              IPv6 Address / Network
            </label>
            <input
              type="text"
              value={ipv6Input}
              onChange={(e) => setIpv6Input(e.target.value)}
              placeholder="e.g., 2001:db8:: or fe80::1"
              className="w-full px-4 py-3 rounded-xl glass-input font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Prefix Length
            </label>
            <select
              value={prefix}
              onChange={(e) => setPrefix(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl glass-input text-sm"
            >
              <option value={32} className="bg-slate-900 text-white">/32 (ISP Allocation)</option>
              <option value={48} className="bg-slate-900 text-white">/48 (Enterprise Site)</option>
              <option value={56} className="bg-slate-900 text-white">/56 (Sub-site / Small Org)</option>
              <option value={60} className="bg-slate-900 text-white">/60 (Customer Edge)</option>
              <option value={64} className="bg-slate-900 text-white">/64 (Standard SLAAC Subnet)</option>
              <option value={96} className="bg-slate-900 text-white">/96 (IPv4-Mapped / NAT64)</option>
              <option value={112} className="bg-slate-900 text-white">/112 (Subnet Division)</option>
              <option value={120} className="bg-slate-900 text-white">/120</option>
              <option value={126} className="bg-slate-900 text-white">/126 (P2P Inter-Router)</option>
              <option value={127} className="bg-slate-900 text-white">/127 (RFC 6164 P2P Links)</option>
              <option value={128} className="bg-slate-900 text-white">/128 (Host Loopback)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results View */}
      {result && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="glass-card rounded-2xl p-6 border-l-4 border-l-brand-cyan space-y-2">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">
                Network Address (Masked)
              </span>
              <span className="text-xl font-bold font-mono text-cyan-300 block break-all">
                {result.network}
              </span>
              <p className="text-xs text-slate-400">
                Calculated by masking host bits beyond bit {result.prefix}.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 border-l-4 border-l-brand-purple space-y-2">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">
                RFC 5952 Canonical Compression
              </span>
              <span className="text-xl font-bold font-mono text-purple-300 block break-all">
                {result.compressed}
              </span>
              <p className="text-xs text-slate-400">
                Longest sequence of 0-hextets replaced by &quot;::&quot; with lowercase hex.
              </p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Cpu className="w-4 h-4 text-brand-sky" />
              Full 128-Bit Uncompressed Notation
            </div>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 font-mono text-xs sm:text-sm text-slate-300 break-all leading-relaxed">
              {result.fullExpanded}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

