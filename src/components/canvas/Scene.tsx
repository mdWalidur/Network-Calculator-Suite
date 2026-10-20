"use client";

import React, { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { NetworkTorus } from "./NetworkTorus";
import { ParticleLattice } from "./ParticleLattice";

export default function Scene() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 0.4, 6.2], fov: isMobile ? 55 : 45 }}
      dpr={[1, 2]} // Capped DPR to ensure high FPS across retina displays
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      }}
      className="w-full h-full pointer-events-auto"
    >
      {/* Ambient and cyber directional lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} color="#a855f7" />
      <directionalLight position={[-10, -10, -5]} intensity={0.8} color="#06b6d4" />
      <pointLight position={[0, 0, 0]} intensity={1.5} color="#8b5cf6" distance={8} />

      {/* 3D Network Torus & Floating Data Nodes */}
      <NetworkTorus isMobile={isMobile} />

      {/* Atmospheric Spatial Particle Cloud */}
      <ParticleLattice isMobile={isMobile} />
    </Canvas>
  );
}

