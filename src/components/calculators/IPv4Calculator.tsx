"use client";

import React, { useState } from "react";
import {
  calculateIPv4,
  wildcardFromMask,
  IPv4CalculationResult,
} from "@/lib/calculator";
import { Download, Copy, Check, AlertCircle, Network, Layers, ShieldCheck } from "lucide-react";
import confetti from "canvas-confetti";

export function IPv4Calculator() {
  const [baseNet, setBaseNet] = useState("192.168.0.0");
  const [basePrefix, setBasePrefix] = useState(24);
  const [desiredPrefix, setDesiredPrefix] = useState(26);
  const [hostReq, setHostReq] = useState("50");
  const [vlanId, setVlanId] = useState("");
  const [vlanName, setVlanName] = useState("");
  const [gatewayPref, setGatewayPref] = useState<"first" | "last">("first");
  const [aclMask, setAclMask] = useState("255.255.255.192");
  const [aclWildcard, setAclWildcard] = useState("");
  const [vlanNotes, setVlanNotes] = useState("");

  const [result, setResult] = useState<IPv4CalculationResult | null>(() => {
    try {
      return calculateIPv4("192.168.0.0", 24, 26, "first");
    } catch {
      return null;
    }
  });
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleBasePrefixChange = (val: number) => {
    setBasePrefix(val);
    if (desiredPrefix < val) {
      setDesiredPrefix(Math.min(30, val + 2));
    }
  };

  const handleCalculate = () => {
    setError(null);
    try {
      const res = calculateIPv4(baseNet, basePrefix, desiredPrefix, gatewayPref);
      setResult(res);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred during calculation");
      }
      setResult(null);
    }
  };

  const handleExportCSV = () => {
    if (!result) return;
    const rows = [
      ["#", "Network", "Prefix", "First Usable", "Last Usable", "Broadcast", "Gateway"],
      ...result.ranges.map((r) => [
        r.id.toString(),
        r.network,
        `/${r.prefix}`,
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
    link.setAttribute("download", `ipv4-subnetting-${result.cidr.replace("/", "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
  };

  const handleCopySummary = () => {
    if (!result) return;
    const text = [
      "=== IPv4 Subnetting Summary ===",
      `Base CIDR: ${result.cidr}`,
      `Subnet Mask: ${result.mask}`,
      `Wildcard Mask: ${result.wildcard}`,
      `Subnets Created: ${result.totalSubnets.toLocaleString()}`,
      `Usable Hosts per Subnet: ${result.usableHosts.toLocaleString()}`,
      `IP Class: ${result.ipClass} (${result.isPrivate ? "Private RFC 1918" : "Public"})`,
      `DHCP Scope: ${result.dhcpScope} addresses`,
    ].join("\n");

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateAcl = () => {
    try {
      const parts = aclMask.trim().split(".").map(Number);
      if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
        throw new Error("Invalid subnet mask format");
      }
      const wc = parts.map((p) => 255 - p).join(".");
      setAclWildcard(wc);
    } catch (e: unknown) {
      if (e instanceof Error) alert(e.message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Input Parameters Form */}
      <div className="glass-card rounded-2xl p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Network className="w-5 h-5 text-brand-purple" />
              IPv4 Subnet Configuration
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Configure root network and target mask for automated CIDR division.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCalculate}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-indigo hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm transition-all shadow-glow-purple flex items-center gap-2"
            >
              Calculate
            </button>
            <button
              onClick={handleExportCSV}
              disabled={!result}
              className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 font-medium text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              title="Export as CSV"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
            <button
              onClick={handleCopySummary}
              disabled={!result}
              className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 font-medium text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              title="Copy Summary"
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Base Network (IPv4)
            </label>
            <input
              type="text"
              value={baseNet}
              onChange={(e) => setBaseNet(e.target.value)}
              placeholder="e.g., 192.168.0.0"
              className="w-full px-4 py-3 rounded-xl glass-input font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Base Prefix
            </label>
            <select
              value={basePrefix}
              onChange={(e) => handleBasePrefixChange(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl glass-input text-sm"
            >
              {Array.from({ length: 23 }, (_, i) => i + 8).map((p) => (
                <option key={p} value={p} className="bg-slate-900 text-white">
                  /{p} {p === 8 ? "(Class A)" : p === 16 ? "(Class B)" : p === 24 ? "(Class C)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Desired Subnet Prefix
            </label>
            <select
              value={desiredPrefix}
              onChange={(e) => setDesiredPrefix(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl glass-input text-sm"
            >
              {Array.from({ length: 31 - basePrefix }, (_, i) => i + basePrefix).map((p) => (
                <option key={p} value={p} className="bg-slate-900 text-white">
                  /{p}
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
              <option value="first" className="bg-slate-900 text-white">
                First Usable (.1)
              </option>
              <option value="last" className="bg-slate-900 text-white">
                Last Usable (.254)
              </option>
            </select>
          </div>
        </div>

        {/* Optional VLAN Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              VLAN ID (Optional)
            </label>
            <input
              type="number"
              min="1"
              max="4094"
              value={vlanId}
              onChange={(e) => setVlanId(e.target.value)}
              placeholder="e.g., 10"
              className="w-full px-4 py-3 rounded-xl glass-input text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              VLAN Name (Optional)
            </label>
            <input
              type="text"
              maxLength={32}
              value={vlanName}
              onChange={(e) => setVlanName(e.target.value)}
              placeholder="e.g., MGMT-PROD"
              className="w-full px-4 py-3 rounded-xl glass-input text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Target Hosts Required
            </label>
            <input
              type="number"
              min="1"
              value={hostReq}
              onChange={(e) => setHostReq(e.target.value)}
              className="w-full px-4 py-3 rounded-xl glass-input text-sm"
            />
          </div>
        </div>
      </div>

      {/* Results KPIs and Grid */}
      {result && (
        <div className="space-y-6">
          {/* KPI Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card rounded-2xl p-5 border-l-4 border-l-brand-purple">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">
                Usable Hosts / Subnet
              </span>
              <span className="text-2xl lg:text-3xl font-extrabold text-white mt-1 block">
                {result.usableHosts.toLocaleString()}
              </span>
              <span className="text-xs text-slate-500 font-mono mt-1 block">
                2^{result.hostBits} − 2 hosts
              </span>
            </div>

            <div className="glass-card rounded-2xl p-5 border-l-4 border-l-brand-cyan">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">
                Number of Subnets
              </span>
              <span className="text-2xl lg:text-3xl font-extrabold text-white mt-1 block">
                {result.numSubnets.toLocaleString()}
              </span>
              <span className="text-xs text-slate-500 font-mono mt-1 block">
                2^{result.subnetBits} subnets
              </span>
            </div>

            <div className="glass-card rounded-2xl p-5 border-l-4 border-l-brand-sky">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">
                Subnet Mask
              </span>
              <span className="text-lg lg:text-xl font-bold font-mono text-cyan-300 mt-1 block">
                {result.mask}
              </span>
              <span className="text-xs text-slate-400 font-mono mt-1 block">
                WC: {result.wildcard}
              </span>
            </div>

            <div className="glass-card rounded-2xl p-5 border-l-4 border-l-amber-500">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">
                Scope & Classification
              </span>
              <span className="text-lg lg:text-xl font-bold text-white mt-1 block">
                {result.ipClass}
              </span>
              <span className="text-xs text-amber-400 font-medium mt-1 block">
                {result.isPrivate ? "Private (RFC 1918)" : "Public IP"}
              </span>
            </div>
          </div>

          {/* Warning Banner if Truncated */}
          {result.truncated && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm flex items-center justify-between">
              <span>
                Displaying first {result.ranges.length} of {result.totalSubnets.toLocaleString()} generated subnets. Export CSV to view the full allocation table.
              </span>
              <button
                onClick={handleExportCSV}
                className="underline font-semibold hover:text-white ml-3"
              >
                Download CSV
              </button>
            </div>
          )}

          {/* Subnet Ranges Table */}
          <div className="glass-card rounded-2xl p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-cyan" />
                Subnet Allocation Table
              </h4>
              <span className="text-xs font-mono text-slate-400">
                CIDR: {result.cidr}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-3">#</th>
                    <th className="py-3 px-3 font-semibold">Network</th>
                    <th className="py-3 px-3 font-semibold">First Usable</th>
                    <th className="py-3 px-3 font-semibold">Last Usable</th>
                    <th className="py-3 px-3 font-semibold">Broadcast</th>
                    <th className="py-3 px-3 font-semibold">Gateway</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono text-slate-200">
                  {result.ranges.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="py-3 px-3 text-slate-500">{row.id}</td>
                      <td className="py-3 px-3 font-bold text-brand-sky">{row.network}</td>
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

          {/* DHCP & ACL Helpers Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* DHCP Scope Planning */}
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                DHCP Scope Architecture
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-slate-400">Available Pool Size:</span>
                  <span className="font-mono text-white font-semibold">
                    {result.dhcpScope.toLocaleString()} hosts
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-slate-400">Recommended Infrastructure Reserve (~10%):</span>
                  <span className="font-mono text-amber-400 font-semibold">
                    {result.dhcpReservations.toLocaleString()} addresses
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-slate-400">Dynamic Lease Scope:</span>
                  <span className="font-mono text-emerald-400 font-semibold">
                    {Math.max(0, result.dhcpScope - result.dhcpReservations).toLocaleString()} addresses
                  </span>
                </div>
              </div>
            </div>

            {/* ACL Helper */}
            <div className="glass-card rounded-2xl p-6 space-y-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Network className="w-4 h-4 text-brand-purple" />
                Cisco / Juniper ACL Wildcard Helper
              </h4>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={aclMask}
                  onChange={(e) => setAclMask(e.target.value)}
                  placeholder="Subnet mask e.g. 255.255.255.192"
                  className="flex-1 px-4 py-2.5 rounded-xl glass-input text-xs font-mono"
                />
                <button
                  onClick={handleGenerateAcl}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-all"
                >
                  Invert Mask
                </button>
              </div>
              {aclWildcard && (
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 font-mono text-xs text-purple-300">
                  <code>access-list 100 permit ip {baseNet} {aclWildcard}</code>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
