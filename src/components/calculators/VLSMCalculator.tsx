"use client";

import React, { useState } from "react";
import { calculateVLSM, VLSMCalculationResult } from "@/lib/calculator";
import { Split, Download, Copy, Check, AlertTriangle, AlertCircle } from "lucide-react";
import confetti from "canvas-confetti";

export function VLSMCalculator() {
  const [baseNetwork, setBaseNetwork] = useState("10.0.0.0");
  const [basePrefix, setBasePrefix] = useState(16);
  const [hostsStr, setHostsStr] = useState("500, 250, 100, 50, 25, 2");
  const [gatewayPref, setGatewayPref] = useState<"first" | "last">("first");

  const [result, setResult] = useState<VLSMCalculationResult | null>(() => {
    try {
      return calculateVLSM("10.0.0.0", 16, [500, 250, 100, 50, 25, 2], "first");
    } catch {
      return null;
    }
  });
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCalculate = () => {
    setError(null);
    try {
      const hosts = hostsStr
        .split(",")
        .map((x) => parseInt(x.trim(), 10))
        .filter((x) => !isNaN(x) && x > 0);

      if (hosts.length === 0) {
        throw new Error("Enter at least one host requirement (e.g., 100, 50, 25)");
      }

      const res = calculateVLSM(baseNetwork, basePrefix, hosts, gatewayPref);
      setResult(res);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error computing VLSM allocations");
      }
      setResult(null);
    }
  };

  const handleExportCSV = () => {
    if (!result) return;
    const rows = [
      ["#", "Requested Hosts", "Allocated Hosts", "Prefix", "Network", "First Usable", "Last Usable", "Broadcast", "Gateway"],
      ...result.allocations.map((a) => [
        a.id.toString(),
        a.requestedHosts.toString(),
        a.allocatedHosts.toString(),
        `/${a.prefix}`,
        a.network,
        a.firstUsable,
        a.lastUsable,
        a.broadcast,
        a.gateway,
      ]),
    ];
    const csvContent = rows.map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `vlsm-plan-${result.baseNetwork.replace(".", "_")}_${result.basePrefix}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
  };

  const handleCopyPlan = () => {
    if (!result) return;
    const lines = [
      "=== VLSM Allocation Plan ===",
      `Base: ${result.baseNetwork}/${result.basePrefix} (Capacity: ${result.baseCapacity.toLocaleString()} addresses)`,
      `Total Space Allocated: ${result.totalAllocated.toLocaleString()} addresses`,
      "",
      "#\tReq\tAlloc\tPrefix\tNetwork\tFirst Usable\tLast Usable\tBroadcast\tGateway",
      ...result.allocations.map(
        (a) => `${a.id}\t${a.requestedHosts}\t${a.allocatedHosts}\t/${a.prefix}\t${a.network}\t${a.firstUsable}\t${a.lastUsable}\t${a.broadcast}\t${a.gateway}`
      ),
    ];
    navigator.clipboard.writeText(lines.join("\n"));
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
              <Split className="w-5 h-5 text-brand-purple" />
              VLSM Multi-Subnet Allocation Planner
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Variable-length subnet mask generator sorting largest host requests first.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCalculate}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-indigo hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm transition-all shadow-glow-purple"
            >
              Generate Plan
            </button>
            <button
              onClick={handleExportCSV}
              disabled={!result}
              className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 font-medium text-sm transition-all disabled:opacity-40 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
            <button
              onClick={handleCopyPlan}
              disabled={!result}
              className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 font-medium text-sm transition-all disabled:opacity-40 flex items-center gap-2"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
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
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Root Base Network
            </label>
            <input
              type="text"
              value={baseNetwork}
              onChange={(e) => setBaseNetwork(e.target.value)}
              placeholder="e.g., 10.0.0.0"
              className="w-full px-4 py-3 rounded-xl glass-input font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Root Base Prefix
            </label>
            <select
              value={basePrefix}
              onChange={(e) => setBasePrefix(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl glass-input text-sm"
            >
              {[8, 12, 16, 18, 20, 22, 24, 25, 26, 27, 28].map((p) => (
                <option key={p} value={p} className="bg-slate-900 text-white">
                  /{p} ({Math.pow(2, 32 - p).toLocaleString()} IP capacity)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Gateway Convention
            </label>
            <select
              value={gatewayPref}
              onChange={(e) => setGatewayPref(e.target.value as "first" | "last")}
              className="w-full px-4 py-3 rounded-xl glass-input text-sm"
            >
              <option value="first" className="bg-slate-900 text-white">First Usable (.1)</option>
              <option value="last" className="bg-slate-900 text-white">Last Usable (.254)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Host Requirements (Comma-separated, e.g. 500, 250, 100, 50, 25, 2)
          </label>
          <input
            type="text"
            value={hostsStr}
            onChange={(e) => setHostsStr(e.target.value)}
            placeholder="e.g. 150, 75, 30, 12, 2"
            className="w-full px-4 py-3 rounded-xl glass-input font-mono text-sm"
          />
        </div>
      </div>

      {/* Results Table & Warnings */}
      {result && (
        <div className="space-y-6">
          {/* Capacity Usage Progress */}
          <div className="glass-card rounded-2xl p-6 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-2">
              <span>
                Root Block: <strong className="text-white font-mono">{result.baseNetwork}/{result.basePrefix}</strong>
              </span>
              <span>
                Allocated: <strong className="text-brand-cyan font-mono">{result.totalAllocated.toLocaleString()}</strong> of <strong className="text-white font-mono">{result.baseCapacity.toLocaleString()}</strong> IP addresses ({Math.min(100, Math.round((result.totalAllocated / result.baseCapacity) * 100))}%)
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden border border-white/5">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  result.exceedsCapacity
                    ? "bg-gradient-to-r from-red-500 to-rose-600"
                    : "bg-gradient-to-r from-brand-purple via-brand-indigo to-brand-cyan"
                }`}
                style={{
                  width: `${Math.min(100, (result.totalAllocated / result.baseCapacity) * 100)}%`,
                }}
              />
            </div>
          </div>

          {result.warnings.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm space-y-1">
              <div className="flex items-center gap-2 font-bold mb-1">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Capacity & Granularity Warnings:
              </div>
              {result.warnings.map((w, idx) => (
                <p key={idx} className="text-xs text-amber-200">
                  • {w}
                </p>
              ))}
            </div>
          )}

          {/* Allocation Table */}
          <div className="glass-card rounded-2xl p-6 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-3">#</th>
                    <th className="py-3 px-3 font-semibold">Req. Hosts</th>
                    <th className="py-3 px-3 font-semibold">Usable</th>
                    <th className="py-3 px-3 font-semibold">Prefix</th>
                    <th className="py-3 px-3 font-semibold">Subnet Network</th>
                    <th className="py-3 px-3 font-semibold">First Usable</th>
                    <th className="py-3 px-3 font-semibold">Last Usable</th>
                    <th className="py-3 px-3 font-semibold">Broadcast</th>
                    <th className="py-3 px-3 font-semibold">Gateway</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono text-slate-200">
                  {result.allocations.map((row) => (
                    <tr key={row.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="py-3 px-3 text-slate-500">{row.id}</td>
                      <td className="py-3 px-3 text-white font-bold">{row.requestedHosts}</td>
                      <td className="py-3 px-3 text-slate-300">{row.allocatedHosts.toLocaleString()}</td>
                      <td className="py-3 px-3 text-purple-400 font-bold">/{row.prefix}</td>
                      <td className="py-3 px-3 text-brand-sky font-bold">{row.network}</td>
                      <td className="py-3 px-3 text-slate-300">{row.firstUsable}</td>
                      <td className="py-3 px-3 text-slate-300">{row.lastUsable}</td>
                      <td className="py-3 px-3 text-slate-400">{row.broadcast}</td>
                      <td className="py-3 px-3 text-amber-400 font-semibold">{row.gateway}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

