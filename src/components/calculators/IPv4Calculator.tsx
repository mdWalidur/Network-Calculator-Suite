"use client";

import React, { useState, useId } from "react";
import { calculateIPv4, IPv4CalculationResult } from "@/lib/calculator";
import { Copy, Check, Download, AlertCircle, RefreshCw } from "lucide-react";

export function IPv4Calculator() {
  const [baseIp, setBaseIp] = useState("192.168.0.0");
  const [basePrefix, setBasePrefix] = useState(24);
  const [desiredPrefix, setDesiredPrefix] = useState(26);
  const [gatewayPref, setGatewayPref] = useState<"first" | "last">("first");

  const [result, setResult] = useState<IPv4CalculationResult | null>(() => {
    try {
      return calculateIPv4("192.168.0.0", 24, 26, "first");
    } catch {
      return null;
    }
  });

  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Form IDs for accessibility
  const baseIpId = useId();
  const basePrefixId = useId();
  const desiredPrefixId = useId();
  const gatewayPrefId = useId();

  const handleCalculate = (ip = baseIp, bPrefix = basePrefix, dPrefix = desiredPrefix, gPref = gatewayPref) => {
    setError(null);
    try {
      const res = calculateIPv4(ip, bPrefix, dPrefix, gPref);
      setResult(res);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Invalid IPv4 address or subnet prefix parameters.");
      }
      setResult(null);
    }
  };

  const handlePreset = (ip: string, bPrefix: number, dPrefix: number, gPref: "first" | "last" = "first") => {
    setBaseIp(ip);
    setBasePrefix(bPrefix);
    setDesiredPrefix(dPrefix);
    setGatewayPref(gPref);
    handleCalculate(ip, bPrefix, dPrefix, gPref);
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

  const handleExportCSV = () => {
    if (!result) return;
    const rows = [
      ["Subnet #", "Network Address", "Prefix", "Subnet Mask", "First Usable Host", "Last Usable Host", "Broadcast Address", "Default Gateway"],
      ...result.ranges.map((r) => [
        r.id.toString(),
        r.network,
        `/${r.prefix}`,
        result.mask,
        r.firstUsable,
        r.lastUsable,
        r.broadcast,
        r.gateway,
      ]),
    ];
    const csvContent = rows.map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `subnet-plan-${result.cidr.replace("/", "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setStatusMessage("CSV file generated and downloaded.");
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleCopySummary = () => {
    if (!result) return;
    const lines = [
      "=== IPv4 Subnet Allocation Summary ===",
      `Base CIDR: ${result.cidr}`,
      `Subnet Mask: ${result.mask} (Wildcard: ${result.wildcard})`,
      `Classification: ${result.ipClass} (${result.isPrivate ? "RFC 1918 Private" : "Public Internet"})`,
      `Subnets Created: ${result.numSubnets}`,
      `Usable Hosts per Subnet: ${result.usableHosts.toLocaleString()}`,
      "",
      "#\tSubnet Network\tFirst Usable\tLast Usable\tBroadcast\tGateway",
      ...result.ranges.map(
        (r) => `${r.id}\t${r.network}\t${r.firstUsable}\t${r.lastUsable}\t${r.broadcast}\t${r.gateway}`
      ),
    ];
    copyToClipboard(lines.join("\n"), "full-summary");
  };

  return (
    <div className="space-y-6">
      {/* Screen Reader Status Announcement */}
      <div className="sr-only" role="status" aria-live="polite">
        {statusMessage}
      </div>

      {/* Input Configuration Panel */}
      <section aria-labelledby="ipv4-input-heading" className="panel p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-workspace-200 gap-3">
          <div>
            <h2 id="ipv4-input-heading" className="text-base font-bold text-slate-900">
              IPv4 Network Configuration
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter network address and prefix to compute subnets, ranges, masks, and ACL wildcards.
            </p>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Presets:</span>
            <button
              type="button"
              onClick={() => handlePreset("192.168.0.0", 24, 26)}
              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] transition-colors"
            >
              192.168.0.0/24 → /26
            </button>
            <button
              type="button"
              onClick={() => handlePreset("10.0.0.0", 16, 24)}
              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] transition-colors"
            >
              10.0.0.0/16 → /24
            </button>
            <button
              type="button"
              onClick={() => handlePreset("172.16.0.0", 24, 30)}
              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] transition-colors"
            >
              P2P /30 Links
            </button>
          </div>
        </div>

        {/* Validation Error Banner */}
        {error && (
          <div role="alert" className="mt-4 p-3.5 rounded-md bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold">Calculation Error: </strong>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Input Controls Grid */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCalculate();
          }}
          className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div>
            <label htmlFor={baseIpId} className="block text-xs font-semibold text-slate-700 mb-1.5">
              Base Network IP
            </label>
            <input
              id={baseIpId}
              type="text"
              value={baseIp}
              onChange={(e) => {
                setBaseIp(e.target.value);
                handleCalculate(e.target.value, basePrefix, desiredPrefix, gatewayPref);
              }}
              placeholder="e.g. 192.168.1.0"
              className="eng-input font-mono"
              autoComplete="off"
              spellCheck={false}
            />
            <span className="text-[11px] text-slate-500 mt-1 block">Valid IPv4 decimal notation</span>
          </div>

          <div>
            <label htmlFor={basePrefixId} className="block text-xs font-semibold text-slate-700 mb-1.5">
              Base Prefix Length
            </label>
            <select
              id={basePrefixId}
              value={basePrefix}
              onChange={(e) => {
                const nextBase = Number(e.target.value);
                setBasePrefix(nextBase);
                const nextDesired = desiredPrefix < nextBase ? nextBase : desiredPrefix;
                setDesiredPrefix(nextDesired);
                handleCalculate(baseIp, nextBase, nextDesired, gatewayPref);
              }}
              className="eng-input font-mono"
            >
              {Array.from({ length: 33 }, (_, i) => i).map((p) => (
                <option key={p} value={p}>
                  /{p} {p === 8 ? "(Class A)" : p === 16 ? "(Class B)" : p === 24 ? "(Class C)" : ""}
                </option>
              ))}
            </select>
            <span className="text-[11px] text-slate-500 mt-1 block">Root network prefix (/0 to /32)</span>
          </div>

          <div>
            <label htmlFor={desiredPrefixId} className="block text-xs font-semibold text-slate-700 mb-1.5">
              Target Subnet Prefix
            </label>
            <select
              id={desiredPrefixId}
              value={desiredPrefix}
              onChange={(e) => {
                const nextDesired = Number(e.target.value);
                setDesiredPrefix(nextDesired);
                handleCalculate(baseIp, basePrefix, nextDesired, gatewayPref);
              }}
              className="eng-input font-mono"
            >
              {Array.from({ length: 33 - basePrefix }, (_, i) => basePrefix + i).map((p) => {
                const subnets = Math.pow(2, p - basePrefix);
                const hosts = p === 32 ? 1 : p === 31 ? 2 : Math.max(0, Math.pow(2, 32 - p) - 2);
                return (
                  <option key={p} value={p}>
                    /{p} ({subnets} subnets • {hosts.toLocaleString()} hosts)
                  </option>
                );
              })}
            </select>
            <span className="text-[11px] text-slate-500 mt-1 block">Subdivided prefix length</span>
          </div>

          <div>
            <label htmlFor={gatewayPrefId} className="block text-xs font-semibold text-slate-700 mb-1.5">
              Default Gateway
            </label>
            <select
              id={gatewayPrefId}
              value={gatewayPref}
              onChange={(e) => {
                const nextG = e.target.value as "first" | "last";
                setGatewayPref(nextG);
                handleCalculate(baseIp, basePrefix, desiredPrefix, nextG);
              }}
              className="eng-input"
            >
              <option value="first">First Usable IP (.1 convention)</option>
              <option value="last">Last Usable IP (.254 convention)</option>
            </select>
            <span className="text-[11px] text-slate-500 mt-1 block">Gateway allocation rule</span>
          </div>
        </form>
      </section>

      {/* Results Workspace */}
      {result && (
        <div className="space-y-6">
          {/* Key Parameters Overview Bar */}
          <section aria-label="Calculated Subnet Summary" className="panel p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Computed Network Block
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xl font-bold font-mono text-slate-900">
                    {result.cidr}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded font-medium border ${
                    result.isPrivate
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-blue-50 text-blue-700 border-blue-200"
                  }`}>
                    {result.ipClass} • {result.isPrivate ? "RFC 1918 Private" : "Public Address"}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="btn-secondary"
                  title="Download subnet plan as CSV"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Export CSV</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="btn-secondary"
                  title="Copy full text summary to clipboard"
                >
                  {copiedKey === "full-summary" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                  )}
                  <span>{copiedKey === "full-summary" ? "Copied" : "Copy Summary"}</span>
                </button>
              </div>
            </div>

            {/* Structured Metric Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-500 block font-medium">Subnet Mask</span>
                <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900 text-sm">
                  <span>{result.mask}</span>
                  <button
                    onClick={() => copyToClipboard(result.mask, "mask")}
                    className="text-slate-400 hover:text-slate-700 p-0.5"
                    title="Copy Subnet Mask"
                    aria-label="Copy Subnet Mask"
                  >
                    {copiedKey === "mask" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 block font-medium">Wildcard Mask</span>
                <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900 text-sm">
                  <span>{result.wildcard}</span>
                  <button
                    onClick={() => copyToClipboard(result.wildcard, "wildcard")}
                    className="text-slate-400 hover:text-slate-700 p-0.5"
                    title="Copy Wildcard Mask"
                    aria-label="Copy Wildcard Mask"
                  >
                    {copiedKey === "wildcard" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 block font-medium">Usable Hosts / Subnet</span>
                <span className="font-mono font-bold text-slate-900 text-sm block">
                  {result.usableHosts.toLocaleString()}
                  <span className="text-slate-500 font-normal text-xs ml-1 font-sans">
                    (2^{result.hostBits}{result.desiredPrefix <= 30 ? " - 2" : ""})
                  </span>
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 block font-medium">Subnets Created</span>
                <span className="font-mono font-bold text-slate-900 text-sm block">
                  {result.numSubnets.toLocaleString()}
                  <span className="text-slate-500 font-normal text-xs ml-1 font-sans">
                    (2^{result.subnetBits})
                  </span>
                </span>
              </div>
            </div>
          </section>

          {/* Subnet Allocation Table */}
          <section aria-labelledby="allocation-table-heading" className="panel overflow-hidden">
            <div className="px-5 py-3.5 border-b border-workspace-200 flex items-center justify-between">
              <div>
                <h3 id="allocation-table-heading" className="text-sm font-bold text-slate-900">
                  Subnet Allocation Matrix
                </h3>
                <p className="text-xs text-slate-500">
                  Showing {result.ranges.length} calculated subnet {result.ranges.length === 1 ? "block" : "blocks"}
                  {result.truncated && ` (display truncated to 256 of ${result.totalSubnets.toLocaleString()} subnets for browser performance)`}.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="eng-table">
                <thead>
                  <tr>
                    <th scope="col" className="w-12">#</th>
                    <th scope="col">Subnet Network</th>
                    <th scope="col">Usable Host Range</th>
                    <th scope="col">Broadcast Address</th>
                    <th scope="col">Default Gateway</th>
                    <th scope="col" className="text-right w-20">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-xs">
                  {result.ranges.map((row) => (
                    <tr key={row.id}>
                      <td className="text-slate-400 font-sans">{row.id}</td>
                      <td>
                        <strong className="text-slate-900 font-semibold">{row.network}</strong>
                      </td>
                      <td className="text-slate-700">
                        {row.firstUsable} <span className="text-slate-400 font-sans">to</span> {row.lastUsable}
                      </td>
                      <td className="text-slate-500">{row.broadcast}</td>
                      <td className="text-blue-700 font-medium">{row.gateway}</td>
                      <td className="text-right">
                        <button
                          onClick={() => copyToClipboard(`${row.network} (${row.firstUsable} - ${row.lastUsable}, GW: ${row.gateway})`, `row-${row.id}`)}
                          className="btn-copy"
                          title="Copy subnet details"
                        >
                          {copiedKey === `row-${row.id}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedKey === `row-${row.id}` ? "Copied" : "Copy"}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Practical Network Engineering Utilities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* DHCP Scope Sizing */}
            <section aria-labelledby="dhcp-scope-heading" className="panel p-5">
              <h3 id="dhcp-scope-heading" className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
                DHCP Pool Architecture (Recommended)
              </h3>
              <div className="mt-3 space-y-2.5 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-slate-600">Total Host Pool:</span>
                  <span className="font-mono font-bold text-slate-900">{result.usableHosts} addresses</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-slate-600">Static / Infrastructure Reserve (~10%):</span>
                  <span className="font-mono font-medium text-amber-700">{result.dhcpReservations} addresses</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-600">Dynamic Client Leases:</span>
                  <span className="font-mono font-bold text-emerald-700">{result.dhcpScope} addresses</span>
                </div>
              </div>
            </section>

            {/* Cisco / Juniper ACL Wildcard Helper */}
            <section aria-labelledby="acl-helper-heading" className="panel p-5">
              <h3 id="acl-helper-heading" className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
                Firewall & ACL Wildcard Notation
              </h3>
              <div className="mt-3 space-y-2 text-xs">
                <p className="text-slate-600">
                  Inverse bit mask used in Cisco IOS access lists, OSPF network statements, and Juniper firewall filters:
                </p>
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200 font-mono flex items-center justify-between">
                  <span className="text-slate-800 font-semibold">{result.cidr} wildcard {result.wildcard}</span>
                  <button
                    onClick={() => copyToClipboard(result.wildcard, "acl-wildcard")}
                    className="btn-copy"
                  >
                    {copiedKey === "acl-wildcard" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === "acl-wildcard" ? "Copied" : "Copy Wildcard"}</span>
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
