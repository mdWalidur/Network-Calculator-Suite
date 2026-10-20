"use client";

import React, { useState, useId } from "react";
import { calculateIPv6, IPv6CalculationResult } from "@/lib/calculator";
import { Copy, Check, AlertCircle } from "lucide-react";

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
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const ipv6InputId = useId();
  const prefixId = useId();

  const handleCalculate = (input = ipv6Input, p = prefix) => {
    setError(null);
    try {
      const res = calculateIPv6(input, p);
      setResult(res);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Invalid IPv6 address. Ensure valid hexadecimal notation.");
      }
      setResult(null);
    }
  };

  const handlePreset = (addr: string, p: number) => {
    setIpv6Input(addr);
    setPrefix(p);
    handleCalculate(addr, p);
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
      <section aria-labelledby="ipv6-input-heading" className="panel p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-workspace-200 gap-3">
          <div>
            <h2 id="ipv6-input-heading" className="text-base font-bold text-slate-900">
              IPv6 Address & Prefix Analysis
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              RFC 5952 canonical compression, full 128-bit uncompressed expansion, and prefix boundary calculation.
            </p>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Presets:</span>
            <button
              type="button"
              onClick={() => handlePreset("2001:db8::", 64)}
              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] transition-colors"
            >
              Doc /64 (SLAAC)
            </button>
            <button
              type="button"
              onClick={() => handlePreset("2001:db8:85a3::", 48)}
              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] transition-colors"
            >
              Enterprise /48
            </button>
            <button
              type="button"
              onClick={() => handlePreset("fe80::1", 64)}
              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] transition-colors"
            >
              Link-Local
            </button>
          </div>
        </div>

        {error && (
          <div role="alert" className="mt-4 p-3.5 rounded-md bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold">Calculation Error: </strong>
              <span>{error}</span>
            </div>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCalculate();
          }}
          className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="md:col-span-2">
            <label htmlFor={ipv6InputId} className="block text-xs font-semibold text-slate-700 mb-1.5">
              IPv6 Address or Network
            </label>
            <input
              id={ipv6InputId}
              type="text"
              value={ipv6Input}
              onChange={(e) => {
                setIpv6Input(e.target.value);
                handleCalculate(e.target.value, prefix);
              }}
              placeholder="e.g. 2001:db8:abcd:0012::0"
              className="eng-input font-mono"
              autoComplete="off"
              spellCheck={false}
            />
            <span className="text-[11px] text-slate-500 mt-1 block">Hexadecimal colon-separated 128-bit address</span>
          </div>

          <div>
            <label htmlFor={prefixId} className="block text-xs font-semibold text-slate-700 mb-1.5">
              Prefix Length
            </label>
            <select
              id={prefixId}
              value={prefix}
              onChange={(e) => {
                const nextP = Number(e.target.value);
                setPrefix(nextP);
                handleCalculate(ipv6Input, nextP);
              }}
              className="eng-input font-mono"
            >
              <option value={32}>/32 (RIR to ISP Allocation)</option>
              <option value={48}>/48 (Enterprise Site Allocation)</option>
              <option value={56}>/56 (Sub-site / SOHO)</option>
              <option value={60}>/60 (Residential Customer Edge)</option>
              <option value={64}>/64 (Standard SLAAC Subnet)</option>
              <option value={96}>/96 (IPv4-Mapped / NAT64)</option>
              <option value={112}>/112 (Point-to-Point Division)</option>
              <option value={120}>/120</option>
              <option value={126}>/126 (P2P Inter-Router Link)</option>
              <option value={127}>/127 (RFC 6164 Inter-Router Links)</option>
              <option value={128}>/128 (Single Host / Loopback)</option>
            </select>
            <span className="text-[11px] text-slate-500 mt-1 block">Network routing prefix</span>
          </div>
        </form>
      </section>

      {/* Results Workspace */}
      {result && (
        <div className="space-y-6">
          {/* Key Formats Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* RFC 5952 Canonical */}
            <div className="panel p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  RFC 5952 Canonical Compressed Form
                </span>
                <button
                  onClick={() => copyToClipboard(result.compressed, "canonical")}
                  className="btn-copy"
                  title="Copy Canonical Address"
                >
                  {copiedKey === "canonical" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === "canonical" ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200 font-mono text-sm font-bold text-slate-900 break-all">
                {result.compressed}
              </div>
              <p className="text-[11px] text-slate-500">
                Lowercase hex with longest run of consecutive 0-hextets replaced by &quot;::&quot;.
              </p>
            </div>

            {/* Network Prefix Masked */}
            <div className="panel p-5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Subnet Routing Network (Masked)
                </span>
                <button
                  onClick={() => copyToClipboard(`${result.networkCompressed}/${result.prefix}`, "network")}
                  className="btn-copy"
                  title="Copy Subnet Network"
                >
                  {copiedKey === "network" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === "network" ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <div className="p-2.5 rounded bg-slate-50 border border-slate-200 font-mono text-sm font-bold text-blue-700 break-all">
                {result.networkCompressed}/{result.prefix}
              </div>
              <p className="text-[11px] text-slate-500">
                Host bits beyond bit position {result.prefix} zeroed out.
              </p>
            </div>
          </div>

          {/* Full Expanded 128-Bit Representation */}
          <section aria-labelledby="expanded-heading" className="panel p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 id="expanded-heading" className="text-sm font-bold text-slate-900">
                  Full 128-Bit Uncompressed Notation
                </h3>
                <p className="text-xs text-slate-500">
                  All 8 hextets zero-padded to 4 hexadecimal digits (32 hex characters total).
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(result.fullExpanded, "expanded")}
                className="btn-copy"
                title="Copy Uncompressed Form"
              >
                {copiedKey === "expanded" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === "expanded" ? "Copied" : "Copy"}</span>
              </button>
            </div>

            <div className="p-3 rounded bg-slate-50 border border-slate-200 font-mono text-xs sm:text-sm text-slate-800 break-all leading-relaxed">
              {result.fullExpanded}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
