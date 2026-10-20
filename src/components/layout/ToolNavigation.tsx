"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TOOLS } from "@/lib/tools";

interface ToolNavigationProps {
  activeId?: string;
  onSelectTab?: (id: string) => void;
}

export function ToolNavigation({ activeId, onSelectTab }: ToolNavigationProps) {
  const pathname = usePathname();

  const currentActiveId =
    activeId ||
    TOOLS.find((t) => t.href === pathname)?.id ||
    (pathname === "/" ? "ipv4" : "ipv4");

  return (
    <nav
      aria-label="Calculator Tool Navigation"
      className="border-b border-workspace-200 bg-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-none">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            const isActive = currentActiveId === tool.id;

            if (onSelectTab) {
              return (
                <button
                  key={tool.id}
                  onClick={() => onSelectTab(tool.id)}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-semibold whitespace-nowrap transition-colors border ${
                    isActive
                      ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                      : "bg-white text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isActive ? "text-blue-400" : "text-slate-500"
                    }`}
                  />
                  <span>{tool.name}</span>
                </button>
              );
            }

            return (
              <Link
                key={tool.id}
                href={tool.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-semibold whitespace-nowrap transition-colors border ${
                  isActive
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-white text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isActive ? "text-blue-400" : "text-slate-500"
                  }`}
                />
                <span>{tool.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

