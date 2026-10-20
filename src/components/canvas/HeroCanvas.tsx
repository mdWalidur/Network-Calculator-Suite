"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";

// Dynamic client import with SSR disabled for Three.js WebGL canvas
const Scene = dynamic(() => import("./Scene"), {
  ssr: false,
  loading: () => <CanvasFallback />,
});

function CanvasFallback() {
  return (
    <div
      aria-hidden="true"
      className="w-full h-full flex items-center justify-center relative overflow-hidden"
    >
      {/* Non-shifting glowing ambient placeholder skeleton */}
      <div className="w-64 h-64 md:w-80 md:h-80 rounded-full border border-purple-500/20 bg-purple-500/5 animate-pulse-glow flex items-center justify-center">
        <div className="w-48 h-48 rounded-full border border-cyan-500/30 bg-cyan-500/5 animate-spin-slow" />
      </div>
    </div>
  );
}

export function HeroCanvas() {
  return (
    <div className="w-full h-[460px] sm:h-[540px] lg:h-[620px] relative select-none">
      <Suspense fallback={<CanvasFallback />}>
        <Scene />
      </Suspense>

      {/* Decorative gradient overlay to smoothly blend 3D canvas with content */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-background/40 via-transparent to-transparent opacity-60" />
    </div>
  );
}

