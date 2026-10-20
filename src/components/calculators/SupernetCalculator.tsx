"use client";

import React, { useState, useId } from "react";
import { parseCIDR, summarizeRoutes, SupernetResult } from "@/lib/calculator";
import { Copy, Check, AlertCircle } from "lucide-react";

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
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const routesInputId = useId();

  const handleSummarize = (input = routesInput) => {
    setError(null);
    try {
      const lines = input
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

      if (lines.length === 0) {
        throw new Error("Enter at least one valid CIDR network prefix (e.g. 192.168.0.0/24).");
      }

      const parsedRoutes = lines.map(parseCIDR);
      const res = summarizeRoutes(parsedRoutes);
      setResult(res);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error summarizing routes. Ensure each line is in valid CIDR format.");
      }
      setResult(null);
    }
  };

  const handlePreset = (text: string) => {
    setRoutesInput(text);
    handleSummarize(text);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setStatusMessage(`Copied "${text}" to clipboard.`);
    setTimeout(() => {
      setCopiedKey(null);
      setStatusMessage(null);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="sr-only" role="status" aria-live="polite">
        {statusMessage}
      </div>

      {/* Input Configuration Panel */}
      <section aria-labelledby="supernet-input-heading" className="panel p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-workspace-200 gap-3">
          <div>
            <h2 id="supernet-input-heading" className="text-base font-bold text-slate-900">
              CIDR Route Summarization & Supernetting
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Aggregate multiple routing table entries into the smallest practical encompassing CIDR prefix.
            </p>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Presets:</span>
            <button
              type="button"
              onClick={() => handlePreset("192.168.0.0/24\n192.168.1.0/24\n192.168.2.0/24\n192.168.3.0/24")}
              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] transition-colors"
            >
              Four /24s → /22
            </button>
            <button
              type="button"
              onClick={() => handlePreset("10.1.0.0/24\n10.1.1.0/24\n10.1.2.0/24\n10.1.3.0/24\n10.1.4.0/24\n10.1.5.0/24\n10.1.6.0/24\n10.1.7.0/24")}
              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] transition-colors"
            >
              Eight /24s → /21
            </button>
          </div>
        </div>

        {error && (
          <div role="alert" className="mt-4 p-3.5 rounded-md bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold">Input Error: </strong>
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="mt-5 space-y-3">
          <label htmlFor={routesInputId} className="block text-xs font-semibold text-slate-700">
            Network Prefixes to Summarize (One CIDR route per line)
          </label>
          <textarea
            id={routesInputId}
            rows={5}
            value={routesInput}
            onChange={(e) => {
              setRoutesInput(e.target.value);
              handleSummarize(e.target.value);
            }}
            placeholder="192.168.0.0/24&#10;192.168.1.0/24&#10;192.168.2.0/24"
            className="eng-input font-mono text-xs sm:text-sm leading-relaxed"
            spellCheck={false}
          />
          <span className="text-[11px] text-slate-500 block">
            Enter network addresses in CIDR format (e.g. 192.168.0.0/24). The engine finds the longest common prefix covering all provided ranges.
          </span>
        </div>
      </section>

      {/* Results Workspace */}
      {result && (
        <section aria-labelledby="summary-result-heading" className="panel p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-workspace-200 gap-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Optimal Aggregate Route
              </span>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-2xl font-bold font-mono text-slate-900">
                  {result.summary}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(result.summary, "summary-route")}
                  className="btn-copy"
                  title="Copy Aggregate Route"
                >
                  {copiedKey === "summary-route" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                  )}
                  <span>{copiedKey === "summary-route" ? "Copied" : "Copy Route"}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                Table Reduction: {result.inputCount} routes → 1 route ({Math.round(((result.inputCount - 1) / result.inputCount) * 100)}% reduction)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-500 font-medium block">Spanned Address Range</span>
              <span className="font-mono font-bold text-slate-900 block text-xs sm:text-sm">
                {result.startIP} – {result.endIP}
              </span>
            </div>

            <div className="p-3.5 rounded bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-500 font-medium block">Total Spanned Capacity</span>
              <span className="font-mono font-bold text-slate-900 block text-xs sm:text-sm">
                {result.spanningAddresses.toLocaleString()} IP addresses
              </span>
            </div>

            <div className="p-3.5 rounded bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-slate-500 font-medium block">Subnet Mask of Aggregate</span>
              <span className="font-mono font-bold text-slate-900 block text-xs sm:text-sm">
                /{result.prefix}
              </span>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
