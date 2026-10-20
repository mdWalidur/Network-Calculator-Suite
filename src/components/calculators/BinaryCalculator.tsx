"use client";

import React, { useState, useId } from "react";
import { calculateBinary, BinaryBreakdown } from "@/lib/calculator";
import { Copy, Check, AlertCircle } from "lucide-react";

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
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const ipInputId = useId();
  const prefixId = useId();

  const handleCalculate = (ip = ipInput, p = prefix) => {
    setError(null);
    try {
      const res = calculateBinary(ip, p);
      setResult(res);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error generating binary representation. Check IP address.");
      }
      setResult(null);
    }
  };

  const handlePreset = (ip: string, p: number) => {
    setIpInput(ip);
    setPrefix(p);
    handleCalculate(ip, p);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setStatusMessage(`Copied to clipboard.`);
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
      <section aria-labelledby="binary-input-heading" className="panel p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-workspace-200 gap-3">
          <div>
            <h2 id="binary-input-heading" className="text-base font-bold text-slate-900">
              Binary Bit Breakdown & Subnet Boundary
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Visualize exact 32-bit boundaries, bit positional powers of 2, and network vs host bit distribution.
            </p>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Presets:</span>
            <button
              type="button"
              onClick={() => handlePreset("192.168.1.10", 24)}
              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] transition-colors"
            >
              Class C /24
            </button>
            <button
              type="button"
              onClick={() => handlePreset("10.50.100.1", 19)}
              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] transition-colors"
            >
              Non-Octet /19
            </button>
            <button
              type="button"
              onClick={() => handlePreset("172.16.5.1", 30)}
              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] transition-colors"
            >
              P2P Link /30
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

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCalculate();
          }}
          className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <div>
            <label htmlFor={ipInputId} className="block text-xs font-semibold text-slate-700 mb-1.5">
              IPv4 Address
            </label>
            <input
              id={ipInputId}
              type="text"
              value={ipInput}
              onChange={(e) => {
                setIpInput(e.target.value);
                handleCalculate(e.target.value, prefix);
              }}
              placeholder="e.g. 192.168.1.10"
              className="eng-input font-mono"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">Standard dotted decimal IP address</span>
          </div>

          <div>
            <label htmlFor={prefixId} className="block text-xs font-semibold text-slate-700 mb-1.5">
              Subnet Prefix Length
            </label>
            <select
              id={prefixId}
              value={prefix}
              onChange={(e) => {
                const nextP = Number(e.target.value);
                setPrefix(nextP);
                handleCalculate(ipInput, nextP);
              }}
              className="eng-input font-mono"
            >
              {Array.from({ length: 33 }, (_, i) => i).map((p) => (
                <option key={p} value={p}>
                  /{p} ({p} Network bits • {32 - p} Host bits)
                </option>
              ))}
            </select>
            <span className="text-[11px] text-slate-500 mt-1 block">Boundary between network & host bits</span>
          </div>
        </form>
      </section>

      {/* Results Workspace */}
      {result && (
        <div className="space-y-6">
          {/* Key Address Metrics Bar */}
          <section aria-label="Binary Parameters Overview" className="panel p-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-500 font-medium block">Decimal IP Address</span>
                <span className="font-mono font-bold text-slate-900 text-sm block">
                  {result.ip}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 font-medium block">Subnet Network</span>
                <span className="font-mono font-bold text-slate-900 text-sm block">
                  {result.network}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 font-medium block">Subnet Mask</span>
                <span className="font-mono font-bold text-slate-900 text-sm block">
                  {result.mask}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 font-medium block">Wildcard Mask</span>
                <span className="font-mono font-bold text-slate-900 text-sm block">
                  {result.wildcard}
                </span>
              </div>
            </div>

            {/* Legend & Count */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-blue-700 border border-blue-800 inline-block" />
                  <span className="text-slate-700 font-medium">Network Bit ({result.prefix} bits)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-slate-200 border border-slate-300 inline-block" />
                  <span className="text-slate-700 font-medium">Host Bit ({32 - result.prefix} bits)</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const binFull = result.octets.map((o) => o.binaryString).join(".");
                  copyToClipboard(binFull, "binary-string");
                }}
                className="btn-copy"
                title="Copy Full 32-bit Binary String"
              >
                {copiedKey === "binary-string" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-500" />}
                <span>{copiedKey === "binary-string" ? "Copied" : "Copy 32-Bit String"}</span>
              </button>
            </div>
          </section>

          {/* 4 Octets Visual Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.octets.map((oct) => (
              <section
                key={oct.octetIndex}
                aria-label={`Octet ${oct.octetIndex}`}
                className="panel p-4 space-y-3"
              >
                <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100">
                  <span className="font-bold uppercase tracking-wider text-slate-600">
                    Octet {oct.octetIndex}
                  </span>
                  <div className="font-mono text-xs">
                    <span className="text-slate-500">Decimal: </span>
                    <strong className="text-slate-900 font-bold">{oct.value}</strong>
                    <span className="text-slate-400 mx-1">•</span>
                    <span className="text-slate-500">Hex: </span>
                    <strong className="text-slate-900 font-bold">0x{oct.value.toString(16).toUpperCase().padStart(2, "0")}</strong>
                  </div>
                </div>

                {/* 8 Bits Table */}
                <div className="grid grid-cols-8 gap-1 text-center font-mono">
                  {oct.bits.map((b, i) => (
                    <div
                      key={i}
                      className={`py-2 px-1 rounded border text-center transition-colors ${
                        b.isNetwork
                          ? "bg-blue-50 border-blue-300 text-blue-900"
                          : "bg-slate-50 border-slate-200 text-slate-700"
                      }`}
                    >
                      <span className="text-sm font-bold block">{b.bit}</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        {Math.pow(2, 7 - i)}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
