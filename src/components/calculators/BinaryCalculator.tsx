"use client";

import React, { useState } from "react";
import { calculateBinary, BinaryBreakdown } from "@/lib/calculator";
import { Binary, Copy, Check, AlertCircle } from "lucide-react";

export function BinaryCalculator() {
  const [ipInput, setIpInput] = useState("192.168.1.10");
  const [prefix, setPrefix] = useState(24);
  const [result, setResult] = useState<BinaryBreakdown | null>(() => {
    try {
      return calculateBinary("192.168.1.10", 24);
    } catch {
      return null;
    }
  });
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCalculate = () => {
    setError(null);
    try {
      const res = calculateBinary(ipInput, prefix);
      setResult(res);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error generating binary breakdown");
      }
      setResult(null);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const text = [
      "=== Binary Visualization Breakdown ===",
      `IP Address: ${result.ip}`,
      `Network: ${result.network}`,
      `Subnet Mask: ${result.mask}`,
      `Wildcard: ${result.wildcard}`,
      ...result.octets.map((o) => `Octet ${o.octetIndex} (${o.value}): ${o.binaryString}`),
    ].join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Input Parameters */}
      <div className="glass-card rounded-2xl p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Binary className="w-5 h-5 text-amber-400" />
              Binary Bit-Level Visualization
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Visualize exact bit boundaries, distinguishing network bits from host bits.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCalculate}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm transition-all shadow-md"
            >
              Visualize
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              IPv4 Address
            </label>
            <input
              type="text"
              value={ipInput}
              onChange={(e) => setIpInput(e.target.value)}
              placeholder="e.g., 192.168.1.10"
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
              {Array.from({ length: 31 }, (_, i) => i + 1).map((p) => (
                <option key={p} value={p} className="bg-slate-900 text-white">
                  /{p}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Bit Matrix Output */}
      {result && (
        <div className="space-y-6">
          {/* Metadata Top Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-card rounded-2xl p-5 border-l-4 border-l-brand-purple">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">
                Network Address
              </span>
              <span className="text-xl font-bold font-mono text-white mt-1 block">
                {result.network}
              </span>
            </div>

            <div className="glass-card rounded-2xl p-5 border-l-4 border-l-brand-cyan">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">
                Subnet Mask
              </span>
              <span className="text-xl font-bold font-mono text-cyan-300 mt-1 block">
                {result.mask}
              </span>
            </div>

            <div className="glass-card rounded-2xl p-5 border-l-4 border-l-amber-500">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">
                Wildcard Mask
              </span>
              <span className="text-xl font-bold font-mono text-amber-300 mt-1 block">
                {result.wildcard}
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 text-xs font-semibold px-2">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-amber-400 inline-block shadow-sm" />
              <span className="text-slate-300">Network Bit (Prefix)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-cyan-400 inline-block shadow-sm" />
              <span className="text-slate-300">Host Bit</span>
            </div>
          </div>

          {/* Octet Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.octets.map((oct) => (
              <div
                key={oct.octetIndex}
                className="glass-card rounded-2xl p-5 space-y-3 border border-white/10"
              >
                <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                  <span className="font-semibold text-slate-400 uppercase tracking-wider">
                    Octet {oct.octetIndex}
                  </span>
                  <span className="font-mono font-bold text-white text-sm">
                    {oct.value} (Dec)
                  </span>
                </div>

                <div className="flex justify-between gap-1 sm:gap-2">
                  {oct.bits.map((b, i) => (
                    <div
                      key={i}
                      className={`flex-1 flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                        b.isNetwork
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                          : "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                      }`}
                    >
                      <span className="font-mono text-base font-extrabold">{b.bit}</span>
                      <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                        2^{7 - i}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

