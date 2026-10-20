"use client";

import React, { useState, useId } from "react";
import { calculateVLSM, VLSMCalculationResult } from "@/lib/calculator";
import { Copy, Check, Download, AlertTriangle, AlertCircle } from "lucide-react";

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
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const baseNetworkId = useId();
  const basePrefixId = useId();
  const gatewayPrefId = useId();
  const hostsStrId = useId();

  const handleCalculate = (
    net = baseNetwork,
    p = basePrefix,
    hStr = hostsStr,
    gPref = gatewayPref
  ) => {
    setError(null);
    try {
      const hosts = hStr
        .split(",")
        .map((x) => parseInt(x.trim(), 10))
        .filter((x) => !isNaN(x) && x > 0);

      if (hosts.length === 0) {
        throw new Error("Enter at least one host requirement (e.g. 100, 50, 25)");
      }

      const res = calculateVLSM(net, p, hosts, gPref);
      setResult(res);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error computing VLSM allocations. Check input parameters.");
      }
      setResult(null);
    }
  };

  const handlePreset = (net: string, p: number, h: string) => {
    setBaseNetwork(net);
    setBasePrefix(p);
    setHostsStr(h);
    handleCalculate(net, p, h, gatewayPref);
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

  const handleExportCSV = () => {
    if (!result) return;
    const rows = [
      ["Subnet #", "Requested Hosts", "Allocated Hosts", "Prefix", "Subnet Network", "First Usable Host", "Last Usable Host", "Broadcast Address", "Default Gateway"],
      ...result.allocations.map((a) => [
        a.id.toString(),
        a.requestedHosts.toString(),
        a.allocatedHosts.toString(),
        `/${a.prefix}`,
        a.network.split("/")[0],
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
    setStatusMessage("VLSM CSV plan downloaded.");
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleCopyPlan = () => {
    if (!result) return;
    const lines = [
      "=== VLSM Allocation Plan ===",
      `Root Network: ${result.baseNetwork}/${result.basePrefix} (Total Capacity: ${result.baseCapacity.toLocaleString()} IPs)`,
      `Total Space Allocated: ${result.totalAllocated.toLocaleString()} IPs`,
      "",
      "#\tReq\tAlloc\tPrefix\tNetwork\tFirst Usable\tLast Usable\tBroadcast\tGateway",
      ...result.allocations.map(
        (a) =>
          `${a.id}\t${a.requestedHosts}\t${a.allocatedHosts}\t/${a.prefix}\t${a.network}\t${a.firstUsable}\t${a.lastUsable}\t${a.broadcast}\t${a.gateway}`
      ),
    ];
    copyToClipboard(lines.join("\n"), "full-plan");
  };

  return (
    <div className="space-y-6">
      <div className="sr-only" role="status" aria-live="polite">
        {statusMessage}
      </div>

      {/* Input Configuration Panel */}
      <section aria-labelledby="vlsm-input-heading" className="panel p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-workspace-200 gap-3">
          <div>
            <h2 id="vlsm-input-heading" className="text-base font-bold text-slate-900">
              VLSM Multi-Subnet Allocation Planner
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Variable-Length Subnet Masking generator. Sorts largest host requirements first to maximize address efficiency.
            </p>
          </div>

          {/* Presets */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Presets:</span>
            <button
              type="button"
              onClick={() => handlePreset("10.0.0.0", 16, "500, 250, 100, 50, 25, 2")}
              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] transition-colors"
            >
              Enterprise /16
            </button>
            <button
              type="button"
              onClick={() => handlePreset("192.168.1.0", 24, "100, 50, 25, 12, 2")}
              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] transition-colors"
            >
              Branch /24
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
          className="mt-5 space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor={baseNetworkId} className="block text-xs font-semibold text-slate-700 mb-1.5">
                Root Major Network
              </label>
              <input
                id={baseNetworkId}
                type="text"
                value={baseNetwork}
                onChange={(e) => {
                  setBaseNetwork(e.target.value);
                  handleCalculate(e.target.value, basePrefix, hostsStr, gatewayPref);
                }}
                placeholder="e.g. 10.0.0.0"
                className="eng-input font-mono"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Starting network address</span>
            </div>

            <div>
              <label htmlFor={basePrefixId} className="block text-xs font-semibold text-slate-700 mb-1.5">
                Root Prefix Length
              </label>
              <select
                id={basePrefixId}
                value={basePrefix}
                onChange={(e) => {
                  const nextP = Number(e.target.value);
                  setBasePrefix(nextP);
                  handleCalculate(baseNetwork, nextP, hostsStr, gatewayPref);
                }}
                className="eng-input font-mono"
              >
                {[8, 12, 16, 18, 20, 22, 24, 25, 26, 27, 28].map((p) => (
                  <option key={p} value={p}>
                    /{p} ({Math.pow(2, 32 - p).toLocaleString()} IP capacity)
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-slate-500 mt-1 block">Total available major block</span>
            </div>

            <div>
              <label htmlFor={gatewayPrefId} className="block text-xs font-semibold text-slate-700 mb-1.5">
                Gateway Assignment
              </label>
              <select
                id={gatewayPrefId}
                value={gatewayPref}
                onChange={(e) => {
                  const nextG = e.target.value as "first" | "last";
                  setGatewayPref(nextG);
                  handleCalculate(baseNetwork, basePrefix, hostsStr, nextG);
                }}
                className="eng-input"
              >
                <option value="first">First Usable Host (.1 convention)</option>
                <option value="last">Last Usable Host (.254 convention)</option>
              </select>
              <span className="text-[11px] text-slate-500 mt-1 block">Default router interface</span>
            </div>
          </div>

          <div>
            <label htmlFor={hostsStrId} className="block text-xs font-semibold text-slate-700 mb-1.5">
              Host Requirements (Comma-separated host counts)
            </label>
            <input
              id={hostsStrId}
              type="text"
              value={hostsStr}
              onChange={(e) => {
                setHostsStr(e.target.value);
                handleCalculate(baseNetwork, basePrefix, e.target.value, gatewayPref);
              }}
              placeholder="e.g. 500, 250, 100, 50, 25, 2"
              className="eng-input font-mono"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Enter required usable host counts separated by commas. The calculator automatically sorts them descending for optimal binary boundary alignment.
            </span>
          </div>
        </form>
      </section>

      {/* Results Workspace */}
      {result && (
        <div className="space-y-6">
          {/* Capacity Usage Summary Bar */}
          <section aria-label="Address Capacity Usage" className="panel p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
              <div>
                <span className="text-slate-500">Root Block Allocation: </span>
                <strong className="font-mono text-slate-900">{result.baseNetwork}/{result.basePrefix}</strong>
              </div>
              <div>
                <span className="text-slate-500">Allocated: </span>
                <strong className="font-mono text-slate-900">{result.totalAllocated.toLocaleString()}</strong>
                <span className="text-slate-500"> of </span>
                <strong className="font-mono text-slate-900">{result.baseCapacity.toLocaleString()}</strong>
                <span className="text-slate-500"> addresses ({Math.min(100, Math.round((result.totalAllocated / result.baseCapacity) * 100))}%)</span>
              </div>
            </div>

            {/* Accessible Progress Meter */}
            <div className="w-full h-2.5 rounded bg-slate-100 overflow-hidden border border-slate-200">
              <div
                className={`h-full transition-all duration-300 ${
                  result.exceedsCapacity ? "bg-red-600" : "bg-blue-600"
                }`}
                style={{
                  width: `${Math.min(100, (result.totalAllocated / result.baseCapacity) * 100)}%`,
                }}
              />
            </div>
          </section>

          {/* Capacity Warnings */}
          {result.warnings.length > 0 && (
            <div role="alert" className="p-4 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold mb-1">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Capacity Warning:</span>
              </div>
              {result.warnings.map((w, idx) => (
                <p key={idx} className="text-amber-800">
                  • {w}
                </p>
              ))}
            </div>
          )}

          {/* Allocation Table */}
          <section aria-labelledby="vlsm-table-heading" className="panel overflow-hidden">
            <div className="px-5 py-3.5 border-b border-workspace-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 id="vlsm-table-heading" className="text-sm font-bold text-slate-900">
                  Subnet Allocation Schedule
                </h3>
                <p className="text-xs text-slate-500">
                  {result.allocations.length} subnets calculated in order of descending size.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="btn-secondary"
                  title="Download VLSM schedule as CSV"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Export CSV</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyPlan}
                  className="btn-secondary"
                  title="Copy VLSM plan text"
                >
                  {copiedKey === "full-plan" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                  )}
                  <span>{copiedKey === "full-plan" ? "Copied" : "Copy Plan"}</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="eng-table">
                <thead>
                  <tr>
                    <th scope="col" className="w-10">#</th>
                    <th scope="col">Required</th>
                    <th scope="col">Allocated</th>
                    <th scope="col">Prefix</th>
                    <th scope="col">Subnet Network</th>
                    <th scope="col">Usable Range</th>
                    <th scope="col">Broadcast</th>
                    <th scope="col">Default Gateway</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-xs">
                  {result.allocations.map((row) => (
                    <tr key={row.id}>
                      <td className="text-slate-400 font-sans">{row.id}</td>
                      <td className="text-slate-700 font-sans font-medium">{row.requestedHosts}</td>
                      <td className="text-slate-900 font-bold">{row.allocatedHosts.toLocaleString()}</td>
                      <td>
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-semibold border border-slate-200">
                          /{row.prefix}
                        </span>
                      </td>
                      <td className="text-slate-900 font-bold">{row.network.split("/")[0]}</td>
                      <td className="text-slate-700">
                        {row.firstUsable} <span className="text-slate-400 font-sans">to</span> {row.lastUsable}
                      </td>
                      <td className="text-slate-500">{row.broadcast}</td>
                      <td className="text-blue-700 font-medium">{row.gateway}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
