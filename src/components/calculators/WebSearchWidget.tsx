"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";

export function WebSearchWidget() {
  const [query, setQuery] = useState("");
  const [engine, setEngine] = useState<"google" | "bing" | "duckduckgo" | "yahoo">("google");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    const urls: Record<string, string> = {
      google: "https://www.google.com/search?q=",
      bing: "https://www.bing.com/search?q=",
      duckduckgo: "https://duckduckgo.com/?q=",
      yahoo: "https://search.yahoo.com/search?p=",
    };

    const targetUrl = urls[engine] + encodeURIComponent(trimmed);
    window.open(targetUrl, "_blank", "noopener,noreferrer");
    setQuery("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-2xl mx-auto flex flex-col sm:flex-row items-stretch gap-2.5 p-2 rounded-2xl glass-card border border-white/10 shadow-2xl"
    >
      <div className="flex-1 flex items-center gap-3 px-4 py-2 bg-slate-950/40 rounded-xl border border-white/5">
        <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search RFCs, CIDR standards, or technical documentation..."
          className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-2">
        <select
          value={engine}
          onChange={(e) => setEngine(e.target.value as "google" | "bing" | "duckduckgo" | "yahoo")}
          className="px-3.5 py-3 rounded-xl bg-slate-950/40 text-slate-300 border border-white/5 text-xs font-medium focus:outline-none focus:border-brand-purple"
        >
          <option value="google" className="bg-slate-900 text-white">Google</option>
          <option value="duckduckgo" className="bg-slate-900 text-white">DuckDuckGo</option>
          <option value="bing" className="bg-slate-900 text-white">Bing</option>
          <option value="yahoo" className="bg-slate-900 text-white">Yahoo</option>
        </select>

        <button
          type="submit"
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-brand-purple to-brand-indigo hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs transition-all shadow-glow-purple whitespace-nowrap"
        >
          Search
        </button>
      </div>
    </form>
  );
}

