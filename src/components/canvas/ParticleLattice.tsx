"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ParticleLatticeProps {
  isMobile?: boolean;
}

export function ParticleLattice({ isMobile = false }: ParticleLatticeProps) {
  const pointsRef = useRef<THREE.Points>(null);

  // Scale down particle count gracefully on mobile (80 vs 350) to prevent battery drain
  const count = isMobile ? 80 : 350;

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const color1 = new THREE.Color("#8b5cf6"); // Purple
    const color2 = new THREE.Color("#06b6d4"); // Cyan
    const color3 = new THREE.Color("#6366f1"); // Indigo

    for (let i = 0; i < count; i++) {
      // Spread in a spherical/cylindrical cloud
      const radius = 3.5 + Math.random() * 4.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;

      pos[i * 3] = radius * Math.cos(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi);
      pos[i * 3 + 2] = radius * Math.cos(phi) * Math.sin(theta);

      const mixed = color1.clone().lerp(Math.random() > 0.5 ? color2 : color3, Math.random());
      col[i * 3] = mixed.r;
      col[i * 3 + 1] = mixed.g;
      col[i * 3 + 2] = mixed.b;
    }
    return [pos, col];
  }, [count]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    const time = state.clock.getElapsedTime();
    const mouseX = state.pointer.x;
    const mouseY = state.pointer.y;

    // Subtle drifting field with gentle mouse parallax
    pointsRef.current.rotation.y = time * 0.04 + mouseX * 0.15;
    pointsRef.current.rotation.x = mouseY * 0.1;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={isMobile ? 0.05 : 0.065}
        vertexColors
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

