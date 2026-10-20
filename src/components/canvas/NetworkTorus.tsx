"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface NetworkTorusProps {
  isMobile?: boolean;
}

export function NetworkTorus({ isMobile = false }: NetworkTorusProps) {
  const outerTorusRef = useRef<THREE.Mesh>(null);
  const innerTorusRef = useRef<THREE.Mesh>(null);
  const nodesGroupRef = useRef<THREE.Group>(null);
  const packetsGroupRef = useRef<THREE.Group>(null);

  // Pre-generate spatial node positions along the torus geometry
  const nodeCount = isMobile ? 16 : 36;
  const nodes = useMemo(() => {
    const list: Array<{ pos: [number, number, number]; scale: number; speed: number; phase: number }> = [];
    const R = 2.4; // Major radius
    const r = 0.85; // Minor radius

    for (let i = 0; i < nodeCount; i++) {
      const u = (i / nodeCount) * Math.PI * 2;
      const v = ((i * 3) % nodeCount / nodeCount) * Math.PI * 2;
      const x = (R + r * Math.cos(v)) * Math.cos(u);
      const y = (R + r * Math.cos(v)) * Math.sin(u);
      const z = r * Math.sin(v);
      list.push({
        pos: [x, y, z],
        scale: 0.05 + Math.random() * 0.05,
        speed: 0.5 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2,
      });
    }
    return list;
  }, [nodeCount]);

  // Data packets travelling along the network ring
  const packetCount = isMobile ? 12 : 28;
  const packets = useMemo(() => {
    return Array.from({ length: packetCount }, (_, i) => ({
      angle: (i / packetCount) * Math.PI * 2,
      speed: 0.4 + Math.random() * 0.8,
      minorAngle: Math.random() * Math.PI * 2,
      color: i % 2 === 0 ? "#8b5cf6" : "#06b6d4",
    }));
  }, [packetCount]);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const mouseX = state.pointer.x;
    const mouseY = state.pointer.y;

    // Outer Torus - Smooth responsive rotation with mouse parallax
    if (outerTorusRef.current) {
      const targetRotX = 0.6 + mouseY * 0.45;
      const targetRotY = time * 0.18 + mouseX * 0.55;
      outerTorusRef.current.rotation.x = THREE.MathUtils.damp(outerTorusRef.current.rotation.x, targetRotX, 3.5, delta);
      outerTorusRef.current.rotation.y = THREE.MathUtils.damp(outerTorusRef.current.rotation.y, targetRotY, 3.5, delta);
      outerTorusRef.current.rotation.z = time * 0.06;
    }

    // Counter-rotating inner energy ring
    if (innerTorusRef.current) {
      innerTorusRef.current.rotation.x = -0.5 - mouseY * 0.35;
      innerTorusRef.current.rotation.y = -time * 0.28 - mouseX * 0.4;
      innerTorusRef.current.rotation.z = -time * 0.12;
    }

    // Nodes group parallax and pulse
    if (nodesGroupRef.current) {
      nodesGroupRef.current.rotation.x = outerTorusRef.current?.rotation.x ?? 0;
      nodesGroupRef.current.rotation.y = outerTorusRef.current?.rotation.y ?? 0;
      nodesGroupRef.current.rotation.z = outerTorusRef.current?.rotation.z ?? 0;
    }

    // Update dynamic packet positions along the torus
    if (packetsGroupRef.current) {
      packetsGroupRef.current.rotation.x = outerTorusRef.current?.rotation.x ?? 0;
      packetsGroupRef.current.rotation.y = outerTorusRef.current?.rotation.y ?? 0;
      packetsGroupRef.current.rotation.z = outerTorusRef.current?.rotation.z ?? 0;

      const children = packetsGroupRef.current.children;
      for (let i = 0; i < children.length; i++) {
        const p = packets[i];
        if (!p) continue;
        const currentAngle = p.angle + time * p.speed;
        const R = 2.4;
        const r = 0.85;
        const u = currentAngle;
        const v = p.minorAngle + time * 1.2;
        children[i].position.set(
          (R + r * Math.cos(v)) * Math.cos(u),
          (R + r * Math.cos(v)) * Math.sin(u),
          r * Math.sin(v)
        );
      }
    }
  });

  return (
    <group>
      {/* Primary Cyber Torus Lattice */}
      <mesh ref={outerTorusRef}>
        <torusGeometry args={[2.4, 0.85, isMobile ? 18 : 32, isMobile ? 48 : 80]} />
        <meshStandardMaterial
          color="#8b5cf6"
          emissive="#4c1d95"
          emissiveIntensity={0.65}
          wireframe
          roughness={0.25}
          metalness={0.85}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Inner Holographic Core Mesh */}
      <mesh ref={innerTorusRef}>
        <torusGeometry args={[2.1, 0.4, isMobile ? 12 : 20, isMobile ? 32 : 50]} />
        <meshStandardMaterial
          color="#06b6d4"
          emissive="#0891b2"
          emissiveIntensity={0.9}
          wireframe
          roughness={0.1}
          metalness={0.9}
          transparent
          opacity={0.45}
        />
      </mesh>

      {/* Network Nodes (Fixed Vertices) */}
      <group ref={nodesGroupRef}>
        {nodes.map((node, i) => (
          <mesh key={i} position={node.pos}>
            <sphereGeometry args={[node.scale, 8, 8]} />
            <meshStandardMaterial
              color={i % 3 === 0 ? "#38bdf8" : i % 3 === 1 ? "#a855f7" : "#fbbf24"}
              emissive={i % 3 === 0 ? "#0284c7" : i % 3 === 1 ? "#7e22ce" : "#d97706"}
              emissiveIntensity={1.8}
              roughness={0.2}
            />
          </mesh>
        ))}
      </group>

      {/* Dynamic Data Packets (Pulsing moving spheres) */}
      <group ref={packetsGroupRef}>
        {packets.map((pkt, i) => (
          <mesh key={i}>
            <sphereGeometry args={[0.075, 8, 8]} />
            <meshBasicMaterial color={pkt.color} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

